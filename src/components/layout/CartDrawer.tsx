import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Copy, Send } from "lucide-react";
import {
  useCartStore,
  buildWhatsAppOrderUrl,
  buildOrderText,
  logOrderToDatabase,
  formatIndianPhoneDisplay,
  isValidIndianPhone,
  type CustomerDetails,
  type DeliveryMethod,
  type PaymentMethod,
} from "@/stores/cartStore";
import { formatPrice } from "@/lib/products";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

type Step = "cart" | "details" | "review";

const initialForm: CustomerDetails = {
  name: "",
  phone: "",
  address: "",
  notes: "",
  deliveryMethod: "home",
  paymentMethod: "cod",
  couponCode: "",
};

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQuantity, removeItem, clearCart } = useCartStore();
  const { settings } = useSiteSettings();
  const [step, setStep] = useState<Step>("cart");
  const [form, setForm] = useState<CustomerDetails>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const currency = items[0]?.currency || "INR";
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const reset = () => {
    setForm(initialForm);
    setStep("cart");
    setSubmitting(false);
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) reset();
  };

  const goReview = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (name.length < 2) return toast.error("Please enter your name");
    if (!isValidIndianPhone(form.phone))
      return toast.error("Please enter a valid 10-digit Indian mobile number");
    if (form.deliveryMethod === "home" && form.address.trim().length < 5)
      return toast.error("Please enter your delivery address");
    setStep("review");
  };

  const finalizeAndSend = async (mode: "whatsapp" | "copy") => {
    if (submitting) return;
    setSubmitting(true);
    const customer: CustomerDetails = {
      ...form,
      name: form.name.trim().slice(0, 200),
      address: form.address.trim().slice(0, 500),
      notes: form.notes?.trim().slice(0, 500) || undefined,
      couponCode: form.couponCode?.trim().slice(0, 50) || undefined,
    };
    const itemsSnapshot = [...items];
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const businessHours = settings.business_hours || "Mon-Sat 10am-8pm";

    const { orderRef } = await logOrderToDatabase(itemsSnapshot, customer);
    if (!orderRef) {
      setSubmitting(false);
      toast.error("Could not save the order. Please try again.");
      return;
    }

    if (mode === "copy") {
      const text = buildOrderText(itemsSnapshot, customer, orderRef, businessHours, origin);
      try {
        await navigator.clipboard.writeText(text);
        toast.success(`Order ${orderRef} copied to clipboard`);
      } catch {
        toast.error("Could not copy. Please try the WhatsApp button.");
      }
    } else {
      const url = buildWhatsAppOrderUrl(
        itemsSnapshot,
        settings.whatsapp_number,
        customer,
        orderRef,
        businessHours,
        origin,
      );
      window.open(url, "_blank", "noopener,noreferrer");
    }

    clearCart();
    reset();
    setOpen(false);
  };

  const titles: Record<Step, string> = {
    cart: "YOUR CART",
    details: "YOUR DETAILS",
    review: "REVIEW ORDER",
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="flex h-full w-full flex-col bg-background sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl tracking-wider">{titles[step]}</SheetTitle>
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
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
              </div>
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
              <p className="text-center text-xs text-muted-foreground">
                Orders confirmed within business hours ({settings.business_hours || "Mon-Sat 10am-8pm"}).
              </p>
            </div>
          </>
        ) : step === "details" ? (
          <form onSubmit={goReview} className="flex flex-1 flex-col overflow-hidden">
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
                <div className="flex items-center gap-2 rounded-md border border-input bg-transparent px-3 focus-within:ring-1 focus-within:ring-ring">
                  <span className="text-sm text-muted-foreground">+91</span>
                  <Input
                    id="cust-phone"
                    required
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    className="border-0 px-0 shadow-none focus-visible:ring-0"
                    value={formatIndianPhoneDisplay(form.phone)}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Delivery method *</Label>
                <RadioGroup
                  value={form.deliveryMethod}
                  onValueChange={(v) => setForm({ ...form, deliveryMethod: v as DeliveryMethod })}
                  className="grid grid-cols-2 gap-2"
                >
                  <Label className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-3 hover:bg-secondary/50">
                    <RadioGroupItem value="home" /> Home Delivery
                  </Label>
                  <Label className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-3 hover:bg-secondary/50">
                    <RadioGroupItem value="pickup" /> Store Pickup
                  </Label>
                </RadioGroup>
              </div>

              {form.deliveryMethod === "home" && (
                <div className="space-y-2">
                  <Label htmlFor="cust-address">Delivery address *</Label>
                  <Textarea id="cust-address" required maxLength={500} rows={3}
                    placeholder="House / Street, City, Pincode"
                    value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Preferred payment *</Label>
                <RadioGroup
                  value={form.paymentMethod}
                  onValueChange={(v) => setForm({ ...form, paymentMethod: v as PaymentMethod })}
                  className="grid gap-2"
                >
                  <Label className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2.5 hover:bg-secondary/50">
                    <RadioGroupItem value="cod" /> Cash on Delivery
                  </Label>
                  <Label className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2.5 hover:bg-secondary/50">
                    <RadioGroupItem value="upi" /> UPI / Online
                  </Label>
                  <Label className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2.5 hover:bg-secondary/50">
                    <RadioGroupItem value="bank" /> Bank Transfer
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cust-coupon">Coupon code (optional)</Label>
                <Input id="cust-coupon" maxLength={50}
                  value={form.couponCode}
                  onChange={(e) => setForm({ ...form, couponCode: e.target.value })} />
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
                className="h-12 w-full bg-primary text-primary-foreground text-base font-bold uppercase tracking-wider hover:bg-primary/90"
              >
                Review order
              </Button>
            </div>
          </form>
        ) : (
          // REVIEW STEP
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto py-4 pr-2">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" /> Edit details
              </button>

              <div className="rounded-lg border border-border bg-card p-3 text-sm">
                <div className="font-bold tracking-wider">Order #{orderId}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>

              <section className="space-y-1 rounded-lg border border-border bg-card p-3 text-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</div>
                <div>{form.name}</div>
                <div className="text-muted-foreground">+91 {formatIndianPhoneDisplay(form.phone)}</div>
                {form.deliveryMethod === "home" && (
                  <div className="text-muted-foreground">{form.address}</div>
                )}
                <div className="pt-1 text-xs">
                  Delivery: <span className="font-semibold">{form.deliveryMethod === "home" ? "Home Delivery" : "Store Pickup"}</span>
                </div>
                <div className="text-xs">
                  Payment: <span className="font-semibold">
                    {form.paymentMethod === "cod" ? "Cash on Delivery" : form.paymentMethod === "upi" ? "UPI / Online" : "Bank Transfer"}
                  </span>
                </div>
                {form.couponCode && <div className="text-xs">Coupon: <span className="font-semibold">{form.couponCode}</span></div>}
                {form.notes && <div className="text-xs">Notes: {form.notes}</div>}
              </section>

              <section className="rounded-lg border border-border bg-card p-3 text-sm">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </div>
                <ul className="space-y-2">
                  {items.map((i) => (
                    <li key={i.productId} className="flex justify-between gap-2">
                      <span>{i.quantity}× {i.productTitle}</span>
                      <span className="font-semibold">{formatPrice(i.price * i.quantity, i.currency)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="text-xs text-muted-foreground">
                Estimated delivery: 2-4 business days. We confirm within business hours ({settings.business_hours || "Mon-Sat 10am-8pm"}).
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between text-lg">
                <span className="font-display tracking-wider">TOTAL</span>
                <span className="font-bold">{formatPrice(total, currency)}</span>
              </div>
              <Button
                type="button"
                onClick={() => finalizeAndSend("whatsapp")}
                className="h-12 w-full bg-[var(--whatsapp)] text-[var(--whatsapp-foreground)] text-base font-bold uppercase tracking-wider hover:bg-[var(--whatsapp)]/90"
              >
                <Send className="mr-2 h-4 w-4" /> Send order on WhatsApp
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => finalizeAndSend("copy")}
                className="h-10 w-full font-semibold uppercase tracking-wider"
              >
                <Copy className="mr-2 h-4 w-4" /> Copy order text
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Your order will be saved and shared with us via WhatsApp.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
