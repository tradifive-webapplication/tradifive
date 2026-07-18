const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSignup() {
  const testEmail = `test_user_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  
  console.log(`[Test] Attempting sign up with: ${testEmail}...`);
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: "Test",
          last_name: "User",
          username: testEmail.split('@')[0]
        }
      }
    });
    
    const duration = Date.now() - startTime;
    console.log(`[Test] Done in ${duration}ms`);
    if (error) {
      console.error("[Test Error]:", error);
    } else {
      console.log("[Test Success] Session:", data.session ? "Active" : "Null (needs email confirmation)");
      console.log("[Test Success] User:", data.user ? data.user.id : "None");
      
      // Clean up the created user if possible
      if (data.user) {
        console.log("[Test Cleanup] Deleting created user from public.profiles...");
        const { error: profileDelError } = await supabase.from('profiles').delete().eq('id', data.user.id);
        if (profileDelError) console.error("[Test Cleanup Error profiles]:", profileDelError);
      }
    }
  } catch (err) {
    console.error("[Test System Error]:", err);
  }
}

testSignup();
