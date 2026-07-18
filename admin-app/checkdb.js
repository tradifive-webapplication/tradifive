import { supabase } from './src/lib/supabase.js';

async function checkDb() {
  const { data } = await supabase.from('system_settings').select('*');
  console.log(JSON.stringify(data, null, 2));
}

checkDb();
