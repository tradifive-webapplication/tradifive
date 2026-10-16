import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";
const supabase = createClient(supabaseUrl, supabaseKey);

async function attempt(email, password) {
  console.log(`\nAttempting login for: ${email}`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    console.error("Login failed:", error);
  } else {
    console.log("Login success! User ID:", data.user?.id);
  }
}

async function run() {
  await attempt("tradifive@gmail.com", "Nikilharake5*");
  await attempt("marketing@fialgo.com", "Nikilharake5*");
}

run();
