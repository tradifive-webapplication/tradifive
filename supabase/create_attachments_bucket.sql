-- 1. Initialize attachments storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create storage policies for public access and authenticated uploads on attachments bucket
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
