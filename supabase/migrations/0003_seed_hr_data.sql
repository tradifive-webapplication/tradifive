-- Seed Mock Data for HR Operations

-- Clear existing data if any (optional, safe for initial seed)
TRUNCATE TABLE public.internal_messages CASCADE;
TRUNCATE TABLE public.hr_attendance CASCADE;
TRUNCATE TABLE public.hr_candidates CASCADE;
TRUNCATE TABLE public.hr_employees CASCADE;

-- Insert Employees
INSERT INTO public.hr_employees (id, full_name, email, department, role_title, role_level, phone, avatar_initials, avatar_color, joined_at, status, salary, reporting_to, skills, location, performance_score)
VALUES
('00000000-0000-0000-0000-000000000001', 'Nikil Sharma', 'ceo@tradifive.com', 'Executive', 'Chief Executive Officer', 'ceo', '+91 98765 00001', 'NS', '#f59e0b', '2023-01-01', 'active', 500000, NULL, ARRAY['Leadership', 'Strategy', 'Product', 'Finance'], 'Mumbai, India', 98),
('00000000-0000-0000-0000-000000000002', 'Aryan Mehta', 'cto@tradifive.com', 'Technology', 'Chief Technology Officer', 'cto', '+91 98765 00002', 'AM', '#6366f1', '2023-01-15', 'active', 400000, '00000000-0000-0000-0000-000000000001', ARRAY['React', 'Node.js', 'Supabase', 'DevOps', 'Python'], 'Bangalore, India', 94),
('00000000-0000-0000-0000-000000000003', 'Priya Kapoor', 'risk@tradifive.com', 'Risk & Trading', 'Head of Risk', 'head', '+91 98765 00003', 'PK', '#ef4444', '2023-02-01', 'active', 320000, '00000000-0000-0000-0000-000000000001', ARRAY['Forex', 'MT5', 'Risk Models', 'Python'], 'Delhi, India', 91),
('00000000-0000-0000-0000-000000000004', 'Rahul Verma', 'ops@tradifive.com', 'Operations', 'Head of Operations', 'head', '+91 98765 00004', 'RV', '#10b981', '2023-02-15', 'active', 300000, '00000000-0000-0000-0000-000000000001', ARRAY['Finance', 'Process Management', 'Excel', 'Analytics'], 'Pune, India', 88),
('00000000-0000-0000-0000-000000000005', 'Sneha Iyer', 'support@tradifive.com', 'Support', 'Head of Support', 'head', '+91 98765 00005', 'SI', '#3b82f6', '2023-03-01', 'active', 280000, '00000000-0000-0000-0000-000000000001', ARRAY['Customer Support', 'Zendesk', 'Communication'], 'Hyderabad, India', 92),
('00000000-0000-0000-0000-000000000006', 'Meera Nair', 'hr@tradifive.com', 'HR', 'HR Manager', 'head', '+91 98765 00006', 'MN', '#a855f7', '2023-03-15', 'active', 250000, '00000000-0000-0000-0000-000000000001', ARRAY['Recruitment', 'HR Policy', 'Payroll', 'Culture'], 'Chennai, India', 90),
('00000000-0000-0000-0000-000000000007', 'Dev Patel', 'dev.patel@tradifive.com', 'Technology', 'Senior Frontend Engineer', 'employee', '+91 98765 00007', 'DP', '#818cf8', '2023-05-01', 'active', 200000, '00000000-0000-0000-0000-000000000002', ARRAY['React', 'TypeScript', 'CSS', 'Framer Motion'], 'Bangalore, India', 87),
('00000000-0000-0000-0000-000000000008', 'Anjali Singh', 'anjali.s@tradifive.com', 'Technology', 'Backend Engineer', 'employee', '+91 98765 00008', 'AS', '#c084fc', '2023-06-01', 'active', 190000, '00000000-0000-0000-0000-000000000002', ARRAY['Node.js', 'PostgreSQL', 'Supabase', 'APIs'], 'Bangalore, India', 85),
('00000000-0000-0000-0000-000000000009', 'Karan Joshi', 'karan.j@tradifive.com', 'Risk & Trading', 'Risk Analyst', 'employee', '+91 98765 00009', 'KJ', '#fb7185', '2023-07-01', 'active', 180000, '00000000-0000-0000-0000-000000000003', ARRAY['Forex Analysis', 'MT5', 'Excel', 'Risk Reporting'], 'Delhi, India', 82),
('00000000-0000-0000-0000-000000000010', 'Tanvi Reddy', 'tanvi.r@tradifive.com', 'Support', 'Support Executive', 'employee', '+91 98765 00010', 'TR', '#60a5fa', '2023-08-01', 'on_leave', 150000, '00000000-0000-0000-0000-000000000005', ARRAY['Customer Support', 'English', 'Hindi'], 'Hyderabad, India', 79),
('00000000-0000-0000-0000-000000000011', 'Rohan Das', 'rohan.d@tradifive.com', 'Operations', 'Operations Analyst', 'employee', '+91 98765 00011', 'RD', '#34d399', '2023-09-01', 'active', 160000, '00000000-0000-0000-0000-000000000004', ARRAY['Finance', 'Data Analysis', 'Reporting'], 'Pune, India', 81),
('00000000-0000-0000-0000-000000000012', 'Ishaan Gupta', 'ishaan.g@tradifive.com', 'Technology', 'DevOps Engineer', 'employee', '+91 98765 00012', 'IG', '#7dd3fc', '2023-10-01', 'active', 210000, '00000000-0000-0000-0000-000000000002', ARRAY['AWS', 'Docker', 'CI/CD', 'Linux'], 'Bangalore, India', 89);

