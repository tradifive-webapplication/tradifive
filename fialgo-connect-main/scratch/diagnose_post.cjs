const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== COMPREHENSIVE POST DIAGNOSTICS ===\n");

  // 1. Check anonymous profile reads
  console.log("1. Anonymous profile read (no auth)...");
  const { data: anonProfiles, error: anonErr } = await supabase.from('profiles').select('id, email, username, display_name').limit(5);
  console.log("   Anon profiles:", anonProfiles?.length || 0, "rows. Error:", anonErr?.message || 'none');

  // 2. Check anonymous post reads
  console.log("\n2. Anonymous social_posts read (no auth)...");
  const { data: anonPosts, error: anonPostErr } = await supabase.from('social_posts').select('*').limit(5);
  console.log("   Anon posts:", anonPosts?.length || 0, "rows. Error:", anonPostErr?.message || 'none');
  if (anonPosts && anonPosts.length > 0) {
    console.log("   Sample post:", JSON.stringify(anonPosts[0], null, 2));
  }

  // 3. Anonymous post insert (should FAIL due to RLS)
  console.log("\n3. Anonymous post insert (should fail)...");
  const { data: anonInsert, error: anonInsertErr } = await supabase
    .from('social_posts')
    .insert({ user_id: '00000000-0000-0000-0000-000000000000', content: 'anon test - should fail' })
    .select();
  console.log("   Anon insert result:", anonInsert ? 'SUCCESS (unexpected!)' : 'null');
  console.log("   Anon insert error:", anonInsertErr?.message || 'none', anonInsertErr?.code || '');

  // 4. Sign up a test user and try the full flow
  const email = `diag_${Date.now()}@test.com`;
  const password = "DiagPass123!";
  console.log(`\n4. Signing up test user: ${email}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    console.error("   Signup error:", signUpError.message);
    return;
  }
  const userId = signUpData.user.id;
  console.log("   User ID:", userId);

  // 5. Check authenticated profile read  
  console.log("\n5. Authenticated profile read...");
  const { data: authProfiles, error: authProfErr } = await supabase.from('profiles').select('id, email, username, display_name').limit(10);
  console.log("   Auth profiles:", authProfiles?.length || 0, "rows. Error:", authProfErr?.message || 'none');
  if (authProfiles) {
    authProfiles.forEach(p => console.log("   ->", p.id.substring(0, 8) + "...", p.email, p.username, p.display_name));
  }

  // 6. Check authenticated post read
  console.log("\n6. Authenticated social_posts read...");
  const { data: authPosts, error: authPostErr } = await supabase.from('social_posts').select('*').limit(10);
  console.log("   Auth posts:", authPosts?.length || 0, "rows. Error:", authPostErr?.message || 'none');

  // 7. Try inserting a TEXT-ONLY post (same as "twit" in the app)
  console.log("\n7. Inserting text-only post (twit mode - same as app)...");
  const newPost = {
    user_id: userId,
    content: "Diagnostic test post - text only twit",
    media_url: undefined,  // Same as app sends for 'twit' type
    media_type: undefined, // Same as app sends for 'twit' type
  };
  console.log("   Payload:", JSON.stringify(newPost));
  const { data: insertData, error: insertErr } = await supabase
    .from('social_posts')
    .insert([newPost])  // Array wrapped, same as app
    .select('*, profiles:user_id(*)')
    .single();
  
  if (insertErr) {
    console.error("   INSERT FAILED:", insertErr.message, insertErr.code, insertErr.details, insertErr.hint);
  } else {
    console.log("   INSERT SUCCESS! Post ID:", insertData?.id);
    console.log("   Profile joined:", insertData?.profiles ? 'YES' : 'NO');
    if (insertData?.profiles) {
      console.log("   Profile display_name:", insertData.profiles.display_name);
      console.log("   Profile username:", insertData.profiles.username);
    }
  }

  // 8. Check RLS policies by querying pg_policies (might fail without service role)
  console.log("\n8. Attempting to read RLS policies (may require service role)...");
  const { data: policies, error: polErr } = await supabase.rpc('get_policies', {});
  if (polErr) {
    console.log("   Cannot read policies via RPC (expected):", polErr.message);
  } else {
    console.log("   Policies:", policies);
  }

  // 9. Check if social_post_likes table exists (needed by fetchPosts)
  console.log("\n9. Checking social_post_likes table...");
  const { data: likesCheck, error: likesErr } = await supabase.from('social_post_likes').select('*').limit(1);
  console.log("   social_post_likes accessible:", !likesErr ? 'YES' : 'NO');
  if (likesErr) console.log("   Error:", likesErr.message, likesErr.code);

  // 10. Check social_follows table
  console.log("\n10. Checking social_follows table...");
  const { data: followsCheck, error: followsErr } = await supabase.from('social_follows').select('*').limit(1);
  console.log("   social_follows accessible:", !followsErr ? 'YES' : 'NO');
  if (followsErr) console.log("   Error:", followsErr.message, followsErr.code);

  // 11. Clean up - delete the test post
  if (insertData) {
    console.log("\n11. Cleaning up test post...");
    const { error: delErr } = await supabase.from('social_posts').delete().eq('id', insertData.id);
    console.log("   Delete result:", delErr ? delErr.message : 'success');
  }

  console.log("\n=== DIAGNOSTICS COMPLETE ===");
  console.log("\nSUMMARY:");
  console.log("  Anon can read profiles:", anonProfiles?.length > 0 ? 'YES' : 'NO (needs SQL fix)');
  console.log("  Anon can read posts:", anonPosts?.length > 0 ? 'YES (' + anonPosts.length + ')' : 'NO (needs SQL fix)');
  console.log("  Auth can read profiles:", authProfiles?.length > 0 ? 'YES (' + authProfiles.length + ')' : 'ONLY OWN (needs SQL fix)');
  console.log("  Auth can insert post:", insertData ? 'YES' : 'NO');
  console.log("  Profile join works:", insertData?.profiles ? 'YES' : 'NO');
}

run().catch(e => console.error("Fatal:", e));
