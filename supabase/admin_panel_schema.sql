-- Phase 1: Database Architecture & Security

-- 1. Create User Roles Enum
CREATE TYPE public.user_role AS ENUM ('user', 'super_admin', 'support_agent', 'finance_admin');

-- 2. Update Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN role public.user_role DEFAULT 'user',
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN plan_type TEXT DEFAULT 'none',
ADD COLUMN is_banned BOOLEAN DEFAULT false;

-- 3. Create Support Tickets Table
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create System Logs Table
CREATE TABLE public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level TEXT NOT NULL, -- e.g., 'info', 'error', 'webhook', 'mt5'
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create System Settings Table (for Global Kill Switch)
CREATE TABLE public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial settings
INSERT INTO public.system_settings (key, value)
VALUES ('global_kill_switch', 'false'::jsonb);

-- 6. Row Level Security (RLS) Rules

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('super_admin', 'support_agent', 'finance_admin')
));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('super_admin', 'finance_admin')
));

-- Support Tickets Policies
CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" 
ON public.support_tickets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view and update all tickets" 
ON public.support_tickets FOR ALL 
USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('super_admin', 'support_agent')
));

-- System Logs Policies
CREATE POLICY "Admins can view system logs" 
ON public.system_logs FOR SELECT 
USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('super_admin', 'support_agent')
));

-- System Settings Policies
CREATE POLICY "Anyone can view system settings" 
ON public.system_settings FOR SELECT 
USING (true);

CREATE POLICY "Super admins can update system settings" 
ON public.system_settings FOR UPDATE 
USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'super_admin'
));

-- Realtime Setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
