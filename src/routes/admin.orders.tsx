import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/products";
import { formatOrderRef } from "@/stores/cartStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const statusColors: Record<Status, string> = {
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
};

function OrdersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
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

  const normalized = search.trim().toLowerCase();
  const digitsOnly = normalized.replace(/\D/g, "");
  const filtered = (data ?? []).filter((o: any) => {
    if (!normalized) return true;
    const ref =
      typeof o.order_number === "number" ? formatOrderRef(o.order_number, o.created_at).toLowerCase() : "";
    const orderNum = typeof o.order_number === "number" ? String(o.order_number) : "";
    const phone = (o.customer_phone || "").replace(/\D/g, "");
    const name = (o.customer_name || "").toLowerCase();
    const notes = (o.notes || "").toLowerCase();
    const itemTitles = ((o.items as any[]) ?? []).map((i) => (i.title || "").toLowerCase()).join(" ");
    return (
      ref.includes(normalized) ||
      orderNum.includes(digitsOnly) ||
      (!!digitsOnly && phone.includes(digitsOnly)) ||
      name.includes(normalized) ||
      notes.includes(normalized) ||
      itemTitles.includes(normalized)
    );
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
    <div className="space-y-8 p-2 bg-zinc-950 text-zinc-50 min-h-screen">
      {/* Header section with Dark-Yellow premium tone */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-wider text-zinc-100">
            Order <span className="text-amber-400">Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">
            All WhatsApp checkout orders are auto-logged here.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, phone, name, item..."
            className="w-full sm:w-72 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 hidden sm:inline">Status:</span>
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-amber-400">
                <SelectValue placeholder="All Orders" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectItem value="all" className="focus:bg-amber-400 focus:text-zinc-950 font-medium">
                  All Orders
                </SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="focus:bg-amber-400 focus:text-zinc-950 uppercase text-xs font-bold"
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="text-xs text-zinc-500 uppercase tracking-widest">
        {isLoading ? "Loading..." : `${filtered.length} order${filtered.length === 1 ? "" : "s"}${search ? ` matching "${search}"` : ""}`}
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="p-4 font-bold uppercase tracking-widest text-[11px]">Order #</th>
                <th className="p-4 font-bold uppercase tracking-widest text-[11px]">Date</th>
                <th className="p-4 font-bold uppercase tracking-widest text-[11px]">Customer</th>
                <th className="p-4 font-bold uppercase tracking-widest text-[11px]">Items</th>
                <th className="p-4 font-bold uppercase tracking-widest text-[11px]">Total</th>
                <th className="p-4 font-bold uppercase tracking-widest text-[11px]">Status</th>
                <th className="p-4 text-right font-bold uppercase tracking-widest text-[11px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                      <span className="text-xs uppercase tracking-widest text-zinc-500">Loading Orders...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-500 font-medium tracking-wide">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((o: any) => {
                  const items = (o.items as any[]) ?? [];
                  const summary = items.map((i) => `${i.qty}× ${i.title}`).join(", ");
                  const orderRef =
                    typeof o.order_number === "number"
                      ? formatOrderRef(o.order_number, o.created_at)
                      : `#${String(o.id).slice(0, 8)}`;
                  return (
                    <tr
                      key={o.id}
                      className="transition-colors hover:bg-zinc-800/40 cursor-pointer group"
                      onClick={() => setSelected(o)}
                    >
                      <td className="p-4 font-mono text-xs font-bold text-amber-400 group-hover:text-amber-300">
                        {orderRef}
                      </td>
                      <td className="p-4 text-xs text-zinc-400">
                        {new Date(o.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
                        {new Date(o.created_at).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="p-4 text-xs">
                        <div className="font-bold text-zinc-200 group-hover:text-zinc-100">
                          {o.customer_name || "—"}
                        </div>
                        <div className="text-zinc-500 mt-0.5 font-mono">{o.customer_phone || ""}</div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-zinc-300 text-xs font-medium">{summary}</td>
                      <td className="p-4 font-extrabold text-zinc-100 text-sm">
                        {formatPrice(Number(o.total), o.currency)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex rounded px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusColors[o.status as Status]}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-xs font-bold text-amber-400 group-hover:underline group-hover:text-amber-300">
                        View Details →
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Details Drawer Sheet */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl bg-zinc-900 border-zinc-800 text-zinc-100 overflow-y-auto shadow-2xl">
          {selected && (
            <>
              <SheetHeader className="border-b border-zinc-800 pb-4 mb-6">
                <div className="text-amber-400 font-mono text-xs font-bold tracking-widest uppercase mb-1">
                  ORDER REFERENCE:{" "}
                  {typeof selected.order_number === "number"
                    ? formatOrderRef(selected.order_number, selected.created_at)
                    : String(selected.id).slice(0, 8).toUpperCase()}
                </div>
                <SheetTitle className="font-display text-2xl font-black uppercase tracking-wider text-zinc-100">
                  ORDER DETAILS
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Date stamp box */}
                <div className="text-xs text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-between font-medium">
                  <span className="uppercase tracking-wider text-zinc-500 text-[10px]">Placement Date</span>
                  <span>{new Date(selected.created_at).toLocaleString()}</span>
                </div>

                {/* Customer Section */}
                {(selected.customer_name || selected.customer_phone) && (
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      Customer Profile
                    </div>
                    <div className="space-y-2">
                      {selected.customer_name && (
                        <div className="font-bold text-base text-zinc-100">{selected.customer_name}</div>
                      )}
                      {selected.customer_phone && (
                        <a
                          href={`tel:${selected.customer_phone}`}
                          className="inline-flex items-center text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline bg-amber-400/5 px-2.5 py-1.5 rounded border border-amber-400/10"
                        >
                          📞 {selected.customer_phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {selected.notes && (
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      Special Instructions
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/40 leading-relaxed">
                      {selected.notes}
                    </pre>
                  </div>
                )}

                {/* Items Section */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                    Purchased Items
                  </div>
                  <ul className="space-y-2.5">
                    {((selected.items as any[]) ?? []).map((i, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-4 rounded-xl bg-zinc-950 border border-zinc-800 p-3"
                      >
                        {i.image ? (
                          <img
                            src={i.image}
                            alt=""
                            className="h-12 w-12 rounded-lg object-cover bg-zinc-900 border border-zinc-800"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 text-[10px] uppercase font-bold">
                            No Img
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-zinc-100 truncate">{i.title}</div>
                          {i.options?.length > 0 && (
                            <div className="text-[11px] text-zinc-400 mt-0.5 flex flex-wrap gap-1">
                              {i.options.map((o: any, oIdx: number) => (
                                <span
                                  key={oIdx}
                                  className="bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]"
                                >
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
                        <div className="font-black text-sm text-zinc-100">
                          {formatPrice(i.price * i.qty, selected.currency)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Premium Yellow Total Block */}
                <div className="flex justify-between items-center bg-amber-400 text-zinc-950 rounded-xl p-4 shadow-xl">
                  <span className="font-display font-black tracking-widest text-xs uppercase">TOTAL SUMMARY</span>
                  <span className="font-mono text-2xl font-black">
                    {formatPrice(Number(selected.total), selected.currency)}
                  </span>
                </div>

                {/* Status Changer Actions */}
                <div className="border-t border-zinc-800 pt-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Update Fulfillment Status
                  </div>
                  <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v as Status)}>
                    <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-amber-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                      {STATUSES.map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className="focus:bg-amber-400 focus:text-zinc-950 uppercase text-xs font-bold"
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
