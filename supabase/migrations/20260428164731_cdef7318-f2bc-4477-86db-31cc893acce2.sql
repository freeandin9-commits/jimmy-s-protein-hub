CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'::public.app_role
    ),
    false
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

NOTIFY pgrst, 'reload schema';