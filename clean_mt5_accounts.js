import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Logging in as marketing@fialgo.com to clean up mt5_accounts rows...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "marketing@fialgo.com",
    password: "Nikilharake5*"
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }

  // Delete all mt5_accounts rows for this user to make it completely fresh
  const { data, error } = await supabase
    .from("mt5_accounts")
    .delete()
    .eq("user_id", authData.user.id);

  if (error) {
    console.error("Delete Error:", error);
  } else {
    console.log("Deleted all duplicate mt5_accounts rows! Response:", data);
  }
}

run();
