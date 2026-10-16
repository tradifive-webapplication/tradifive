/**
 * This script uses the Supabase Management API to reset the password for tradifive@gmail.com
 * It uses the project's service role or management token.
 * 
 * We need to call the GoTrue admin endpoint: PATCH /admin/users/{userId}
 * with the project's anon key + user JWT isn't enough - we need service role key.
 * 
 * Alternative approach: Use Supabase CLI "supabase auth user list" style management.
 */

// Let's try a different approach: delete the broken user and re-signup properly
// Step 1: check what users exist via the Management API

const SUPABASE_URL = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function run() {
  // Test: Try to sign up again with email+password (in case old record has no password)
  console.log("Attempting sign up with email/password...");
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: "tradifive@gmail.com",
    password: "Nikilharake5*"
  });
  
  if (signupError) {
    console.log("Sign up result:", signupError.message);
  } else {
    console.log("Sign up result:", signupData.user ? "User created/found, ID: " + signupData.user.id : "No user returned");
    if (signupData.user) {
      console.log("Email confirmed:", signupData.user.email_confirmed_at);
    }
  }

  // Now try login again
  console.log("\nTrying login...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "tradifive@gmail.com",
    password: "Nikilharake5*"
  });

  if (error) {
    console.error("Login FAILED:", error.message);
  } else {
    console.log("Login SUCCESS! User ID:", data.user.id);
  }
}

run();
