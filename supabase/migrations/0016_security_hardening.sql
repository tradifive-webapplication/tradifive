-- ============================================================
-- TRADIFIVE SECURITY HARDENING MIGRATION
-- Version: 1.0
-- Purpose: Audit logging, policy hardening, RLS gap closure,
--          rate limiting tables, admin access controls,
--          and broker connections RLS protection.
-- ============================================================


-- ==========================================
-- 1. AUDIT LOG TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email   TEXT,
  actor_role    TEXT,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  details       JSONB DEFAULT '{}',
  ip_address    TEXT,
  user_agent    TEXT,
  severity      TEXT DEFAULT 'info',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id   ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action      ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity    ON public.audit_logs(severity);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins read audit logs" ON public.audit_logs;
END $$;


-- ==========================================
-- 2. LOGIN ATTEMPT TRACKING TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  ip_address   TEXT,
  user_agent   TEXT,
  success      BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email       ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON public.login_attempts(attempted_at DESC);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 3. ACTIVE SESSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_token_hash TEXT NOT NULL,
  device_name  TEXT,
  ip_address   TEXT,
  user_agent   TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at   TIMESTAMPTZ DEFAULT now(),
  revoked      BOOLEAN DEFAULT false,
  revoked_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users see own sessions" ON public.user_sessions;
  DROP POLICY IF EXISTS "Users revoke own sessions" ON public.user_sessions;

  CREATE POLICY "Users see own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users revoke own sessions" ON public.user_sessions
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;


-- ==========================================
-- 4. HARDEN EXISTING RLS POLICIES
-- ==========================================

-- 4a. Profiles RLS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users insert own profile" ON public.profiles;

  CREATE POLICY "Authenticated users insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL);
END $$;

-- 4b. Trades RLS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users see own trades" ON public.trades;
  DROP POLICY IF EXISTS "Users insert own trades" ON public.trades;
  DROP POLICY IF EXISTS "Users update own trades" ON public.trades;
  DROP POLICY IF EXISTS "Users delete own trades" ON public.trades;

  CREATE POLICY "Users see own trades" ON public.trades
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users insert own trades" ON public.trades
    FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

  CREATE POLICY "Users update own trades" ON public.trades
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users delete own trades" ON public.trades
    FOR DELETE USING (auth.uid() = user_id);
END $$;

-- 4c. MT5 Accounts RLS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users see own mt5 accounts" ON public.mt5_accounts;
  DROP POLICY IF EXISTS "Users insert own mt5 accounts" ON public.mt5_accounts;
  DROP POLICY IF EXISTS "Users update own mt5 accounts" ON public.mt5_accounts;
  DROP POLICY IF EXISTS "Users delete own mt5 accounts" ON public.mt5_accounts;

  CREATE POLICY "Users see own mt5 accounts" ON public.mt5_accounts
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users insert own mt5 accounts" ON public.mt5_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

  CREATE POLICY "Users update own mt5 accounts" ON public.mt5_accounts
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users delete own mt5 accounts" ON public.mt5_accounts
    FOR DELETE USING (auth.uid() = user_id);
END $$;


-- ==========================================
-- 5. ADMIN PROFILES
-- ==========================================
DO $$ BEGIN
  ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS two_factor_enforced BOOLEAN DEFAULT true;
  ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
  ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS login_ip TEXT;
  ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admin sees own profile" ON public.admin_profiles;
  CREATE POLICY "Admin sees own profile" ON public.admin_profiles
    FOR SELECT USING (auth.uid() = id);
END $$;


-- ==========================================
-- 6. FUNCTION: LOG AUDIT EVENT
-- ==========================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_actor_id      UUID,
  p_actor_email   TEXT,
  p_actor_role    TEXT,
  p_action        TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id   TEXT DEFAULT NULL,
  p_details       JSONB DEFAULT '{}',
  p_ip_address    TEXT DEFAULT NULL,
  p_severity      TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    actor_id, actor_email, actor_role, action,
    resource_type, resource_id, details, ip_address, severity
  ) VALUES (
    p_actor_id, p_actor_email, p_actor_role, p_action,
    p_resource_type, p_resource_id, p_details, p_ip_address, p_severity
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;


-- ==========================================
-- 7. FUNCTION: CHECK LOGIN RATE LIMIT
-- ==========================================
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(
  p_email     TEXT,
  p_ip        TEXT DEFAULT NULL,
  p_window_minutes INTEGER DEFAULT 15,
  p_max_attempts   INTEGER DEFAULT 10
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.login_attempts
  WHERE
    email = p_email
    AND success = false
    AND attempted_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;

  RETURN v_count >= p_max_attempts;
END;
$$;


-- ==========================================
-- 8. HARDEN BROKER CONNECTIONS
-- ==========================================
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own broker connections" ON public.broker_connections;
DROP POLICY IF EXISTS "Service role manages all broker connections" ON public.broker_connections;

CREATE POLICY "Users can manage their own broker connections" 
  ON public.broker_connections 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages all broker connections" 
  ON public.broker_connections 
  FOR ALL 
  USING (auth.role() = 'service_role');
