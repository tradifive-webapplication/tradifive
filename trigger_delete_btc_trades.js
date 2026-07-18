import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Logging in as marketing@fialgo.com to acquire session token...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "marketing@fialgo.com",
    password: "Nikilharake5*"
  });

  if (authError || !authData?.session) {
    console.error("Auth Error:", authError);
    return;
  }

  const token = authData.session.access_token;
  console.log("Authenticated! Triggering secure admin deletion of BTCUSD trades...");

  const response = await fetch(`${supabaseUrl}/functions/v1/mt5-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ action: "delete_btc_trades" })
  });

  console.log("Status:", response.status, response.statusText);
  const result = await response.json();
  console.log("Result:", result);

  // Check remaining count in DB
  const { data: remaining } = await supabase.from("trades").select("symbol").eq("user_id", authData.user.id);
  console.log("\nRemaining Trades in DB:", remaining?.length);
  const symbols = {};
  remaining?.forEach(t => {
    symbols[t.symbol] = (symbols[t.symbol] || 0) + 1;
  });
  console.log(symbols);
}

run();
