const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const email = `signup_test_${Date.now()}@example.com`;
  const password = "TestPass123!";
  const firstName = "Test";
  const lastName = "Signup";

  console.log("=== SIGNUP FLOW TEST ===\n");
  console.log("1. Attempting signup with:", email);

  // Step 1: Sign up (same as AuthService.signUpWithEmail)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        username: email.split('@')[0],
      }
    }
  });

  if (error) {
    console.error("   SIGNUP ERROR:", error.message, error.status);
    return;
  }

  console.log("   Signup response:");
  console.log("   - User ID:", data.user?.id || 'null');
  console.log("   - Session:", data.session ? 'YES (auto-confirmed)' : 'NULL (email confirm required)');
  console.log("   - User email:", data.user?.email);
  console.log("   - Identities:", data.user?.identities?.length || 0);

  // Check if user was actually created (identities > 0 means new user)
  if (data.user?.identities?.length === 0) {
    console.log("\n   WARNING: User already exists (0 identities returned).");
  }

  // Step 2: Try profile upsert (same as auth.service.ts)
  if (data.user) {
    console.log("\n2. Upserting profile...");
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      display_name: '',
      bio: '',
      username: email.split('@')[0],
      email: email,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/png?seed=${firstName}`
    });
    if (profileError) {
      console.error("   PROFILE UPSERT ERROR:", profileError.message, profileError.code);
    } else {
      console.log("   Profile upserted successfully.");
    }
  }

  // Step 3: Try auto-login (the new fix)
  if (!data.session) {
    console.log("\n3. No session — attempting auto-login with credentials...");
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error("   AUTO-LOGIN ERROR:", loginError.message, loginError.status);
      console.log("   This means email confirmation is BLOCKING login.");
      console.log("   FIX: Go to Supabase Dashboard → Authentication → Providers → Email");
      console.log("         Turn OFF 'Confirm email'");
    } else {
      console.log("   Auto-login SUCCESS!");
      console.log("   - Session:", loginData.session ? 'YES' : 'NO');
      console.log("   - User ID:", loginData.user?.id);
    }
  } else {
    console.log("\n3. Session already exists — auto-login not needed.");
  }

  console.log("\n=== TEST COMPLETE ===");
}

testSignup().catch(e => console.error("Fatal:", e));
