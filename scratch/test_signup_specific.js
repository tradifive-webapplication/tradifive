import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignupSpecific() {
  const email = "nikilharake369@gmail.com";
  const password = "TestPassword123!";
  
  console.log("Attempting signup for specific email:", email);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:8081/auth-callback',
        data: {
          first_name: "nikil",
          last_name: "harake"
        }
      }
    });
    
    if (error) {
      console.error("Signup returned error:", error);
    } else {
      console.log("Signup returned data:", data);
    }
  } catch (err) {
    console.error("Fetch threw error:", err);
  }
}

testSignupSpecific();
