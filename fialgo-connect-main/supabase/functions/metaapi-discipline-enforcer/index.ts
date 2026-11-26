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

    // 2. Query the user's profile, Risk Guard config & extended rules
    const [{ data: profile, error: profileError }, { data: riskCfg }, { data: extRules }] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('is_locked_for_today, trades_today, max_daily_trades, max_lot_size')
        .eq('id', userId)
        .single(),
      supabaseAdmin
        .from('user_risk_configs')
        .select('max_lot_size, max_open_trades, max_daily_loss_percent')
        .eq('user_id', userId)
        .maybeSingle(),
      supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('id', `risk_guard_rules_${userId}`)
        .maybeSingle()
    ]);

    if (profileError || !profile) {
      throw new Error(`Profile fetch failed for user_id ${userId}: ${profileError?.message}`);
    }

    const rules = (extRules?.value && typeof extRules.value === 'object' ? extRules.value : {}) as Record<string, any>;

    // Prefer user_risk_configs (Risk Guard UI) when configured, falling back to profiles
    const activeMaxLot =
      riskCfg && riskCfg.max_lot_size !== null && riskCfg.max_lot_size !== undefined
        ? Number(riskCfg.max_lot_size)
        : Number(profile.max_lot_size || 0);
    const activeMaxTrades =
      riskCfg && riskCfg.max_open_trades !== null && riskCfg.max_open_trades !== undefined && Number(riskCfg.max_open_trades) > 0
        ? Number(riskCfg.max_open_trades)
        : Number(profile.max_daily_trades || 0);

    // Extract trade volume & symbol from MetaApi/Custom webhook payload
    let tradeVolume = payload.volume || payload.lot_size || payload.position?.volume || null;
    let tradeSymbol = payload.symbol || payload.position?.symbol || null;

    // 3. Rule Enforcement Logic
    const isLocked = profile.is_locked_for_today;
    const overTradeLimit = activeMaxTrades > 0 && profile.trades_today >= activeMaxTrades;
    let overMaxLot = false;
    
    // If we have trade volume in the payload, we can check it immediately without RPC
    if (tradeVolume !== null && activeMaxLot > 0 && Number(tradeVolume) > activeMaxLot) {
      overMaxLot = true;
    }

    const noAvgEnabled = Boolean(rules.no_averaging_down);
    const noAvgStrict = rules.no_avg_mode !== 'warning';
    const martingaleEnabled = Boolean(rules.martingale_detection);
    const martingaleMult = Number(rules.martingale_multiplier || 1.5);
    const oneInstrumentEnabled = Boolean(rules.one_instrument_mode);
    const allowedTicker = String(rules.allowed_ticker || '').toUpperCase();

    // Determine if we have a guaranteed violation before RPC
    let violationReason = isLocked ? 'ACCOUNT_LOCKED' : overTradeLimit ? 'MAX_TRADES_EXCEEDED' : overMaxLot ? 'MAX_LOT_EXCEEDED' : null;
    if (!violationReason && oneInstrumentEnabled && allowedTicker && tradeSymbol && !String(tradeSymbol).toUpperCase().includes(allowedTicker)) {
      violationReason = 'OFF_INSTRUMENT_BLOCKED';
    }

    // Need RPC inspection if volume is missing or if we need open positions / last closed trade for No Avg Down / Martingale / One Instrument
    const needsRpcCheck =
      !violationReason &&
      ((activeMaxLot > 0 && tradeVolume === null) ||
        noAvgEnabled ||
        martingaleEnabled ||
        (oneInstrumentEnabled && Boolean(allowedTicker) && !tradeSymbol));

    if (violationReason || needsRpcCheck) {
      console.log(`[SHIELD] Checking/Enforcing rules for user ${userId}. Initial Violation: ${violationReason || 'Inspecting via MetaApi RPC'}`);

      try {
        // Access the account and send commands via RPC connection
        const account = await metaApi.metatraderAccountApi.getMetatraderAccount(accountId);
        const connection = account.getRPCConnection();
        
        await connection.connect();
        await connection.waitConnected();
        
        if (needsRpcCheck) {
          const position = await connection.getPosition(String(ticketId)).catch(() => null);
          if (position) {
            tradeVolume = position.volume;
            tradeSymbol = position.symbol;

            if (activeMaxLot > 0 && position.volume > activeMaxLot) {
              violationReason = 'MAX_LOT_EXCEEDED';
            } else if (oneInstrumentEnabled && allowedTicker && !String(position.symbol || '').toUpperCase().includes(allowedTicker)) {
              violationReason = 'OFF_INSTRUMENT_BLOCKED';
            }

            // Check No Averaging Down: same symbol + same direction while existing open trade is losing
            if (!violationReason && noAvgEnabled) {
              const positions = await connection.getPositions().catch(() => []);
              const hasLosingSameDir = (positions || []).some(
                (p: any) =>
                  String(p.id) !== String(ticketId) &&
                  String(p.symbol || '').toUpperCase() === String(position.symbol || '').toUpperCase() &&
                  p.type === position.type &&
                  Number(p.profit || 0) < 0
              );
              if (hasLosingSameDir) {
                if (noAvgStrict) {
                  violationReason = 'AVERAGING_DOWN_BLOCKED';
                } else {
                  await supabaseAdmin.from('risk_breach_logs').insert({
                    user_id: userId,
                    rule_type: 'AVERAGING_DOWN_WARNING',
                    message: `Warning: Added ${position.symbol} while existing position is in loss.`,
                  });
                }
              }
            }

            // Check Martingale Protection: current lot exceeds last closed losing lot * multiplier
            if (!violationReason && martingaleEnabled && martingaleMult > 0) {
              const { data: lastClosed } = await supabaseAdmin
                .from('trades')
                .select('profit, lot_size')
                .eq('user_id', userId)
                .not('closed_at', 'is', null)
                .order('closed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (lastClosed && Number(lastClosed.profit || 0) < 0 && Number(lastClosed.lot_size || 0) > 0) {
                const allowedNext = Number(lastClosed.lot_size) * martingaleMult;
                if (position.volume > allowedNext) {
                  violationReason = 'MARTINGALE_LOT_EXCEEDED';
                }
              }
            }
          }
        }

        // Only proceed to close if we have a confirmed violation
        if (violationReason) {
          console.log(`[SHIELD] Termination command initiated for ticket ${ticketId} on account ${accountId}. Reason: ${violationReason}`);
          await connection.closePosition(String(ticketId));
          
          // 4. Log the forceful closure in system_logs & risk_breach_logs
          const logMessage = `Discipline Shield Activated: Trade [${ticketId}] auto-closed for rule violation (${violationReason}).`;
          await Promise.all([
            supabaseAdmin.from('system_logs').insert({
              level: 'mt5',
              user_id: userId,
              message: logMessage,
              metadata: {
                ticketId,
                accountId,
                volume: tradeVolume,
                symbol: tradeSymbol,
                max_lot_size: activeMaxLot,
                reason: violationReason,
                enforced_at: new Date().toISOString()
              }
            }),
            supabaseAdmin.from('risk_breach_logs').insert({
              user_id: userId,
              rule_type: violationReason,
              message: logMessage,
            })
          ]);

          let friendlyReason = 'Account is restricted for today';
          if (violationReason === 'MAX_TRADES_EXCEEDED') friendlyReason = 'Maximum daily trade volume exceeded';
          if (violationReason === 'MAX_LOT_EXCEEDED') friendlyReason = `Maximum lot size exceeded (${tradeVolume} > ${activeMaxLot})`;
          if (violationReason === 'OFF_INSTRUMENT_BLOCKED') friendlyReason = `Instrument ${tradeSymbol} is outside allowed ticker ${allowedTicker}`;
          if (violationReason === 'AVERAGING_DOWN_BLOCKED') friendlyReason = `Averaging down blocked on losing ${tradeSymbol} position`;
          if (violationReason === 'MARTINGALE_LOT_EXCEEDED') friendlyReason = `Post-loss lot limit (${martingaleMult}x) exceeded`;

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
