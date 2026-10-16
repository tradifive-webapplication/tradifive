import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://rylwyxhupwpwsdbvuoej.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA');

async function createBillingHistoryTable() {
    console.log('Attempting to ensure billing_history table exists...');
    // We can't create tables via the anon key unless there's a specific RPC or we use a service role key.
    // However, I can check if it's really missing.
    const { error } = await supabase.from('billing_history').select('*').limit(1);
    if (error) {
        console.error('Table access error:', error);
        if (error.code === '42P01') {
            console.log('Table does not exist. Please run the SQL in the Supabase dashboard:');
            console.log(`
CREATE TABLE IF NOT EXISTS public.billing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reference_id TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    stripe_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
            `);
        }
    } else {
        console.log('billing_history table exists and is accessible.');
    }
}

createBillingHistoryTable();
