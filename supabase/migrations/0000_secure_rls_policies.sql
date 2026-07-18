-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Read access: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Update access: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Insert access: Users can insert their own profile
-- (Often needed during signup if not using a database trigger)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Delete access: Users can delete their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id);

-- Support Tickets Table RLS

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 1. Read access: Users can view their own tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" 
ON public.support_tickets FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Insert access: Users can create tickets
DROP POLICY IF EXISTS "Users can insert own tickets" ON public.support_tickets;
CREATE POLICY "Users can insert own tickets" 
ON public.support_tickets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Ticket Replies Table RLS

ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- 1. Read access: Users can view replies on their own tickets
DROP POLICY IF EXISTS "Users can view replies on own tickets" ON public.ticket_replies;
CREATE POLICY "Users can view replies on own tickets" 
ON public.ticket_replies FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets st
    WHERE st.id = ticket_replies.ticket_id
    AND st.user_id = auth.uid()
  )
);

-- 2. Insert access: Users can reply to their own tickets
DROP POLICY IF EXISTS "Users can insert replies on own tickets" ON public.ticket_replies;
CREATE POLICY "Users can insert replies on own tickets" 
ON public.ticket_replies FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_tickets st
    WHERE st.id = ticket_replies.ticket_id
    AND st.user_id = auth.uid()
  )
);

-- Channels Table RLS

-- 1. Insert access: Authenticated users can create channels
DROP POLICY IF EXISTS "Users can create channels" ON public.channels;
CREATE POLICY "Users can create channels" 
ON public.channels FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- 2. Update access: Creators can update their own channels
DROP POLICY IF EXISTS "Creators can update channels" ON public.channels;
CREATE POLICY "Creators can update channels" 
ON public.channels FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- 3. Delete access: Creators can delete their own channels
DROP POLICY IF EXISTS "Creators can delete channels" ON public.channels;
CREATE POLICY "Creators can delete channels" 
ON public.channels FOR DELETE 
USING (auth.uid() = created_by);
