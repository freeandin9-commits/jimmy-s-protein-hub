CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number integer;

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.orders
  WHERE order_number IS NULL
)
UPDATE public.orders o
SET order_number = ordered.rn::int
FROM ordered
WHERE o.id = ordered.id;

SELECT setval(
  'public.order_number_seq',
  GREATEST(COALESCE((SELECT MAX(order_number) FROM public.orders), 0), 1)
);

ALTER TABLE public.orders
  ALTER COLUMN order_number SET DEFAULT nextval('public.order_number_seq');

ALTER TABLE public.orders
  ALTER COLUMN order_number SET NOT NULL;

ALTER SEQUENCE public.order_number_seq OWNED BY public.orders.order_number;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key
  ON public.orders(order_number);