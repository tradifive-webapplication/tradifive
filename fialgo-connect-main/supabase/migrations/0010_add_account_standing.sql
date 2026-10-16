-- ============================================================
-- TRADIFIVE DYNAMIC ACCOUNT STANDING MIGRATION
-- Purpose: Adds account_standing and standing_message columns 
--          to the profiles table for admin moderation.
-- ============================================================

-- Create is_admin function helper if it does not exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  has_admin_profile BOOLEAN := false;
  has_hr_employee BOOLEAN := false;
BEGIN
  -- Check if admin_profiles table exists and user is in it
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_profiles') THEN
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = $1)' 
    INTO has_admin_profile USING auth.uid();
  END IF;

  -- Check if hr_employees table exists and user has admin/CEO role
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hr_employees') THEN
    EXECUTE 'SELECT EXISTS (
      SELECT 1 FROM public.hr_employees 
      WHERE auth_id = $1 AND role_title IN (''CEO'', ''Master Admin'', ''System Admin'', ''CTO'')
    )' INTO has_hr_employee USING auth.uid();
  END IF;

  RETURN has_admin_profile OR has_hr_employee;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_standing VARCHAR(20) DEFAULT 'GOOD',
  ADD COLUMN IF NOT EXISTS standing_message TEXT DEFAULT NULL;

-- Add check constraint to restrict the status values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_account_standing'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT chk_account_standing 
      CHECK (account_standing IN ('GOOD', 'WARNING', 'RESTRICTED', 'BANNED'));
  END IF;
END $$;

-- Enable admin updates on profiles table via RLS policy
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());
