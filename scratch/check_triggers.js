import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTriggers() {
  console.log("Checking triggers or RPC functions...");
  // Let's check what functions we can call or let's check mt5_accounts structure by trying to insert a dummy row.
  // We can insert a row into mt5_accounts with a dummy user_id if we have one, or check if we can query some database views.
  
  // Since we are using the anonymous key, we can see what policies or public functions exist.
  // Let's fetch some existing rows or check profiles again to see if we have any test profiles.
  const { data: profiles, error: err } = await supabase.from('profiles').select('id, activation_key').limit(5);
  if (err) {
    console.error("Error fetching profiles:", err);
  } else {
    console.log("Existing profiles:", profiles);
  }
}

checkTriggers();
