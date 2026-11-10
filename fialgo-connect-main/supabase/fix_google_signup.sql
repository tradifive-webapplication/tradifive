-- ============================================================
-- TRADIFIVE: FIX GOOGLE SIGNUP TRIGGER (Zero-Failure Architecture)
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hcgylvdvlandtiuudefu/sql/new
-- ============================================================

-- 1. Ensure any blank/empty usernames are given unique valid handles
UPDATE public.profiles 
SET username = lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '_' || substr(replace(id::text, '-', ''), 1, 5)
WHERE username IS NULL OR username = '';

-- 2. Bulletproof handle_new_user trigger that NEVER crashes Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT := 'user';
  v_assigned_role TEXT;
  v_invite_code TEXT;
  v_full_name TEXT;
  v_username TEXT;
BEGIN
  -- Extract full name (Google provides 'name' and 'full_name')
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  IF v_full_name IS NULL OR v_full_name = '' THEN
    v_full_name := 'Trader';
  END IF;

  -- Generate unique username from email prefix + user ID hash
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'user_name',
    ''
  );
  IF v_username = '' THEN
    v_username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '_' || substr(replace(NEW.id::text, '-', ''), 1, 5);
  END IF;

  -- If username already exists, loop until a unique username is found
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username AND id <> NEW.id) LOOP
    v_username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  END LOOP;

  -- Check clearance code for admin provisioning
  BEGIN
    v_invite_code := NEW.raw_user_meta_data->>'invite_code';
    IF v_invite_code IS NOT NULL AND v_invite_code <> '' THEN
      SELECT assigned_role INTO v_assigned_role 
      FROM public.signup_clearance_codes 
      WHERE code = trim(v_invite_code) AND is_active = true 
      LIMIT 1;

      IF v_assigned_role IS NOT NULL THEN
        v_role := v_assigned_role;
        INSERT INTO public.admin_profiles (id, email, full_name, role, is_active)
        VALUES (NEW.id, NEW.email, v_full_name, v_assigned_role, true)
        ON CONFLICT (id) DO UPDATE SET
          role = EXCLUDED.role,
          full_name = EXCLUDED.full_name,
          is_active = true;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Insert into public.profiles with safe exception guard
  BEGIN
    INSERT INTO public.profiles (
      id, email, full_name, display_name, username, avatar_url, has_chosen_username, role, subscription_status
    )
    VALUES (
      NEW.id,
      NEW.email,
      v_full_name,
      v_full_name,
      v_username,
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
      false,
      v_role,
      'standard'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
      display_name = CASE WHEN profiles.display_name IS NULL OR profiles.display_name = '' THEN EXCLUDED.display_name ELSE profiles.display_name END,
      avatar_url = CASE WHEN profiles.avatar_url IS NULL OR profiles.avatar_url = '' THEN EXCLUDED.avatar_url ELSE profiles.avatar_url END;
  EXCEPTION WHEN OTHERS THEN
    -- Log warning but NEVER abort the auth.users insertion
    RAISE WARNING 'handle_new_user profile creation warning: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-attach the trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
