-- 1. Admin Optimization
-- Create a high-performance function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user exists in admin_profiles (or fallback to employee table with CEO/Lead roles)
  RETURN EXISTS (
    SELECT 1 FROM auth.users u
    JOIN public.hr_employees e ON e.auth_id = u.id
    WHERE u.id = auth.uid()
    AND e.role_title IN ('CEO', 'Master Admin', 'System Admin', 'CTO')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Trade Journals
CREATE TABLE IF NOT EXISTS public.trade_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    discipline_score INTEGER DEFAULT 100,
    emotional_state TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trade_journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own journals" ON public.trade_journals FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users manage own journals" ON public.trade_journals FOR ALL USING (auth.uid() = user_id OR public.is_admin());


-- 3. Marketplace
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'EA', 'Indicator', 'Utility'
    price NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view approved items" ON public.marketplace_items FOR SELECT USING (status = 'approved' OR auth.uid() = seller_id OR public.is_admin());
CREATE POLICY "Sellers manage own items" ON public.marketplace_items FOR ALL USING (auth.uid() = seller_id OR public.is_admin());


-- 4. Moderation Flags
CREATE TABLE IF NOT EXISTS public.moderation_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL, -- 'post', 'comment', 'story'
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    severity TEXT DEFAULT 'low',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporters view own flags" ON public.moderation_flags FOR SELECT USING (auth.uid() = reporter_id OR public.is_admin());
CREATE POLICY "Reporters insert flags" ON public.moderation_flags FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Only admins update/delete flags" ON public.moderation_flags FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins delete flags" ON public.moderation_flags FOR DELETE USING (public.is_admin());


-- 5. Push Notifications
CREATE TABLE IF NOT EXISTS public.push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    target_audience TEXT DEFAULT 'all',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view notifications" ON public.push_notifications FOR SELECT USING (true);
CREATE POLICY "Only admins manage notifications" ON public.push_notifications FOR ALL USING (public.is_admin());


-- 6. Learning Center
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Course', 'Webinar'
    status TEXT DEFAULT 'draft',
    enrollments INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view published courses" ON public.courses FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Only admins manage courses" ON public.courses FOR ALL USING (public.is_admin());


-- 7. Strategies
CREATE TABLE IF NOT EXISTS public.trading_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'EA Builder', 'Template'
    win_rate NUMERIC DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    status TEXT DEFAULT 'stopped',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trading_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view active strategies" ON public.trading_strategies FOR SELECT USING (status = 'running' OR auth.uid() = creator_id OR public.is_admin());
CREATE POLICY "Creators manage own strategies" ON public.trading_strategies FOR ALL USING (auth.uid() = creator_id OR public.is_admin());


-- 8. Referrals/Affiliates
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    total_referred INTEGER DEFAULT 0,
    active_subs INTEGER DEFAULT 0,
    earnings NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own affiliate profile" ON public.affiliate_profiles FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users manage own affiliate profile" ON public.affiliate_profiles FOR ALL USING (auth.uid() = user_id OR public.is_admin());

