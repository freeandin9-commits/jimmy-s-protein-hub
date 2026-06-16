import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/products";

export interface CartItem {
  productId: string;
  productTitle: string;
  image?: string;
  price: number;
  currency: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (v) => set({ isOpen: v }),
      addItem: (item, qty = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i,
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: qty }] });
        }
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        });
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "jimmys-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function pickItemFromProduct(p: Product): Omit<CartItem, "quantity"> {
  return {
    productId: p.id,
    productTitle: p.title,
    image: p.image_url || undefined,
    price: Number(p.price),
    currency: p.currency,
  };
}

export type DeliveryMethod = "home" | "pickup";
export type PaymentMethod = "cod" | "upi" | "bank";

export interface AddressDetails {
  house: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: AddressDetails;
  notes?: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export const emptyAddress: AddressDetails = {
  house: "",
  street: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  landmark: "",
};

const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  home: "Home Delivery",
  pickup: "Store Pickup",
};

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  upi: "UPI / Online",
  bank: "Bank Transfer",
};

export function formatAddressLines(a: AddressDetails): string[] {
  const lines: string[] = [];
  const line1 = [a.house, a.street].filter(Boolean).join(", ");
  if (line1) lines.push(line1);
  if (a.landmark) lines.push(`Landmark: ${a.landmark}`);
  const cityDist = [a.city, a.district].filter(Boolean).join(", ");
  if (cityDist) lines.push(cityDist);
  const stateLine = [a.state, a.pincode].filter(Boolean).join(" - ");
  if (stateLine) lines.push(stateLine);
  return lines;
}

export function formatAddressOneLine(a: AddressDetails): string {
  return formatAddressLines(a).join(", ");
}

export function isAddressComplete(a: AddressDetails): boolean {
  return (
    a.house.trim().length > 0 &&
    a.street.trim().length > 0 &&
    a.city.trim().length > 0 &&
    a.district.trim().length > 0 &&
    a.state.trim().length > 0 &&
    /^[1-9]\d{5}$/.test(a.pincode.trim())
  );
}

// Format a numeric order number as "JP-0042"
export function formatOrderRef(n: number): string {
  return `JP-${String(n).padStart(4, "0")}`;
}

// Formats Indian phone for display: "98765 43210"
export function formatIndianPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^91/, "").slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

// Normalizes to "+919876543210" for storage / WhatsApp
export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^91/, "").slice(0, 10);
  return digits.length === 10 ? `+91${digits}` : raw.trim();
}

export function isValidIndianPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "").replace(/^91/, "");
  return /^[6-9]\d{9}$/.test(digits);
}

export function buildOrderText(
  items: CartItem[],
  customer: CustomerDetails,
  orderId: string,
  businessHours: string,
  origin?: string,
): string {
  const currency = items[0]?.currency || "INR";
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const placedOn = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const phoneFmt = normalizeIndianPhone(customer.phone);

  const addressBlock =
    customer.deliveryMethod === "home"
      ? ["*Delivery Address*", ...formatAddressLines(customer.address), ""]
      : [];

  const lines = [
    `🏋️ *New Order — Jimmy's Protein*`,
    `*Order #${orderId}*`,
    `Placed on: ${placedOn}`,
    "",
    "*Customer Details*",
    `Name: ${customer.name}`,
    `Phone: ${phoneFmt}`,
    `Delivery: ${DELIVERY_LABEL[customer.deliveryMethod]}`,
    `Preferred payment: ${PAYMENT_LABEL[customer.paymentMethod]}`,
    ...(customer.couponCode ? [`Coupon: ${customer.couponCode}`] : []),
    ...(customer.notes ? [`Notes: ${customer.notes}`] : []),
    "",
    ...addressBlock,
    `*Order (${itemCount} item${itemCount !== 1 ? "s" : ""})*`,
    ...items.map((i, idx) => {
      const sub = (i.price * i.quantity).toFixed(2);
      const link = origin ? `\n   Link: ${origin}/product/${i.productId}` : "";
      return `${idx + 1}. *${i.productTitle}*\n   Qty: ${i.quantity} × ${i.currency} ${i.price.toFixed(2)} = ${i.currency} ${sub}${link}`;
    }),
    "",
    `*Total: ${currency} ${total.toFixed(2)}*`,
    "",
    `Estimated delivery: 2-4 business days`,
    `We confirm orders within business hours (${businessHours}).`,
    "",
    "Please confirm availability and share payment details.",
  ];

  return lines.join("\n");
}

export function buildWhatsAppOrderUrl(
  items: CartItem[],
  whatsappNumber: string,
  customer: CustomerDetails,
  orderId: string,
  businessHours: string,
  origin?: string,
) {
  const text = encodeURIComponent(
    buildOrderText(items, customer, orderId, businessHours, origin),
  );
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}

export async function logOrderToDatabase(
  items: CartItem[],
  customer: CustomerDetails,
): Promise<{ orderNumber: number | null; orderRef: string }> {
  if (items.length === 0) return { orderNumber: null, orderRef: "" };
  const currency = items[0].currency || "INR";
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const notesParts: string[] = [
    `Delivery: ${DELIVERY_LABEL[customer.deliveryMethod]}`,
    `Payment: ${PAYMENT_LABEL[customer.paymentMethod]}`,
  ];
  if (customer.couponCode) notesParts.push(`Coupon: ${customer.couponCode}`);
  if (customer.deliveryMethod === "home") {
    const addr = formatAddressOneLine(customer.address);
    if (addr) notesParts.push(`Address: ${addr}`);
  }
  if (customer.notes) notesParts.push(`Notes: ${customer.notes}`);

  const payload = {
    items: items.map((i) => ({
      productId: i.productId,
      title: i.productTitle,
      qty: i.quantity,
      price: i.price,
      image: i.image ?? null,
    })),
    subtotal: total,
    total,
    currency,
    status: "pending" as const,
    customer_name: customer.name,
    customer_phone: normalizeIndianPhone(customer.phone),
    notes: notesParts.join("\n").slice(0, 1000),
  };
  try {
    const { data, error } = await supabase.rpc("place_order", {
      p_items: payload.items as any,
      p_subtotal: payload.subtotal,
      p_total: payload.total,
      p_currency: payload.currency,
      p_customer_name: payload.customer_name,
      p_customer_phone: payload.customer_phone,
      p_notes: payload.notes,
    });
    if (error) throw error;
    const num = typeof data === "number" ? data : null;
    return { orderNumber: num, orderRef: num != null ? formatOrderRef(num) : "" };
  } catch (err) {
    console.error("Order log failed:", err);
    return { orderNumber: null, orderRef: "" };
  }
}
