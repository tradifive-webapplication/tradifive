import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://rylwyxhupwpwsdbvuoej.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA"
);

async function run() {
  const query = `
    CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
    RETURNS void AS $$
    BEGIN
      UPDATE public.profiles
      SET username = '[DELETED]_' || target_user_id::text,
          is_frozen = true,
          is_banned = true,
          full_name = '[ACCOUNT DELETED]',
          email = 'deleted_' || extract(epoch from now())::text || '@removed.com',
          subscription_status = 'expired'
      WHERE id = target_user_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  const { data, error } = await supabase.rpc("exec_sql", { query });
  console.log("Create RPC error:", error);
  console.log("Create RPC data:", data);
}

run();
