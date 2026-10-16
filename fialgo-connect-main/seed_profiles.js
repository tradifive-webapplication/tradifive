import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rylwyxhupwpwsdbvuoej.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProfile(id, data) {
  const { data: res, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', id)
    .select();
  if (error) {
    console.error(`Error updating profile ${id}:`, error);
  } else {
    console.log(`Successfully updated profile ${id}:`, res);
  }
}

async function run() {
  await updateProfile('314cfff7-f243-4d04-83a3-f703fcb91ba8', {
    full_name: 'Mike Taravella',
    display_name: 'Mike Taravella',
    username: 'miket',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mike',
    win_rate: 68,
    streak_days: 12,
    bio: 'Swing Trader',
    trading_style: 'Swing Trader',
    location: 'Memphis, TN, US'
  });

  await updateProfile('c382f6f8-0de9-40c3-8bd3-274e75dbde98', {
    full_name: 'Marc Kuhn',
    display_name: 'Marc Kuhn',
    username: 'marck',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Marc',
    win_rate: 72,
    streak_days: 8,
    bio: 'Price Action Trader',
    trading_style: 'Price Action Trader',
    location: 'Newark, NJ, US'
  });

  await updateProfile('96985917-5a97-4cd7-bcd8-1ae13a1aef6a', {
    full_name: 'Anna B',
    display_name: 'Anna B',
    username: 'annab',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Anna',
    win_rate: 64,
    streak_days: 5,
    bio: 'Scalper',
    trading_style: 'Scalper',
    location: 'Fort Worth, TX, US'
  });

  await updateProfile('70ae04b5-351a-4273-8a22-99289e68f253', {
    full_name: 'Lauralee Quintero',
    display_name: 'Lauralee Quintero',
    username: 'lauraleeq',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lauralee',
    win_rate: 58,
    streak_days: 3,
    bio: 'Risk Desk Analyst',
    trading_style: 'Intraday Trader',
    location: 'Honolulu, HI, US'
  });
}

run();
