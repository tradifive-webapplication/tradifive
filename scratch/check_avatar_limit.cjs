const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  console.log("Fetching first profile...");
  const { data: profiles, error: fetchError } = await supabase.from('profiles').select('*').limit(1);
  if (fetchError) {
    console.error("Fetch Error:", fetchError);
    return;
  }
  if (!profiles || profiles.length === 0) {
    console.log("No profiles found to test with.");
    return;
  }

  const profile = profiles[0];
  console.log("Selected profile ID:", profile.id);
  console.log("Current display name:", profile.display_name);
  console.log("Current avatar URL length:", profile.avatar_url ? profile.avatar_url.length : 0);

  // Generate a mock base64 string (about 100KB)
  const dummyBase64 = "data:image/png;base64," + "A".repeat(100 * 1024);

  console.log("Attempting to update profile avatar_url with 100KB base64 string...");
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: dummyBase64 })
    .eq('id', profile.id)
    .select();

  if (error) {
    console.error("UPDATE FAILED! Database error:", error);
  } else {
    console.log("UPDATE SUCCESSFUL! Updated row:", JSON.stringify(data, null, 2));

    // Restore old avatar_url
    console.log("Restoring original avatar_url...");
    await supabase.from('profiles').update({ avatar_url: profile.avatar_url }).eq('id', profile.id);
    console.log("Restored!");
  }
}

testUpdate();
