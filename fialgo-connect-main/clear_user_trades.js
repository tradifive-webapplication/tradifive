import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Logging in as marketing@fialgo.com to delete all old trades...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "marketing@fialgo.com",
    password: "Nikilharake5*"
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }

  console.log("Logged in successfully! Deleting all trades for user ID:", authData.user.id);

  // 1. Delete all trades
  const { error: tradesError } = await supabase
    .from("trades")
    .delete()
    .eq("user_id", authData.user.id);

  if (tradesError) {
    console.error("Error deleting trades:", tradesError);
  } else {
    console.log("Successfully deleted all trades!");
  }

  // 2. Delete all accounts to allow a clean reconnect
  const { error: accountsError } = await supabase
    .from("mt5_accounts")
    .delete()
    .eq("user_id", authData.user.id);

  if (accountsError) {
    console.error("Error deleting mt5_accounts:", accountsError);
  } else {
    console.log("Successfully cleared mt5_accounts!");
  }

  console.log("\n✨ All old data cleared! Please run your MT5 Python bridge script now to sync your new live account fresh.");
}

run();
