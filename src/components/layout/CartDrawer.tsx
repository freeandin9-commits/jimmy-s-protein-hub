import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import {
  useCartStore,
  buildWhatsAppOrderUrl,
  logOrderToDatabase,
  type CustomerDetails,
} from "@/stores/cartStore";
import { formatPrice } from "@/lib/products";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQuantity, removeItem, clearCart } = useCartStore();
  const { settings } = useSiteSettings();
  const [step, setStep] = useState<"cart" | "details">("cart");
  const [form, setForm] = useState<CustomerDetails>({ name: "", phone: "", address: "", notes: "" });
  const currency = items[0]?.currency || "INR";
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();
    if (name.length < 2) return toast.error("Please enter your name");
    if (!/^[+\d][\d\s-]{6,20}$/.test(phone)) return toast.error("Please enter a valid phone number");
    if (address.length < 5) return toast.error("Please enter your delivery address");

    const customer: CustomerDetails = {
      name: name.slice(0, 200),
      phone: phone.slice(0, 50),
      address: address.slice(0, 500),
      notes: form.notes?.trim().slice(0, 500) || undefined,
    };
    const itemsSnapshot = [...items];
    const url = buildWhatsAppOrderUrl(itemsSnapshot, settings.whatsapp_number, customer);
    logOrderToDatabase(itemsSnapshot, customer);
    window.open(url, "_blank", "noopener,noreferrer");
    clearCart();
    setForm({ name: "", phone: "", address: "", notes: "" });
    setStep("cart");
    setOpen(false);
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) setStep("cart");
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="flex h-full w-full flex-col bg-background sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl tracking-wider">
            {step === "cart" ? "YOUR CART" : "YOUR DETAILS"}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingBag className="h-12 w-12" />
            <p>Your cart is empty</p>
          </div>
        ) : step === "cart" ? (
          <>
            <div className="flex-1 overflow-y-auto py-4 pr-2">
              <ul className="space-y-4">
                {items.map((i) => (
                  <li key={i.productId} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                      {i.image && <img src={i.image} alt={i.productTitle} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold leading-tight">{i.productTitle}</h4>
                          <p className="text-xs text-muted-foreground">{formatPrice(i.price, i.currency)}</p>
                        </div>
                        <button
                          onClick={() => removeItem(i.productId)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-md border border-border">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i.productId, i.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">{i.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i.productId, i.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold">{formatPrice(i.price * i.quantity, i.currency)}</span>
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
                onClick={() => setStep("details")}
                className="h-12 w-full bg-primary text-primary-foreground text-base font-bold uppercase tracking-wider hover:bg-primary/90"
              >
                Continue to checkout
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto py-4 pr-2">
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" /> Back to cart
              </button>

              <div className="space-y-2">
                <Label htmlFor="cust-name">Full name *</Label>
                <Input id="cust-name" required maxLength={200} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cust-phone">Phone number *</Label>
                <Input id="cust-phone" required type="tel" maxLength={50} placeholder="+91 98xxxxxxxx"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cust-address">Delivery address *</Label>
                <Textarea id="cust-address" required maxLength={500} rows={3}
                  placeholder="House / Street, City, Pincode"
                  value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cust-notes">Notes (optional)</Label>
                <Textarea id="cust-notes" maxLength={500} rows={2}
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between text-lg">
                <span className="font-display tracking-wider">TOTAL</span>
                <span className="font-bold">{formatPrice(total, currency)}</span>
              </div>
              <Button
                type="submit"
                className="h-12 w-full bg-[var(--whatsapp)] text-[var(--whatsapp-foreground)] text-base font-bold uppercase tracking-wider hover:bg-[var(--whatsapp)]/90"
              >
                Send order on WhatsApp
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Your details will be shared with us via WhatsApp to confirm your order.
              </p>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
