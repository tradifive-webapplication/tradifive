-- ============================================================
-- ADMIN PLATFORM MIGRATION
-- Creates all missing tables needed for full admin functionality
-- ============================================================

-- 1. COMPETITIONS TABLE
CREATE TABLE IF NOT EXISTS competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'finished')),
  start_date DATE,
  end_date DATE,
  prize_pool TEXT,
  max_contestants INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read competitions" ON competitions FOR SELECT USING (true);
CREATE POLICY "Admins can insert competitions" ON competitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update competitions" ON competitions FOR UPDATE USING (true);
CREATE POLICY "Admins can delete competitions" ON competitions FOR DELETE USING (true);

-- 2. PAYOUT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  method TEXT DEFAULT 'bank_transfer',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own payouts" ON payout_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all payouts" ON payout_requests FOR SELECT USING (true);
CREATE POLICY "Admins can update payouts" ON payout_requests FOR UPDATE USING (true);
CREATE POLICY "Users can insert payouts" ON payout_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. TRANSACTIONS TABLE  
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('deposit', 'withdrawal', 'subscription', 'refund', 'reward')),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "System can insert transactions" ON transactions FOR INSERT WITH CHECK (true);

-- 4. SYSTEM SETTINGS TABLE (for global kill switch etc)
CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Admins can upsert settings" ON system_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update settings" ON system_settings FOR UPDATE USING (true);

-- 5. TICKET REPLIES TABLE (for support ticket responses)
CREATE TABLE IF NOT EXISTS ticket_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID,
  admin_id UUID,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ticket replies" ON ticket_replies FOR SELECT USING (true);
CREATE POLICY "Admins can insert ticket replies" ON ticket_replies FOR INSERT WITH CHECK (true);

-- 6. JOURNAL ENTRIES TABLE (for user trade journals)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  symbol TEXT,
  notes TEXT,
  description TEXT,
  trade_id UUID,
  mood TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own journals" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journals" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journals" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all journals" ON journal_entries FOR SELECT USING (true);

-- 7. ADMIN PINGS TABLE
CREATE TABLE IF NOT EXISTS admin_pings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  admin_id UUID,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_pings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own pings" ON admin_pings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert pings" ON admin_pings FOR INSERT WITH CHECK (true);

-- Done!
SELECT 'All admin tables created successfully!' AS result;
