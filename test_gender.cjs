const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=\"(.*)\"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=\"(.*)\"/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data, error } = await supabase.from('profiles').update({ gender: '' }).eq('id', 'b6f3f0e7-4779-4a5a-8ade-239bd98936d2').select();
  console.log('Update gender error:', error);
}
run();
