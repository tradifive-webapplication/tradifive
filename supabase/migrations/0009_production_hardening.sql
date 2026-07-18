-- ============================================================
-- PRODUCTION HARDENING MIGRATION
-- Run this in Supabase SQL Editor to ensure full production readiness
-- ============================================================

-- 1. Ensure social_follow_requests table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.social_follow_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(requester_id, target_id)
);

-- 2. Indexes for fast lookups at scale
CREATE INDEX IF NOT EXISTS idx_social_follow_requests_target_id ON public.social_follow_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_social_follow_requests_requester_id ON public.social_follow_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_social_follow_requests_composite ON public.social_follow_requests(requester_id, target_id);

-- 3. Ensure social_follows has indexes too (for performance at 10k+ users)
CREATE INDEX IF NOT EXISTS idx_social_follows_follower_id ON public.social_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_following_id ON public.social_follows(following_id);

-- 4. Enable RLS on social_follow_requests
ALTER TABLE public.social_follow_requests ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies and recreate cleanly (idempotent approach)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own sent or received requests" ON public.social_follow_requests;
  DROP POLICY IF EXISTS "Users can insert their own requests" ON public.social_follow_requests;
  DROP POLICY IF EXISTS "Users can delete requests involving them" ON public.social_follow_requests;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- SELECT: can see requests you sent OR received
CREATE POLICY "Users can view their own sent or received requests"
    ON public.social_follow_requests FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = target_id);

-- INSERT: can only create requests as yourself, and not to yourself
CREATE POLICY "Users can insert their own requests"
    ON public.social_follow_requests FOR INSERT
    WITH CHECK (auth.uid() = requester_id AND auth.uid() != target_id);

-- DELETE: can cancel your own request OR reject requests sent to you
CREATE POLICY "Users can delete requests involving them"
    ON public.social_follow_requests FOR DELETE
    USING (auth.uid() = requester_id OR auth.uid() = target_id);

-- 6. Enable real-time
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'social_follow_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.social_follow_requests;
  END IF;
END $$;

-- 7. Prevent duplicate follows (safety net for when the app accepts a request)
-- This adds a unique constraint to social_follows if not already present
DO $$ BEGIN
  ALTER TABLE public.social_follows ADD CONSTRAINT social_follows_unique_pair UNIQUE (follower_id, following_id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN
  RAISE NOTICE 'Unique constraint on social_follows already exists, skipping.';
END $$;

-- 8. Prevent users from following themselves in social_follows
DO $$ BEGIN
  ALTER TABLE public.social_follows ADD CONSTRAINT social_follows_no_self_follow CHECK (follower_id != following_id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN
  RAISE NOTICE 'Self-follow constraint already exists, skipping.';
END $$;

-- 9. Prevent users from requesting to follow themselves in social_follow_requests
DO $$ BEGIN
  ALTER TABLE public.social_follow_requests ADD CONSTRAINT social_follow_requests_no_self UNIQUE (requester_id, target_id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN
  RAISE NOTICE 'Unique constraint on social_follow_requests already exists, skipping.';
END $$;

-- ✅ All production hardening applied
