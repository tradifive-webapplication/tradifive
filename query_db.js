import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const query = process.argv[2];
  if (!query) {
    console.error("Please provide a SQL query as an argument.");
    process.exit(1);
  }

  console.log("Executing query:", query);
  const { data, error } = await supabase.rpc("exec_sql", { query });

  if (error) {
    console.error("RPC Error:", error);
  } else {
    console.log("Query Results:", data);
  }
}

run();
