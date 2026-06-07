
CREATE POLICY "Admins upload ads images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ads' AND public.is_current_user_admin());

CREATE POLICY "Admins update ads images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'ads' AND public.is_current_user_admin());

CREATE POLICY "Admins delete ads images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ads' AND public.is_current_user_admin());

CREATE POLICY "Anyone can read ads images" ON storage.objects
  FOR SELECT USING (bucket_id = 'ads');
