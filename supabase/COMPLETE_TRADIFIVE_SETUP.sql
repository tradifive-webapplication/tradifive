-- ============================================================
-- TRADIFIVE COMPLETE FRESH DATABASE SETUP
-- Project: hcgylvdvlandtiuudefu
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  activation_key TEXT,
  address TEXT,
  avatar_url TEXT,
  avg_rr NUMERIC,
  banner_url TEXT,
  bio TEXT,
  city TEXT,
  country TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  current_xp INTEGER DEFAULT 0,
  date_of_birth TEXT,
  display_name TEXT,
  email TEXT,
  first_name TEXT,
  full_name TEXT,
  gender TEXT,
  has_chosen_username BOOLEAN DEFAULT false,
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_id TEXT,
  is_banned BOOLEAN DEFAULT false,
  is_frozen BOOLEAN,
  is_locked_for_today BOOLEAN,
  is_pro BOOLEAN,
  is_verified BOOLEAN,
  last_login_at TEXT,
  last_login_date TEXT,
  last_name TEXT,
  location TEXT,
  max_daily_trades NUMERIC,
  next_billing_at TEXT,
  objective_amount NUMERIC(15,2) DEFAULT 0,
  phone TEXT,
  plan_type TEXT,
  preferred_market TEXT,
  progress_percent INTEGER DEFAULT 0,
  recovery_email TEXT,
  recovery_phone TEXT,
  referral_code TEXT,
  referred_by TEXT,
  risk_appetite TEXT,
  roi_all_time NUMERIC,
  role TEXT,
  show_portfolio BOOLEAN,
  show_roi BOOLEAN,
  show_streak BOOLEAN,
  show_trades BOOLEAN,
  show_winrate BOOLEAN,
  state TEXT,
  streak_days NUMERIC,
  subscription_status TEXT,
  total_trades NUMERIC,
  trades_today NUMERIC,
  trading_style TEXT,
  two_factor_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  username TEXT UNIQUE,
  website TEXT,
  win_rate NUMERIC,
  xp_level NUMERIC,
  xp_total NUMERIC,
  zip_code TEXT
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_profiles" ON public.profiles;
CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.channels (
  channel_type TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT,
  description TEXT,
  icon TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_official BOOLEAN,
  member_count NUMERIC,
  message_count NUMERIC,
  name TEXT,
  rules TEXT,
  slug TEXT,
  tags TEXT[]
);
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_channels" ON public.channels;
CREATE POLICY "allow_all_channels" ON public.channels FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.competitions (
  created_at TIMESTAMPTZ DEFAULT now(),
  end_date TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_contestants NUMERIC,
  prize_pool TEXT,
  start_date TEXT,
  status TEXT,
  title TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_competitions" ON public.competitions;
CREATE POLICY "allow_all_competitions" ON public.competitions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.social_posts (
  bookmark_count NUMERIC,
  comment_count INTEGER DEFAULT 0,
  comments_count NUMERIC,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_public BOOLEAN,
  like_count INTEGER DEFAULT 0,
  likes_count NUMERIC,
  linked_trade_id TEXT,
  media_type TEXT,
  media_url TEXT,
  media_urls TEXT[],
  post_type TEXT,
  share_count NUMERIC,
  symbol TEXT,
  tags TEXT[],
  timeframe TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0
);
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_social_posts" ON public.social_posts;
CREATE POLICY "allow_all_social_posts" ON public.social_posts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.active_bots (
  bot_name TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_level TEXT,
  status TEXT,
  trading_pair TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.active_bots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_active_bots" ON public.active_bots;
CREATE POLICY "allow_all_active_bots" ON public.active_bots FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.admin_pings (
  admin_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_read BOOLEAN,
  message TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.admin_pings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_admin_pings" ON public.admin_pings;
CREATE POLICY "allow_all_admin_pings" ON public.admin_pings FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT,
  full_name TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN,
  role TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_admin_profiles" ON public.admin_profiles;
CREATE POLICY "allow_all_admin_profiles" ON public.admin_profiles FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.ai_coach_messages (
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB,
  role TEXT,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.ai_coach_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_ai_coach_messages" ON public.ai_coach_messages;
CREATE POLICY "allow_all_ai_coach_messages" ON public.ai_coach_messages FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.ai_coach_sessions (
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_message_at TEXT,
  message_count NUMERIC,
  session_type TEXT,
  title TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.ai_coach_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_ai_coach_sessions" ON public.ai_coach_sessions;
CREATE POLICY "allow_all_ai_coach_sessions" ON public.ai_coach_sessions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.billing_history (
  amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  currency TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_end TEXT,
  period_start TEXT,
  plan TEXT,
  status TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_billing_history" ON public.billing_history;
CREATE POLICY "allow_all_billing_history" ON public.billing_history FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.channel_members (
  channel_id TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_muted BOOLEAN,
  joined_at TEXT,
  role TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_channel_members" ON public.channel_members;
CREATE POLICY "allow_all_channel_members" ON public.channel_members FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.channel_messages (
  channel_id TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_channel_messages" ON public.channel_messages;
CREATE POLICY "allow_all_channel_messages" ON public.channel_messages FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.community_channels (
  created_at TIMESTAMPTZ DEFAULT now(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_verified BOOLEAN,
  member_count NUMERIC,
  name TEXT
);
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_community_channels" ON public.community_channels;
CREATE POLICY "allow_all_community_channels" ON public.community_channels FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.competition_entries (
  competition_id TEXT,
  current_pips NUMERIC,
  current_roi NUMERIC,
  current_winrate NUMERIC,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_disqualified BOOLEAN,
  joined_at TEXT,
  mt5_account_id TEXT,
  rank NUMERIC,
  starting_balance NUMERIC,
  trade_count NUMERIC,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_competition_entries" ON public.competition_entries;
CREATE POLICY "allow_all_competition_entries" ON public.competition_entries FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.competition_leaderboard (
  competition_id TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank NUMERIC,
  score NUMERIC,
  trade_count NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.competition_leaderboard ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_competition_leaderboard" ON public.competition_leaderboard;
CREATE POLICY "allow_all_competition_leaderboard" ON public.competition_leaderboard FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.daily_missions (
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN,
  mission_type TEXT,
  recurrence TEXT,
  target_count NUMERIC,
  title TEXT,
  xp_reward NUMERIC
);
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_daily_missions" ON public.daily_missions;
CREATE POLICY "allow_all_daily_missions" ON public.daily_missions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.direct_messages (
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_deleted_by_receiver BOOLEAN,
  is_deleted_by_sender BOOLEAN,
  is_read BOOLEAN,
  media_url TEXT,
  message_type TEXT,
  receiver_id TEXT,
  sender_id TEXT
);
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_direct_messages" ON public.direct_messages;
CREATE POLICY "allow_all_direct_messages" ON public.direct_messages FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.dm_conversations (
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_message_at TEXT,
  last_message_id TEXT,
  user1_id TEXT,
  user1_unread_count NUMERIC,
  user2_id TEXT,
  user2_unread_count NUMERIC
);
ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_dm_conversations" ON public.dm_conversations;
CREATE POLICY "allow_all_dm_conversations" ON public.dm_conversations FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.economic_calendar (
  actual TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  currency TEXT,
  event_time TEXT,
  event_title TEXT,
  forecast TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impact TEXT,
  previous TEXT,
  source TEXT
);
ALTER TABLE public.economic_calendar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_economic_calendar" ON public.economic_calendar;
CREATE POLICY "allow_all_economic_calendar" ON public.economic_calendar FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.feed_watchlist (
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_pinned BOOLEAN,
  sort_order NUMERIC,
  symbol TEXT,
  symbol_type TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.feed_watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_feed_watchlist" ON public.feed_watchlist;
CREATE POLICY "allow_all_feed_watchlist" ON public.feed_watchlist FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.journal_entries (
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood TEXT,
  notes TEXT,
  symbol TEXT,
  tags TEXT[],
  title TEXT,
  trade_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_journal_entries" ON public.journal_entries;
CREATE POLICY "allow_all_journal_entries" ON public.journal_entries FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.mt5_accounts (
  account_number TEXT,
  activation_key TEXT,
  algo_status BOOLEAN,
  balance NUMERIC(15,2) DEFAULT 0,
  broker_name TEXT,
  broker_server TEXT,
  connection_purpose TEXT,
  connection_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  currency TEXT,
  equity NUMERIC(15,2) DEFAULT 0,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN,
  is_connected BOOLEAN,
  leverage NUMERIC,
  metaapi_account_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.mt5_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_mt5_accounts" ON public.mt5_accounts;
CREATE POLICY "allow_all_mt5_accounts" ON public.mt5_accounts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.notifications (
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_read BOOLEAN,
  message TEXT,
  metadata JSONB,
  priority TEXT,
  title TEXT,
  type TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_notifications" ON public.notifications;
CREATE POLICY "allow_all_notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.payout_requests (
  amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method TEXT,
  notes TEXT,
  status TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_payout_requests" ON public.payout_requests;
CREATE POLICY "allow_all_payout_requests" ON public.payout_requests FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.referrals (
  completed_at TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code TEXT,
  referred_id TEXT,
  referrer_id TEXT,
  reward_tier TEXT,
  status TEXT,
  xp_rewarded NUMERIC
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_referrals" ON public.referrals;
CREATE POLICY "allow_all_referrals" ON public.referrals FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.risk_breach_logs (
  actual_value NUMERIC,
  breach_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolved BOOLEAN,
  rule_value NUMERIC,
  severity TEXT,
  trade_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.risk_breach_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_risk_breach_logs" ON public.risk_breach_logs;
CREATE POLICY "allow_all_risk_breach_logs" ON public.risk_breach_logs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.social_follow_requests (
  created_at TIMESTAMPTZ DEFAULT now(),
  requester_id TEXT,
  target_id TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
ALTER TABLE public.social_follow_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_social_follow_requests" ON public.social_follow_requests;
CREATE POLICY "allow_all_social_follow_requests" ON public.social_follow_requests FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.social_follows (
  created_at TIMESTAMPTZ DEFAULT now(),
  follower_id TEXT,
  following_id TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
ALTER TABLE public.social_follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_social_follows" ON public.social_follows;
CREATE POLICY "allow_all_social_follows" ON public.social_follows FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.social_post_bookmarks (
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.social_post_bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_social_post_bookmarks" ON public.social_post_bookmarks;
CREATE POLICY "allow_all_social_post_bookmarks" ON public.social_post_bookmarks FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.social_post_comments (
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  like_count INTEGER DEFAULT 0,
  parent_comment_id TEXT,
  post_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.social_post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_social_post_comments" ON public.social_post_comments;
CREATE POLICY "allow_all_social_post_comments" ON public.social_post_comments FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.social_post_likes (
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.social_post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_social_post_likes" ON public.social_post_likes;
CREATE POLICY "allow_all_social_post_likes" ON public.social_post_likes FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  priority TEXT,
  status TEXT,
  subject TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_support_tickets" ON public.support_tickets;
CREATE POLICY "allow_all_support_tickets" ON public.support_tickets FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  value TEXT
);
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_system_config" ON public.system_config;
CREATE POLICY "allow_all_system_config" ON public.system_config FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  value JSONB
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_system_settings" ON public.system_settings;
CREATE POLICY "allow_all_system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.ticket_replies (
  admin_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT,
  ticket_id TEXT
);
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_ticket_replies" ON public.ticket_replies;
CREATE POLICY "allow_all_ticket_replies" ON public.ticket_replies FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.trades (
  bot_id TEXT,
  close_price NUMERIC,
  closed_at TEXT,
  commission NUMERIC,
  discipline_score NUMERIC,
  emotion TEXT,
  entry_price NUMERIC,
  entry_reason TEXT,
  exit_price NUMERIC,
  exit_reason TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_pending BOOLEAN,
  lot_size NUMERIC,
  max_drawdown NUMERIC,
  notes TEXT,
  open_price NUMERIC,
  opened_at TEXT,
  pips NUMERIC,
  profit NUMERIC(15,2) DEFAULT 0,
  risk_percent NUMERIC,
  risk_reward_ratio NUMERIC,
  screenshot_url TEXT,
  setup TEXT,
  source TEXT,
  status TEXT,
  stop_loss NUMERIC,
  swap NUMERIC,
  symbol TEXT,
  tags TEXT[],
  take_profit NUMERIC,
  ticket TEXT,
  trade_type TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_trades" ON public.trades;
CREATE POLICY "allow_all_trades" ON public.trades FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.transactions (
  amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT,
  type TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_transactions" ON public.transactions;
CREATE POLICY "allow_all_transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  achievement_icon TEXT,
  achievement_id TEXT,
  achievement_name TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unlocked_at TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_rewarded NUMERIC
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_user_achievements" ON public.user_achievements;
CREATE POLICY "allow_all_user_achievements" ON public.user_achievements FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  event_type TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT,
  metadata JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_user_activity_logs" ON public.user_activity_logs;
CREATE POLICY "allow_all_user_activity_logs" ON public.user_activity_logs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.user_feedback (
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performance_rating NUMERIC,
  rating NUMERIC,
  setup_rating NUMERIC,
  trust_rating NUMERIC,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_user_feedback" ON public.user_feedback;
CREATE POLICY "allow_all_user_feedback" ON public.user_feedback FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.user_follows (
  created_at TIMESTAMPTZ DEFAULT now(),
  follower_id TEXT,
  following_id TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_user_follows" ON public.user_follows;
CREATE POLICY "allow_all_user_follows" ON public.user_follows FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.user_mission_progress (
  completed_at TEXT,
  date TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_complete BOOLEAN,
  mission_id TEXT,
  progress_count NUMERIC,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_user_mission_progress" ON public.user_mission_progress;
CREATE POLICY "allow_all_user_mission_progress" ON public.user_mission_progress FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.user_risk_configs (
  alert_on_breach BOOLEAN,
  alert_on_warning BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_prop_firm_mode BOOLEAN,
  max_correlation_trades NUMERIC,
  max_daily_loss_percent NUMERIC,
  max_lot_size NUMERIC,
  max_open_trades NUMERIC,
  max_overall_drawdown_percent NUMERIC,
  prop_firm_daily_loss NUMERIC,
  prop_firm_max_drawdown NUMERIC,
  prop_firm_name TEXT,
  risk_per_trade_percent NUMERIC,
  target_capital NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.user_risk_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_user_risk_configs" ON public.user_risk_configs;
CREATE POLICY "allow_all_user_risk_configs" ON public.user_risk_configs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.user_xp_ledger (
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  event_type TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata JSONB,
  source_page TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount NUMERIC
);
ALTER TABLE public.user_xp_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_user_xp_ledger" ON public.user_xp_ledger;
CREATE POLICY "allow_all_user_xp_ledger" ON public.user_xp_ledger FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.waitlist (
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT,
  feedback TEXT,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  status TEXT
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_waitlist" ON public.waitlist;
CREATE POLICY "allow_all_waitlist" ON public.waitlist FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.weekly_streak_checkins (
  checkin_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streak_day NUMERIC,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_awarded NUMERIC
);
ALTER TABLE public.weekly_streak_checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_weekly_streak_checkins" ON public.weekly_streak_checkins;
CREATE POLICY "allow_all_weekly_streak_checkins" ON public.weekly_streak_checkins FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.xp_reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redeemed_at TEXT,
  reward_id TEXT,
  reward_name TEXT,
  status TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_cost NUMERIC
);
ALTER TABLE public.xp_reward_redemptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_xp_reward_redemptions" ON public.xp_reward_redemptions;
CREATE POLICY "allow_all_xp_reward_redemptions" ON public.xp_reward_redemptions FOR ALL USING (true) WITH CHECK (true);


-- ── AUTO CREATE PROFILE ON USER SIGNUP (Email or Google OAuth) ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, display_name, username, avatar_url, has_chosen_username, role, subscription_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'user_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    false,
    'user',
    'standard'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    display_name = CASE WHEN profiles.display_name IS NULL OR profiles.display_name = '' THEN EXCLUDED.display_name ELSE profiles.display_name END,
    avatar_url = CASE WHEN profiles.avatar_url IS NULL OR profiles.avatar_url = '' THEN EXCLUDED.avatar_url ELSE profiles.avatar_url END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── STORAGE BUCKETS SETUP ──
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_select_avatars" ON storage.objects;
CREATE POLICY "public_select_avatars" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'attachments', 'post-media'));
DROP POLICY IF EXISTS "auth_insert_avatars" ON storage.objects;
CREATE POLICY "auth_insert_avatars" ON storage.objects FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_avatars" ON storage.objects;
CREATE POLICY "auth_update_avatars" ON storage.objects FOR UPDATE USING (true);

-- ── ADMIN & CLEARANCE CODES ──
CREATE TABLE IF NOT EXISTS public.signup_clearance_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  assigned_role TEXT NOT NULL,
  created_by_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.signup_clearance_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_signup_clearance_codes" ON public.signup_clearance_codes;
CREATE POLICY "allow_all_signup_clearance_codes" ON public.signup_clearance_codes FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.signup_clearance_codes (code, assigned_role, created_by_email)
VALUES 
  ('TRADIFIVE_ADMIN_2026', 'ceo', 'system'),
  ('TRADIFIVE_DEPT_2026', 'operations_executive', 'system'),
  ('TRADIFIVE_STAFF_2026', 'employee', 'system')
ON CONFLICT (code) DO NOTHING;
