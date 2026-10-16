-- HR & Internal Operations Database Schema

-- Types
CREATE TYPE public.hr_employee_status AS ENUM ('active', 'on_leave', 'terminated');
CREATE TYPE public.hr_candidate_stage AS ENUM ('applied', 'interview', 'offer', 'hired', 'rejected');

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS public.hr_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    role_title TEXT NOT NULL,
    role_level TEXT NOT NULL,
    phone TEXT,
    avatar_initials TEXT,
    avatar_color TEXT,
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
    status public.hr_employee_status DEFAULT 'active',
    salary NUMERIC,
    reporting_to UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
    skills TEXT[],
    location TEXT,
    performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Attendance Table
CREATE TABLE IF NOT EXISTS public.hr_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    check_in TIME,
    check_out TIME,
    UNIQUE(employee_id, date)
);

-- 3. Candidates Table
CREATE TABLE IF NOT EXISTS public.hr_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role_applied TEXT NOT NULL,
    department TEXT NOT NULL,
    stage public.hr_candidate_stage DEFAULT 'applied',
    resume_url TEXT,
    notes TEXT,
    added_by TEXT,
    experience_years INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Internal Messages Table
CREATE TABLE IF NOT EXISTS public.internal_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    to_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Employees
CREATE POLICY "Anyone can view employees" ON public.hr_employees FOR SELECT USING (true);
CREATE POLICY "Admins can manage employees" ON public.hr_employees FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles));

-- RLS Policies: Attendance
CREATE POLICY "Anyone can view attendance" ON public.hr_attendance FOR SELECT USING (true);
CREATE POLICY "Employees can manage own attendance" ON public.hr_attendance FOR ALL USING (
    auth.uid() IN (SELECT auth_id FROM public.hr_employees WHERE id = employee_id)
    OR auth.uid() IN (SELECT id FROM public.admin_profiles)
);

-- RLS Policies: Candidates
CREATE POLICY "Admins can view candidates" ON public.hr_candidates FOR SELECT USING (auth.uid() IN (SELECT id FROM public.admin_profiles));
CREATE POLICY "Admins can manage candidates" ON public.hr_candidates FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles));

-- RLS Policies: Messages
CREATE POLICY "Users can view their own messages" ON public.internal_messages FOR SELECT USING (
    auth.uid() IN (SELECT auth_id FROM public.hr_employees WHERE id = from_id OR id = to_id)
    OR auth.uid() IN (SELECT id FROM public.admin_profiles)
);
CREATE POLICY "Users can insert messages" ON public.internal_messages FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_id FROM public.hr_employees WHERE id = from_id)
    OR auth.uid() IN (SELECT id FROM public.admin_profiles)
);
CREATE POLICY "Users can update messages" ON public.internal_messages FOR UPDATE USING (
    auth.uid() IN (SELECT auth_id FROM public.hr_employees WHERE id = to_id)
    OR auth.uid() IN (SELECT id FROM public.admin_profiles)
);
