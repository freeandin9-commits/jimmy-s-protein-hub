DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins can view all categories" ON public.categories FOR SELECT TO authenticated USING (is_current_user_admin());
GRANT SELECT ON public.categories TO anon, authenticated;