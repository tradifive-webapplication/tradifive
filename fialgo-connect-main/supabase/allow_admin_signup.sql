-- Fix Admin Profiles RLS Policies
-- Adds missing INSERT and UPDATE permissions to allow registration and role management

-- 1. Allow users to register themselves in the admin_profiles table during signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.admin_profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.admin_profiles FOR INSERT 
WITH CHECK (
    auth.uid() = id AND 
    role = 'employee' -- Hardcoded to employee to prevent privilege escalation via API manipulation
);

-- 2. Allow users to update their own profile (name, etc)
DROP POLICY IF EXISTS "Admins can update their own profile" ON public.admin_profiles;
CREATE POLICY "Admins can update their own profile" 
ON public.admin_profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. Allow CEOs and Super Admins to manage (update) all other admin profiles
DROP POLICY IF EXISTS "Super admins and CEOs can update all profiles" ON public.admin_profiles;
CREATE POLICY "Super admins and CEOs can update all profiles" 
ON public.admin_profiles FOR UPDATE 
USING (
    auth.uid() IN (
        SELECT id FROM public.admin_profiles 
        WHERE role = 'super_admin' OR role = 'ceo'
    )
);

-- 4. Allow HR Managers to manage (update) employees
DROP POLICY IF EXISTS "HR Managers can update employee profiles" ON public.admin_profiles;
CREATE POLICY "HR Managers can update employee profiles" 
ON public.admin_profiles FOR UPDATE 
USING (
    auth.uid() IN (
        SELECT id FROM public.admin_profiles 
        WHERE role = 'hr_manager'
    )
);
