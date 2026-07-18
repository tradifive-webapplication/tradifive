import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Altering trades table to add opened_at and closed_at if they do not exist...");
  
  const { data, error } = await supabase.rpc("exec_sql", {
    query: "ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ, ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;"
  });

  if (error) {
    console.error("Error running SQL:", error);
  } else {
    console.log("SQL run successfully. Response:", data);
  }
}

run();
