-- ============================================================
-- TRADIFIVE COMPLETE BACKEND MIGRATION
-- Generated: 2026-05-26
-- Scope: All pages (Home, Discover, Journal, Channels, Inbox,
--        AI Coach, Risk Guard, Competitions, Rewards, Settings, Profiles)
-- Instructions: Run this entire script in your Supabase SQL Editor.
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. BASE SYSTEM & IDENTITY LAYER (PROFILES EXTENSIONS)
-- ==========================================

-- Verify profiles table columns exist, if not add them safely
DO $$
BEGIN
  -- Add standard profiles fields
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_id TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recovery_email TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recovery_phone TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMPTZ;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS objective_amount NUMERIC(15,2) DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_xp INTEGER DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'standard';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_chosen_username BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trading_style TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS risk_appetite TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_market TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp_total INTEGER DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp_level INTEGER DEFAULT 1;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;
  
  -- Stats caching columns
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_trades INTEGER DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS win_rate NUMERIC(5,2) DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roi_all_time NUMERIC(10,2) DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avg_rr NUMERIC(5,2) DEFAULT 0;
  
  -- Privacy toggles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_trades BOOLEAN DEFAULT true;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_winrate BOOLEAN DEFAULT true;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_roi BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_streak BOOLEAN DEFAULT true;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_portfolio BOOLEAN DEFAULT false;
END $$;

-- Enable RLS on profiles if not already done
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for public.profiles
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public profiles visible to all" ON public.profiles;
  DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
  
  CREATE POLICY "Public profiles visible to all" ON public.profiles 
    FOR SELECT USING (true);
  
  CREATE POLICY "Users update own profile" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);
END $$;


-- ==========================================
-- 2. METATRADER & TRADING LAYER
-- ==========================================

-- Ensure public.mt5_accounts columns
DO $$
BEGIN
  ALTER TABLE public.mt5_accounts ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'pending';
  ALTER TABLE public.mt5_accounts ADD COLUMN IF NOT EXISTS broker_name TEXT;
  ALTER TABLE public.mt5_accounts ADD COLUMN IF NOT EXISTS leverage INTEGER DEFAULT 100;
  ALTER TABLE public.mt5_accounts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
  ALTER TABLE public.mt5_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
END $$;

-- Ensure public.trades columns
DO $$
BEGIN
  -- Journal columns
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS setup TEXT;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS entry_reason TEXT;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS exit_reason TEXT;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS emotion TEXT;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS discipline_score INTEGER;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS notes TEXT;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS tags TEXT[];
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS risk_percent NUMERIC(5,2);
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS max_drawdown NUMERIC(10,2);
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'closed';
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'mt5';
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS commission DECIMAL(12,2) DEFAULT 0;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS swap DECIMAL(12,2) DEFAULT 0;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS pips DECIMAL(10,1) DEFAULT 0;
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS risk_reward_ratio DECIMAL(5,2);
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS stop_loss DECIMAL(15,5);
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS take_profit DECIMAL(15,5);
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS open_price DECIMAL(15,5);
  ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS close_price DECIMAL(15,5);
END $$;


-- ==========================================
-- 3. BILLING HISTORY & SUBSCRIPTION
-- ==========================================
CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'paid',
  stripe_payment_id TEXT,
  stripe_invoice_id TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users view own billing history" ON public.billing_history;
  CREATE POLICY "Users view own billing history" ON public.billing_history
    FOR SELECT USING (auth.uid() = user_id);
END $$;


-- ==========================================
-- 4. HOME & DISCOVER (SOCIAL LAYER)
-- ==========================================

-- Social Posts Table
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  post_type TEXT DEFAULT 'text', -- 'text','chart','trade_share','journal_share'
  linked_trade_id UUID REFERENCES public.trades(id),
  symbol TEXT,
  timeframe TEXT,
  is_public BOOLEAN DEFAULT true,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.social_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.social_post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS public.social_post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Feed Watchlist (Home watchlist)
CREATE TABLE IF NOT EXISTS public.feed_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  symbol_type TEXT DEFAULT 'forex',
  is_pinned BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Economic Calendar Table
CREATE TABLE IF NOT EXISTS public.economic_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_title TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  currency TEXT,
  impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
  forecast TEXT,
  previous TEXT,
  actual TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all missing columns on public.social_posts exist safely if the table was previously created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'social_posts'
  ) THEN
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS content TEXT;
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS media_urls TEXT[];
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'text';
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS linked_trade_id UUID REFERENCES public.trades(id);
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS symbol TEXT;
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS timeframe TEXT;
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS bookmark_count INTEGER DEFAULT 0;
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS tags TEXT[];
    ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Enable RLS for Social Layer
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_calendar ENABLE ROW LEVEL SECURITY;

