GRANT SELECT ON public.ads TO anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO anon, authenticated;