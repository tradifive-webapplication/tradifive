-- ==============================================================================
-- TRADIFIVE - ABORT SIGNUP & DELETE ACCOUNT RPC
-- ==============================================================================
-- This function allows a user to securely delete their own account from the 
-- database if they click "Cancel" during the Username/Market setup phase.
-- ==============================================================================

CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure the user is actually authenticated
  IF auth.uid() IS NOT NULL THEN
    -- Delete the user from the master auth.users table.
    -- Supabase's ON DELETE CASCADE will automatically wipe out their profile, 
    -- logs, and any other data associated with them.
    DELETE FROM auth.users WHERE id = auth.uid();
  END IF;
END;
$$;
