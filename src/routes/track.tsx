import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/products";
import { formatOrderRef } from "@/stores/cartStore";
import { Package, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order — Nutrin Sports" },
      { name: "description", content: "Track the status of your Nutrin Sports order using your order number and phone." },
    ],
  }),
  component: TrackPage,
});

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"] as const;
type Status = typeof STATUS_STEPS[number] | "cancelled";

const STATUS_COLORS: Record<Status, string> = {
  pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/40",
  confirmed: "bg-blue-500/20 text-blue-500 border-blue-500/40",
  shipped: "bg-purple-500/20 text-purple-500 border-purple-500/40",
  delivered: "bg-green-500/20 text-green-500 border-green-500/40",
  cancelled: "bg-red-500/20 text-red-500 border-red-500/40",
};

function TrackPage() {
  const [orderRef, setOrderRef] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);

  const parseOrderInput = (input: string): number | null => {
    const trimmed = input.trim();
    const digits = trimmed.replace(/\D/g, "");
    if (!digits) return null;
    if (/^NS/i.test(trimmed) && digits.length > 8) {
      // Full format NSDDMMYYYY00000 — last 5 digits are the order number
      return parseInt(digits.slice(-5), 10);
    }
    return parseInt(digits, 10);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderNum = parseOrderInput(orderRef);
    if (orderNum == null) { toast.error("Enter your order number"); return; }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 6) { toast.error("Enter the phone number you ordered with"); return; }

    setLoading(true);
    setNotFound(false);
    setResult(null);
    const { data, error } = await supabase.rpc("track_order" as any, {
      p_order_number: orderNum,
      p_phone: phoneDigits,
    });
    setLoading(false);
    if (error) {
      console.error(error);
      toast.error("Could not look up your order. Try again.");
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) { setNotFound(true); return; }
    setResult(row);
  };

  const status = result?.status as Status | undefined;
  const stepIdx = status && status !== "cancelled" ? STATUS_STEPS.indexOf(status) : -1;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-display text-4xl uppercase tracking-wide">Track Your Order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your order number and the phone number used at checkout.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <Label htmlFor="ref">Order number</Label>
            <Input
              id="ref"
              placeholder="e.g. NS1706202600000 or 42"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Searching…" : "Track Order"}
          </Button>
        </form>

        {notFound && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm">No order matches that number and phone. Double-check both and try again.</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order</div>
                <div className="font-mono text-lg font-bold">{formatOrderRef(result.order_number, result.created_at)}</div>
                <div className="text-xs text-muted-foreground">
                  Placed {new Date(result.created_at).toLocaleString()}
                </div>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[status as Status]}`}>
                {result.status}
              </span>
            </div>

            {status !== "cancelled" && (
              <div>
                <div className="flex items-center justify-between gap-2">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex flex-1 flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          i <= stepIdx ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {s}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 h-1 w-full rounded bg-secondary">
                  <div
                    className="h-1 rounded bg-primary transition-all"
                    style={{ width: `${((stepIdx + 1) / STATUS_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Items</div>
              <ul className="space-y-2">
                {((result.items as any[]) ?? []).map((i, idx) => (
                  <li key={idx} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    {i.image && <img src={i.image} alt="" className="h-12 w-12 rounded object-cover" />}
                    <div className="flex-1">
                      <div className="font-semibold">{i.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Qty: {i.qty} × {formatPrice(i.price, result.currency)}
                      </div>
                    </div>
                    <div className="font-bold">{formatPrice(i.price * i.qty, result.currency)}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between border-t border-border pt-3 text-lg">
              <span className="font-display tracking-wider">TOTAL</span>
              <span className="font-bold">{formatPrice(Number(result.total), result.currency)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
