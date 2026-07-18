import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBehavior() {
  const userId = '314cfff7-f243-4d04-83a3-f703fcb91ba8';
  const testKey = 'TRADIFIVE-TESTKEY-12345';

  console.log("Updating profile with activation key...");
  const { data: profUpdate, error: profErr } = await supabase
    .from('profiles')
    .update({ activation_key: testKey })
    .eq('id', userId)
    .select();

  if (profErr) {
    console.error("Profile update error:", profErr);
    return;
  }
  console.log("Profile updated successfully:", profUpdate);

  console.log("Inserting mt5_accounts row...");
  const { data: mt5Insert, error: mt5Err } = await supabase
    .from('mt5_accounts')
    .insert({
      user_id: userId,
      broker_server: 'DemoServer',
      account_number: '112233'
    })
    .select();

  if (mt5Err) {
    console.error("MT5 insert error:", mt5Err);
  } else {
    console.log("MT5 row inserted:", mt5Insert);
  }

  // Cleanup
  console.log("Cleaning up...");
  await supabase.from('mt5_accounts').delete().eq('user_id', userId);
  await supabase.from('profiles').update({ activation_key: null }).eq('id', userId);
}

testBehavior();
