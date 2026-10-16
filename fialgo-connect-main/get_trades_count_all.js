import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: "marketing@fialgo.com",
    password: "Nikilharake5*"
  });

  const { data: profiles } = await supabase.from("profiles").select("id, email, full_name");
  console.log("Profiles:", profiles);

  const { data: trades } = await supabase.from("trades").select("user_id, symbol, ticket, profit");
  console.log("Total trades in DB:", trades?.length);

  const counts = {};
  trades?.forEach(t => {
    counts[t.user_id] = (counts[t.user_id] || 0) + 1;
  });
  console.log("Trades counts grouped by user_id:", counts);

  const { data: accounts } = await supabase.from("mt5_accounts").select("user_id, account_number, balance");
  console.log("All MT5 Accounts in DB:", accounts);
}

run();
