INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);