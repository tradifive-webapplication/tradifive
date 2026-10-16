import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Step 1: Signing in as tradifive@gmail.com...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "tradifive@gmail.com",
    password: "Nikilharake5*"
  });

  if (authError) {
    console.error("❌ Login FAILED:", authError.message);
    return;
  }
  console.log("✅ Login SUCCESS! User ID:", authData.user.id);

  console.log("\nStep 2: Checking admin_profiles for this user...");
  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("role, email, full_name")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    console.error("❌ Admin profile NOT found:", profileError?.message);
  } else {
    console.log("✅ Admin profile found:", profile);
  }

  console.log("\nStep 3: Testing profile update (sending warning to nikilharake369@gmail.com)...");
  const targetUserId = "b6f3f0e7-4779-4a5a-8ade-239bd98936d2";
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      account_standing: "WARNING",
      standing_message: "Test warning from admin - please review your trading activity."
    })
    .eq("id", targetUserId);

  if (updateError) {
    console.error("❌ Profile update FAILED:", updateError.message);
  } else {
    console.log("✅ Profile update SUCCESS! Warning sent to nikilharake369@gmail.com");
  }

  // Sign out after test
  await supabase.auth.signOut();
}

run();
