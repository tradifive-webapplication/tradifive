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
      opened_at_sec, closed_at_sec, account_number, broker, balance, equity, 
      active_position_tickets, is_pending, active_pending_tickets,
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

    // Fallback: Verify via activation_key in payload if not authenticated via JWT
    if (!user_id && activation_key) {
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

    // Step B: Return 401 if neither authorization method is successful
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid credentials or missing activation key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
       // Check if account row already exists for this user
       const { data: existingAccount } = await supabaseAdmin
         .from('mt5_accounts')
         .select('id')
         .eq('user_id', user_id)
         .limit(1)
         .maybeSingle();

       let dbError = null;

       let targetAccountId = existingAccount?.id || null;

       if (existingAccount) {
         // Update existing account
         const { error } = await supabaseAdmin
           .from('mt5_accounts')
           .update({ 
              account_number: account_number ? String(account_number) : null,
              broker_server: broker || 'Unknown Server',
              balance,
              equity,
              connection_status: 'deployed'
           })
           .eq('id', targetAccountId);
         dbError = error;
       } else {
         // Insert new account row
         const { data: insertedAccount, error } = await supabaseAdmin
           .from('mt5_accounts')
           .insert([{ 
              user_id,
              account_number: account_number ? String(account_number) : null,
              broker_server: broker || 'Unknown Server',
              balance,
              equity,
              connection_status: 'deployed'
           }])
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
