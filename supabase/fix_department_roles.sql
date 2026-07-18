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

    -- OVERRIDE ASSIGNED ROLE BASED ON SELECTED DEPARTMENT
    IF v_dept = 'HR & People' THEN
        v_assigned_role := 'hr_manager';
    ELSIF v_dept = 'Support' THEN
        v_assigned_role := 'support_executive';
    ELSIF v_dept = 'Technology' THEN
        v_assigned_role := 'technical_lead';
    ELSIF v_dept = 'Operations' THEN
        v_assigned_role := 'operations_executive';
    END IF;

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
      )
      ON CONFLICT (key_code) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
