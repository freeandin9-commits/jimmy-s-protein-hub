## Goal
WhatsApp checkout flow + admin orders pageil 13 useful features add cheyyuka.

---

## Features & Implementation

### 1. Order ID / Reference number
- `cartStore.ts`-il `generateOrderId()` helper: `JP-` + 4-char base36 random (e.g. `JP-A8F3`).
- ID WhatsApp message top-il + DB `notes` field-il store cheyyum (separate column venda — notes prefix-il "Order #JP-A8F3" ennu cherkkum).
- Admin orders pageil DB `id` (uuid) short form (first 8 chars) display cheyyum.

### 2. Order date & time
- WhatsApp message-il "Placed on: 28 Apr 2026, 10:45 PM" line cherkkum (`toLocaleString('en-IN')`).

### 3. Product link in message
- Each item-num product page URL include cheyyum: `${window.location.origin}/product/${handle}`.
- `CartItem` interface-il `handle?: string` add cheyyum, `pickItemFromProduct`-il populate cheyyum.

### 4. Delivery method selector
- Checkout form-il radio group: **Home Delivery** / **Store Pickup**.
- Pickup select cheytha customer-num address optional aakum.
- WhatsApp message-il "Delivery: Home / Pickup" line.

### 5. Payment method preference
- Radio group: **Cash on Delivery** / **UPI/Online** / **Bank Transfer**.
- WhatsApp message-il "Preferred payment: ___" line.

### 6. Coupon code field
- Optional input "Coupon code" (free text — validation server-il pinneed cheyyam).
- Currently coupon-num discount apply cheyyilla, just admin-num arivanam ennullath kondu message-il forward cheyyum.
- Future-proof: `coupons` table later add cheyyaam, ippol just text capture.

### 7. Order summary preview before submit
- "Send order on WhatsApp" click cheyyumbol munpu oru read-only confirmation card (items + customer + total + delivery + payment) kaanum.
- Two-step → three-step flow: `cart` → `details` → `review` → submit.

### 8. Total item count
- Cart total-num munpil "X items" line both UI-ilum WhatsApp message-ilum.

### 9. Business hours note
- `site_settings`-il pudiya optional column `business_hours` (text, default `"Mon-Sat 10am-8pm"`).
- Cart drawer footer-il small text + WhatsApp message-il bottom line: "We confirm orders within business hours".
- Admin settings page-il edit cheyyaan field add cheyyum.

### 10. "Copy order" fallback button
- Review step-il "Send on WhatsApp" + "Copy order text" rendu buttons.
- Copy click cheytha clipboard-il full order text + toast "Order copied".

### 11. Auto-format Indian phone numbers
- Phone input onChange-il digits maathram extract → 10 digits aanenkil display "+91 98765 43210" pattern.
- Validation: `+91` prefix + 10 digits stricter regex.
- Submit cheyumbol normalized form (`+919876543210`) save cheyyum.

### 12. Image/thumbnail in message (text link only)
- WhatsApp text message-il image embed cheyyaan pattilla, athu kondu product link (#3) thanne ee role serve cheyyum.
- Already #3-il covered.

### 13. Estimated delivery line
- Static line in WhatsApp message: "Estimated delivery: 2-4 business days" (settings-il future-il configurable aakaam, ippol hardcode).

---

## Files to Edit

- **`src/stores/cartStore.ts`**
  - `CartItem` add `handle?: string`
  - `CustomerDetails` add `deliveryMethod`, `paymentMethod`, `couponCode?`
  - `generateOrderId()` helper
  - `formatIndianPhone()` helper
  - `buildWhatsAppOrderUrl()` rewrite to include order ID, date, item count, links, delivery, payment, coupon, business hours, ETA
  - `logOrderToDatabase()` notes-il order ID + delivery + payment + coupon prefix

- **`src/components/layout/CartDrawer.tsx`**
  - 3-step flow (`cart` → `details` → `review`)
  - Delivery/payment radio groups (use existing `RadioGroup` ui)
  - Coupon input
  - Phone auto-format onChange
  - Review screen with full summary
  - "Copy order" button alongside WhatsApp button
  - Show item count + business hours note

- **`src/lib/products.ts`** (verify `handle` field exists; if not, use product `id` for URL)

- **`src/hooks/useSiteSettings.ts`** + **`src/routes/admin.settings.tsx`**
  - Add `business_hours` field

- **Migration**: `ALTER TABLE site_settings ADD COLUMN business_hours text NOT NULL DEFAULT 'Mon-Sat 10am-8pm';`

- **`src/routes/admin.orders.tsx`**
  - Display short order ID (first 8 chars of uuid)
  - Show parsed delivery/payment from notes (or display notes as-is — simpler)

---

## Technical Notes

- All new WhatsApp text built client-side, URL-encoded same as current.
- Coupon validation skipped now → just text passthrough; no DB table created.
- Phone normalization uses regex: `value.replace(/\D/g, '').slice(0, 10)`, format with template literal.
- Order ID generated at submit time, NOT stored as separate column (kept inside `notes` to avoid migration churn). Admin still has uuid `id` for true uniqueness.
- RLS on `orders` already allows anon insert with current schema — no policy changes needed.
- Review step uses same form state, just toggles a `step` value — no extra store needed.

---

## Out of Scope (explicitly NOT doing)
- Real coupon discount logic / coupons table
- Image embedding in WhatsApp (not supported by wa.me text API)
- Server-side email/SMS notifications
- Stock decrement on order placement
