import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = "tradifive@gmail.com";
  const password = "Nikilharake5*";

  console.log(`Attempting to sign up ${email}...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Sign-up error:", error.message);
    if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("exists")) {
      console.log("\nTrying with a new admin account (admin@tradifive.com)...");
      const fallbackEmail = "admin@tradifive.com";
      const { data: fbData, error: fbError } = await supabase.auth.signUp({
        email: fallbackEmail,
        password,
      });
      if (fbError) {
        console.error("Fallback sign-up error:", fbError.message);
      } else {
        console.log(`\n🎉 Success! Fallback account signed up.`);
        console.log(`Email: ${fallbackEmail}`);
        console.log(`User ID: ${fbData.user?.id}`);
      }
    }
  } else {
    console.log(`\n🎉 Success! Account signed up.`);
    console.log(`Email: ${email}`);
    console.log(`User ID: ${data.user?.id}`);
  }
}

run();
