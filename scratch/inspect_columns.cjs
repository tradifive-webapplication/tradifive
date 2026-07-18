const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkResources() {
  console.log("Checking if 'preferences' column exists in profiles...");
  const { data: prefData, error: prefError } = await supabase
    .from('profiles')
    .select('preferences')
    .limit(1);

  if (prefError) {
    console.log("Preferences column check failed:", prefError.message);
  } else {
    console.log("Preferences column EXISTS!");
  }

  console.log("Checking if 'delete_own_user' RPC exists...");
  const { data: rpcData, error: rpcError } = await supabase.rpc('delete_own_user');
  if (rpcError) {
    console.log("Delete own user RPC check error:", rpcError.message);
  } else {
    console.log("Delete own user RPC EXISTS! (or returned success/auth issue)");
  }
}

checkResources();
