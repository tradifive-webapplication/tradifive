import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// simple parse of .env.local
const envFile = readFileSync('.env.local', 'utf-8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function test() {
  console.log('Testing channels...');
  const res1 = await supabase.from('channels').select('*').limit(1);
  console.log('Channels:', res1.error || 'OK');

  console.log('Testing channel_messages...');
  const res2 = await supabase.from('channel_messages').select('*, profiles(full_name, avatar_url, username)').limit(1);
  console.log('Messages:', res2.error || 'OK');

  console.log('Testing channel_members...');
  const res3 = await supabase.from('channel_members').select('id').limit(1);
  console.log('Members:', res3.error || 'OK');
}
test();
