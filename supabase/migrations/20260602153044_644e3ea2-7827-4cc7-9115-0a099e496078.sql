
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS compare_at_price numeric CHECK (compare_at_price IS NULL OR compare_at_price >= 0);
