
CREATE OR REPLACE FUNCTION public.track_order(p_order_number integer, p_phone text)
RETURNS TABLE (
  order_number integer,
  status order_status,
  created_at timestamptz,
  updated_at timestamptz,
  total numeric,
  currency text,
  customer_name text,
  items jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.order_number, o.status, o.created_at, o.updated_at,
         o.total, o.currency, o.customer_name, o.items
  FROM public.orders o
  WHERE o.order_number = p_order_number
    AND regexp_replace(coalesce(o.customer_phone,''), '\D', '', 'g')
        LIKE '%' || regexp_replace(coalesce(p_phone,''), '\D', '', 'g')
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.track_order(integer, text) TO anon, authenticated;
