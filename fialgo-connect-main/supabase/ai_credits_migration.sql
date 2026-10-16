-- ============================================================
-- TRADIFIVE — AI CREDITS SERVER-SIDE MIGRATION
-- Generated: 2026-06-30
-- Purpose: Move AI coach credits from localStorage to Supabase
--          for security and tamper-proofing
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- ==========================================
-- 1. ADD CREDIT COLUMNS TO PROFILES
-- ==========================================
DO $$
BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_credits_remaining INTEGER DEFAULT 10;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_credits_max INTEGER DEFAULT 10;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_credits_last_reset DATE DEFAULT CURRENT_DATE;
END $$;

-- ==========================================
-- 2. RPC: Consume one AI credit (server-enforced)
-- Returns { credits_remaining, success, error }
-- Called by the Edge Function before processing any AI request
-- ==========================================
CREATE OR REPLACE FUNCTION public.consume_ai_credit(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  profile_rec RECORD;
  new_credits  INTEGER;
BEGIN
  -- Fetch current credit state
  SELECT ai_credits_remaining, ai_credits_max, ai_credits_last_reset, subscription_status
  INTO profile_rec
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE; -- row lock for atomicity

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found', 'credits_remaining', 0);
  END IF;

  -- Reset credits if it's a new day
  IF profile_rec.ai_credits_last_reset < CURRENT_DATE THEN
    -- Determine max credits based on plan
    DECLARE
      max_cred INTEGER := 10;
    BEGIN
      IF profile_rec.subscription_status IN ('pro', 'intermediate') THEN
        max_cred := 50;
      ELSIF profile_rec.subscription_status IN ('elite', 'advanced') THEN
        max_cred := 150;
      END IF;

      UPDATE public.profiles
      SET ai_credits_remaining = max_cred,
          ai_credits_max = max_cred,
          ai_credits_last_reset = CURRENT_DATE
      WHERE id = p_user_id;

      profile_rec.ai_credits_remaining := max_cred;
      profile_rec.ai_credits_max := max_cred;
    END;
  END IF;

  -- Check if credits available
  IF profile_rec.ai_credits_remaining <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'out_of_credits', 'credits_remaining', 0);
  END IF;

  -- Atomically decrement
  UPDATE public.profiles
  SET ai_credits_remaining = ai_credits_remaining - 1
  WHERE id = p_user_id
  RETURNING ai_credits_remaining INTO new_credits;

  RETURN jsonb_build_object('success', true, 'credits_remaining', new_credits);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. RPC: Get current AI credit state (for UI)
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_ai_credits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  profile_rec RECORD;
  max_cred INTEGER;
BEGIN
  SELECT ai_credits_remaining, ai_credits_max, ai_credits_last_reset, subscription_status
  INTO profile_rec
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('credits_remaining', 0, 'credits_max', 10);
  END IF;

  -- If stale (new day), return max as preview
  IF profile_rec.ai_credits_last_reset < CURRENT_DATE THEN
    max_cred := 10;
    IF profile_rec.subscription_status IN ('pro', 'intermediate') THEN max_cred := 50;
    ELSIF profile_rec.subscription_status IN ('elite', 'advanced') THEN max_cred := 150;
    END IF;
    RETURN jsonb_build_object('credits_remaining', max_cred, 'credits_max', max_cred);
  END IF;

  RETURN jsonb_build_object(
    'credits_remaining', COALESCE(profile_rec.ai_credits_remaining, 10),
    'credits_max', COALESCE(profile_rec.ai_credits_max, 10)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. Initialize existing users with correct credits
-- ==========================================
UPDATE public.profiles
SET
  ai_credits_remaining = CASE
    WHEN subscription_status IN ('elite', 'advanced') THEN 150
    WHEN subscription_status IN ('pro', 'intermediate') THEN 50
    ELSE 10
  END,
  ai_credits_max = CASE
    WHEN subscription_status IN ('elite', 'advanced') THEN 150
    WHEN subscription_status IN ('pro', 'intermediate') THEN 50
    ELSE 10
  END,
  ai_credits_last_reset = CURRENT_DATE
WHERE ai_credits_remaining IS NULL OR ai_credits_last_reset IS NULL;
