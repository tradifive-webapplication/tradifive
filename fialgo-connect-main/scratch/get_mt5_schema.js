import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

async function getSchema() {
  console.log("Fetching schema info for mt5_accounts...");
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`, {
    headers: {
      'Accept': 'application/openapi+json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  if (!res.ok) {
    console.error("Failed to fetch API spec:", res.status, res.statusText);
    return;
  }
  const spec = await res.json();
  const mt5Schema = spec.paths['/mt5_accounts'];
  console.log("MT5 Accounts definition:", JSON.stringify(mt5Schema, null, 2));
}

getSchema();
