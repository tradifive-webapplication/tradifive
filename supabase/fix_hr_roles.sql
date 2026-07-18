-- 1. Create a dedicated Master Clearance Code specifically for HR Managers
INSERT INTO public.signup_clearance_codes (code, assigned_role, created_by_email)
VALUES 
  ('TRADIFIVE_HR_2026', 'hr_manager', 'system')
ON CONFLICT (code) DO NOTHING;

-- 2. Fix the roles for anyone who accidentally got assigned to Operations 
-- when they were supposed to be HR. 
-- (This will fix Sushma and Akarshnikil's accounts immediately)
UPDATE public.admin_profiles
SET role = 'hr_manager'
WHERE role = 'operations_executive';
