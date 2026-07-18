import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rylwyxhupwpwsdbvuoej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  console.log("Attempting to update...");
  
  // Try to update NIKHIL HARAKE's profile
  const userId = 'f1ff3781-9999-40e2-a25a-9380fe2c5f4d';

  // We are not logged in here, so RLS will definitely block it unless we login.
  // We can't easily login without their password.

  // Let's just fetch the user to see if RLS allows anon SELECT
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId);
  console.log("SELECT result:", { data, error });
}

testUpdate();
