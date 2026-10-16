const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const lines = env.split('\n');
const supabaseUrl = lines.find(l => l.startsWith('VITE_SUPABASE_URL')).split('=')[1].trim().replace(/"/g, '');
const supabaseKey = lines.find(l => l.startsWith('VITE_SUPABASE_PUBLISHABLE_KEY')).split('=')[1].trim().replace(/"/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);
supabase.from('waitlist').select('*').order('created_at', { ascending: false }).limit(5).then(res => console.log(JSON.stringify(res.data, null, 2)));
