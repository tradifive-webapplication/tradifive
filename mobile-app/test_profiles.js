const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
const supabaseUrl = appJson.expo.extra.supabaseUrl;
const supabaseAnonKey = appJson.expo.extra.supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery() {
  console.log("Querying profile nikilharake369@gmail.com:");
  const res1 = await supabase.from('profiles').select('id').eq('email', 'nikilharake369@gmail.com').maybeSingle();
  console.log(res1);
}

testQuery();
