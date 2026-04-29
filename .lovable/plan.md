## Goal

Replace the single "Delivery address" textarea with structured address fields, including dropdowns for **State** and **District** (auto-filtered by selected state, focused on India / Kerala-first).

## New address fields

For **Home Delivery**, the form will collect:

1. House / Building name & number (text)
2. Street / Area / Landmark (text)
3. City / Town (text)
4. District (dropdown — filtered by state)
5. State (dropdown — all 28 Indian states + 8 UTs, Kerala default)
6. Pincode (6-digit numeric, validated)

For **Store Pickup**, no address fields are shown (unchanged).

## UI changes — `src/components/layout/CartDrawer.tsx`

- Remove the single `address` Textarea.
- Add 6 new inputs in a clean two-column layout on wider screens:
  ```text
  [ House / Building          ] [ Pincode (6 digits) ]
  [ Street / Area / Landmark                         ]
  [ City / Town               ] [ State   ▾ ]
  [ District   ▾ (depends on State)                  ]
  ```
- Use existing shadcn `Select` for State + District dropdowns.
- District dropdown is disabled until a state is selected and resets when state changes.
- Pincode: `inputMode="numeric"`, max 6 digits, validate `/^[1-9]\d{5}$/`.
- Review step shows a nicely formatted multi-line address block.

## Data model changes — `src/stores/cartStore.ts`

Replace single `address: string` with a structured object:

```ts
export interface AddressDetails {
  house: string;       // House / Building
  street: string;      // Street / Area / Landmark
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: AddressDetails;   // structured now
  notes?: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}
```

Add helpers:
- `formatAddressLines(a: AddressDetails): string[]` → one line per non-empty field, used in WhatsApp text and Review.
- `formatAddressOneLine(a: AddressDetails): string` → comma-joined version for DB notes / admin table.
- `isValidPincode(p: string): boolean`.

Update `buildOrderText` and `logOrderToDatabase` (notes section) to use the new formatter so WhatsApp message + admin notes show the full structured address.

The `orders` table itself is **not** changed — the structured address is serialized into the existing `notes` column (and into the WhatsApp text). No DB migration needed.

## State & District data — new file `src/lib/india-locations.ts`

A static map of Indian States/UTs to their districts, with Kerala fully populated (all 14 districts) and all other states/UTs listed by name with their districts. Shape:

```ts
export const INDIA_LOCATIONS: Record<string, string[]> = {
  "Kerala": ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
    "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
    "Kozhikode", "Wayanad", "Kannur", "Kasaragod"],
  "Tamil Nadu": [...],
  "Karnataka": [...],
  // ... all 28 states + 8 UTs
};
export const INDIAN_STATES = Object.keys(INDIA_LOCATIONS).sort();
```

Kerala will be the default selected state (since this is a Kerala-based business based on the Manglish usage). Districts list updates reactively when state changes.

## Validation (in `goReview`)

For Home Delivery, each of these must be filled:
- house (≥ 2 chars)
- street (≥ 2 chars)
- city (≥ 2 chars)
- state (selected)
- district (selected)
- pincode (valid 6-digit)

Toast a clear message identifying the first missing/invalid field.

## Persisted form state

The drawer's `initialForm` is updated to:
```ts
address: { house: "", street: "", city: "", district: "", state: "Kerala", pincode: "" }
```

## Files to change

- `src/stores/cartStore.ts` — type, helpers, builder & DB notes update
- `src/components/layout/CartDrawer.tsx` — new fields, Select dropdowns, review block, validation
- `src/lib/india-locations.ts` — **new** static state→districts map

No database migration. No changes to admin pages (they already render `notes`).

## Out of scope

- Adding `address` as separate columns in the `orders` table (can be a follow-up if needed for filtering/reporting).
- Pincode → district auto-lookup via API (kept manual to stay offline-friendly).
