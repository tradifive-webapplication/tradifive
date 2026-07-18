import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[match[1].trim()] = val;
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "agenttest@tradifive.com",
    password: "password123"
  });

  if (error) {
    console.error("Sign in failed:", error);
    return;
  }

  console.log("Logged in user:", JSON.stringify(data.user, null, 2));

  const { data: userData } = await supabase.auth.getUser();
  console.log("getUser() user:", JSON.stringify(userData.user, null, 2));
}
run();