-- Insert Candidates
INSERT INTO public.hr_candidates (id, name, email, phone, role_applied, department, stage, notes, added_by, experience_years)
VALUES
('00000000-0000-0000-0000-000000000101', 'Vikram Rao', 'vikram.r@gmail.com', '+91 98000 11111', 'Senior React Developer', 'Technology', 'interview', 'Strong portfolio, 5 yrs experience at Razorpay.', 'Meera Nair', 5),
('00000000-0000-0000-0000-000000000102', 'Divya Menon', 'divya.m@gmail.com', '+91 98000 22222', 'Risk Analyst', 'Risk & Trading', 'offer', 'MBA Finance, 3 yrs at ICICI. Excellent quantitative skills.', 'Priya Kapoor', 3),
('00000000-0000-0000-0000-000000000103', 'Sameer Khan', 'sameer.k@gmail.com', '+91 98000 33333', 'Customer Support Lead', 'Support', 'applied', 'Fluent in 4 languages. Prior call center experience.', 'Meera Nair', 2),
('00000000-0000-0000-0000-000000000104', 'Ritika Shah', 'ritika.s@gmail.com', '+91 98000 44444', 'Backend Engineer', 'Technology', 'hired', 'Excellent Node.js skills. Joining July 1.', 'Aryan Mehta', 4),
('00000000-0000-0000-0000-000000000105', 'Aditya Kumar', 'aditya.k@gmail.com', '+91 98000 55555', 'Operations Analyst', 'Operations', 'rejected', 'Good candidate but experience mismatch.', 'Meera Nair', 1),
('00000000-0000-0000-0000-000000000106', 'Pooja Tiwari', 'pooja.t@gmail.com', '+91 98000 66666', 'UI/UX Designer', 'Technology', 'interview', 'Beautiful Figma work. Strong product sense.', 'Aryan Mehta', 3),
('00000000-0000-0000-0000-000000000107', 'Nikhil Bajaj', 'nikhil.b@gmail.com', '+91 98000 77777', 'Finance Executive', 'Operations', 'applied', 'CA qualified, 2 yrs experience.', 'Rahul Verma', 2),
('00000000-0000-0000-0000-000000000108', 'Zara Ahmed', 'zara.a@gmail.com', '+91 98000 88888', 'Senior Risk Analyst', 'Risk & Trading', 'interview', 'Ex-Goldman Sachs. Extremely strong quant background.', 'Priya Kapoor', 6);

-- Insert Internal Messages
INSERT INTO public.internal_messages (from_id, to_id, message, read, created_at)
VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Aryan, please review the MT5 bridge performance report. We need to optimize the latency before Q3.', true, now() - interval '2 hours'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'On it. I''ll have the report ready by EOD. Current latency is around 48ms, target is under 30ms.', true, now() - interval '1.5 hours'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Priya, the Risk Guard false positive rate is too high this week. Can we calibrate the thresholds?', false, now() - interval '1 hour'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'CEO, we have 3 critical support tickets pending for over 48 hours. Need additional resources.', false, now() - interval '30 minutes');

-- We won't generate 30 days of attendance for everyone manually here, but we can generate a few recent records for demonstration.
INSERT INTO public.hr_attendance (employee_id, date, status, check_in, check_out)
VALUES
('00000000-0000-0000-0000-000000000001', CURRENT_DATE, 'present', '09:00:00', '18:30:00'),
('00000000-0000-0000-0000-000000000002', CURRENT_DATE, 'present', '09:15:00', '19:00:00'),
('00000000-0000-0000-0000-000000000003', CURRENT_DATE, 'present', '08:50:00', '17:45:00'),
('00000000-0000-0000-0000-000000000004', CURRENT_DATE, 'late', '10:15:00', '18:00:00'),
('00000000-0000-0000-0000-000000000005', CURRENT_DATE, 'on_leave', NULL, NULL);

