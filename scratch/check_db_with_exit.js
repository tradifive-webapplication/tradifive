import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    console.log("Checking connection...");
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error("Error reading profiles:", error);
    } else {
      console.log("Profiles count:", profiles.length);
      console.log("Profiles list:", JSON.stringify(profiles, null, 2));
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  } finally {
    process.exit(0);
  }
}

run();
