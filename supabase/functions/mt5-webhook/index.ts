import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  // Ensure it's a POST request
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse the incoming JSON payload
    const payload = await req.json();
    const { 
      action, activation_key, ticket, symbol, trade_type, lot_size, profit, 
      opened_at_sec, closed_at_sec, account_number, broker, server, balance, equity, currency,
      active_position_tickets, is_pending, active_pending_tickets, open_positions, recent_deals,
      open_price, close_price, stop_loss, take_profit, commission, swap, fee
    } = payload;

    // Initialize Supabase Client with Service Role Key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceRoleKey) {
       console.error("Missing Supabase Environment Variables");
       return new Response(
        JSON.stringify({ error: 'Internal Server Configuration Error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    let user_id = null;

    // Check for standard Authorization: Bearer JWT token first (premium login route)
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (!userError && user) {
        user_id = user.id;
        console.log("Authenticated successfully via standard Supabase JWT for user_id:", user_id);
      }
    }

    // Fallback: Verify via activation_key or account_number in payload
    if (!user_id && (activation_key || account_number)) {
      if (activation_key) {
        // Resolve the user_id by looking up the activation key in public.profiles table
        const { data: profileData } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('activation_key', activation_key)
          .maybeSingle();

        if (profileData) {
          user_id = profileData.id;
        } else {
          // Fallback: Query the mt5_accounts table to verify the activation key
          const { data: accountData } = await supabaseAdmin
            .from('mt5_accounts')
            .select('user_id')
            .eq('activation_key', activation_key)
            .maybeSingle();
          
          if (accountData) {
            user_id = accountData.user_id;
          }
        }
      }

      // If not resolved, check by account_number
      if (!user_id && account_number) {
        const cleanAcc = String(account_number).replace(/\D/g, '');
        const { data: accMatch } = await supabaseAdmin
          .from('mt5_accounts')
          .select('user_id')
          .or(`account_number.eq.${cleanAcc},account_number.eq.#${cleanAcc}`)
          .maybeSingle();
        if (accMatch) {
          user_id = accMatch.user_id;
        }
      }

      // If still not resolved and activation_key has valid format, bind to the most recent user profile
      if (!user_id && (activation_key?.startsWith('TF-') || account_number)) {
        const { data: latestProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latestProfile) {
          user_id = latestProfile.id;
          if (activation_key) {
            await supabaseAdmin
              .from('profiles')
              .update({ activation_key })
              .eq('id', user_id);
          }
        }
      }
    }

    // Step B: Return 401 if neither authorization method is successful
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid credentials or missing activation key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step C.0: Live Telemetry Query for Frontend Dashboard
    if (action === 'get_telemetry') {
      const cleanAcc = account_number ? String(account_number).replace(/\D/g, '') : null;
      let accountRow = null;

      if (cleanAcc) {
        const { data: acc } = await supabaseAdmin
          .from('mt5_accounts')
          .select('*')
          .or(`account_number.eq.${cleanAcc},account_number.eq.#${cleanAcc}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        accountRow = acc;
      }

      if (!accountRow && user_id) {
        const { data: acc } = await supabaseAdmin
          .from('mt5_accounts')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        accountRow = acc;
      }

      // If still not matched, grab the latest active MT5 account
      if (!accountRow) {
        const { data: acc } = await supabaseAdmin
          .from('mt5_accounts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        accountRow = acc;
      }

      // Fetch trades
      let tradesQuery = supabaseAdmin.from('trades').select('*').order('opened_at', { ascending: false }).limit(50);
      if (user_id) {
        tradesQuery = tradesQuery.eq('user_id', user_id);
      } else if (accountRow?.user_id) {
        tradesQuery = tradesQuery.eq('user_id', accountRow.user_id);
      }
      const { data: tradesList } = await tradesQuery;

      return new Response(
        JSON.stringify({
          success: true,
          account: accountRow,
          trades: tradesList || []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step C.1: Intercept Kill-Switch Pull
    if (action === 'get_status') {
      const { data: accStatus } = await supabaseAdmin
        .from('mt5_accounts')
        .select('algo_status')
        .eq('user_id', user_id)
        .maybeSingle();
        
      return new Response(
        JSON.stringify({ success: true, algo_status: accStatus?.algo_status || false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step C.2: Intercept Deletion of Old BTCUSD Trades
    if (action === 'delete_btc_trades') {
      const { error } = await supabaseAdmin
        .from('trades')
        .delete()
        .eq('user_id', user_id)
        .eq('symbol', 'BTCUSD');
        
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step D: Intercept Metrics Heartbeat
    if (action === 'metrics_sync') {
       const cleanAcc = account_number ? String(account_number).replace(/\D/g, '') : null;
       const brokerClean = String(broker || '').replace(/[\uFFFD\?]/g, '').trim();
       const serverClean = String(server || '').replace(/[\uFFFD\?]/g, '').trim();
       const brokerServerStr = brokerClean ? (serverClean ? `${brokerClean} · ${serverClean}` : brokerClean) : (serverClean || 'Exness Technologies Ltd · Exness-MT5Trial6');

       // Check if account row already exists for this user or account number
       const { data: existingAccount } = await supabaseAdmin
         .from('mt5_accounts')
         .select('id')
         .or(`user_id.eq.${user_id}${cleanAcc ? `,account_number.eq.${cleanAcc},account_number.eq.#${cleanAcc}` : ''}`)
         .limit(1)
         .maybeSingle();

       let dbError = null;
       let targetAccountId = existingAccount?.id || null;

       const accountPayload: any = {
          user_id,
          account_number: cleanAcc,
          broker_server: brokerServerStr,
          balance: balance !== undefined ? Number(balance) : 0,
          equity: equity !== undefined ? Number(equity) : 0,
          currency: currency || 'INR',
          connection_status: 'deployed',
          algo_status: true
       };

       if (existingAccount) {
         // Update existing account
         const { error } = await supabaseAdmin
           .from('mt5_accounts')
           .update(accountPayload)
           .eq('id', targetAccountId);
         dbError = error;
       } else {
         // Insert new account row
         const { data: insertedAccount, error } = await supabaseAdmin
           .from('mt5_accounts')
           .insert([accountPayload])
           .select('id')
           .maybeSingle();
         
         dbError = error;
         targetAccountId = insertedAccount?.id || null;
       }

       // Clean up duplicate old accounts to ensure exactly 1 active account row exists
       if (targetAccountId) {
         await supabaseAdmin
           .from('mt5_accounts')
           .delete()
           .eq('user_id', user_id)
           .not('id', 'eq', targetAccountId);
       }

       // Sync open positions directly in batch if provided
       if (open_positions && Array.isArray(open_positions) && open_positions.length > 0) {
         const batchPositions = open_positions.map((pos: any) => {
           const pType = (pos.type === 0 || String(pos.type).toUpperCase() === 'BUY') ? 0 : 1;
           return {
             user_id,
             ticket: String(pos.ticket),
             symbol: pos.symbol || 'XAUUSD',
             trade_type: pType,
             lot_size: Number(pos.lot || pos.lot_size || pos.volume || 0.01),
             open_price: Number(pos.open_price || pos.price_open || 0),
             close_price: Number(pos.current_price || pos.price_current || pos.open_price || 0),
             profit: Number(pos.profit || 0),
             stop_loss: pos.sl ? Number(pos.sl) : null,
             take_profit: pos.tp ? Number(pos.tp) : null,
             opened_at: pos.opened_at ? new Date(pos.opened_at).toISOString() : new Date().toISOString(),
             closed_at: null,
             is_pending: false
           };
         });
         await supabaseAdmin.from('trades').upsert(batchPositions, { onConflict: 'ticket' });

         const activeTickets = open_positions.map((p: any) => String(p.ticket));
         await supabaseAdmin
           .from('trades')
           .delete()
           .eq('user_id', user_id)
           .is('closed_at', null)
           .not('ticket', 'in', activeTickets);
       } else if (open_positions && Array.isArray(open_positions) && open_positions.length === 0) {
         await supabaseAdmin
           .from('trades')
           .delete()
           .eq('user_id', user_id)
           .is('closed_at', null);
       }

       // Sync closed deals directly in batch if provided
       if (recent_deals && Array.isArray(recent_deals) && recent_deals.length > 0) {
         const batchDeals = recent_deals.map((deal: any) => {
           const dType = (deal.type === 0 || String(deal.type).toUpperCase() === 'BUY') ? 0 : 1;
           const openTime = deal.opened_at ? new Date(deal.opened_at).toISOString() : (deal.time ? new Date(deal.time * 1000).toISOString() : new Date().toISOString());
           const closeTime = deal.closed_at ? new Date(deal.closed_at).toISOString() : (deal.time ? new Date(deal.time * 1000).toISOString() : new Date().toISOString());
           return {
             user_id,
             ticket: String(deal.ticket),
             symbol: deal.symbol || 'XAUUSD',
             trade_type: dType,
             lot_size: Number(deal.lot || deal.volume || deal.lot_size || 0.01),
             open_price: Number(deal.open_price || deal.price || 0),
             close_price: Number(deal.close_price || deal.price || 0),
             profit: Number(deal.profit || 0),
             commission: Number(deal.commission || 0),
             swap: Number(deal.swap || 0),
             opened_at: openTime,
             closed_at: closeTime,
             is_pending: false
           };
         });
         await supabaseAdmin.from('trades').upsert(batchDeals, { onConflict: 'ticket' });
       }
         
        // Clean up closed/removed open positions in real time
        if (active_position_tickets && Array.isArray(active_position_tickets)) {
          const activeString = active_position_tickets.map(t => String(t));
          if (activeString.length > 0) {
            await supabaseAdmin
              .from('trades')
              .delete()
              .eq('user_id', user_id)
              .is('closed_at', null)
              .eq('is_pending', false)
              .not('ticket', 'in', activeString);
          } else {
            await supabaseAdmin
              .from('trades')
              .delete()
              .eq('user_id', user_id)
              .is('closed_at', null)
              .eq('is_pending', false);
          }
        }

        // Clean up closed/canceled pending orders in real time
        if (active_pending_tickets && Array.isArray(active_pending_tickets)) {
          const pendingString = active_pending_tickets.map(t => String(t));
          if (pendingString.length > 0) {
            await supabaseAdmin
              .from('trades')
              .delete()
              .eq('user_id', user_id)
              .eq('is_pending', true)
              .not('ticket', 'in', pendingString);
          } else {
            await supabaseAdmin
              .from('trades')
              .delete()
              .eq('user_id', user_id)
              .eq('is_pending', true);
          }
        }
          
       if (dbError) {
         console.error('Metrics Sync Error:', dbError);
         return new Response(JSON.stringify({ error: dbError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
       }
       return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step E: Normalize trade_type (supporting "BUY"/"SELL" strings, "0"/"1" strings, or 0/1 numbers)
    let finalTradeType = 0;
    if (typeof trade_type === 'string') {
      const cleanType = trade_type.trim().toUpperCase();
      finalTradeType = (cleanType === 'BUY' || cleanType === '0') ? 0 : 1;
    } else if (typeof trade_type === 'number') {
      finalTradeType = trade_type === 0 ? 0 : 1;
    }

    const insertPayload: any = {
          user_id,
          ticket: String(ticket),
          symbol,
          trade_type: finalTradeType,
          lot_size,
          profit,
          is_pending: !!is_pending,
          open_price: open_price !== undefined ? Number(open_price) : null,
          close_price: close_price !== undefined ? Number(close_price) : null,
          stop_loss: stop_loss !== undefined && Number(stop_loss) > 0 ? Number(stop_loss) : null,
          take_profit: take_profit !== undefined && Number(take_profit) > 0 ? Number(take_profit) : null,
          commission: (commission !== undefined ? Number(commission) : 0) + (fee !== undefined ? Number(fee) : 0),
          swap: swap !== undefined ? Number(swap) : null
    };

    // If MT5 provided a historical timestamp, use it
    if (opened_at_sec && opened_at_sec > 0) {
       insertPayload.opened_at = new Date(opened_at_sec * 1000).toISOString();
    }
    if (closed_at_sec && closed_at_sec > 0) {
       insertPayload.closed_at = new Date(closed_at_sec * 1000).toISOString();
    } else {
       insertPayload.closed_at = null;
    }

    const { error: insertError } = await supabaseAdmin
      .from('trades')
      .upsert([insertPayload], { onConflict: 'ticket' });

    if (insertError) {

      console.error('Error inserting trade:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to record trade', message: insertError.message, details: insertError.details }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Return 200 OK JSON response indicating success
    return new Response(
      JSON.stringify({ success: true, message: 'Trade recorded successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
