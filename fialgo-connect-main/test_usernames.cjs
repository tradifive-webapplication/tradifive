const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=\"(.*)\"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=\"(.*)\"/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data, error } = await supabase.from('profiles').select('username');
  if (data) {
     const emptyUsernames = data.filter(d => d.username === '');
     console.log('Empty usernames count:', emptyUsernames.length);
     console.log('Total users:', data.length);
  }
}
run();
