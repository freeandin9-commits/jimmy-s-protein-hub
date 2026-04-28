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

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  notes?: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  home: "Home Delivery",
  pickup: "Store Pickup",
};

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  upi: "UPI / Online",
  bank: "Bank Transfer",
};

// Generates short order ref like "JP-A8F3"
export function generateOrderId(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JP-${rand}`;
}

// Formats Indian phone for display: "+91 98765 43210"
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

  const lines = [
    `🏋️ *New Order — Jimmy's Protein*`,
    `*Order #${orderId}*`,
    `Placed on: ${placedOn}`,
    "",
    "*Customer Details*",
    `Name: ${customer.name}`,
    `Phone: ${phoneFmt}`,
    ...(customer.deliveryMethod === "home" ? [`Address: ${customer.address}`] : []),
    `Delivery: ${DELIVERY_LABEL[customer.deliveryMethod]}`,
    `Preferred payment: ${PAYMENT_LABEL[customer.paymentMethod]}`,
    ...(customer.couponCode ? [`Coupon: ${customer.couponCode}`] : []),
    ...(customer.notes ? [`Notes: ${customer.notes}`] : []),
    "",
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
  orderId: string,
) {
  if (items.length === 0) return;
  const currency = items[0].currency || "INR";
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const notesParts: string[] = [
    `Order #${orderId}`,
    `Delivery: ${DELIVERY_LABEL[customer.deliveryMethod]}`,
    `Payment: ${PAYMENT_LABEL[customer.paymentMethod]}`,
  ];
  if (customer.couponCode) notesParts.push(`Coupon: ${customer.couponCode}`);
  if (customer.deliveryMethod === "home" && customer.address) {
    notesParts.push(`Address: ${customer.address}`);
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
    await supabase.from("orders").insert(payload);
  } catch (err) {
    console.error("Order log failed:", err);
  }
}
