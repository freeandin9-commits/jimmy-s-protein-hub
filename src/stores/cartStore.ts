import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShopifyProductNode } from "@/lib/shopify";

export interface CartItem {
  productId: string;
  productTitle: string;
  productHandle: string;
  image?: string;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
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
        const existing = items.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: i.quantity + qty } : i,
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: qty }] });
        }
      },
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        });
      },
      removeItem: (variantId) =>
        set({ items: get().items.filter((i) => i.variantId !== variantId) }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "jimmys-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// Placeholder WhatsApp number — replace with the real one
export const WHATSAPP_NUMBER = "910000000000"; // country code + number, no + or spaces

export function buildWhatsAppOrderUrl(items: CartItem[]) {
  const currency = items[0]?.price.currencyCode || "USD";
  const total = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);

  const lines = [
    "🏋️ *New Order — Jimmy's Protein*",
    "",
    ...items.map((i, idx) => {
      const opts = i.selectedOptions
        .filter((o) => o.value && o.value !== "Default Title")
        .map((o) => `${o.name}: ${o.value}`)
        .join(", ");
      const sub = (parseFloat(i.price.amount) * i.quantity).toFixed(2);
      return `${idx + 1}. *${i.productTitle}*${opts ? ` (${opts})` : ""}\n   Qty: ${i.quantity} × ${i.price.currencyCode} ${parseFloat(i.price.amount).toFixed(2)} = ${i.price.currencyCode} ${sub}`;
    }),
    "",
    `*Total: ${currency} ${total.toFixed(2)}*`,
    "",
    "Please confirm availability and share payment details.",
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function pickDefaultItemFromProduct(product: ShopifyProductNode): Omit<CartItem, "quantity"> | null {
  const variant = product.variants.edges.find((v) => v.node.availableForSale)?.node ?? product.variants.edges[0]?.node;
  if (!variant) return null;
  return {
    productId: product.id,
    productTitle: product.title,
    productHandle: product.handle,
    image: product.images.edges[0]?.node.url,
    variantId: variant.id,
    variantTitle: variant.title,
    price: variant.price,
    selectedOptions: variant.selectedOptions,
  };
}
