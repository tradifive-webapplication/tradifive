const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
const supabaseUrl = appJson.expo.extra.supabaseUrl;
const supabaseAnonKey = appJson.expo.extra.supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log("Testing existing email (reset):");
  const res1 = await supabase.auth.resetPasswordForEmail('nikilharake369@gmail.com');
  console.log(res1.error?.message || "Success");

  console.log("Testing non-existent email (reset):");
  const res2 = await supabase.auth.resetPasswordForEmail('doesntexist123999@gmail.com');
  console.log(res2.error?.message || "Success");
}

testAuth();
