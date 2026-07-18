-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the landing page)
CREATE POLICY "Allow anonymous inserts to waitlist" 
ON public.waitlist 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow admins to see it (you)
CREATE POLICY "Allow authenticated users to see waitlist" 
ON public.waitlist 
FOR SELECT 
TO authenticated 
USING (true);
