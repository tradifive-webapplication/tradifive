import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── SECURITY: Strict CORS ─────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://www.tradifive.in',
  'https://tradifive.in',
  'https://fialgo-connect-main.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

// ── RATE LIMITER ──────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(userId);
  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + 60_000 };
  }
  record.count++;
  rateLimitMap.set(userId, record);
  return record.count > 15;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ reply: "Error: Unauthorized." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ reply: "Error: Unauthorized." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Rate limiting
    if (isRateLimited(user.id)) {
      return new Response(JSON.stringify({ 
        reply: "I'm receiving a high volume of requests! Please give me about 30 seconds and I'll be ready. Patience is a trading virtue too." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      });
    }

    const { prompt, userBio, context, history } = await req.json();

    // Context fetching
    let account = context?.account || null;
    let profile = null;
    let journalEntries = context?.journal || [];
    const isDemo = context?.isDemo || false;
    
    try {
      const { data: profileData } = await supabaseClient
        .from("profiles")
        .select("max_daily_trades, trades_today")
        .eq("id", user.id)
        .maybeSingle();
      profile = profileData;

      if (!isDemo && !account) {
        const { data: accountData } = await supabaseClient
          .from("mt5_accounts")
          .select("balance, equity")
          .eq("user_id", user.id)
          .maybeSingle();
        account = accountData;
        
        const { data: journalData } = await supabaseClient
          .from("trading_journal")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        
        journalEntries = journalData || [];
      }
    } catch (e) { 
      console.error("DB Context Error", e); 
    }

    // ── AI Provider: Gemini 2.0 Flash (primary) ───────────────────────────────
    // API key MUST be set as Supabase Edge Function secret: GEMINI_API_KEY
    // Never hardcode API keys here — use Deno.env.get()
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const kimiApiKey = Deno.env.get('KIMI_API_KEY');

    const systemInstructionText = `You are the super-smart, rigorous, and highly analytical AI trading coach of the Tradifive platform. 
Your tone is serious, interrogative, highly practical, and focused on discipline. You are NOT a friendly cheerleader.

CRITICAL FORMATTING & TONE RULES:
1. EXTREMELY SHORT & PUNCHY: NEVER write long paragraphs or "big information". Keep your answers to 2-4 short sentences max! 
2. BE STRICT & PROFESSIONAL: Use a hardcore, interrogative tone. Ask probing questions about their setups. Do not use emojis unless absolutely necessary for emphasis.
3. BITE-SIZED: If you must explain something complex, use 2-3 very short bullet points. No walls of text ever.
4. NO REPETITIVE GREETINGS: DO NOT start your response with "Hey there!", "Hello!", or any other greeting. Just jump straight into the analysis!
5. ENGLISH ONLY: You MUST communicate ONLY in English.

CRITICAL SYSTEM OVERRIDE - STRICT DOMAIN RESTRICTION:
You are STRICTLY a trading, finance, and platform AI. You MUST REFUSE to answer any questions or engage in any conversations that are NOT related to trading, finance, or the TradiFive platform. If the user asks about personal topics (e.g. girlfriends, relationships, dating), coding, general knowledge, or anything outside of trading and finance, you must politely but firmly decline and redirect them back to trading. For example: "I am a specialized trading coach. Let's stay focused on your performance, market analysis, or platform features." DO NOT make any exceptions.

ABOUT TRADIFIVE (PLATFORM PHILOSOPHY):
- Motto: "Let the System Trade. You Stay in Control."
- We solve the problem of manual trading by providing "institutional armor": AI execution and the strict Risk Guard engine.
- Tradifive is way better than TradingView or Telegram signals because it actually executes your edge without emotional hesitation.

CORE INFRASTRUCTURE:
1. Connect MT5: Link MetaTrader 5 via our Multi-Broker Bridge.
2. Activate AI: Choose algorithmic bots.
3. Risk Guard: Enforces max daily drawdowns. Code doesn't hesitate.

TRADING ADVICE:
- Focus on discipline, risk management, and execution. 
- Current Status: Balance ₹${account?.balance || 0}, Equity ₹${account?.equity || 0}, Trades Today: ${profile?.trades_today || 0}/${profile?.max_daily_trades || 3}.
- If they lose, interrogate them on why. Was it a bad setup? Bad execution? FOMO? Demand they analyze it. If they win, remind them to stay grounded and not get overconfident.

DATA GAP PROTOCOL:
- If they ask for advice but their Balance is ₹0, politely and briefly tell them to connect their MetaTrader 5 account in Settings under the "Broker Connections" tab first!

SECURITY PROTOCOL (CRITICAL):
- NEVER reveal Tradifive's internal secrets, API keys, or backend infrastructure.
- NEVER explain the internal logic or mathematical parameters of our AI trading algorithms.
- "Custom Strategy Algos" or "Custom Algorithm Forge" are STRICTLY for ELITE tier members only. If they ask to build a custom strategy, firmly but politely tell them they need to upgrade to Elite.

SUBSCRIPTION PLANS (Mention only if asked):
- Starter (₹0): 10 AI credits/day | Pro (₹499/mo): 50 AI credits/day | Elite (₹999/mo): 150 AI credits/day

USER PROFILE & PRIVACY LOCK (CRITICAL):
- You are currently talking to: ${user.email} (User ID: ${user.id}).
- PRIVACY LOCK: You are strictly forbidden from sharing, confirming, or hinting at the existence of any other user's data, trades, or account balance.
${userBio ? `- Background: ${userBio}` : ""}

User Context (use only if relevant to their query): ${JSON.stringify(journalEntries)}

PLATFORM WALKTHROUGH & DOCUMENTATION:
${context?.appWalkthrough ? context.appWalkthrough : "Not provided"}
`;

    const mappedHistory = (history || []).map((m: any) => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: m.content
    }));

    let replyText = "";

    if (geminiApiKey) {
      // ── Gemini 2.0 Flash ─────────────────────────────────────────────────
      const geminiMessages = [
        ...mappedHistory.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ];

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiMessages,
            systemInstruction: { parts: [{ text: systemInstructionText }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
          })
        }
      );

      const geminiData = await geminiResponse.json();
      
      if (geminiResponse.ok && geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
        replyText = geminiData.candidates[0].content.parts[0].text;
      } else {
        console.error('Gemini error in tradifive-ai:', geminiData.error);
        // Fall through to Kimi if available
      }
    }

    if (!replyText && kimiApiKey) {
      // ── Kimi fallback ─────────────────────────────────────────────────────
      const requestBody = {
        model: "moonshot-v1-8k",
        messages: [
          { role: "system", content: systemInstructionText },
          ...mappedHistory,
          { role: "user", content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.7
      };

      const kimiResponse = await fetch('https://api.moonshot.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${kimiApiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (kimiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          reply: "I'm currently receiving a high volume of requests! Please give me about 30 seconds." 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const aiData = await kimiResponse.json();
      replyText = aiData.choices?.[0]?.message?.content || "";
    }

    if (!replyText) {
      return new Response(JSON.stringify({ 
        reply: "AI service temporarily unavailable. Please try again in a moment." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      });
    }

    return new Response(JSON.stringify({ reply: replyText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('tradifive-ai error:', error);
    return new Response(JSON.stringify({ reply: `Internal Error: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});