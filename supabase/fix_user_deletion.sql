-- ==============================================================================
-- FIX USER DELETION IN SUPABASE
-- Run this script in your Supabase SQL Editor to fix user deletion issues.
-- ==============================================================================

-- 1. Fix Foreign Key Constraints (Allows deleting from Supabase Auth Dashboard)
-- These tables were missing ON DELETE CASCADE, which prevents deleting users.
ALTER TABLE public.payout_requests DROP CONSTRAINT IF EXISTS payout_requests_user_id_fkey;
ALTER TABLE public.payout_requests ADD CONSTRAINT payout_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_fkey;
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.admin_pings DROP CONSTRAINT IF EXISTS admin_pings_user_id_fkey;
ALTER TABLE public.admin_pings ADD CONSTRAINT admin_pings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create RPC for Soft Deleting Users from Admin Panel
-- Bypasses RLS so admins can soft-delete users securely from the frontend.
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET username = '[DELETED]_' || target_user_id::text,
      is_frozen = true,
      is_banned = true,
      full_name = '[ACCOUNT DELETED]',
      email = 'deleted_' || extract(epoch from now())::text || '@removed.com',
      subscription_status = 'expired'
  WHERE id = target_user_id;
END;
$$;

-- 3. Create RPC for Updating Account Standing from Admin Panel
CREATE OR REPLACE FUNCTION admin_update_standing(target_user_id UUID, p_standing TEXT, p_message TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET account_standing = p_standing,
      standing_message = p_message,
      is_banned = (p_standing = 'BANNED'),
      is_frozen = (p_standing IN ('BANNED', 'RESTRICTED'))
  WHERE id = target_user_id;
END;
$$;

-- 4. Create RPC for Changing Plan from Admin Panel
CREATE OR REPLACE FUNCTION admin_change_plan(target_user_id UUID, p_plan TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET subscription_status = p_plan
  WHERE id = target_user_id;
END;
$$;

-- 5. Create RPC for Resetting XP from Admin Panel
CREATE OR REPLACE FUNCTION admin_reset_xp(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET xp = 0,
      streak_days = 0,
      discipline_level = 1
  WHERE id = target_user_id;
END;
$$;

-- 6. Create RPC for Verifying Account from Admin Panel
CREATE OR REPLACE FUNCTION admin_verify_account(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET is_verified = true
  WHERE id = target_user_id;
END;
$$;
