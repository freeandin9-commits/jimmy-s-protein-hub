CREATE OR REPLACE FUNCTION public.place_order(
  p_items jsonb,
  p_subtotal numeric,
  p_total numeric,
  p_currency text,
  p_customer_name text,
  p_customer_phone text,
  p_notes text
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number integer;
BEGIN
  -- Validate inputs (mirror RLS checks)
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Invalid items';
  END IF;
  IF p_total < 0 OR p_total > 1000000 THEN
    RAISE EXCEPTION 'Invalid total';
  END IF;
  IF p_customer_name IS NOT NULL AND length(p_customer_name) > 200 THEN
    RAISE EXCEPTION 'Customer name too long';
  END IF;
  IF p_customer_phone IS NOT NULL AND length(p_customer_phone) > 50 THEN
    RAISE EXCEPTION 'Customer phone too long';
  END IF;
  IF p_notes IS NOT NULL AND length(p_notes) > 1000 THEN
    RAISE EXCEPTION 'Notes too long';
  END IF;

  INSERT INTO public.orders (items, subtotal, total, currency, status, customer_name, customer_phone, notes)
  VALUES (p_items, COALESCE(p_subtotal, p_total), p_total, COALESCE(p_currency, 'INR'), 'pending', p_customer_name, p_customer_phone, p_notes)
  RETURNING order_number INTO v_order_number;

  RETURN v_order_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order(jsonb, numeric, numeric, text, text, text, text) TO anon, authenticated;