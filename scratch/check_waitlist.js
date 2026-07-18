import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking waitlist table on Supabase...");
  const { data, error } = await supabase.from('waitlist').select('*').limit(1);
  if (error) {
    console.error("Error querying waitlist:", error);
  } else {
    console.log("Successfully queried waitlist! Data:", data);
  }
}
check();
