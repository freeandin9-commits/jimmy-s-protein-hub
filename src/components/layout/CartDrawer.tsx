import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore, buildWhatsAppOrderUrl } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQuantity, removeItem } = useCartStore();
  const currency = items[0]?.price.currencyCode || "USD";
  const total = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);

  const handleCheckout = () => {
    const url = buildWhatsAppOrderUrl(items);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex h-full w-full flex-col bg-background sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl tracking-wider">YOUR CART</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingBag className="h-12 w-12" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 pr-2">
              <ul className="space-y-4">
                {items.map((i) => (
                  <li key={i.variantId} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                      {i.image && <img src={i.image} alt={i.productTitle} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold leading-tight">{i.productTitle}</h4>
                          <p className="text-xs text-muted-foreground">
                            {i.selectedOptions
                              .filter((o) => o.value !== "Default Title")
                              .map((o) => o.value)
                              .join(" • ") || "Standard"}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(i.variantId)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-md border border-border">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i.variantId, i.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">{i.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i.variantId, i.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold">{formatPrice(parseFloat(i.price.amount) * i.quantity, i.price.currencyCode)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between text-lg">
                <span className="font-display tracking-wider">TOTAL</span>
                <span className="font-bold">{formatPrice(total, currency)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="h-12 w-full bg-[var(--whatsapp)] text-[var(--whatsapp-foreground)] text-base font-bold uppercase tracking-wider hover:bg-[var(--whatsapp)]/90"
              >
                Order on WhatsApp
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You'll be redirected to WhatsApp to confirm your order with us directly.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
