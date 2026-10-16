-- Phase 2: Isolated Admin Database Architecture

-- 1. Create Admin Profiles table (Isolated from regular users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role public.user_role DEFAULT 'support_agent',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. System Configuration (for Invite Code)
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert the Master Invite Code
INSERT INTO public.system_config (key, value)
VALUES ('master_invite_code', 'TRADIFIVE_ADMIN_2026')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. RLS Security Updates

-- Enable RLS on admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view their own profile
CREATE POLICY "Admins can view their own profile" 
ON public.admin_profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Only super_admins can see all admin profiles
CREATE POLICY "Super admins can view all admin profiles" 
ON public.admin_profiles FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role = 'super_admin'));

-- 4. Re-securing Admin Data Tables
-- We adjust existing RLS policies to check the admin_profiles table instead of the profiles table.

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.admin_profiles));

DROP POLICY IF EXISTS "Admins can view and update all tickets" ON public.support_tickets;
CREATE POLICY "Admins can view and update all tickets" 
ON public.support_tickets FOR ALL 
USING (auth.uid() IN (SELECT id FROM public.admin_profiles));

DROP POLICY IF EXISTS "Admins can view system logs" ON public.system_logs;
CREATE POLICY "Admins can view system logs" 
ON public.system_logs FOR SELECT 
USING (auth.uid() IN (SELECT id FROM public.admin_profiles));

DROP POLICY IF EXISTS "Super admins can update system settings" ON public.system_settings;
CREATE POLICY "Super admins can update system settings" 
ON public.system_settings FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role = 'super_admin'));
