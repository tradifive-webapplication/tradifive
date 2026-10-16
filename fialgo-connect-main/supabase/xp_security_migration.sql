-- ============================================================
-- TRADIFIVE — XP SECURITY & ANTI-CHEAT MIGRATION
-- Generated: 2026-06-30
-- Purpose: Server-side XP validation, anti-double-reward,
--          and tamper-proof trade-XP awards
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- ==========================================
-- 1. ADD XP TRACKING COLUMN TO TRADES TABLE
-- Prevents the same trade being rewarded twice
-- ==========================================
DO $$
BEGIN
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS xp_awarded BOOLEAN DEFAULT false;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS xp_amount INTEGER DEFAULT 0;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS xp_awarded_at TIMESTAMPTZ;
END $$;

-- ==========================================
-- 2. RPC: Award XP for a profitable disciplined trade
-- Server validates all conditions before awarding
-- ==========================================
CREATE OR REPLACE FUNCTION public.award_trade_xp(
  p_user_id UUID,
  p_trade_id UUID,
  p_consistency_score INTEGER,  -- 0-100
  p_discipline_score INTEGER,   -- 0-100
  p_profit NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  trade_rec   RECORD;
  xp_amount   INTEGER := 0;
  base_xp     INTEGER := 25;
  bonus_xp    INTEGER := 0;
BEGIN
  -- Fetch the trade and verify ownership
  SELECT id, user_id, profit, xp_awarded
  INTO trade_rec
  FROM public.trades
  WHERE id = p_trade_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Trade not found or unauthorized');
  END IF;

  -- Prevent double-awarding
  IF trade_rec.xp_awarded = true THEN
    RETURN jsonb_build_object('success', false, 'error', 'XP already awarded for this trade');
  END IF;

  -- Validate trade is actually profitable
  IF COALESCE(trade_rec.profit, 0) <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Trade is not profitable');
  END IF;

  -- Validate discipline thresholds
  IF p_consistency_score < 50 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Consistency score too low', 'score', p_consistency_score);
  END IF;

  IF p_discipline_score < 40 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Discipline score too low', 'score', p_discipline_score);
  END IF;

  -- Calculate XP based on discipline quality
  -- Base: 25 XP for any profitable disciplined trade
  -- Bonus: up to 75 XP based on consistency
  bonus_xp := LEAST(75, GREATEST(0, ((p_consistency_score - 50) * 3)));
  xp_amount := base_xp + bonus_xp;

  -- Cap at 100 XP per trade (anti-abuse)
  xp_amount := LEAST(100, xp_amount);

  -- Mark trade as rewarded
  UPDATE public.trades
  SET xp_awarded = true,
      xp_amount = xp_amount,
      xp_awarded_at = now()
  WHERE id = p_trade_id;

  -- Update user's total XP in profiles
  UPDATE public.profiles
  SET xp_total = COALESCE(xp_total, 0) + xp_amount
  WHERE id = p_user_id;

  -- Log in XP ledger
  INSERT INTO public.user_xp_ledger (user_id, xp_amount, event_type, description, source_page)
  VALUES (p_user_id, xp_amount, 'TRADE_XP', 
    format('Profitable Disciplined Trade (consistency: %s%%, discipline: %s%%)', p_consistency_score, p_discipline_score),
    'dashboard');

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', xp_amount,
    'consistency_score', p_consistency_score,
    'discipline_score', p_discipline_score
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. RPC: Award referral XP (secure, server-side)
-- ==========================================
CREATE OR REPLACE FUNCTION public.award_referral_xp(p_referrer_id UUID, p_referred_id UUID)
RETURNS JSONB AS $$
DECLARE
  xp_reward INTEGER := 500;
BEGIN
  -- Verify the referral exists and is pending
  IF NOT EXISTS (
    SELECT 1 FROM public.referrals
    WHERE referrer_id = p_referrer_id
      AND referred_id = p_referred_id
      AND status = 'pending'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'No pending referral found');
  END IF;

  -- Complete the referral
  UPDATE public.referrals
  SET status = 'completed',
      referrer_xp = xp_reward,
      referred_xp = xp_reward,
      completed_at = now()
  WHERE referrer_id = p_referrer_id AND referred_id = p_referred_id;

  -- Award XP to both
  UPDATE public.profiles SET xp_total = COALESCE(xp_total, 0) + xp_reward WHERE id = p_referrer_id;
  UPDATE public.profiles SET xp_total = COALESCE(xp_total, 0) + xp_reward WHERE id = p_referred_id;

  -- Log transactions
  INSERT INTO public.user_xp_ledger (user_id, xp_amount, event_type, description, source_page)
  VALUES
    (p_referrer_id, xp_reward, 'REFERRAL', 'Referral reward: friend connected their account', 'referrals'),
    (p_referred_id, xp_reward, 'REFERRAL', 'Welcome bonus: joined via referral link', 'referrals');

  RETURN jsonb_build_object('success', true, 'xp_awarded', xp_reward);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. LEADERBOARD VIEW — fast query for Discover leaderboard
-- ==========================================
CREATE OR REPLACE VIEW public.xp_leaderboard AS
SELECT
  p.id,
  p.display_name,
  p.username,
  p.avatar_url,
  p.xp_total,
  p.xp_level,
  p.streak_days,
  p.win_rate,
  p.is_verified,
  p.subscription_status,
  ROW_NUMBER() OVER (ORDER BY p.xp_total DESC NULLS LAST) AS rank
FROM public.profiles p
WHERE p.is_banned = false
  AND p.xp_total > 0
ORDER BY p.xp_total DESC NULLS LAST;

-- Index for leaderboard speed
CREATE INDEX IF NOT EXISTS idx_profiles_xp_total ON public.profiles(xp_total DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_profiles_xp_level ON public.profiles(xp_level);

-- ==========================================
-- 5. RATE LIMITING TABLE (Server-side)
-- Tracks API-level rate limits per user
-- ==========================================
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint     TEXT NOT NULL,   -- 'ai_coach', 'xp_award', 'referral'
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint 
  ON public.api_rate_limits(user_id, endpoint);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
-- No user-level access — only via service role / Edge Functions
