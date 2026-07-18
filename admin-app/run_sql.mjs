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
  const query = `UPDATE public.hr_employees SET department = 'Operations' WHERE department IN ('Risk & Trading', 'Risk', 'Trading & Risk');`;
  console.log("Executing SQL:", query);
  
  const { data, error } = await supabase.rpc("exec_sql", { query });

  if (error) {
    console.error("SQL Execution Error:", error);
  } else {
    console.log("SQL Executed Successfully! Result:", data);
  }
}
run();
