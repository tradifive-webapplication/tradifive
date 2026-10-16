import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserId() {
  const email = "marketing@fialgo.com";
  console.log("Fetching user ID from profiles for email:", email);
  const { data, error } = await supabase.from('profiles').select('id, activation_key').eq('email', email).maybeSingle();
  if (error) {
    console.error("Error querying profiles:", error);
  } else {
    console.log("Profile data:", data);
  }
}

getUserId();
