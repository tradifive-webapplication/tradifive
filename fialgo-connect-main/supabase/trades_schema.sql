-- 1. Create Trades Table
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    mt5_account_id UUID REFERENCES public.mt5_accounts(id) ON DELETE CASCADE,
    ticket TEXT UNIQUE NOT NULL,
    symbol TEXT NOT NULL,
    profit DECIMAL(12,2) NOT NULL,
    trade_type INTEGER NOT NULL, -- 0 = Buy, 1 = Sell
    lot_size DECIMAL(12,2) NOT NULL,
    opened_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
CREATE POLICY "Users can view their own trades"
ON public.trades FOR SELECT
USING (auth.uid() = user_id);

-- 4. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_closed_at ON public.trades(closed_at DESC);
