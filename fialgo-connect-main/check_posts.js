import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read from .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const envKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(envUrl, envKey);

async function check() {
  const { data, error } = await supabase
    .from('social_posts')
    .select('id, content, media_url, media_type, post_type, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
    
  console.log("Error:", error);
  console.log("Recent posts:");
  data?.forEach(d => console.log(`- ${d.id} | type: ${d.post_type} | media: ${d.media_type} | url: ${d.media_url?.substring(0, 30)}...`));
}

check();
