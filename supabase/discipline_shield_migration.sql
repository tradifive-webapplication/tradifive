-- Migration: Add Discipline Shield columns to Profiles and MT5 Accounts
-- This ensures the Risk Engine and Discipline Enforcer function can operate correctly.

-- 1. Update Profiles with Risk Parameters
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_locked_for_today BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_daily_trades INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS trades_today INTEGER DEFAULT 0;

-- 2. Update MT5 Accounts with MetaApi Mapping
ALTER TABLE public.mt5_accounts
ADD COLUMN IF NOT EXISTS metaapi_account_id TEXT;

-- 3. Create a trigger to reset trades_today at midnight (Optional but recommended)
-- Or we can handle it via a cron job in Supabase.
-- For now, let's just ensure the columns exist.

-- 4. Create an index for faster lookups in the edge function
CREATE INDEX IF NOT EXISTS idx_mt5_accounts_metaapi_id ON public.mt5_accounts(metaapi_account_id);
