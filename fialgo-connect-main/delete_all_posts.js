import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllPosts() {
  console.log('Deleting all posts...');
  
  // Try to delete all rows where id is not null (which matches all rows)
  const { data, error } = await supabase
    .from('social_posts')
    .delete()
    .not('id', 'is', null);

  if (error) {
    console.error('Error deleting posts:', error);
  } else {
    console.log('Successfully deleted all posts.');
  }
}

deleteAllPosts();
