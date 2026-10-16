import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const META_API_TOKEN = Deno.env.get('META_API_TOKEN')
    if (!META_API_TOKEN) throw new Error('META_API_TOKEN not configured')

    // 2. Fetch active accounts
    const { data: accounts, error: accError } = await supabaseAdmin
      .from('mt5_accounts')
      .select('*')
      .eq('connection_status', 'deployed')
      .eq('is_active', true)

    if (accError) throw accError
    if (!accounts || accounts.length === 0) {
      return new Response(JSON.stringify({ message: 'No active accounts to sync' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const syncResults = []

    for (const account of accounts) {
      const accountId = account.metaapi_account_id
      if (!accountId) continue

      try {
        // 3. Fetch Account State first to ensure it's deployed
        const accountUrl = `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${accountId}`
        const accountRes = await fetch(accountUrl, {
          headers: { 'auth-token': META_API_TOKEN }
        })
        const accountData = await accountRes.json()

        if (!accountRes.ok) {
          console.error(`Could not fetch account state for ${accountId}:`, accountData)
          continue
        }

        if (accountData.state !== 'DEPLOYED') {
          console.log(`Account ${accountId} is in state ${accountData.state}, skipping sync.`)
          syncResults.push({ id: account.id, status: 'skipped', reason: `Account state is ${accountData.state}` })
          continue
        }

        if (accountData.connectionStatus !== 'CONNECTED') {
          console.log(`Account ${accountId} is not connected to broker, skipping sync.`)
          syncResults.push({ id: account.id, status: 'skipped', reason: 'Broker not connected' })
          continue
        }

        // 4. Fetch Account Info (Balance/Equity)
        const infoUrl = `https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${accountId}/account-information`
        const infoRes = await fetch(infoUrl, {
          headers: { 'auth-token': META_API_TOKEN }
        })
        
        if (infoRes.ok) {
          const infoData = await infoRes.json()
          await supabaseAdmin.from('mt5_accounts').update({
            balance: infoData.balance,
            equity: infoData.equity,
            updated_at: new Date().toISOString()
          }).eq('id', account.id)
        }

        // 5. Fetch History Deals
        // Use a 48 hour window to be safe, or since last update if possible
        const startTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        const dealsUrl = `https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${accountId}/history-deals?startTime=${startTime}`
        const dealsRes = await fetch(dealsUrl, {
          headers: { 'auth-token': META_API_TOKEN }
        })
        const deals = await dealsRes.json()

        if (dealsRes.ok && Array.isArray(deals)) {
          const formattedTrades = deals
            .filter((deal: any) => deal.entryType === 'DEAL_ENTRY_OUT') // Only closing deals for history
            .map((deal: any) => ({
              user_id: account.user_id,
              mt5_account_id: account.id,
              ticket: deal.id,
              symbol: deal.symbol,
              profit: deal.profit + (deal.commission || 0) + (deal.swap || 0),
              trade_type: deal.type === 'DEAL_TYPE_BUY' ? 0 : 1,
              lot_size: deal.volume,
              opened_at: deal.time, 
              closed_at: deal.time,
            }))

          if (formattedTrades.length > 0) {
            const { error: tradeError } = await supabaseAdmin
              .from('trades')
              .upsert(formattedTrades, { onConflict: 'ticket' })
            
            if (tradeError) console.error(`Trade sync error for account ${account.id}:`, tradeError)
          }
        }

        syncResults.push({ id: account.id, status: 'success' })
      } catch (err) {
        console.error(`Sync failure for account ${account.id}:`, err)
        syncResults.push({ id: account.id, status: 'failed', error: err.message })
      }
    }

    return new Response(
      JSON.stringify({ message: 'Sync completed', results: syncResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
