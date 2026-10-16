import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.17.0?target=deno'

const ALLOWED_ORIGINS = [
  'https://www.tradifive.in',
  'https://tradifive.in',
  'https://fialgo-connect-main.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

// --- RATE LIMITING ---
// In-memory token bucket per edge isolate
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(identifier);
  
  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  
  record.count++;
  rateLimitMap.set(identifier, record);
  
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Check rate limit using IP
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown-ip';
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 429
    });
  }

  try {
    // SECURITY: Stripe secret key MUST come from environment variables only
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Server configuration error: payment provider not configured');
    }
    const stripe = new Stripe(stripeKey);

    const body = await req.json();
    const { planId, price, name } = body;

    // Validate required fields
    if (!planId || !price || !name) {
      throw new Error('Missing required checkout parameters');
    }

    const authHeader = req.headers.get('Authorization');

    let userId = "anonymous";
    let userEmail = undefined;

    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } },
      })
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email;
      }
    }

    // SECURITY: Only allow redirects back to our own origins
    const origin = req.headers.get('origin') || '';
    const safeOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr', 
            product_data: {
              name: name || 'Tradifive Premium',
            },
            unit_amount: Math.round(price * 100), 
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${safeOrigin}/settings?success=true&session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${safeOrigin}/settings?canceled=true`,
      client_reference_id: userId,
      customer_email: userEmail,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Checkout session creation failed. Please try again.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
