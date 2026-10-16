import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MjY2MDUsImV4cCI6MjA1NDUwMjYwNX0.HlK-ZfD49KqD6N60O0N7m9C71DpxvT3uYf_oQ3-4vTo";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAccount() {
  const { data, error } = await supabase.from('mt5_accounts').select('*').limit(1);
  console.log("MT5 Account:", data);
}
checkAccount();