-- Policies
-- Posts
DROP POLICY IF EXISTS "Public posts visible" ON public.social_posts;
DROP POLICY IF EXISTS "Users create posts" ON public.social_posts;
DROP POLICY IF EXISTS "Users update own posts" ON public.social_posts;
DROP POLICY IF EXISTS "Users delete own posts" ON public.social_posts;
CREATE POLICY "Public posts visible" ON public.social_posts FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users create posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON public.social_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own posts" ON public.social_posts FOR DELETE USING (auth.uid() = user_id);

-- Comments
DROP POLICY IF EXISTS "Anyone read comments" ON public.social_post_comments;
DROP POLICY IF EXISTS "Users write comments" ON public.social_post_comments;
DROP POLICY IF EXISTS "Users delete own comments" ON public.social_post_comments;
CREATE POLICY "Anyone read comments" ON public.social_post_comments FOR SELECT USING (true);
CREATE POLICY "Users write comments" ON public.social_post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.social_post_comments FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks
DROP POLICY IF EXISTS "Users see own bookmarks" ON public.social_post_bookmarks;
DROP POLICY IF EXISTS "Users add bookmarks" ON public.social_post_bookmarks;
DROP POLICY IF EXISTS "Users remove bookmarks" ON public.social_post_bookmarks;
CREATE POLICY "Users see own bookmarks" ON public.social_post_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add bookmarks" ON public.social_post_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove bookmarks" ON public.social_post_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Watchlist
DROP POLICY IF EXISTS "Users see own watchlist" ON public.feed_watchlist;
DROP POLICY IF EXISTS "Users edit watchlist" ON public.feed_watchlist;
CREATE POLICY "Users see own watchlist" ON public.feed_watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users edit watchlist" ON public.feed_watchlist FOR ALL USING (auth.uid() = user_id);

-- Economic Calendar
DROP POLICY IF EXISTS "Anyone read economic calendar" ON public.economic_calendar;
CREATE POLICY "Anyone read economic calendar" ON public.economic_calendar FOR SELECT USING (true);


-- ==========================================
-- 5. CHANNELS & MESSAGING
-- ==========================================

-- Community Channels
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  cover_url TEXT,
  channel_type TEXT DEFAULT 'public', -- 'public','private','premium'
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  is_official BOOLEAN DEFAULT false,
  tags TEXT[],
  rules TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Channel Members
CREATE TABLE IF NOT EXISTS public.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner','admin','moderator','member'
  is_muted BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Channel Messages
CREATE TABLE IF NOT EXISTS public.channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text','image','trade_card','chart','system'
  media_url TEXT,
  linked_trade_id UUID REFERENCES public.trades(id),
  reply_to_id UUID REFERENCES public.channel_messages(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  reactions JSONB DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  edited_at TIMESTAMPTZ
);

-- Direct Messages (Inbox DMs)
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_deleted_by_sender BOOLEAN DEFAULT false,
  is_deleted_by_receiver BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DM Conversations Meta Table
CREATE TABLE IF NOT EXISTS public.dm_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  user1_unread_count INTEGER DEFAULT 0,
  user2_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS for Messaging
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;

-- Messaging Policies
-- Channels
DROP POLICY IF EXISTS "Anyone see public channels" ON public.channels;
CREATE POLICY "Anyone see public channels" ON public.channels FOR SELECT USING (true);

-- Channel Members
DROP POLICY IF EXISTS "Members see memberships" ON public.channel_members;
DROP POLICY IF EXISTS "Users join channels" ON public.channel_members;
CREATE POLICY "Members see memberships" ON public.channel_members FOR SELECT USING (true);
CREATE POLICY "Users join channels" ON public.channel_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Channel Messages
DROP POLICY IF EXISTS "Anyone read channel messages" ON public.channel_messages;
DROP POLICY IF EXISTS "Members post channel messages" ON public.channel_messages;
CREATE POLICY "Anyone read channel messages" ON public.channel_messages FOR SELECT USING (true);
CREATE POLICY "Members post channel messages" ON public.channel_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DMs
DROP POLICY IF EXISTS "DMs visible to participants" ON public.direct_messages;
DROP POLICY IF EXISTS "Users send DMs" ON public.direct_messages;
CREATE POLICY "DMs visible to participants" ON public.direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users send DMs" ON public.direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Conversations
DROP POLICY IF EXISTS "Conversations visible to participants" ON public.dm_conversations;
CREATE POLICY "Conversations visible to participants" ON public.dm_conversations FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);


