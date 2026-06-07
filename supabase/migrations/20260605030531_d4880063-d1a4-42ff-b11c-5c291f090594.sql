ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS fit_mode text NOT NULL DEFAULT 'cover',
  ADD COLUMN IF NOT EXISTS focal_x numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS focal_y numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS zoom numeric NOT NULL DEFAULT 1;

ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_fit_mode_check;
ALTER TABLE public.ads ADD CONSTRAINT ads_fit_mode_check CHECK (fit_mode IN ('cover','contain'));