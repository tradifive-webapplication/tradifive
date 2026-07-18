import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rylwyxhupwpwsdbvuoej.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching all admin profiles...");
  const { data, error: fetchError } = await supabase.from('admin_profiles').select('id, email, role');
  
  if (fetchError) {
    console.error("Error fetching:", fetchError);
    return;
  }

  if (!data || data.length === 0) {
    console.log("No admin profiles found.");
    return;
  }

  console.log(`Found ${data.length} admin profile(s):`);
  data.forEach(u => console.log(`  - ${u.email} (${u.role})`));

  console.log("\nDeleting all admin_profiles...");
  const { error: deleteError } = await supabase
    .from('admin_profiles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

  if (deleteError) {
    console.error("Delete error:", deleteError);
  } else {
    console.log("✅ admin_profiles table cleared.");
    console.log("\n⚠️  NEXT STEP: Delete the Auth users from the Supabase dashboard:");
    console.log("   → https://supabase.com/dashboard/project/rylwyxhupwpwsdbvuoej/auth/users");
    console.log("   Select all users and click Delete.");
    console.log("\nAfter that, you can sign up fresh at http://localhost:8082/signup");
  }
}

run();
