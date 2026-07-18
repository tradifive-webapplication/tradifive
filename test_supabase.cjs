const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=\"(.*)\"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=\"(.*)\"/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
     console.log('Error:', error);
  } else if (data && data.length > 0) {
     console.log('Columns:', Object.keys(data[0]));
  } else {
     console.log('No data');
  }
}
run();
