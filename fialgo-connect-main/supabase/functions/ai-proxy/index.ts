import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── SECURITY: Allowed origins only ────────────────────────────────────────────
// In this project we will reflect the requesting origin to avoid CORS issues
// on local network IPs and preview deployments.

// ── SERVER-SIDE RATE LIMITER ───────────────────────────────────────────────────
// In-memory token bucket per edge isolate (resets on cold start)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;  // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15;       // 15 AI requests per minute per user

interface RateLimitRecord {
  count: number;
  resetAt: number;
  violations: number;
  blockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function isRateLimited(identifier: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  let record = rateLimitMap.get(identifier);

  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS, violations: record?.violations ?? 0, blockedUntil: record?.blockedUntil ?? 0 };
  }

  // Check if user is in a violation block period (escalating backoff)
  if (record.blockedUntil > now) {
    return { limited: true, retryAfter: Math.ceil((record.blockedUntil - now) / 1000) };
  }

  record.count++;
  
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    record.violations++;
    // Escalating backoff: 1min, 5min, 15min based on violation count
    const backoffMs = record.violations >= 3 ? 15 * 60 * 1000 
                    : record.violations === 2 ? 5 * 60 * 1000 
                    : 60 * 1000;
    record.blockedUntil = now + backoffMs;
    rateLimitMap.set(identifier, record);
    return { limited: true, retryAfter: Math.ceil(backoffMs / 1000) };
  }

  rateLimitMap.set(identifier, record);
  return { limited: false };
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    });
  }

  try {
    // ── Auth verification ──────────────────────────────────────────────────────
    let user = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }
    
    const userId = user?.id || 'anonymous';

    // ── Rate limiting (per user) ───────────────────────────────────────────────
    const rlResult = isRateLimited(userId);
    if (rlResult.limited) {
      return new Response(JSON.stringify({ 
        error: 'Too Many Requests',
        message: "I'm receiving a high volume of requests! Please wait a moment and try again.",
        retryAfter: rlResult.retryAfter
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(rlResult.retryAfter ?? 60)
        },
        status: 429
      });
    }

    // ── Server-side credit check ───────────────────────────────────────────────
    // Use service role for credit operations (bypasses RLS for atomic update)
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (user && serviceRoleKey) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      const { data: creditResult, error: creditError } = await adminClient
        .rpc('consume_ai_credit', { p_user_id: user.id });
      
      if (!creditError && creditResult?.success === false && creditResult?.error === 'out_of_credits') {
        return new Response(JSON.stringify({ 
          error: 'out_of_credits',
          message: "You've used all your AI coach credits for today! Credits reset daily. Upgrade your plan for more credits.",
          credits_remaining: 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 402
        });
      }
    }

    // ── Parse request body ─────────────────────────────────────────────────────
    const { model, messages, systemInstruction } = await req.json();

    // ── AI Provider Selection (Google Gemini) ───────────────
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('Server configuration error: GEMINI_API_KEY is not configured in Supabase Edge Function secrets.');
    }

    // ── Prepare Gemini API Payload ──────────────────────────────────
    const geminiPayload: any = {
      contents: messages,
    };
    
    if (systemInstruction) {
      geminiPayload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    // ── Gemini API Call ───────────────────────────────────────────
    // Using gemini-3.5-flash
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload)
    });

    const responseData = await geminiResponse.json();

    if (responseData.error) {
      throw new Error(`Gemini error: ${responseData.error.message || 'Unknown error'}`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('AI proxy error:', error);
    
    // Check if it's a quota error from Gemini
    if (error.message && error.message.toLowerCase().includes('quota')) {
      return new Response(JSON.stringify({ 
        message: "Google Gemini API Quota Reached: Your server's API key has hit its Google limit. Please check your Google Cloud Billing or wait a few minutes."
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: error.message?.includes('Unauthorized') ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
