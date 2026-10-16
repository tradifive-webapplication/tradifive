import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://rylwyxhupwpwsdbvuoej.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA');

async function checkTable() {
    try {
        console.log('Checking notifications table...');
        const { data, error } = await supabase.from('notifications').select('*').limit(1);
        if (error) {
            console.error('Table error:', error);
        } else {
            console.log('Table exists, data:', data);
        }
    } catch (e) {
        console.error('Execution error:', e);
    }
}

checkTable();
