-- ==============================================================================
-- TRADIFIVE COMPLETE FRESH START DATABASE RESET
-- Target Supabase Project: hcgylvdvlandtiuudefu
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hcgylvdvlandtiuudefu/sql/new
-- ==============================================================================

-- 1. Temporarily disable foreign key constraints to allow clean truncation
SET session_replication_role = 'replica';

-- 2. Wipe all social interactions, posts, comments, likes, follows
TRUNCATE TABLE public.social_post_likes CASCADE;
TRUNCATE TABLE public.social_post_comments CASCADE;
TRUNCATE TABLE public.social_posts CASCADE;
TRUNCATE TABLE public.social_follows CASCADE;
TRUNCATE TABLE public.social_follow_requests CASCADE;

-- 3. Wipe all messaging and channel activity
TRUNCATE TABLE public.direct_messages CASCADE;
TRUNCATE TABLE public.channel_messages CASCADE;
TRUNCATE TABLE public.channel_members CASCADE;
-- If you want to reset custom channels, uncomment the following line:
-- TRUNCATE TABLE public.channels CASCADE;

-- 4. Wipe all trading journal entries and trade records
TRUNCATE TABLE public.trades CASCADE;
TRUNCATE TABLE public.journal_entries CASCADE;
TRUNCATE TABLE public.mt5_accounts CASCADE;

-- 5. Wipe all notifications
TRUNCATE TABLE public.notifications CASCADE;

-- 6. Wipe all financial transactions and payout requests
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.payout_requests CASCADE;

-- 7. Wipe public user profiles
TRUNCATE TABLE public.profiles CASCADE;

-- 8. (Optional) If you also want to wipe admin profiles, uncomment this:
-- TRUNCATE TABLE public.admin_profiles CASCADE;

-- 9. Re-enable foreign key constraints
SET session_replication_role = 'DEFAULT';

-- 10. Delete all Authentication Users so everyone must register from scratch
DELETE FROM auth.users;

-- ==============================================================================
-- SUCCESS: The database is now 100% clean and reset for a fresh start!
-- New users signing up will be registered as User #1.
-- ==============================================================================
