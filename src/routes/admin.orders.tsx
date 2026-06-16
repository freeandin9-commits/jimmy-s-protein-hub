import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/products";
import { formatOrderRef } from "@/stores/cartStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Calendar, User, ShoppingBag, Hash, PhoneCall, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const statusColors: Record<Status, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  confirmed: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  shipped: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
  delivered: "bg-green-500/10 text-green-400 border border-green-500/30",
  cancelled: "bg-red-500/10 text-red-400 border border-red-500/30",
};

function OrdersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", filter],
    queryFn: async () => {
      let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success("Status updated successfully");
    qc.invalidateQueries({ queryKey: ["admin"] });
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  return (
    <div className="space-y-8 p-1 bg-zinc-950 text-zinc-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-wider text-zinc-100">
            Order <span className="text-yellow-400">Management</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Monitor and process all inbound WhatsApp checkout orders seamlessly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden sm:inline">
            Filter Status:
          </span>
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-yellow-400/50">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
              <SelectItem value="all" className="focus:bg-yellow-400 focus:text-zinc-950">
                All Orders
              </SelectItem>
              {STATUSES.map((s) => (
                <SelectItem
                  key={s}
                  value={s}
                  className="focus:bg-yellow-400 focus:text-zinc-950 uppercase text-xs font-semibold"
                >
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">ID / Ref</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Date & Time</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Customer Details</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Items Summary</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Total Amount</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs">Current Status</th>
                <th className="p-4 text-right font-bold uppercase tracking-wider text-xs">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                      <span className="text-xs uppercase tracking-widest text-zinc-400">Fetching Orders...</span>
                    </div>
                  </td>
                </tr>
              ) : (data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-500 font-medium">
                    No matching orders discovered in this view.
                  </td>
                </tr>
              ) : (
                (data ?? []).map((o: any) => {
                  const items = (o.items as any[]) ?? [];
                  const summary = items.map((i) => `${i.qty} × ${i.title}`).join(", ");
                  const orderRef =
                    typeof o.order_number === "number"
                      ? formatOrderRef(o.order_number)
                      : `#${String(o.id).slice(0, 8)}`;
                  return (
                    <tr
                      key={o.id}
                      className="transition-colors hover:bg-zinc-800/40 cursor-pointer group"
                      onClick={() => setSelected(o)}
                    >
                      <td className="p-4 font-mono text-xs font-bold text-yellow-400 group-hover:text-yellow-300">
                        {orderRef}
                      </td>
                      <td className="p-4 text-xs text-zinc-400">
                        {new Date(o.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
                        {new Date(o.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-4 text-xs">
                        <div className="font-semibold text-zinc-200">{o.customer_name || "—"}</div>
                        <div className="text-zinc-500 mt-0.5">{o.customer_phone || ""}</div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-zinc-300 text-xs font-medium">{summary}</td>
                      <td className="p-4 font-bold text-zinc-100 text-sm">
                        {formatPrice(Number(o.total), o.currency)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-sm ${statusColors[o.status as Status]}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-xs font-bold text-yellow-400 group-hover:underline group-hover:text-yellow-300">
                        Manage →
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Side Panel */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl bg-zinc-900 border-zinc-800 text-zinc-100 overflow-y-auto shadow-2xl">
          {selected && (
            <>
              <SheetHeader className="border-b border-zinc-800 pb-4 mb-6">
                <div className="flex items-center gap-2 text-yellow-400 mb-1">
                  <Hash className="h-5 w-5" />
                  <span className="font-mono text-lg font-bold tracking-wider">
                    {typeof selected.order_number === "number"
                      ? formatOrderRef(selected.order_number)
                      : String(selected.id).slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <SheetTitle className="font-display text-2xl font-black uppercase tracking-wider text-zinc-100">
                  Order Details
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Order Time Stamp */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                  <Calendar className="h-4 w-4 text-yellow-400" />
                  <span>Placed on {new Date(selected.created_at).toLocaleString()}</span>
                </div>

                {/* Customer Section */}
                {(selected.customer_name || selected.customer_phone) && (
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 shadow-inner">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      <User className="h-3.5 w-3.5 text-yellow-400" />
                      <span>Customer Infomation</span>
                    </div>
                    <div className="space-y-2">
                      {selected.customer_name && (
                        <div className="font-bold text-base text-zinc-200">{selected.customer_name}</div>
                      )}
                      {selected.customer_phone && (
                        <a
                          href={`tel:${selected.customer_phone}`}
                          className="inline-flex items-center gap-2 text-xs font-medium text-yellow-400 hover:text-yellow-300 hover:underline bg-yellow-400/5 px-2.5 py-1.5 rounded-md border border-yellow-400/20"
                        >
                          <PhoneCall className="h-3 w-3" />
                          {selected.customer_phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {selected.notes && (
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      <FileText className="h-3.5 w-3.5 text-yellow-400" />
                      <span>Order Instructions / Notes</span>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-300 leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/40">
                      {selected.notes}
                    </pre>
                  </div>
                )}

                {/* Items Section */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                    <ShoppingBag className="h-3.5 w-3.5 text-yellow-400" />
                    <span>Cart Items</span>
                  </div>
                  <ul className="space-y-2.5">
                    {((selected.items as any[]) ?? []).map((i, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-4 rounded-xl bg-zinc-950 border border-zinc-800/80 p-3 transition-hover hover:border-zinc-700"
                      >
                        {i.image ? (
                          <img
                            src={i.image}
                            alt=""
                            className="h-14 w-14 rounded-lg object-cover bg-zinc-900 border border-zinc-800"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
                            No Img
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-zinc-200 truncate">{i.title}</div>
                          {i.options?.length > 0 && (
                            <div className="text-[11px] text-zinc-400 mt-0.5 flex flex-wrap gap-1">
                              {i.options.map((o: any, oIdx: number) => (
                                <span key={oIdx} className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                  {o.name}: <strong className="text-zinc-300">{o.value}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-zinc-500 mt-1 font-medium">
                            Qty: <span className="text-zinc-300">{i.qty}</span> ×{" "}
                            {formatPrice(i.price, selected.currency)}
                          </div>
                        </div>
                        <div className="font-extrabold text-sm text-zinc-100">
                          {formatPrice(i.price * i.qty, selected.currency)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Total Billing */}
                <div className="flex justify-between items-center bg-yellow-400 text-zinc-950 rounded-xl p-4 shadow-lg">
                  <span className="font-display font-black tracking-wider text-sm uppercase">Total Amount</span>
                  <span className="font-mono text-2xl font-black">
                    {formatPrice(Number(selected.total), selected.currency)}
                  </span>
                </div>

                {/* Quick Action State Switcher */}
                <div className="border-t border-zinc-800 pt-5 mt-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Update Order Status
                  </div>
                  <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v as Status)}>
                    <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200 focus:ring-yellow-400/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                      {STATUSES.map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className="focus:bg-yellow-400 focus:text-zinc-950 uppercase text-xs font-bold"
                        >
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/products";
import { formatOrderRef } from "@/stores/cartStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const statusColors: Record<Status, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  confirmed: "bg-blue-500/20 text-blue-500",
  shipped: "bg-purple-500/20 text-purple-500",
  delivered: "bg-green-500/20 text-green-500",
  cancelled: "bg-red-500/20 text-red-500",
};

function OrdersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", filter],
    queryFn: async () => {
      let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin"] });
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-wide">Orders</h1>
          <p className="text-sm text-muted-foreground">All WhatsApp checkout orders are auto-logged here.</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/30">
            <tr className="text-left">
              <th className="p-3 font-semibold uppercase tracking-wider text-xs">Order #</th>
              <th className="p-3 font-semibold uppercase tracking-wider text-xs">Date</th>
              <th className="p-3 font-semibold uppercase tracking-wider text-xs">Customer</th>
              <th className="p-3 font-semibold uppercase tracking-wider text-xs">Items</th>
              <th className="p-3 font-semibold uppercase tracking-wider text-xs">Total</th>
              <th className="p-3 font-semibold uppercase tracking-wider text-xs">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : (data ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            ) : (
              (data ?? []).map((o: any) => {
                const items = (o.items as any[]) ?? [];
                const summary = items.map((i) => `${i.qty}× ${i.title}`).join(", ");
                const orderRef =
                  typeof o.order_number === "number" ? formatOrderRef(o.order_number) : `#${String(o.id).slice(0, 8)}`;
                return (
                  <tr
                    key={o.id}
                    className="border-b border-border hover:bg-secondary/20 cursor-pointer"
                    onClick={() => setSelected(o)}
                  >
                    <td className="p-3 font-mono text-xs">{orderRef}</td>
                    <td className="p-3 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="p-3 text-xs">
                      <div className="font-semibold">{o.customer_name || "—"}</div>
                      <div className="text-muted-foreground">{o.customer_phone || ""}</div>
                    </td>
                    <td className="p-3 max-w-xs truncate">{summary}</td>
                    <td className="p-3 font-bold">{formatPrice(Number(o.total), o.currency)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase ${statusColors[o.status as Status]}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-xs text-primary">View →</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-2xl tracking-wider">ORDER DETAILS</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="text-xs text-muted-foreground">{new Date(selected.created_at).toLocaleString()}</div>
                {(selected.customer_name || selected.customer_phone) && (
                  <div className="rounded-lg border border-border p-3 text-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Customer
                    </div>
                    {selected.customer_name && <div className="font-semibold">{selected.customer_name}</div>}
                    {selected.customer_phone && (
                      <a href={`tel:${selected.customer_phone}`} className="text-primary hover:underline">
                        {selected.customer_phone}
                      </a>
                    )}
                  </div>
                )}
                {selected.notes && (
                  <div className="rounded-lg border border-border p-3 text-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
                    <pre className="whitespace-pre-wrap font-sans text-xs">{selected.notes}</pre>
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Items</div>
                  <ul className="space-y-2">
                    {((selected.items as any[]) ?? []).map((i, idx) => (
                      <li key={idx} className="flex items-start gap-3 rounded-lg border border-border p-3">
                        {i.image && <img src={i.image} alt="" className="h-12 w-12 rounded object-cover" />}
                        <div className="flex-1">
                          <div className="font-semibold">{i.title}</div>
                          {i.options?.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {i.options.map((o: any) => `${o.name}: ${o.value}`).join(" • ")}
                            </div>
                          )}
                          <div className="text-xs">
                            Qty: {i.qty} × {formatPrice(i.price, selected.currency)}
                          </div>
                        </div>
                        <div className="font-bold">{formatPrice(i.price * i.qty, selected.currency)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-lg">
                  <span className="font-display tracking-wider">TOTAL</span>
                  <span className="font-bold">{formatPrice(Number(selected.total), selected.currency)}</span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Status</div>
                  <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v as Status)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
