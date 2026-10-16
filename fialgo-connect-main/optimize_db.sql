-- Supabase Database Optimization Script
-- Execute this directly in your Supabase SQL Editor
-- This script creates indexes to optimize queries identified as slow during load testing.

-- 1. Optimize Social Feeds & Stories Queries
-- The application heavily queries social_posts ordering by created_at and filtering by post_type.
CREATE INDEX IF NOT EXISTS idx_social_posts_post_type_created_at 
ON public.social_posts (post_type, created_at DESC);

-- 2. Optimize Discover Profiles & Leaderboards
-- The application queries profiles by win_rate and streak_days for the leaderboard cards.
CREATE INDEX IF NOT EXISTS idx_profiles_streak_days 
ON public.profiles (streak_days DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_profiles_win_rate 
ON public.profiles (win_rate DESC NULLS LAST);

-- 3. Optimize MT5 Accounts & Journal Data
-- Frequently fetched to build the dashboard based on user_id.
CREATE INDEX IF NOT EXISTS idx_mt5_accounts_user_id 
ON public.mt5_accounts (user_id);

CREATE INDEX IF NOT EXISTS idx_trades_user_id_closed_at
ON public.trades (user_id, closed_at DESC);

-- 4. Optimize Channel Messages
-- When loading a channel, the application fetches the most recent messages.
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_id_created_at
ON public.channel_messages (channel_id, created_at DESC);

-- 5. Optimize Watchlist
-- Fetched on Home Page based on user_id
CREATE INDEX IF NOT EXISTS idx_feed_watchlist_user_id 
ON public.feed_watchlist (user_id);
