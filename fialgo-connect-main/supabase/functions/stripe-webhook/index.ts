import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14.17.0'

// SECURITY: Stripe secret key MUST come from environment variables only
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeSecretKey) {
  console.error('FATAL: STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2023-10-16',
})

const ALLOWED_ORIGINS = [
  'https://www.tradifive.in',
  'https://tradifive.in',
  'https://fialgo-connect-main.vercel.app',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!stripeSecretKey) {
      throw new Error('Server configuration error: payment provider not configured');
    }

    const signature = req.headers.get('stripe-signature')
    if (!signature) throw new Error('Missing Stripe signature')

    const bodyText = await req.text()

    // SECURITY: Webhook secret is REQUIRED — never skip signature verification
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Server configuration error: webhook verification not configured');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret)
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;

      if (userId) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ 
            premium_active: true,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription
          })
          .eq('id', userId)

        if (error) throw error;

        // Log the revenue and MetaApi allocated cost if amount matches 1,299
        if (session.amount_total === 129900 || session.amount_total === 1299) {
          const { error: ledgerError } = await supabaseAdmin
            .from('financial_ledger')
            .insert([
              {
                user_id: userId,
                transaction_type: 'revenue',
                category: 'subscription',
                amount: 1299.00,
                currency: 'INR',
                description: 'Subscription revenue',
                stripe_session_id: session.id
              },
              {
                user_id: userId,
                transaction_type: 'expense',
                category: 'metaapi_cost',
                amount: 2.00,
                currency: 'USD',
                description: 'MetaApi allocated cost',
                stripe_session_id: session.id
              }
            ]);
            
          if (ledgerError) console.error("Ledger insertion error:", ledgerError);
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ premium_active: false })
        .eq('stripe_subscription_id', subscription.id)
        
      if (error) console.error("Downgrade error:", error);
    }

    return new Response(JSON.stringify({ received: true }), { headers: corsHeaders })

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { headers: corsHeaders, status: 400 }
    )
  }
})
