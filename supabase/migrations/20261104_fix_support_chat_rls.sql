-- Fix Support Chat & Ticket Replies RLS for Admins & Users
-- Drop old restrictive policies on ticket_replies
DROP POLICY IF EXISTS "Admins can manage all replies" ON public.ticket_replies;
DROP POLICY IF EXISTS "Users can view their ticket replies" ON public.ticket_replies;
DROP POLICY IF EXISTS "Users can reply to their tickets" ON public.ticket_replies;
DROP POLICY IF EXISTS "Users can view own ticket replies" ON public.ticket_replies;
DROP POLICY IF EXISTS "Users can insert own ticket replies" ON public.ticket_replies;
DROP POLICY IF EXISTS "Users can view replies on own tickets" ON public.ticket_replies;
DROP POLICY IF EXISTS "Users can insert replies on own tickets" ON public.ticket_replies;
DROP POLICY IF EXISTS "Allow admins and ticket owners select replies" ON public.ticket_replies;
DROP POLICY IF EXISTS "Allow admins and ticket owners insert replies" ON public.ticket_replies;

-- Enable RLS
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Unified SELECT policy: Admin in admin_profiles OR user owns the ticket OR service role
CREATE POLICY "Allow admins and ticket owners select replies"
ON public.ticket_replies FOR SELECT
USING (
  (auth.uid() IN (SELECT id FROM public.admin_profiles))
  OR (EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.id = ticket_replies.ticket_id AND st.user_id = auth.uid()))
  OR (auth.role() = 'service_role')
);

-- Unified INSERT policy: Admin in admin_profiles OR user owns the ticket OR service role
CREATE POLICY "Allow admins and ticket owners insert replies"
ON public.ticket_replies FOR INSERT
WITH CHECK (
  (auth.uid() IN (SELECT id FROM public.admin_profiles))
  OR (EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.id = ticket_replies.ticket_id AND st.user_id = auth.uid()))
  OR (auth.role() = 'service_role')
);

-- Enable Realtime replication for ticket_replies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'ticket_replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_replies;
  END IF;
END $$;
