## Plan

### 1. Site-wide search bar (above first ads banner)
- New `src/components/SearchBar.tsx` — input + submit, navigates to `/products?q=<term>`.
- Render at top of landing page (`src/routes/index.tsx`), just above `<AdsCarousel />`. Also include in `src/routes/products.tsx` header area for consistency.
- Update `src/routes/products.tsx`:
  - Add `validateSearch` (zod) for `q` param.
  - Filter products client-side by title/description (case-insensitive) matching `q`.
- Searches products by title/description and category name. (Pages like About/Contact are static — skip; if user wants, can be added later.)

### 2. Landing ads → horizontal scroll strip
- Replace `AdsCarousel` usage on landing with a new `src/components/AdsStrip.tsx`:
  - Horizontal scrollable row (`overflow-x-auto snap-x`) of ad cards.
  - Each card: fixed width (e.g. ~280px mobile / 360px desktop), 16:9 aspect, `object-cover` with focal point/zoom respected.
  - Scroll buttons (left/right) on desktop; native swipe on mobile.
  - Keep clickability via `link_url`.
- Keep `AdsCarousel.tsx` intact (admin preview still references shape) but swap landing import.

### 3. Product categories section (admin-managed)
- DB migration:
  - New table `public.categories`: `id`, `name`, `slug` (unique), `image_url` (nullable), `sort_order`, `active`, timestamps.
  - Add `category_id uuid` (nullable) to `public.products` referencing `categories(id) on delete set null`.
  - GRANTs: `SELECT` to anon + authenticated on both; full to service_role. `INSERT/UPDATE/DELETE` to authenticated on `categories` (admin-only via RLS).
  - RLS: public read where `active = true`; admin all using `is_current_user_admin()`.
- Admin UI: new route `src/routes/admin.categories.tsx` — list/create/edit/delete with image upload (reuse `ads` storage bucket or add `categories` bucket; plan: reuse `ads` bucket with `categories/` prefix to avoid migration overhead).
- Add link in admin sidebar (`src/routes/admin.tsx`).
- In admin products form (`src/routes/admin.products.tsx`): add category select dropdown.
- Landing page: new `src/components/CategoriesSection.tsx` — grid of category cards (image + name). Click → `/products?category=<slug>`.
- `/products` route: support `category` search param → filter products by `category_id`.

### Layout order on landing
1. SearchBar
2. AdsStrip (horizontal)
3. Hero
4. Benefits
5. **CategoriesSection (new)**
6. Featured Products
7. CTA strip

### Technical notes
- Search filtering done client-side (small product catalog); no backend changes needed.
- Category image upload uses existing `ads` storage bucket with `categories/` path prefix to avoid creating a new bucket.
- All new tables follow the standard GRANT + RLS pattern with admin checks via existing `is_current_user_admin()` function.
