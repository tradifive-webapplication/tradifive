-- Migration: Add Financial Ledger for tracking Stripe revenue vs MetaApi costs

CREATE TABLE IF NOT EXISTS public.financial_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL, -- e.g., 'revenue', 'expense'
    category TEXT NOT NULL,         -- e.g., 'subscription', 'metaapi_cost'
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    description TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ledger entries"
ON public.financial_ledger FOR SELECT
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_financial_ledger_user ON public.financial_ledger(user_id);
