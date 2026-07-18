const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const lines = env.split('\n');
const supabaseUrl = lines.find(l => l.startsWith('VITE_SUPABASE_URL')).split('=')[1].trim().replace(/"/g, '');
const supabaseKey = lines.find(l => l.startsWith('VITE_SUPABASE_PUBLISHABLE_KEY')).split('=')[1].trim().replace(/"/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('waitlist').insert({
    name: 'Test',
    email: 'test@example.com',
    status: 'pending'
  });
  console.log('Insert Result:', { data, error });
}
testInsert();
