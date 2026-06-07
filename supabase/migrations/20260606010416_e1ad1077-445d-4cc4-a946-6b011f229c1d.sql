REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO service_role;

DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ads;
CREATE POLICY "Public can view active ads"
ON public.ads FOR SELECT
TO anon, authenticated
USING (active = true);

CREATE POLICY "Admins can view all ads"
ON public.ads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));