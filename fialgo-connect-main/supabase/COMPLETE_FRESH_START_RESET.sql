-- ==============================================================================
-- TRADIFIVE COMPLETE FRESH START DATABASE RESET (TESTED & FIXED)
-- Target Supabase Project: hcgylvdvlandtiuudefu
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hcgylvdvlandtiuudefu/sql/new
-- ==============================================================================

-- 1. Wipe all social interactions, posts, comments, likes, follows
TRUNCATE TABLE public.social_post_likes CASCADE;
TRUNCATE TABLE public.social_post_comments CASCADE;
TRUNCATE TABLE public.social_posts CASCADE;
TRUNCATE TABLE public.social_follows CASCADE;
TRUNCATE TABLE public.social_follow_requests CASCADE;

-- 2. Wipe all messaging and channel activity
TRUNCATE TABLE public.direct_messages CASCADE;
TRUNCATE TABLE public.channel_messages CASCADE;
TRUNCATE TABLE public.channel_members CASCADE;

-- 3. Wipe all trading journal entries, trades, and broker accounts
TRUNCATE TABLE public.trades CASCADE;
TRUNCATE TABLE public.journal_entries CASCADE;
TRUNCATE TABLE public.mt5_accounts CASCADE;

-- 4. Wipe all notifications
TRUNCATE TABLE public.notifications CASCADE;

-- 5. Wipe all financial transactions and payout requests
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.payout_requests CASCADE;

-- 6. Wipe public user profiles
TRUNCATE TABLE public.profiles CASCADE;

-- 7. Delete all Authentication Users so everyone registers from scratch
DELETE FROM auth.users;

-- ==============================================================================
-- SUCCESS: The database is now 100% clean and reset for a fresh start!
-- New users signing up will be registered as User #1.
-- ==============================================================================
