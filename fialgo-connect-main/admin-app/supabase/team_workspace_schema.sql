-- Team Workspace Schema

-- 1. Team Tasks (assigned by CEO to employees)
CREATE TABLE public.team_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignee_email TEXT NOT NULL,
    assigned_by_email TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Team Time Logs (Attendance and Stopwatch)
CREATE TABLE public.team_time_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_email TEXT NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE,
    total_minutes INTEGER DEFAULT 0,
    date DATE NOT NULL,
    status TEXT DEFAULT 'active' -- 'active', 'completed'
);

-- 3. Team End of Day (EOD) Reports
CREATE TABLE public.team_eod_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_email TEXT NOT NULL,
    date DATE NOT NULL,
    time_log_id UUID REFERENCES public.team_time_logs(id),
    report_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS Policies (Assuming users are authenticated via Supabase Auth)
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_eod_reports ENABLE ROW LEVEL SECURITY;

-- Simple policies for prototyping (Allow all authenticated users for now)
CREATE POLICY "Allow authenticated read tasks" ON public.team_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert tasks" ON public.team_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update tasks" ON public.team_tasks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read logs" ON public.team_time_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert logs" ON public.team_time_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update logs" ON public.team_time_logs FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read reports" ON public.team_eod_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert reports" ON public.team_eod_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update reports" ON public.team_eod_reports FOR UPDATE TO authenticated USING (true);
