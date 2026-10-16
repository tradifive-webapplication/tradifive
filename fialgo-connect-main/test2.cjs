const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=\"(.*)\"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=\"(.*)\"/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data: users } = await supabase.from('profiles').select('id, website').limit(1);
  console.log('User website before:', users[0].website);
  
  const { error, data } = await supabase.from('profiles').update({ website: 'test2' }).eq('id', users[0].id).select();
  console.log('Update error:', error);
  console.log('Update data:', data);
}
run();
