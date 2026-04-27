
-- Fix search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Revoke public execute on SECURITY DEFINER funcs (still callable from RLS as definer)
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- Replace permissive orders INSERT policy with one that validates payload
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;

CREATE POLICY "Anyone can place a valid order"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    items IS NOT NULL
    AND jsonb_typeof(items) = 'array'
    AND jsonb_array_length(items) > 0
    AND jsonb_array_length(items) <= 50
    AND total >= 0
    AND total <= 1000000
    AND status = 'pending'
    AND (customer_name IS NULL OR length(customer_name) <= 200)
    AND (customer_phone IS NULL OR length(customer_phone) <= 50)
    AND (notes IS NULL OR length(notes) <= 1000)
  );
