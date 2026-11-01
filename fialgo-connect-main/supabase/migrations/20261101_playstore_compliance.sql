-- ==============================================================================
-- GOOGLE PLAY STORE COMPLIANCE MIGRATION
-- 1. Account Deletion RPC: delete_own_user()
-- 2. UGC User Blocks Table: user_blocks
-- ==============================================================================

-- 1. User Account Deletion (Play Store Data Safety Requirement)
CREATE OR REPLACE FUNCTION public.delete_own_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_uid UUID;
BEGIN
  current_uid := auth.uid();
  IF current_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Anonymize / Soft Delete Profile
  UPDATE public.profiles
  SET username = '[DELETED]_' || current_uid::text,
      is_frozen = true,
      is_banned = true,
      full_name = '[ACCOUNT DELETED]',
      avatar_url = NULL,
      bio = NULL,
      email = 'deleted_' || extract(epoch from now())::text || '@tradifive.in',
      subscription_status = 'expired'
  WHERE id = current_uid;

  -- Clean up user UGC posts & comments
  DELETE FROM public.posts WHERE user_id = current_uid;
  DELETE FROM public.comments WHERE user_id = current_uid;
  DELETE FROM public.notifications WHERE user_id = current_uid;

  -- Remove from auth.users (cascades)
  DELETE FROM auth.users WHERE id = current_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_own_user() TO authenticated;

-- 2. User Blocks Table for UGC Moderation (Play Store UGC Policy)
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_user_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own blocks"
ON public.user_blocks
FOR ALL
TO authenticated
USING (auth.uid() = blocker_id)
WITH CHECK (auth.uid() = blocker_id);
