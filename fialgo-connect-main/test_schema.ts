import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const url = env['VITE_SUPABASE_URL'] + '/rest/v1/';
const key = env['VITE_SUPABASE_ANON_KEY'];

async function test() {
  const res = await fetch(url + 'channel_messages?limit=1', {
    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
  });
  const data = await res.json();
  console.log('channel_messages schema/sample:', data);
}
test();
