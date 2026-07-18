import { createClient } from "@supabase/supabase-js";
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("=== Starting Database Security Hardening ===");

  // 1. Load SQL from supabase/security_hardening.sql
  let sqlContent = "";
  try {
    sqlContent = fs.readFileSync('supabase/security_hardening.sql', 'utf8');
  } catch (err) {
    console.error("Failed to read security_hardening.sql:", err.message);
    return;
  }

  // 2. Append additional hardening SQL for broker_connections RLS policies
  const additionalSQL = `
    -- Enable RLS on broker_connections
    ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

    -- Drop existing connection policies to avoid duplicates
    DROP POLICY IF EXISTS "Users can manage their own broker connections" ON public.broker_connections;
    DROP POLICY IF EXISTS "Service role manages all broker connections" ON public.broker_connections;

    -- Policy: Users can only select/insert/update/delete their own broker connection record
    CREATE POLICY "Users can manage their own broker connections" 
      ON public.broker_connections 
      FOR ALL 
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    -- Policy: Service role (e.g. edge functions) can manage all broker connections
    CREATE POLICY "Service role manages all broker connections" 
      ON public.broker_connections 
      FOR ALL 
      USING (auth.role() = 'service_role');
  `;

  const finalSQL = sqlContent + "\n" + additionalSQL;

  console.log("Executing SQL migration via exec_sql RPC...");
  const { data, error } = await supabase.rpc("exec_sql", { query: finalSQL });

  if (error) {
    console.error("❌ Migration failed! Error:", error);
  } else {
    console.log("✅ Security Hardening Migration completed successfully! Data returned:", data);
  }
}

run();
