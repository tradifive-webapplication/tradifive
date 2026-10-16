-- 1. Create the new dynamic table for signup clearance codes
CREATE TABLE IF NOT EXISTS public.signup_clearance_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  assigned_role TEXT NOT NULL,
  created_by_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Insert the initial default codes so you don't get locked out
INSERT INTO public.signup_clearance_codes (code, assigned_role, created_by_email)
VALUES 
  ('TRADIFIVE_ADMIN_2026', 'ceo', 'system'),
  ('TRADIFIVE_DEPT_2026', 'operations_executive', 'system'),
  ('TRADIFIVE_STAFF_2026', 'employee', 'system')
ON CONFLICT (code) DO NOTHING;

-- 3. TRIGGER 1: BEFORE INSERT - Auto confirms the email so they don't need OTP
CREATE OR REPLACE FUNCTION public.auto_confirm_admin_email()
RETURNS TRIGGER AS $$
DECLARE
  v_is_valid BOOLEAN;
BEGIN
  -- Check if they have a valid invite code
  SELECT EXISTS(
    SELECT 1 FROM public.signup_clearance_codes 
    WHERE code = NEW.raw_user_meta_data->>'invite_code' AND is_active = true
  ) INTO v_is_valid;

  IF v_is_valid THEN
    NEW.email_confirmed_at = now();
    NEW.confirmed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_before ON auth.users;
CREATE TRIGGER on_auth_user_created_before
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_admin_email();


-- 4. TRIGGER 2: AFTER INSERT - Creates the profile and saves the department key
CREATE OR REPLACE FUNCTION public.create_admin_profile_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_assigned_role TEXT;
  v_dept TEXT;
  v_secret TEXT;
  v_full_name TEXT;
BEGIN
  -- Look up the invite_code
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

    -- If they provided a department and secret key, save it
    IF v_dept IS NOT NULL AND v_secret IS NOT NULL THEN
      INSERT INTO public.department_access_keys (key_code, department, label)
      VALUES (
        v_secret,
        v_dept,
        v_assigned_role || ' - ' || v_full_name
      )
      ON CONFLICT (key_code) DO UPDATE 
      SET label = EXCLUDED.label, 
          department = EXCLUDED.department;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_admin_profile_on_signup();
