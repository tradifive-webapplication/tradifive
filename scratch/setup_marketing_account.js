import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupMarketing() {
  const email = "marketing@fialgo.com";
  const password = "Nikilharake5*";
  const testKey = "TRADIFIVE-MARKETING-KEY";

  console.log(`Signing in as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error("Login failed:", authError.message);
    return;
  }
  
  const userId = authData.user.id;
  console.log("Logged in successfully! User ID:", userId);

  console.log("Attempting to insert mt5_accounts row...");
  const { data: mt5Data, error: mt5Err } = await supabase
    .from('mt5_accounts')
    .insert([{
      user_id: userId,
      activation_key: testKey,
      broker_server: 'Exness-MT5Trial14',
      account_number: '415756396',
      connection_status: 'deployed',
      balance: 415.90,
      equity: 415.90
    }])
    .select();

  if (mt5Err) {
    console.warn("MT5 accounts insert failed (expected if insert policy is missing):", mt5Err.message);
    
    console.log("Attempting to update existing mt5_accounts row instead...");
    const { data: mt5UpdateData, error: mt5UpdateErr } = await supabase
      .from('mt5_accounts')
      .update({
        activation_key: testKey,
        broker_server: 'Exness-MT5Trial14',
        account_number: '415756396',
        connection_status: 'deployed',
        balance: 415.90,
        equity: 415.90
      })
      .eq('user_id', userId)
      .select();
      
    if (mt5UpdateErr) {
      console.error("MT5 update failed:", mt5UpdateErr.message);
    } else {
      console.log("MT5 update succeeded:", mt5UpdateData);
    }
  } else {
    console.log("MT5 account inserted successfully:", mt5Data);
  }
}

setupMarketing();
