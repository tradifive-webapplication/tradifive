-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    assigned_to UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create operations_tasks table
CREATE TABLE IF NOT EXISTS public.operations_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_logs table for Global Radar
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL, -- INFO, WARNING, ERROR
    message TEXT NOT NULL,
    source TEXT NOT NULL, -- 'web', 'admin', 'mt5'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all support tickets"
    ON public.support_tickets FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage support tickets"
    ON public.support_tickets FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view their own tickets"
    ON public.support_tickets FOR SELECT
    USING (user_id = auth.uid());
    
CREATE POLICY "Users can create tickets"
    ON public.support_tickets FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view operations tasks"
    ON public.operations_tasks FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage operations tasks"
    ON public.operations_tasks FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view system logs"
    ON public.system_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));
    
CREATE POLICY "Anyone can insert system logs"
    ON public.system_logs FOR INSERT
    WITH CHECK (true);

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    target_type TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
    ON public.admin_audit_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can insert audit logs"
    ON public.admin_audit_logs FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()));

