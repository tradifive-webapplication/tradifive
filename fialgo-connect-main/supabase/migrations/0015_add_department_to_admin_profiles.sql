-- Add department to admin profiles
ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Unassigned';
