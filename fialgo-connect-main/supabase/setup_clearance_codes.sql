-- 1. Create the new dynamic table for signup clearance codes
CREATE TABLE IF NOT EXISTS public.signup_clearance_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  assigned_role TEXT NOT NULL,
  created_by_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.signup_clearance_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (needed during signup)
DROP POLICY IF EXISTS "Allow public read of active clearance codes" ON public.signup_clearance_codes;
CREATE POLICY "Allow public read of active clearance codes" 
ON public.signup_clearance_codes FOR SELECT 
USING (is_active = true);

-- Allow CEO and HR to manage them
DROP POLICY IF EXISTS "Allow CEO and HR to manage clearance codes" ON public.signup_clearance_codes;
CREATE POLICY "Allow CEO and HR to manage clearance codes" 
ON public.signup_clearance_codes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid() 
    AND role IN ('ceo', 'hr_manager')
  )
);

-- 2. Insert the initial default codes so you don't get locked out
INSERT INTO public.signup_clearance_codes (code, assigned_role, created_by_email)
VALUES 
  ('TRADIFIVE_ADMIN_2026', 'ceo', 'system'),
  ('TRADIFIVE_DEPT_2026', 'operations_executive', 'system'),
  ('TRADIFIVE_STAFF_2026', 'employee', 'system')
ON CONFLICT (code) DO NOTHING;

-- 3. Replace the profile creation trigger to use this new table
CREATE OR REPLACE FUNCTION public.create_admin_profile_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_assigned_role TEXT;
  v_dept TEXT;
  v_secret TEXT;
  v_full_name TEXT;
BEGIN
  -- Look up the invite_code from the new dynamic table
  SELECT assigned_role INTO v_assigned_role
  FROM public.signup_clearance_codes
  WHERE code = NEW.raw_user_meta_data->>'invite_code'
  AND is_active = true;

  -- If a valid active code is found, create the profile
  IF v_assigned_role IS NOT NULL THEN
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    v_dept := NEW.raw_user_meta_data->>'department';
    v_secret := NEW.raw_user_meta_data->>'secret_key';

    INSERT INTO public.admin_profiles (id, email, full_name, role)
    VALUES (
      NEW.id, 
      NEW.email,
      v_full_name,
      v_assigned_role
    )
    ON CONFLICT (id) DO NOTHING;

    -- If they provided a department and secret key, save it so the CEO can manage it
    IF v_dept IS NOT NULL AND v_secret IS NOT NULL THEN
      INSERT INTO public.department_access_keys (key_code, department, label)
      VALUES (
        v_secret,
        v_dept,
        v_assigned_role || ' - ' || v_full_name
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