-- ==========================================
-- 6. XP ECONOMY & GAMIFICATION
-- ==========================================

-- XP Ledger
CREATE TABLE IF NOT EXISTS public.user_xp_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  event_type TEXT NOT NULL, -- 'DAILY_LOGIN','TRADE_LOGGED','JOURNAL_ENTRY','STREAK_BONUS','REFERRAL','CHALLENGE_COMPLETE','SOCIAL_LIKE','SOCIAL_POST','AI_COACH_QUERY','CHANNEL_MESSAGE','COMPETITION_ENTRY','REDEEM_SPEND'
  description TEXT,
  metadata JSONB DEFAULT '{}',
  source_page TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Achievements Unlocked
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_icon TEXT,
  xp_rewarded INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Daily/Weekly Missions Configuration
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  target_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  recurrence TEXT DEFAULT 'daily',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Mission Progress Table
CREATE TABLE IF NOT EXISTS public.user_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.daily_missions(id) ON DELETE CASCADE,
  progress_count INTEGER DEFAULT 0,
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, mission_id, date)
);

-- Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  xp_rewarded INTEGER DEFAULT 0,
  reward_tier TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referred_id)
);

-- Weekly Login Streak Tracker
CREATE TABLE IF NOT EXISTS public.weekly_streak_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_day INTEGER NOT NULL,
  xp_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

-- Spendable XP Rewards / Marketplace Spend Logs
CREATE TABLE IF NOT EXISTS public.xp_reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL,
  reward_name TEXT NOT NULL,
  xp_cost INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Gamification Tables
ALTER TABLE public.user_xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_streak_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Gamification Policies
-- XP Ledger
DROP POLICY IF EXISTS "Users see own XP ledger" ON public.user_xp_ledger;
CREATE POLICY "Users see own XP ledger" ON public.user_xp_ledger FOR SELECT USING (auth.uid() = user_id);

-- Achievements
DROP POLICY IF EXISTS "Users see own achievements" ON public.user_achievements;
CREATE POLICY "Users see own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Missions
DROP POLICY IF EXISTS "Anyone see active missions" ON public.daily_missions;
CREATE POLICY "Anyone see active missions" ON public.daily_missions FOR SELECT USING (is_active = true);

-- Mission Progress
DROP POLICY IF EXISTS "Users see own progress" ON public.user_mission_progress;
DROP POLICY IF EXISTS "Users update own progress" ON public.user_mission_progress;
CREATE POLICY "Users see own progress" ON public.user_mission_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.user_mission_progress FOR ALL USING (auth.uid() = user_id);

-- Referrals
DROP POLICY IF EXISTS "Users see own referrals" ON public.referrals;
CREATE POLICY "Users see own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Streaks
DROP POLICY IF EXISTS "Users see own streaks" ON public.weekly_streak_checkins;
CREATE POLICY "Users see own streaks" ON public.weekly_streak_checkins FOR SELECT USING (auth.uid() = user_id);

-- Redemptions
DROP POLICY IF EXISTS "Users see own redemptions" ON public.xp_reward_redemptions;
DROP POLICY IF EXISTS "Users insert redemptions" ON public.xp_reward_redemptions;
CREATE POLICY "Users see own redemptions" ON public.xp_reward_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert redemptions" ON public.xp_reward_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- 7. COMPETITIONS LAYER
-- ==========================================

-- Competition entries
CREATE TABLE IF NOT EXISTS public.competition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mt5_account_id UUID REFERENCES public.mt5_accounts(id) ON DELETE SET NULL,
  starting_balance NUMERIC(15,2),
  current_roi NUMERIC(10,2) DEFAULT 0,
  current_pips NUMERIC(10,1) DEFAULT 0,
  current_winrate NUMERIC(5,2) DEFAULT 0,
  trade_count INTEGER DEFAULT 0,
  rank INTEGER,
  is_disqualified BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

-- Leaders Cached Table
CREATE TABLE IF NOT EXISTS public.competition_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score NUMERIC(15,4) NOT NULL,
  trade_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Competitions
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_leaderboard ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone see entries" ON public.competition_entries;
DROP POLICY IF EXISTS "Users enter competitions" ON public.competition_entries;
CREATE POLICY "Anyone see entries" ON public.competition_entries FOR SELECT USING (true);
CREATE POLICY "Users enter competitions" ON public.competition_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone see leaderboards" ON public.competition_leaderboard;
CREATE POLICY "Anyone see leaderboards" ON public.competition_leaderboard FOR SELECT USING (true);


