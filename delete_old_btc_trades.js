import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Logging in as marketing@fialgo.com to remove old BTCUSD trade history...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "marketing@fialgo.com",
    password: "Nikilharake5*"
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }

  console.log("Logged in successfully! Deleting BTCUSD trades for user:", authData.user.id);

  // Delete only the old BTCUSD trades
  const { data, error } = await supabase
    .from("trades")
    .delete()
    .eq("user_id", authData.user.id)
    .eq("symbol", "BTCUSD");

  if (error) {
    console.error("Delete Error:", error);
  } else {
    console.log("Successfully deleted all old BTCUSD trades from the database!");
  }

  // Get count of remaining trades to confirm
  const { data: remainingTrades } = await supabase
    .from("trades")
    .select("symbol, profit")
    .eq("user_id", authData.user.id);

  console.log("\nRemaining Live Trades in DB:", remainingTrades?.length);
  console.log("Remaining Trades by Symbol:");
  const symbols = {};
  remainingTrades?.forEach(t => {
    symbols[t.symbol] = (symbols[t.symbol] || 0) + 1;
  });
  console.log(symbols);
}

run();
