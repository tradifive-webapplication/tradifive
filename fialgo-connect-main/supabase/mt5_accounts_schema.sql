-- 1. Create Connection Status Enum
DO $$ BEGIN
    CREATE TYPE public.connection_status AS ENUM ('pending', 'deployed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create MT5 Accounts Table
CREATE TABLE IF NOT EXISTS public.mt5_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    metaapi_account_id TEXT,
    broker_server TEXT NOT NULL,
    account_number TEXT,
    connection_status public.connection_status DEFAULT 'pending',
    algo_status BOOLEAN DEFAULT false,
    balance DECIMAL(12,2) DEFAULT 0,
    equity DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.mt5_accounts ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
CREATE POLICY "Users can view their own MT5 account"
ON public.mt5_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own MT5 account"
ON public.mt5_accounts FOR UPDATE
USING (auth.uid() = user_id);

-- Note: We do not store MT5 Master Passwords in this table for security. 
-- They are passed directly to the Edge Function for one-time deployment.
