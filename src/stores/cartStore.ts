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

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export function buildWhatsAppOrderUrl(
  items: CartItem[],
  whatsappNumber: string,
  customer: CustomerDetails,
) {
  const currency = items[0]?.currency || "INR";
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const lines = [
    "🏋️ *New Order — Jimmy's Protein*",
    "",
    "*Customer Details*",
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.address}`,
    ...(customer.notes ? [`Notes: ${customer.notes}`] : []),
    "",
    "*Order*",
    ...items.map((i, idx) => {
      const sub = (i.price * i.quantity).toFixed(2);
      return `${idx + 1}. *${i.productTitle}*\n   Qty: ${i.quantity} × ${i.currency} ${i.price.toFixed(2)} = ${i.currency} ${sub}`;
    }),
    "",
    `*Total: ${currency} ${total.toFixed(2)}*`,
    "",
    "Please confirm availability and share payment details.",
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}

export async function logOrderToDatabase(items: CartItem[], customer: CustomerDetails) {
  if (items.length === 0) return;
  const currency = items[0].currency || "INR";
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
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
    customer_phone: customer.phone,
    notes: [customer.address && `Address: ${customer.address}`, customer.notes]
      .filter(Boolean)
      .join("\n") || null,
  };
  try {
    await supabase.from("orders").insert(payload);
  } catch (err) {
    console.error("Order log failed:", err);
  }
}
