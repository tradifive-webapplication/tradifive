const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL="(.*)"/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*)"/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);
async function run() {
  const { data } = await supabase.from('notifications').select('*').limit(5);
  console.log(JSON.stringify(data, null, 2));
}
run();
