const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf-8');
const lines = envFile.split('\n');
let supabaseUrl = '';
let supabaseAnonKey = '';
for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim().replace(/"/g, '');
  if (line.startsWith('VITE_SUPABASE_PUBLISHABLE_KEY=')) supabaseAnonKey = line.split('=')[1].trim().replace(/"/g, '');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: users, error: userErr } = await supabase.from('profiles').select('id').limit(1);
  if (userErr || !users.length) {
    console.log('Error getting user', userErr);
    return;
  }
  const userId = users[0].id;
  
  const { data, error } = await supabase
    .from('user_xp_ledger')
    .insert([{
      user_id: userId,
      xp_amount: 50,
      event_type: 'check_in',
      description: 'Daily Check-In (Day 1)',
      source_page: 'rewards'
    }]);
    
  console.log('Ledger Insert Result:', { data, error });
  
  const { data: pData, error: pErr } = await supabase
    .from('profiles')
    .update({
      streak_days: 1,
      xp_total: 50,
      xp_level: 1
    })
    .eq('id', userId);
    
  console.log('Profile Update Result:', { pData, error: pErr });
}

test();
