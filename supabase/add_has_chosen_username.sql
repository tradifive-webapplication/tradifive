-- Add has_chosen_username column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'has_chosen_username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN has_chosen_username BOOLEAN DEFAULT false;
  END IF;
END $$;
