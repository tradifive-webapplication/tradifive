import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DhanTrade {
  dhanClientId: string;
  orderId: string;
  tradeId: string;
  transactionType: "BUY" | "SELL";
  exchangeSegment: string;
  productType: string;
  tradingSymbol: string;
  quantity: number;
  price: number;
  createTime: string;
}

interface MatchedTrade {
  user_id: string;
  ticket: string; // unique ticket identifier e.g. "dhan_buyId_sellId"
  symbol: string;
  profit: number;
  trade_type: number; // 0 = Buy, 1 = Sell
  lot_size: number;
  opened_at: string;
  closed_at: string;
}

// Chronological FIFO matching algorithm to pair fills and calculate P&L
function matchTrades(trades: DhanTrade[], userId: string, brokerName: string): MatchedTrade[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
  );

  const matched: MatchedTrade[] = [];
  const tradesBySymbol: Record<string, DhanTrade[]> = {};

  // Group fills by symbol
  for (const t of sorted) {
    if (!tradesBySymbol[t.tradingSymbol]) {
      tradesBySymbol[t.tradingSymbol] = [];
    }
    tradesBySymbol[t.tradingSymbol].push(t);
  }

  // FIFO logic per symbol
  for (const symbol in tradesBySymbol) {
    const symbolTrades = tradesBySymbol[symbol];
    const executionQueue: { tradeId: string; type: "BUY" | "SELL"; qty: number; price: number; time: string }[] = [];

    for (const execution of symbolTrades) {
      const type = execution.transactionType;
      const qty = execution.quantity;
      const price = execution.price;
      const time = execution.createTime;
      const id = execution.tradeId;

      let remainingQty = qty;

      while (executionQueue.length > 0 && remainingQty > 0) {
        const front = executionQueue[0];

        // Match opposite trades (offsetting positions)
        if (front.type !== type) {
          const matchQty = Math.min(front.qty, remainingQty);
          let profit = 0;
          let tradeType = 0; // 0 = Long, 1 = Short

          if (front.type === "BUY") {
            // Long trade exit
            profit = (price - front.price) * matchQty;
            tradeType = 0;
          } else {
            // Short trade cover
            profit = (front.price - price) * matchQty;
            tradeType = 1;
          }

          matched.push({
            user_id: userId,
            ticket: `${brokerName}_${front.tradeId}_${id}`,
            symbol: symbol,
            profit: parseFloat(profit.toFixed(2)),
            trade_type: tradeType,
            lot_size: matchQty,
            opened_at: front.time,
            closed_at: time,
          });

          front.qty -= matchQty;
          remainingQty -= matchQty;

          if (front.qty === 0) {
            executionQueue.shift();
          }
        } else {
          break; // Same execution type, cannot match
        }
      }

      if (remainingQty > 0) {
        executionQueue.push({
          tradeId: id,
          type: type,
          qty: remainingQty,
          price: price,
          time: time,
        });
      }
    }
  }

  return matched;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let action = 'sync';
    let body: any = {};
    if (req.method === 'POST') {
      body = await req.json().catch(() => ({}));
      action = body.action || 'sync';
    }

    const appId = Deno.env.get('DHAN_API_KEY');
    const appSecret = Deno.env.get('DHAN_API_SECRET');

    // --- DHAN OAUTH ACTION: GENERATE CONSENT ---
    if (action === 'generate-consent') {
      const dhanClientId = body.dhanClientId;
      if (!dhanClientId) throw new Error('Missing dhanClientId');

      const res = await fetch(`https://auth.dhan.co/app/generate-consent?client_id=${dhanClientId}`, {
        method: 'POST',
        headers: {
          'app_id': appId ?? '',
          'app_secret': appSecret ?? '',
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Dhan Consent Error: ${err || res.statusText}`);
      }

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // --- DHAN OAUTH ACTION: CONSUME CONSENT ---
    if (action === 'consume-consent') {
      const tokenId = body.tokenId;
      const userId = body.userId;
      if (!tokenId) throw new Error('Missing tokenId');
      if (!userId) throw new Error('Missing userId');

      // Dhan's endpoint for consuming consent is a GET request to consumeApp-consent
      const res = await fetch(`https://auth.dhan.co/app/consumeApp-consent?tokenId=${tokenId}`, {
        method: 'GET',
        headers: {
          'app_id': appId ?? '',
          'app_secret': appSecret ?? '',
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Dhan Token Consume Error: ${err || res.statusText}`);
      }

      const data = await res.json();
      const accessToken = data.accessToken || data.access_token;
      const clientUcc = data.dhanClientId || data.dhanClientUcc || body.dhanClientId || 'Connected';

      if (!accessToken) {
        throw new Error('Dhan response did not contain an access token');
      }

      // Clear any existing Dhan connections for this user first
      await supabaseAdmin
        .from('broker_connections')
        .delete()
        .eq('user_id', userId)
        .eq('broker_name', 'dhan');

      const { error: dbError } = await supabaseAdmin
        .from('broker_connections')
        .insert({
          user_id: userId,
          broker_name: 'dhan',
          client_id: clientUcc,
          api_key: accessToken,
          connection_status: 'active'
        });

      if (dbError) throw dbError;

      return new Response(JSON.stringify({ success: true, client_id: clientUcc }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // --- DEFAULT ACTION: SYNC TRADES ---
    // Fetch active Dhan and Upstox connections
    const { data: connections, error: connError } = await supabaseAdmin
      .from('broker_connections')
      .select('*')
      .in('broker_name', ['dhan', 'upstox'])
      .eq('connection_status', 'active');

    if (connError) throw connError;
    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active Indian broker connections to sync' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const syncResults = [];

    for (const connection of connections) {
      const broker = connection.broker_name;
      try {
        const apiToken = connection.api_key;
        const clientId = connection.client_id;

        if (!apiToken || !clientId) {
          syncResults.push({ id: connection.id, broker, status: 'skipped', reason: 'Missing credentials' });
          continue;
        }

        let unifiedTrades: DhanTrade[] = [];

        if (broker === 'dhan') {
          // Fetch from Dhan API
          const dhanUrl = "https://api.dhan.co/v2/trades";
          const dhanRes = await fetch(dhanUrl, {
            headers: {
              "access-token": apiToken,
              "client-id": clientId,
              "Content-Type": "application/json"
            }
          });

          if (!dhanRes.ok) {
            const errMsg = await dhanRes.text();
            throw new Error(`Dhan API Error: ${errMsg || dhanRes.statusText}`);
          }

          unifiedTrades = await dhanRes.json();
        } else if (broker === 'upstox') {
          // Fetch today's executed trades from Upstox API
          const upstoxUrl = "https://api.upstox.com/v2/order/trades";
          const upstoxRes = await fetch(upstoxUrl, {
            headers: {
              "Authorization": `Bearer ${apiToken}`,
              "Accept": "application/json"
            }
          });

          if (!upstoxRes.ok) {
            const errMsg = await upstoxRes.text();
            throw new Error(`Upstox API Error: ${errMsg || upstoxRes.statusText}`);
          }

          const upstoxResData = await upstoxRes.json();
          const rawTrades = upstoxResData.data || [];
          
          // Map Upstox trades to unified format
          unifiedTrades = rawTrades.map((t: any) => ({
            dhanClientId: clientId,
            orderId: t.order_id,
            tradeId: t.trade_id,
            transactionType: t.transaction_type,
            exchangeSegment: t.exchange || "NSE",
            productType: t.product || "I",
            tradingSymbol: t.trading_symbol,
            quantity: t.quantity,
            price: t.price,
            createTime: t.trade_timestamp
          }));
        }

        if (Array.isArray(unifiedTrades) && unifiedTrades.length > 0) {
          // 3. Match fills and calculate profits
          const matched = matchTrades(unifiedTrades, connection.user_id, broker);

          if (matched.length > 0) {
            // 4. Upsert trades into 'trades' table
            const { error: upsertError } = await supabaseAdmin
              .from('trades')
              .upsert(matched, { onConflict: 'ticket' });

            if (upsertError) throw upsertError;
          }
          
          syncResults.push({ id: connection.id, broker, status: 'success', matchedCount: matched.length });
        } else {
          syncResults.push({ id: connection.id, broker, status: 'success', matchedCount: 0, reason: 'No trades executed today' });
        }

        // 5. Fetch Account Balance / Funds and store in mt5_accounts
        try {
          let accountBalance = 0;
          let accountEquity = 0;

          if (broker === 'dhan') {
            const fundsRes = await fetch('https://api.dhan.co/v2/fundlimit', {
              headers: {
                'access-token': apiToken,
                'client-id': clientId,
                'Content-Type': 'application/json'
              }
            });
            if (fundsRes.ok) {
              const fundsData = await fundsRes.json();
              // Dhan fundlimit response: availabelBalance, sodLimit, collateralAmount, receiveableAmount
              accountBalance = parseFloat(fundsData.availabelBalance || fundsData.availableBalance || fundsData.sodLimit || 0);
              accountEquity = parseFloat(fundsData.availabelBalance || fundsData.availableBalance || fundsData.sodLimit || 0);
            }
          } else if (broker === 'upstox') {
            const fundsRes = await fetch('https://api.upstox.com/v2/user/get-funds-and-margin?segment=SEC', {
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Accept': 'application/json'
              }
            });
            if (fundsRes.ok) {
              const fundsData = await fundsRes.json();
              const equity = fundsData?.data?.equity;
              accountBalance = parseFloat(equity?.available_margin || equity?.net || 0);
              accountEquity = parseFloat(equity?.available_margin || equity?.net || 0);
            }
          }

          if (accountBalance > 0 || accountEquity > 0) {
            // Upsert balance into indian_broker_accounts (NOT mt5_accounts — that is for Forex/MT5 only)
            await supabaseAdmin
              .from('indian_broker_accounts')
              .upsert({
                user_id: connection.user_id,
                broker_name: broker,
                client_id: clientId,
                account_number: clientId,
                balance: accountBalance,
                equity: accountEquity,
                available_margin: accountBalance,
                connection_status: 'active',
                last_synced_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });

            // Also update broker_connections with cached balance for quick reads
            await supabaseAdmin
              .from('broker_connections')
              .update({
                balance: accountBalance,
                updated_at: new Date().toISOString()
              })
              .eq('id', connection.id);

            syncResults.push({ id: connection.id, broker, balanceSynced: true, balance: accountBalance });
          }
        } catch (fundErr: any) {
          console.warn(`Fund sync warning for ${broker}:`, fundErr.message);
        }

        // Update connection update timestamps
        await supabaseAdmin
          .from('broker_connections')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', connection.id);

      } catch (err: any) {
        console.error(`Sync failed for connection ${connection.id} (${broker}):`, err);
        syncResults.push({ id: connection.id, broker, status: 'failed', error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ message: 'Sync complete', results: syncResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})
