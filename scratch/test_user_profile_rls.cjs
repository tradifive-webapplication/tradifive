const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = `test_${Date.now()}@example.com`;
  const password = "password123";

  console.log(`1. Signing up user ${email}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    console.error("Signup error:", signUpError);
    return;
  }

  const user = signUpData.user;
  console.log("Signup success. User ID:", user.id);

  console.log("2. Attempting to insert profile for user...");
  const newProfile = {
    id: user.id,
    email: email,
    first_name: 'Test',
    last_name: 'User',
    display_name: 'Test User',
    username: `test_${Date.now()}`,
    created_at: new Date().toISOString()
  };

  const { data: insertData, error: insertError } = await supabase.from('profiles').insert(newProfile).select();
  if (insertError) {
    console.error("Profile insert failed:", insertError);
  } else {
    console.log("Profile insert success:", insertData);
  }

  console.log("3. Attempting to select all profiles as authenticated user...");
  const { data: selectData, error: selectError } = await supabase.from('profiles').select('*');
  console.log("Select result (profiles count):", selectData ? selectData.length : 'null', { selectError });
  if (selectData && selectData.length > 0) {
    console.log("Sample profile:", selectData[0]);
  }

  console.log("4. Attempting to insert post with profiles select...");
  const newPost = {
    user_id: user.id,
    content: "This is a test post matching mobile app query"
  };
  const { data: postData, error: postError } = await supabase.from('social_posts').insert(newPost).select('*, profiles:user_id(*)').single();
  if (postError) {
    console.error("Post insert failed:", postError);
  } else {
    console.log("Post insert success:", postData);
  }
}

run();
