-- 1. Add preferences JSONB column to public.profiles if it does not exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;


-- 2. Create secure RPC function for user self-deletion
CREATE OR REPLACE FUNCTION delete_own_user()
RETURNS void AS $$
BEGIN
  -- Delete the user from auth.users (will cascade delete profiles, trades, mt5_accounts, etc.)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Initialize avatars storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS on storage objects if not already enabled (by default it is enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Create storage policies for public access and authenticated uploads
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;
CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);


-- 6. Initialize attachments storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Create storage policies for public access and authenticated uploads on attachments bucket
DROP POLICY IF EXISTS "Public Access Attachments" ON storage.objects;
CREATE POLICY "Public Access Attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Authenticated Upload Attachments" ON storage.objects;
CREATE POLICY "Authenticated Upload Attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owner Update Attachments" ON storage.objects;
CREATE POLICY "Owner Update Attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owner Delete Attachments" ON storage.objects;
CREATE POLICY "Owner Delete Attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);


