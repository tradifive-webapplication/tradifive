-- ============================================================
-- TRADIFIVE — REFERRAL TRACKING MIGRATION
-- Generated: 2026-06-30
-- Purpose: Server-side referral tracking with automatic XP awards
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- ==========================================
-- 1. REFERRALS TABLE
-- Tracks who referred whom and XP awarded
-- ==========================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending',   -- 'pending', 'completed', 'expired'
  referrer_xp   INTEGER DEFAULT 0,
  referred_xp   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  CONSTRAINT unique_referral UNIQUE (referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status   ON public.referrals(status);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can see their own referrals (as referrer or referred)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users see own referrals" ON public.referrals;
  CREATE POLICY "Users see own referrals" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
END $$;

-- Only service role can insert/update (done via Edge Functions / triggers)
-- No direct INSERT policy for regular users — prevents self-referral spoofing

-- ==========================================
-- 2. REFERRAL COMPLETION TRIGGER
-- When a referred user connects their MT5 account, auto-complete the referral
-- and award XP to both parties
-- ==========================================
CREATE OR REPLACE FUNCTION public.complete_referral_on_mt5_connect()
RETURNS TRIGGER AS $$
DECLARE
  ref_record RECORD;
  xp_reward INTEGER := 500;
BEGIN
  -- Check if the newly connected user was referred by someone
  FOR ref_record IN
    SELECT r.id, r.referrer_id, r.referred_id
    FROM public.referrals r
    WHERE r.referred_id = NEW.user_id
      AND r.status = 'pending'
  LOOP
    -- Mark referral as completed
    UPDATE public.referrals
    SET status = 'completed',
        referrer_xp = xp_reward,
        referred_xp = xp_reward,
        completed_at = now()
    WHERE id = ref_record.id;

    -- Award XP to referrer
    UPDATE public.profiles
    SET xp_total = COALESCE(xp_total, 0) + xp_reward
    WHERE id = ref_record.referrer_id;

    -- Award XP to referred user
    UPDATE public.profiles
    SET xp_total = COALESCE(xp_total, 0) + xp_reward
    WHERE id = ref_record.referred_id;

    -- Log XP transactions
    INSERT INTO public.user_xp_ledger (user_id, xp_amount, event_type, description, source_page)
    VALUES
      (ref_record.referrer_id, xp_reward, 'REFERRAL', 'Referral bonus: friend connected MT5', 'referrals'),
      (ref_record.referred_id, xp_reward, 'REFERRAL', 'Welcome bonus: referred by friend', 'referrals');
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to mt5_accounts table
DROP TRIGGER IF EXISTS trg_referral_complete ON public.mt5_accounts;
CREATE TRIGGER trg_referral_complete
  AFTER INSERT ON public.mt5_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.complete_referral_on_mt5_connect();

-- ==========================================
-- 3. RPC: Register a referral (called on signup when referral code is entered)
-- ==========================================
CREATE OR REPLACE FUNCTION public.register_referral(referral_code_input TEXT, new_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  referrer_profile RECORD;
BEGIN
  -- Find the referrer by their referral code
  SELECT id INTO referrer_profile
  FROM public.profiles
  WHERE referral_code = referral_code_input
  LIMIT 1;

  IF referrer_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  -- Prevent self-referral
  IF referrer_profile.id = new_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot refer yourself');
  END IF;

  -- Check if referral already exists
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referrer_id = referrer_profile.id AND referred_id = new_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Referral already registered');
  END IF;

  -- Insert the referral
  INSERT INTO public.referrals (referrer_id, referred_id, status)
  VALUES (referrer_profile.id, new_user_id, 'pending');

  -- Update the new user's referred_by field
  UPDATE public.profiles
  SET referred_by = referrer_profile.id
  WHERE id = new_user_id;

  RETURN jsonb_build_object('success', true, 'referrer_id', referrer_profile.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
