## Goal
Order ID-yude random style (`JP-A8F3`) ozhivakki sequential numbering aakkuka (`JP-0001`, `JP-0002`, ...). Every order DB-il auto-increment cheyyum.

## Database migration

```sql
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number integer;

-- Backfill existing rows in chronological order
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
  ALTER COLUMN order_number SET DEFAULT nextval('public.order_number_seq'),
  ALTER COLUMN order_number SET NOT NULL;

ALTER SEQUENCE public.order_number_seq OWNED BY public.orders.order_number;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key
  ON public.orders(order_number);
```

The existing INSERT RLS policy already allows anonymous inserts and doesn't restrict `order_number` (uses default), so no policy change needed.

## Code changes

### `src/stores/cartStore.ts`
- Remove `generateOrderId()`.
- Add `formatOrderRef(n: number): string` → returns `JP-` + zero-padded 4-digit number.
- Change `logOrderToDatabase(items, customer)` signature: drop `orderId` argument, return `{ orderNumber, orderRef }` from the inserted row using `.select("order_number").single()`.
- Drop `Order #...` from the notes prefix (no longer needed — column has it).

### `src/components/layout/CartDrawer.tsx`
- Remove the `orderId` state and `generateOrderId()` call in `goReview`.
- Review screen: show "Order # will be assigned on submit" instead of a fake ID.
- `finalizeAndSend()` flow:
  1. Call `logOrderToDatabase(items, customer)` first → get `{ orderRef }`.
  2. Use that `orderRef` to build WhatsApp text / copy text.
  3. If insert fails (no orderRef), show toast error and abort — do NOT open WhatsApp without a real order number.

### `src/routes/admin.orders.tsx`
- Stop parsing `Order #...` from `notes`.
- Use `o.order_number` directly: display as `formatOrderRef(o.order_number)` (i.e., `JP-0042`).
- Sort/filter unchanged.

## Files modified
- Migration (new SQL)
- `src/stores/cartStore.ts`
- `src/components/layout/CartDrawer.tsx`
- `src/routes/admin.orders.tsx`

## Out of scope
- Changing the `JP-` prefix or padding width (configurable later if needed).
- Per-year reset (e.g., `JP-2026-0001`) — keeping it simple, monotonic forever.
