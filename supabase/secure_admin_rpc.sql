-- register_admin_secure
-- Creates admin profile + auto-confirms email so admin can log in without OTP.
-- Includes a retry loop to handle the Supabase signup race condition where
-- auth.users may not be immediately visible when the RPC is called.
CREATE OR REPLACE FUNCTION public.register_admin_secure(
  admin_id   UUID,
  admin_email TEXT,
  admin_name  TEXT,
  invite_code TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt     INT := 0;
  v_max_retries INT := 10;     -- max 10 attempts
  v_delay       FLOAT := 0.3;  -- 300ms between attempts = up to 3s total
  v_user_exists BOOLEAN := false;
BEGIN
  -- Guard: verify invite code
  IF invite_code NOT IN ('TRADIFIVE_ADMIN_2026', 'TRADIFIVE_STAFF_2026') THEN
    RAISE EXCEPTION 'Invalid clearance code';
  END IF;

  -- Wait until auth.users has the new user committed (handles signup race condition)
  LOOP
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = admin_id) INTO v_user_exists;
    EXIT WHEN v_user_exists;

    v_attempt := v_attempt + 1;
    IF v_attempt >= v_max_retries THEN
      RAISE EXCEPTION 'Signup error: user % not found in auth.users after % attempts', admin_id, v_max_retries;
    END IF;

    PERFORM pg_sleep(v_delay);
  END LOOP;

  -- Auto-confirm email so the admin can log in without OTP
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = admin_id;

  -- Create admin profile — owner email auto-gets CEO role
  INSERT INTO public.admin_profiles (id, email, full_name, role)
  VALUES (
    admin_id,
    admin_email,
    admin_name,
    CASE WHEN lower(admin_email) = 'tradifive@gmail.com' THEN 'ceo' ELSE 'employee' END
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Allow anon (no session yet after signUp) and authenticated to call this
GRANT EXECUTE ON FUNCTION public.register_admin_secure(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.register_admin_secure(UUID, TEXT, TEXT, TEXT) TO authenticated;
