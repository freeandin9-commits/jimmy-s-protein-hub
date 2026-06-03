import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Copy, Send, CheckCircle } from "lucide-react";
import {
  useCartStore,
  buildWhatsAppOrderUrl,
  buildOrderText,
  logOrderToDatabase,
  formatIndianPhoneDisplay,
  isValidIndianPhone,
  isAddressComplete,
  formatAddressLines,
  emptyAddress,
  type CustomerDetails,
  type AddressDetails,
  type DeliveryMethod,
  type PaymentMethod,
} from "@/stores/cartStore";
import { INDIA_STATES, getDistricts, PINCODE_REGEX } from "@/lib/india-locations";
import { formatPrice } from "@/lib/products";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

type Step = "cart" | "details" | "review";

const initialForm: CustomerDetails = {
  name: "",
  phone: "",
  address: { ...emptyAddress },
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
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState("");

  const currency = items[0]?.currency || "INR";
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const districts = useMemo(() => getDistricts(form.address.state), [form.address.state]);

  const updateAddress = (patch: Partial<AddressDetails>) =>
    setForm((f) => ({ ...f, address: { ...f.address, ...patch } }));

  const reset = () => {
    setForm({ ...initialForm, address: { ...emptyAddress } });
    setStep("cart");
    setSubmitting(false);
    setConfirmed(false);
    setConfirmedRef("");
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
    if (form.deliveryMethod === "home") {
      const a = form.address;
      if (!a.house.trim()) return toast.error("Please enter house / flat / building");
      if (!a.street.trim()) return toast.error("Please enter street / area");
      if (!a.city.trim()) return toast.error("Please enter city / town / village");
      if (!a.state) return toast.error("Please select your state");
      if (!a.district) return toast.error("Please select your district");
      if (!PINCODE_REGEX.test(a.pincode.trim()))
        return toast.error("Please enter a valid 6-digit pincode");
      if (!isAddressComplete(a)) return toast.error("Please complete your address");
    }
    setStep("review");
  };

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    const customer: CustomerDetails = {
      ...form,
      name: form.name.trim().slice(0, 200),
      address: {
        house: form.address.house.trim().slice(0, 120),
        street: form.address.street.trim().slice(0, 200),
        city: form.address.city.trim().slice(0, 100),
        district: form.address.district.trim().slice(0, 100),
        state: form.address.state.trim().slice(0, 100),
        pincode: form.address.pincode.trim().slice(0, 6),
        landmark: form.address.landmark?.trim().slice(0, 120) || "",
      },
      notes: form.notes?.trim().slice(0, 500) || undefined,
      couponCode: form.couponCode?.trim().slice(0, 50) || undefined,
    };
    const { orderRef } = await logOrderToDatabase([...items], customer);
    setSubmitting(false);
    if (!orderRef) {
      toast.error("Could not save the order. Please try again.");
      return;
    }
    setConfirmedRef(orderRef);
    setConfirmed(true);
    toast.success(`Order ${orderRef} confirmed!`);
  };

  const finalizeAndSend = async (mode: "whatsapp" | "copy") => {
    if (submitting) return;
    setSubmitting(true);
    const customer: CustomerDetails = {
      ...form,
      name: form.name.trim().slice(0, 200),
      address: {
        house: form.address.house.trim().slice(0, 120),
        street: form.address.street.trim().slice(0, 200),
        city: form.address.city.trim().slice(0, 100),
        district: form.address.district.trim().slice(0, 100),
        state: form.address.state.trim().slice(0, 100),
        pincode: form.address.pincode.trim().slice(0, 6),
        landmark: form.address.landmark?.trim().slice(0, 120) || "",
      },
      notes: form.notes?.trim().slice(0, 500) || undefined,
      couponCode: form.couponCode?.trim().slice(0, 50) || undefined,
    };
    const itemsSnapshot = [...items];
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const businessHours = settings.business_hours || "Mon-Sat 10am-8pm";

    let orderRef = confirmedRef;
    if (!orderRef) {
      const result = await logOrderToDatabase(itemsSnapshot, customer);
      orderRef = result.orderRef;
    }
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
                <div className="space-y-3 rounded-lg border border-border p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Delivery Address
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addr-house">House / Flat / Building *</Label>
                    <Input
                      id="addr-house"
                      required
                      maxLength={120}
                      placeholder="e.g. Flat 3B, Sunrise Apartments"
                      value={form.address.house}
                      onChange={(e) => updateAddress({ house: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addr-street">Street / Area / Locality *</Label>
                    <Input
                      id="addr-street"
                      required
                      maxLength={200}
                      placeholder="e.g. MG Road, Panampilly Nagar"
                      value={form.address.street}
                      onChange={(e) => updateAddress({ street: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addr-landmark">Landmark (optional)</Label>
                    <Input
                      id="addr-landmark"
                      maxLength={120}
                      placeholder="Near…"
                      value={form.address.landmark || ""}
                      onChange={(e) => updateAddress({ landmark: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addr-city">City / Town / Village *</Label>
                    <Input
                      id="addr-city"
                      required
                      maxLength={100}
                      value={form.address.city}
                      onChange={(e) => updateAddress({ city: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Select
                        value={form.address.state}
                        onValueChange={(v) => updateAddress({ state: v, district: "" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIA_STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>District *</Label>
                      <Select
                        value={form.address.district}
                        onValueChange={(v) => updateAddress({ district: v })}
                        disabled={!form.address.state}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={form.address.state ? "Select district" : "Select state first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addr-pincode">Pincode *</Label>
                    <Input
                      id="addr-pincode"
                      required
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit pincode"
                      value={form.address.pincode}
                      onChange={(e) =>
                        updateAddress({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                      }
                    />
                  </div>
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

              {confirmed && (
                <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                  <h3 className="mt-2 font-display text-xl tracking-wider text-green-500">ORDER CONFIRMED</h3>
                  <p className="mt-1 text-sm font-semibold">{confirmedRef}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your order has been saved. Share it with us via WhatsApp or copy the details below.
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-border bg-card p-3 text-sm">
                <div className="font-bold tracking-wider text-muted-foreground">
                  {confirmed ? "Order confirmed" : "Order # will be assigned on submit"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>

              <section className="space-y-1 rounded-lg border border-border bg-card p-3 text-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</div>
                <div>{form.name}</div>
                <div className="text-muted-foreground">+91 {formatIndianPhoneDisplay(form.phone)}</div>
                {form.deliveryMethod === "home" && (
                  <div className="pt-1 text-muted-foreground">
                    {formatAddressLines(form.address).map((ln, idx) => (
                      <div key={idx}>{ln}</div>
                    ))}
                  </div>
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
                disabled={submitting}
                onClick={() => finalizeAndSend("whatsapp")}
                className="h-12 w-full bg-[var(--whatsapp)] text-[var(--whatsapp-foreground)] text-base font-bold uppercase tracking-wider hover:bg-[var(--whatsapp)]/90"
              >
                <Send className="mr-2 h-4 w-4" /> {submitting ? "Saving…" : "Send order on WhatsApp"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
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
