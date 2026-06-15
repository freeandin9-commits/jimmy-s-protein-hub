
CREATE TABLE public.shop_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  link_url text,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  fit_mode text NOT NULL DEFAULT 'cover',
  focal_x numeric NOT NULL DEFAULT 50,
  focal_y numeric NOT NULL DEFAULT 50,
  zoom numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shop_ads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shop_ads TO authenticated;
GRANT ALL ON public.shop_ads TO service_role;

ALTER TABLE public.shop_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shop ads"
  ON public.shop_ads FOR SELECT
  USING (active = true OR public.is_current_user_admin());

CREATE POLICY "Admins can insert shop ads"
  ON public.shop_ads FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can update shop ads"
  ON public.shop_ads FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can delete shop ads"
  ON public.shop_ads FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

CREATE TRIGGER set_shop_ads_updated_at
  BEFORE UPDATE ON public.shop_ads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX shop_ads_category_active_idx ON public.shop_ads(category_id, active, sort_order);
