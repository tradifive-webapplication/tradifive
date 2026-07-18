const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=\"(.*)\"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=\"(.*)\"/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data: users, error: selectError } = await supabase.from('profiles').select('id').limit(1);
  if (!users || users.length === 0) return console.log('No users');
  const userId = users[0].id;
  
  const payload = {
    first_name: "test",
    last_name: "test",
    display_name: "test",
    username: "test",
    has_chosen_username: true,
    bio: "test",
    website: "test",
    instagram_id: "test",
    address: "test",
    city: "test",
    state: "test",
    zip_code: "test",
    country: "test",
    date_of_birth: null,
    gender: "test",
    avatar_url: "test",
    cover_url: "test"
  };
  
  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  
  console.log('Update result error:', error);
}
run();
