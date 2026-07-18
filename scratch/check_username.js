import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsername() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, username')
    .eq('username', 'nikilharake369');

  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profiles holding this username:", data);
  }
}

checkUsername();
