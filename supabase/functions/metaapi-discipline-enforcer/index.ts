import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import MetaApi from 'npm:metaapi.cloud-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the incoming JSON payload (Webhook from MetaApi)
    const payload = await req.json();
    const { accountId, ticketId } = payload;

    if (!accountId || !ticketId) {
      return new Response(
        JSON.stringify({ error: 'Missing accountId or ticketId in payload' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Initialize MetaApi SDK
    const token = Deno.env.get('META_API_TOKEN');
    if (!token) {
      throw new Error("META_API_TOKEN is not configured in environment variables.");
    }
    const metaApi = new MetaApi(token);

    // 1. Query the mt5_accounts table to find the associated user_id
    // We use the accountId provided by MetaApi webhook
    const { data: accountData, error: accountError } = await supabaseAdmin
      .from('mt5_accounts')
      .select('user_id')
      .eq('metaapi_account_id', accountId) 
      .single();

    if (accountError || !accountData) {
      console.error(`Account resolution failed for ${accountId}:`, accountError);
      return new Response(
        JSON.stringify({ error: 'MetaApi Account ID not found in database registry.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = accountData.user_id;

    // 2. Query the user's profile to check discipline rules
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_locked_for_today, trades_today, max_daily_trades, max_lot_size')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile fetch failed for user_id ${userId}: ${profileError?.message}`);
    }

    // Extract trade volume from various possible MetaApi/Custom webhook payload formats
    let tradeVolume = payload.volume || payload.lot_size || payload.position?.volume || null;

    // 3. Rule Enforcement Logic
    const isLocked = profile.is_locked_for_today;
    const overTradeLimit = profile.max_daily_trades > 0 && profile.trades_today >= profile.max_daily_trades;
    let overMaxLot = false;
    
    // If we have trade volume in the payload, we can check it immediately without RPC
    if (tradeVolume !== null && profile.max_lot_size > 0 && tradeVolume > profile.max_lot_size) {
      overMaxLot = true;
    }

    // Determine if we have a guaranteed violation before RPC
    let violationReason = isLocked ? 'ACCOUNT_LOCKED' : overTradeLimit ? 'MAX_TRADES_EXCEEDED' : overMaxLot ? 'MAX_LOT_EXCEEDED' : null;

    // If no initial violation is detected, but we have a max lot size rule and couldn't find the volume in the payload, we MUST check via RPC
    const needsRpcVolumeCheck = !violationReason && profile.max_lot_size > 0 && tradeVolume === null;

    if (violationReason || needsRpcVolumeCheck) {
      console.log(`[SHIELD] Checking/Enforcing rules for user ${userId}. Initial Violation: ${violationReason || 'Checking Volume via RPC'}`);

      try {
        // Access the account and send the close command via RPC connection
        const account = await metaApi.metatraderAccountApi.getMetatraderAccount(accountId);
        const connection = account.getRPCConnection();
        
        await connection.connect();
        await connection.waitConnected();
        
        // If we needed to check volume via RPC, do it now before closing
        if (needsRpcVolumeCheck) {
           const position = await connection.getPosition(String(ticketId));
           if (position && position.volume > profile.max_lot_size) {
              overMaxLot = true;
              violationReason = 'MAX_LOT_EXCEEDED';
              tradeVolume = position.volume;
           }
        }

        // Only proceed to close if we have a confirmed violation
        if (violationReason) {
          console.log(`[SHIELD] Termination command initiated for ticket ${ticketId} on account ${accountId}. Reason: ${violationReason}`);
          await connection.closePosition(String(ticketId));
          
          // 4. Log the forceful closure in system_logs
          const logMessage = `Discipline Shield Activated: Trade [${ticketId}] auto-closed for rule violation.`;
          await supabaseAdmin.from('system_logs').insert({
            level: 'mt5',
            user_id: userId,
            message: logMessage,
            metadata: {
              ticketId,
              accountId,
              volume: tradeVolume,
              reason: violationReason,
              enforced_at: new Date().toISOString()
            }
          });

          let friendlyReason = 'Account is restricted for today';
          if (violationReason === 'MAX_TRADES_EXCEEDED') friendlyReason = 'Maximum daily trade volume exceeded';
          if (violationReason === 'MAX_LOT_EXCEEDED') friendlyReason = `Maximum lot size exceeded (${tradeVolume} > ${profile.max_lot_size})`;

          return new Response(
            JSON.stringify({ 
              success: true, 
              shield_active: true, 
              action: 'TERMINATED', 
              reason: friendlyReason 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (closeError) {
        console.error(`[SHIELD] Failed to check/close position ${ticketId}:`, closeError);
        return new Response(
          JSON.stringify({ error: 'Trade termination failed', details: closeError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // No violation
    return new Response(
      JSON.stringify({ success: true, shield_active: false, message: 'Position check passed. No violation.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge Function Critical Failure:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
