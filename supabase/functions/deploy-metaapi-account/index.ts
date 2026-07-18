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
    const body = await req.json()
    console.log("Received deployment request:", { ...body, masterPassword: '***' })
    const { accountNumber, masterPassword, brokerServer, manualAccountId, purpose } = body

    // Validate input before calling MetaApi
    if (!accountNumber || !masterPassword || !brokerServer) {
      console.error("Missing fields in request:", { accountNumber: !!accountNumber, masterPassword: !!masterPassword, brokerServer: !!brokerServer });
      throw new Error('Missing required fields. Please ensure MT5 ID, Password, and Server are all filled out.');
    }

    // 1. Initialize Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let metaapiAccountId = manualAccountId;

    if (!metaapiAccountId) {
      // 2. Fetch the MetaApi Token from Env
      const META_API_TOKEN = Deno.env.get('META_API_TOKEN')
      if (!META_API_TOKEN) throw new Error('META_API_TOKEN not configured in Supabase')

      // 3. Register Account with MetaApi
      const metaApiUrl = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts';
      
      // FIRST: Check if an account with this login already exists and delete it to prevent "stuck" high-reliability accounts
      try {
        const listRes = await fetch(metaApiUrl, {
          headers: { 'auth-token': META_API_TOKEN }
        });
        if (listRes.ok) {
          const accounts = await listRes.json();
          const existing = accounts.find((a: any) => a.login === String(accountNumber) && a.server === brokerServer);
          if (existing) {
            console.log("Found existing account, deleting it to recreate with correct tier:", existing.id);
            await fetch(`${metaApiUrl}/${existing.id}`, {
              method: 'DELETE',
              headers: { 'auth-token': META_API_TOKEN }
            });
          }
        }
      } catch (e) {
        console.warn("Could not check/delete existing accounts", e);
      }

      const registrationPayload = {
        name: `Tradifive-${accountNumber}`,
        type: 'cloud-g1',
        login: String(accountNumber),
        password: masterPassword,
        server: brokerServer,
        platform: 'mt5',
        magic: 1000,
        reliability: 'regular'
      };

      console.log("Registering with MetaApi. Payload:", JSON.stringify({ ...registrationPayload, password: '***' }));
      
      const registerResponse = await fetch(metaApiUrl, {
        method: 'POST',
        headers: {
          'auth-token': META_API_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationPayload)
      });

      const metaApiData = await registerResponse.json();
      
      if (!registerResponse.ok) {
        console.error('MetaApi Registration Error:', metaApiData);
        
        // Handle specific "Validation failed" errors with more detail
        if (metaApiData.message === 'Validation failed' && metaApiData.details) {
          const details = metaApiData.details.map((d: any) => `${d.path}: ${d.message}`).join(', ');
          throw new Error(`MetaApi Validation Failed: ${details}`);
        }

        // If account already exists, we might get a 400. 
        if (registerResponse.status === 400 && (metaApiData.message?.includes('already exists') || JSON.stringify(metaApiData).includes('already exists'))) {
          console.log("Account already exists in MetaApi, attempting to fetch existing account ID...");
          const listRes = await fetch('https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts', {
            headers: { 'auth-token': META_API_TOKEN }
          });
          const accounts = await listRes.json();
          const existing = accounts.find((a: any) => a.login === accountNumber);
          if (existing) {
            metaApiData.id = existing.id;
          } else {
            throw new Error('Account exists but could not be retrieved');
          }
        } else {
          throw new Error(metaApiData.message || 'MetaApi: ' + JSON.stringify(metaApiData));
        }
      }

      metaapiAccountId = metaApiData.id || metaApiData.accountId;

      // 4. Explicitly DEPLOY the account (required for cloud-g2)
      console.log("Deploying MetaApi account:", metaapiAccountId);
      const deployRes = await fetch(`https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${metaapiAccountId}/deploy`, {
        method: 'POST',
        headers: { 'auth-token': META_API_TOKEN }
      });
      
      if (!deployRes.ok) {
        const deployError = await deployRes.json();
        console.error("Deployment Error:", deployError);
        throw new Error(`MetaApi Deployment Failed: ${deployError.message || 'Insufficient balance or billing error in MetaApi'}`);
      }
    }

    // 5. Update the user's profile with the new account info
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (userError || !user) throw new Error('Unauthorized')

    console.log("Upserting to mt5_accounts for user:", user.id);
    const { error: updateError } = await supabaseAdmin
      .from('mt5_accounts')
      .upsert({
        user_id: user.id,
        account_number: accountNumber,
        broker_server: brokerServer,
        metaapi_account_id: metaapiAccountId,
        connection_status: 'deployed'
      })

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        message: 'Account deployed successfully',
        accountId: metaapiAccountId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error("Critical Function Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
