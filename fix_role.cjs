const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './admin-app/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  // Find the last created hr_employee
  const { data: emp } = await supabase.from('hr_employees').select('*').order('created_at', { ascending: false }).limit(1);
  if (!emp || emp.length === 0) return console.log("No employees found");
  
  console.log("Found newest employee:", emp[0].full_name, emp[0].email, emp[0].department);
  
  if (emp[0].department === "Content & Marketing") {
    // Update admin_profile
    const { data: profile } = await supabase.from('admin_profiles').select('*').eq('email', emp[0].email).single();
    if (profile) {
      console.log("Updating role for", profile.email, "from", profile.role, "to community_manager");
      await supabase.from('admin_profiles').update({ role: 'community_manager' }).eq('id', profile.id);
      console.log("Done!");
    } else {
      console.log("No admin profile found");
    }
  } else {
    console.log("Department is not Content & Marketing");
  }
}
fix();
