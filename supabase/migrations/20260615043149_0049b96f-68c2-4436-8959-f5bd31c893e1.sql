
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_badge_text text DEFAULT '100% Premium Quality',
  ADD COLUMN IF NOT EXISTS hero_cta_text text DEFAULT 'Buy Now',
  ADD COLUMN IF NOT EXISTS hero_cta_link text DEFAULT '/products',
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS hero_video_url text,
  ADD COLUMN IF NOT EXISTS hero_media_type text DEFAULT 'image';
