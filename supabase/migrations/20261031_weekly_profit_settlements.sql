-- ====================================================================
-- TRADIFIVE WEEKLY PROFIT SETTLEMENT MIGRATION
-- Tables: settlements, settlement_items, settlement_accounts,
--         settlement_payments, settlement_adjustments, settlement_audit_logs
-- ====================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enum for Settlement Status
DO $$ BEGIN
    CREATE TYPE public.settlement_status_enum AS ENUM (
        'pending',
        'paid',
        'overdue',
        'loss_week',
        'approved',
        'rejected',
        'processing'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Enum for Payment Gateway Types
DO $$ BEGIN
    CREATE TYPE public.settlement_gateway_enum AS ENUM (
        'razorpay',
        'upi_qr',
        'crypto_usdt',
        'bank_transfer',
        'admin_manual'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- TABLE 1: settlement_accounts (Tracks account binding and loss carry-forwards)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.settlement_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    mt5_account_number TEXT NOT NULL,
    broker_server TEXT DEFAULT 'Exness-Real',
    currency TEXT DEFAULT 'INR', -- Reporting currency (INR / USC / USD)
    settlement_cohort_day TEXT DEFAULT 'Wednesday', -- Day of weekly settlement
    loss_carry_forward DECIMAL(14,2) DEFAULT 0.00, -- Accumulated losses to offset against future gains
    lifetime_realised_profit DECIMAL(14,2) DEFAULT 0.00,
    lifetime_platform_share_paid DECIMAL(14,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_settlement_account UNIQUE (user_id, mt5_account_number)
);

-- ====================================================================
-- TABLE 2: settlements (Master weekly settlement records)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_number TEXT UNIQUE NOT NULL, -- e.g. SETTLE-2026-W44-3652
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    mt5_account_id UUID REFERENCES public.settlement_accounts(id) ON DELETE SET NULL,
    mt5_account_number TEXT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    week_label TEXT NOT NULL, -- e.g. "Week 44 (Oct 26 - Nov 01, 2026)"
    starting_balance DECIMAL(14,2) DEFAULT 0.00,
    ending_balance DECIMAL(14,2) DEFAULT 0.00,
    gross_profit DECIMAL(14,2) DEFAULT 0.00,
    gross_loss DECIMAL(14,2) DEFAULT 0.00,
    commissions DECIMAL(14,2) DEFAULT 0.00,
    swaps DECIMAL(14,2) DEFAULT 0.00,
    net_realised_profit DECIMAL(14,2) DEFAULT 0.00,
    previous_loss_carried DECIMAL(14,2) DEFAULT 0.00,
    eligible_profit DECIMAL(14,2) DEFAULT 0.00,
    tradifive_share DECIMAL(14,2) DEFAULT 0.00, -- 50%
    customer_share DECIMAL(14,2) DEFAULT 0.00,  -- 50%
    amount_payable DECIMAL(14,2) DEFAULT 0.00,  -- = tradifive_share
    currency TEXT DEFAULT 'INR',
    fx_rate DECIMAL(10,4) DEFAULT 0.9368,       -- For USC -> INR conversion
    status TEXT DEFAULT 'pending',
    payment_deadline TIMESTAMPTZ NOT NULL,
    payment_reference TEXT,
    payment_method TEXT,
    paid_at TIMESTAMPTZ,
    receipt_number TEXT,
    receipt_url TEXT,
    admin_notes TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    calculation_breakdown JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- TABLE 3: settlement_items (Closed trades included in this settlement)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.settlement_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id UUID REFERENCES public.settlements(id) ON DELETE CASCADE NOT NULL,
    ticket TEXT NOT NULL,
    symbol TEXT NOT NULL,
    trade_type TEXT NOT NULL, -- 'BUY' or 'SELL'
    lot_size DECIMAL(10,2) DEFAULT 0.01,
    open_price DECIMAL(14,5),
    close_price DECIMAL(14,5),
    profit DECIMAL(14,2) NOT NULL,
    commission DECIMAL(14,2) DEFAULT 0.00,
    swap DECIMAL(14,2) DEFAULT 0.00,
    net_pnl DECIMAL(14,2) NOT NULL,
    opened_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- TABLE 4: settlement_payments (Gateway & offline payment records)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.settlement_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id UUID REFERENCES public.settlements(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    payment_gateway TEXT DEFAULT 'razorpay',
    gateway_order_id TEXT,
    gateway_payment_id TEXT,
    gateway_signature TEXT,
    amount DECIMAL(14,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'initiated', -- initiated, success, failed, refunded
    payment_metadata JSONB DEFAULT '{}'::jsonb,
    verified_at TIMESTAMPTZ,
    verified_by TEXT, -- 'razorpay_webhook', 'edge_function', 'admin_manual'
    receipt_number TEXT UNIQUE,
    proof_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- TABLE 5: settlement_adjustments (Admin audit log for adjustments)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.settlement_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id UUID REFERENCES public.settlements(id) ON DELETE CASCADE NOT NULL,
    adjusted_by UUID REFERENCES public.profiles(id) NOT NULL,
    previous_amount DECIMAL(14,2) NOT NULL,
    new_amount DECIMAL(14,2) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- TABLE 6: settlement_audit_logs (Immutable audit ledger)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.settlement_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id UUID REFERENCES public.settlements(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id),
    actor_email TEXT,
    action TEXT NOT NULL, -- 'CALCULATED', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED', 'ADJUSTED', 'APPROVED', 'REJECTED'
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_settlements_user_id ON public.settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON public.settlements(status);
CREATE INDEX IF NOT EXISTS idx_settlements_period ON public.settlements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_settlements_number ON public.settlements(settlement_number);
CREATE INDEX IF NOT EXISTS idx_settlement_items_settlement ON public.settlement_items(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_ticket ON public.settlement_items(ticket);
CREATE INDEX IF NOT EXISTS idx_settlement_payments_settlement ON public.settlement_payments(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_audit_settlement ON public.settlement_audit_logs(settlement_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.settlement_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user has Admin role
CREATE OR REPLACE FUNCTION public.is_settlement_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'support_agent', 'finance_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for settlements
CREATE POLICY "Users can view their own settlements"
ON public.settlements FOR SELECT
USING (auth.uid() = user_id OR public.is_settlement_admin());

CREATE POLICY "Admins have full access to settlements"
ON public.settlements FOR ALL
USING (public.is_settlement_admin());

-- Policies for settlement_items
CREATE POLICY "Users can view their settlement items"
ON public.settlement_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.settlements s
        WHERE s.id = settlement_items.settlement_id
        AND s.user_id = auth.uid()
    ) OR public.is_settlement_admin()
);

CREATE POLICY "Admins have full access to settlement items"
ON public.settlement_items FOR ALL
USING (public.is_settlement_admin());

-- Policies for settlement_accounts
CREATE POLICY "Users can view their settlement accounts"
ON public.settlement_accounts FOR SELECT
USING (auth.uid() = user_id OR public.is_settlement_admin());

CREATE POLICY "Users can update their own settlement account settings"
ON public.settlement_accounts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to settlement accounts"
ON public.settlement_accounts FOR ALL
USING (public.is_settlement_admin());

-- Policies for settlement_payments
CREATE POLICY "Users can view their settlement payments"
ON public.settlement_payments FOR SELECT
USING (auth.uid() = user_id OR public.is_settlement_admin());

CREATE POLICY "Users can insert settlement payments"
ON public.settlement_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to settlement payments"
ON public.settlement_payments FOR ALL
USING (public.is_settlement_admin());

-- Policies for settlement_adjustments (Read-only for users, full for admins)
CREATE POLICY "Users can view adjustments for their settlements"
ON public.settlement_adjustments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.settlements s
        WHERE s.id = settlement_adjustments.settlement_id
        AND s.user_id = auth.uid()
    ) OR public.is_settlement_admin()
);

CREATE POLICY "Admins can insert settlement adjustments"
ON public.settlement_adjustments FOR INSERT
WITH CHECK (public.is_settlement_admin());

-- Policies for settlement_audit_logs
CREATE POLICY "Users can view audit logs for their settlements"
ON public.settlement_audit_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.settlements s
        WHERE s.id = settlement_audit_logs.settlement_id
        AND s.user_id = auth.uid()
    ) OR public.is_settlement_admin()
);

CREATE POLICY "Admins can view and write all audit logs"
ON public.settlement_audit_logs FOR ALL
USING (public.is_settlement_admin());

-- ====================================================================
-- CALCULATION ENGINE FUNCTION (RPC)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.calculate_weekly_settlement(
    p_user_id UUID,
    p_mt5_account_number TEXT,
    p_period_start TIMESTAMPTZ,
    p_period_end TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
    v_gross_profit DECIMAL(14,2) := 0.00;
    v_gross_loss DECIMAL(14,2) := 0.00;
    v_commissions DECIMAL(14,2) := 0.00;
    v_swaps DECIMAL(14,2) := 0.00;
    v_net_realised_profit DECIMAL(14,2) := 0.00;
    v_loss_carry_forward DECIMAL(14,2) := 0.00;
    v_eligible_profit DECIMAL(14,2) := 0.00;
    v_tradifive_share DECIMAL(14,2) := 0.00;
    v_customer_share DECIMAL(14,2) := 0.00;
    v_amount_payable DECIMAL(14,2) := 0.00;
    v_status TEXT := 'pending';
    v_settlement_id UUID;
    v_settlement_number TEXT;
    v_week_label TEXT;
    v_starting_bal DECIMAL(14,2) := 0.00;
    v_ending_bal DECIMAL(14,2) := 0.00;
    v_deadline TIMESTAMPTZ;
BEGIN
    -- 1. Fetch account's current loss carry forward
    SELECT COALESCE(loss_carry_forward, 0.00)
    INTO v_loss_carry_forward
    FROM public.settlement_accounts
    WHERE user_id = p_user_id AND mt5_account_number = p_mt5_account_number;

    -- 2. Aggregate closed trades within settlement window
    SELECT 
        COALESCE(SUM(CASE WHEN profit > 0 THEN profit ELSE 0 END), 0.00),
        COALESCE(SUM(CASE WHEN profit < 0 THEN ABS(profit) ELSE 0 END), 0.00),
        COALESCE(SUM(ABS(COALESCE(commission, 0.00))), 0.00),
        COALESCE(SUM(ABS(COALESCE(swap, 0.00))), 0.00)
    INTO 
        v_gross_profit,
        v_gross_loss,
        v_commissions,
        v_swaps
    FROM public.trades
    WHERE user_id = p_user_id
      AND closed_at >= p_period_start
      AND closed_at <= p_period_end;

    -- 3. Calculate Net Realised Profit
    v_net_realised_profit := v_gross_profit - v_gross_loss - v_commissions - v_swaps;

    -- 4. Apply 50/50 formula and loss carry forward rules
    IF v_net_realised_profit <= 0 THEN
        v_eligible_profit := 0.00;
        v_tradifive_share := 0.00;
        v_customer_share := 0.00;
        v_amount_payable := 0.00;
        v_status := 'loss_week';
    ELSE
        IF v_net_realised_profit <= v_loss_carry_forward THEN
            v_eligible_profit := 0.00;
            v_tradifive_share := 0.00;
            v_customer_share := 0.00;
            v_amount_payable := 0.00;
            v_status := 'loss_week';
        ELSE
            v_eligible_profit := v_net_realised_profit - v_loss_carry_forward;
            v_tradifive_share := ROUND((v_eligible_profit * 0.50), 2);
            v_customer_share := ROUND((v_eligible_profit * 0.50), 2);
            v_amount_payable := v_tradifive_share;
            v_status := 'pending';
        END IF;
    END IF;

    -- 5. Format labels and deadline (Wednesday 23:59 UTC after period end)
    v_week_label := 'Week ' || TO_CHAR(p_period_start, 'WW (Mon DD - ') || TO_CHAR(p_period_end, 'Mon DD, YYYY)');
    v_settlement_number := 'SETTLE-' || TO_CHAR(p_period_start, 'YYYY-') || 'W' || TO_CHAR(p_period_start, 'IW-') || SUBSTRING(p_mt5_account_number FROM LENGTH(p_mt5_account_number)-3 FOR 4);
    v_deadline := p_period_end + INTERVAL '3 days'; -- e.g. Sunday end -> Wednesday deadline

    RETURN jsonb_build_object(
        'settlement_number', v_settlement_number,
        'week_label', v_week_label,
        'gross_profit', v_gross_profit,
        'gross_loss', v_gross_loss,
        'commissions', v_commissions,
        'swaps', v_swaps,
        'net_realised_profit', v_net_realised_profit,
        'previous_loss_carried', v_loss_carry_forward,
        'eligible_profit', v_eligible_profit,
        'tradifive_share', v_tradifive_share,
        'customer_share', v_customer_share,
        'amount_payable', v_amount_payable,
        'status', v_status,
        'payment_deadline', v_deadline
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