-- ==========================================
-- 8. RISK GUARD LAYER
-- ==========================================

-- User Risk Configuration
CREATE TABLE IF NOT EXISTS public.user_risk_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  target_capital NUMERIC(15,2) DEFAULT 10000,
  max_daily_loss_percent NUMERIC(5,2) DEFAULT 3.0,
  max_overall_drawdown_percent NUMERIC(5,2) DEFAULT 10.0,
  max_lot_size NUMERIC(10,2) DEFAULT 1.0,
  max_open_trades INTEGER DEFAULT 5,
  risk_per_trade_percent NUMERIC(5,2) DEFAULT 1.0,
  max_correlation_trades INTEGER DEFAULT 3,
  is_prop_firm_mode BOOLEAN DEFAULT false,
  prop_firm_name TEXT,
  prop_firm_max_drawdown NUMERIC(5,2),
  prop_firm_daily_loss NUMERIC(5,2),
  alert_on_breach BOOLEAN DEFAULT true,
  alert_on_warning BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Breach Logs
CREATE TABLE IF NOT EXISTS public.risk_breach_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  breach_type TEXT NOT NULL, -- 'DAILY_LOSS','DRAWDOWN','LOT_SIZE','OPEN_TRADES'
  rule_value NUMERIC(15,4),
  actual_value NUMERIC(15,4),
  severity TEXT DEFAULT 'warning',
  trade_id UUID REFERENCES public.trades(id) ON DELETE SET NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on Risk Guard
ALTER TABLE public.user_risk_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_breach_logs ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users see own risk config" ON public.user_risk_configs;
DROP POLICY IF EXISTS "Users edit own risk config" ON public.user_risk_configs;
CREATE POLICY "Users see own risk config" ON public.user_risk_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users edit own risk config" ON public.user_risk_configs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own breach logs" ON public.risk_breach_logs;
CREATE POLICY "Users see own breach logs" ON public.risk_breach_logs FOR SELECT USING (auth.uid() = user_id);


-- ==========================================
-- 9. AI COACH SESSION LAYER
-- ==========================================

-- Sessions
CREATE TABLE IF NOT EXISTS public.ai_coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  session_type TEXT DEFAULT 'chat',
  context JSONB DEFAULT '{}',
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.ai_coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.ai_coach_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coach_messages ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users see own sessions" ON public.ai_coach_sessions;
DROP POLICY IF EXISTS "Users edit own sessions" ON public.ai_coach_sessions;
CREATE POLICY "Users see own sessions" ON public.ai_coach_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users edit own sessions" ON public.ai_coach_sessions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own AI messages" ON public.ai_coach_messages;
DROP POLICY IF EXISTS "Users insert AI messages" ON public.ai_coach_messages;
CREATE POLICY "Users see own AI messages" ON public.ai_coach_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert AI messages" ON public.ai_coach_messages FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- 10. REALTIME PUBLICATIONS AND TRIGGERS
-- ==========================================

-- Auto-refresh updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply set_updated_at trigger to main tables
DO $$
BEGIN
  DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
  CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

  DROP TRIGGER IF EXISTS trigger_social_posts_updated_at ON public.social_posts;
  CREATE TRIGGER trigger_social_posts_updated_at BEFORE UPDATE ON public.social_posts 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

  DROP TRIGGER IF EXISTS trigger_social_comments_updated_at ON public.social_post_comments;
  CREATE TRIGGER trigger_social_comments_updated_at BEFORE UPDATE ON public.social_post_comments 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
END $$;

-- Enable Realtime for New Tables in supabase_realtime publication
DO $$
DECLARE
  new_tables TEXT[] := ARRAY['channel_messages', 'direct_messages', 'notifications', 'competition_leaderboard', 'user_xp_ledger', 'social_posts'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY new_tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
    END IF;
  END LOOP;
END $$;


-- ==========================================
-- 11. INDEXES FOR EXTREME PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON public.social_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_id ON public.channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_created_at ON public.channel_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_receiver ON public.direct_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_id ON public.user_xp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_created_at ON public.user_xp_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_coach_messages_session_id ON public.ai_coach_messages(session_id);


-- ==========================================
-- MIGRATION VERIFICATION
-- ==========================================
SELECT 'Tradifive Complete Backend Migration generated successfully!' AS status;
