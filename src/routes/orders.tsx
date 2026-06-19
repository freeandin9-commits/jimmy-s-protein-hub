import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import {
  formatOrderRef,
  getSavedOrders,
  removeSavedOrder,
  type SavedOrderRef,
} from "@/stores/cartStore";
import { Package, Trash2, ShoppingBag, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Nutrin Sports" },
      { name: "description", content: "View the orders you've placed from this device." },
    ],
  }),
  component: OrdersPage,
});

type Status = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const STATUS_COLORS: Record<Status, string> = {
  pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/40",
  confirmed: "bg-blue-500/20 text-blue-500 border-blue-500/40",
  shipped: "bg-purple-500/20 text-purple-500 border-purple-500/40",
  delivered: "bg-green-500/20 text-green-500 border-green-500/40",
  cancelled: "bg-red-500/20 text-red-500 border-red-500/40",
};

interface FetchedOrder {
  ref: SavedOrderRef;
  data: any | null;
  notFound: boolean;
}

function OrdersPage() {
  const [saved, setSaved] = useState<SavedOrderRef[]>([]);
  const [orders, setOrders] = useState<FetchedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async (refs: SavedOrderRef[]) => {
    setLoading(true);
    const results = await Promise.all(
      refs.map(async (ref) => {
        const phoneDigits = ref.phone.replace(/\D/g, "");
        const { data, error } = await supabase.rpc("track_order" as any, {
          p_order_number: ref.orderNumber,
          p_phone: phoneDigits,
        });
        if (error) return { ref, data: null, notFound: true };
        const row = Array.isArray(data) ? data[0] : data;
        return { ref, data: row ?? null, notFound: !row };
      }),
    );
    setOrders(results);
    setLoading(false);
  };

  useEffect(() => {
    const refs = getSavedOrders();
    setSaved(refs);
    if (refs.length === 0) {
      setLoading(false);
      return;
    }
    loadAll(refs);
  }, []);

  const handleRemove = (orderNumber: number) => {
    removeSavedOrder(orderNumber);
    const next = saved.filter((o) => o.orderNumber !== orderNumber);
    setSaved(next);
    setOrders((prev) => prev.filter((o) => o.ref.orderNumber !== orderNumber));
    toast.success("Order removed from history");
  };

  const handleRefresh = () => {
    const refs = getSavedOrders();
    setSaved(refs);
    if (refs.length > 0) loadAll(refs);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-7 w-7 text-primary" />
              <h1 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">My Orders</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Orders you've placed from this device. Stored locally in your browser.
            </p>
          </div>
          {saved.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="font-bold uppercase tracking-wider"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>

        {loading && (
          <div className="mt-10 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading your orders…
          </div>
        )}

        {!loading && saved.length === 0 && (
          <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-3 font-display text-xl uppercase tracking-wide">No orders yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              When you place an order, it'll show up here on this device.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button asChild className="font-bold uppercase tracking-wider">
                <Link to="/products">Start Shopping</Link>
              </Button>
              <Button asChild variant="outline" className="font-bold uppercase tracking-wider">
                <Link to="/track">Track by Number</Link>
              </Button>
            </div>
          </div>
        )}

        {!loading && saved.length > 0 && (
          <div className="mt-8 space-y-4">
            {orders.map(({ ref, data, notFound }) => {
              if (notFound || !data) {
                return (
                  <div
                    key={ref.orderNumber}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Order
                        </div>
                        <div className="font-mono text-base font-bold">
                          {formatOrderRef(ref.orderNumber, ref.createdAt)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Could not load order details.
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(ref.orderNumber)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              }

              const status = data.status as Status;
              const items = (data.items as any[]) ?? [];
              return (
                <div
                  key={ref.orderNumber}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Order
                      </div>
                      <div className="font-mono text-base font-bold">
                        {formatOrderRef(data.order_number, data.created_at)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Placed {new Date(data.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[status]}`}
                      >
                        {status}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(ref.orderNumber)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Remove from history"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {items.map((i, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 rounded-lg border border-border p-3"
                      >
                        {i.image && (
                          <img
                            src={i.image}
                            alt=""
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-semibold">{i.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Qty: {i.qty} × {formatPrice(i.price, data.currency)}
                          </div>
                        </div>
                        <div className="font-bold">
                          {formatPrice(i.price * i.qty, data.currency)}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-display text-sm uppercase tracking-wider">Total</span>
                    <span className="text-lg font-bold">
                      {formatPrice(Number(data.total), data.currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
