-- Create a dedicated table for Indian broker accounts (Dhan, Zerodha, Upstox, Fyers)
-- This is completely separate from mt5_accounts which is for MT5/Forex brokers

CREATE TABLE IF NOT EXISTS public.indian_broker_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_name TEXT NOT NULL, -- 'dhan', 'zerodha', 'upstox', 'fyers'
  client_id TEXT,            -- Broker's client/UCC ID
  account_number TEXT,       -- Same as client_id for display purposes
  
  -- Account financials (fetched from broker API)
  balance NUMERIC DEFAULT 0,          -- Available cash / margin
  equity NUMERIC DEFAULT 0,           -- Net portfolio value
  used_margin NUMERIC DEFAULT 0,      -- Margin in use
  available_margin NUMERIC DEFAULT 0, -- Free margin available
  unrealized_pnl NUMERIC DEFAULT 0,   -- Open P&L
  realized_pnl NUMERIC DEFAULT 0,     -- Closed P&L today
  
  -- Connection state
  connection_status TEXT DEFAULT 'active' CHECK (connection_status IN ('active', 'disconnected', 'error')),
  algo_status BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id) -- One Indian broker account per user (primary)
);

-- RLS policies
ALTER TABLE public.indian_broker_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own Indian broker account"
  ON public.indian_broker_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own Indian broker account"
  ON public.indian_broker_accounts FOR ALL
  USING (auth.uid() = user_id);

-- Service role bypass (for Edge Functions)
CREATE POLICY "Service role can manage all Indian broker accounts"
  ON public.indian_broker_accounts FOR ALL
  USING (auth.role() = 'service_role');

-- Also add balance column to broker_connections if not present (for caching)
ALTER TABLE public.broker_connections ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;
ALTER TABLE public.broker_connections ADD COLUMN IF NOT EXISTS api_secret TEXT;
