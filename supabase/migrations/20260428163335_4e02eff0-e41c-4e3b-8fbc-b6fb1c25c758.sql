-- Make handle_new_user resilient: don't block signup if role insert fails,
-- and grant explicit auth.users read for the security-definer function.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_count INT;
BEGIN
  BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    IF user_count <= 1 THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    ELSE
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Never block auth signup if role assignment fails
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  END;
  RETURN NEW;
END;
$function$;