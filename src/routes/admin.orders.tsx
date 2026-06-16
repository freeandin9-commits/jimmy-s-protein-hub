import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/products";
import { formatOrderRef } from "@/stores/cartStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { ClipboardList, Filter, User, Package, Calendar, Phone, FileText, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

// Refined high-performance color matrix for sports dark theme
const statusColors: Record<Status, string> = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
  confirmed: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  shipped: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  cancelled: "border-rose-500/30 bg-rose-500/10 text-rose-400",
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
    toast.success("Operational status updated");
    qc.invalidateQueries({ queryKey: ["admin"] });
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  return (
    <div className="space-y-8 bg-zinc-950 text-zinc-100 antialiased min-h-screen pb-12">
      {/* Upper Module Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-400/10">
            <ClipboardList className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-wider text-yellow-400">
              Order Manifest
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-0.5">
              Live logging ledger mapping customer WhatsApp checkouts to fulfillment vectors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Filter className="h-4 w-4 text-zinc-500 hidden sm:block" />
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300 h-11 focus:ring-yellow-400">
              <SelectValue placeholder="Filter Pipeline" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs font-semibold uppercase tracking-wider">
              <SelectItem value="all" className="focus:bg-yellow-400 focus:text-zinc-950">
                All Dispatches
              </SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="focus:bg-yellow-400 focus:text-zinc-950 uppercase">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Interface Grid Canvas */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-2xl">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/80 bg-zinc-950/80 text-left text-zinc-500 select-none">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Order Ref</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Timestamp</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Customer Profile</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Manifest Items</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Total Valuation</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Status Node</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-12 text-center text-xs font-bold uppercase tracking-widest text-zinc-500 animate-pulse"
                >
                  Querying relational transaction ledger…
                </td>
              </tr>
            ) : (data ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="p-16 text-center text-xs font-bold uppercase tracking-widest text-zinc-500">
                  No matches compiled inside active pipeline state.
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
                    className="hover:bg-zinc-900/30 cursor-pointer transition-colors group"
                    onClick={() => setSelected(o)}
                  >
                    <td className="p-4 font-mono text-xs text-zinc-300 font-bold tracking-tight group-hover:text-yellow-400 transition-colors">
                      {orderRef}
                    </td>
                    <td className="p-4 text-xs font-mono text-zinc-500 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-xs whitespace-nowrap">
                      <div className="font-bold text-zinc-200">{o.customer_name || "—"}</div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5">{o.customer_phone || ""}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate text-xs text-zinc-400 font-semibold">{summary}</td>
                    <td className="p-4 font-mono font-black text-sm text-yellow-400 tracking-tight">
                      {formatPrice(Number(o.total), o.currency)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusColors[o.status as Status]}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:text-yellow-400 group-hover:border-yellow-400/20 transition-all">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Slide Deck Sheet */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl p-6 space-y-6">
          {selected && (
            <>
              <SheetHeader className="border-b border-zinc-800 pb-4">
                <span className="text-[10px] font-mono font-bold text-yellow-400 tracking-wider uppercase bg-yellow-400/5 border border-yellow-400/10 px-2 py-0.5 rounded-sm self-start">
                  Order ID Mapping:{" "}
                  {typeof selected.order_number === "number" ? formatOrderRef(selected.order_number) : selected.id}
                </span>
                <SheetTitle className="font-display text-2xl font-black uppercase tracking-wider text-zinc-100 mt-2">
                  Transaction Matrix
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-5">
                {/* Segment 1: Timestamp */}
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 border-b border-zinc-800/50 pb-3">
                  <Calendar className="h-4 w-4 text-zinc-600" />
                  <span>Logged Epoch: {new Date(selected.created_at).toLocaleString()}</span>
                </div>

                {/* Segment 2: Customer Identity */}
                {(selected.customer_name || selected.customer_phone) && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <User className="h-3.5 w-3.5 text-yellow-400" /> Identity Profile
                    </div>
                    <div>
                      {selected.customer_name && (
                        <div className="font-display font-black text-sm uppercase text-zinc-200 tracking-wide">
                          {selected.customer_name}
                        </div>
                      )}
                      {selected.customer_phone && (
                        <a
                          href={`tel:${selected.customer_phone}`}
                          className="inline-flex items-center gap-1.5 font-mono text-xs text-yellow-400/90 hover:text-yellow-300 mt-1 hover:underline"
                        >
                          <Phone className="h-3 w-3" /> {selected.customer_phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Segment 3: Extra Transmission Notes */}
                {selected.notes && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <FileText className="h-3.5 w-3.5 text-yellow-400" /> Dispatch Transmission Notes
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-400 leading-relaxed bg-zinc-900 border border-zinc-800/60 p-2.5 rounded-lg">
                      {selected.notes}
                    </pre>
                  </div>
                )}

                {/* Segment 4: Line Items */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <Package className="h-3.5 w-3.5 text-yellow-400" /> Cargo Composition Stack
                  </div>
                  <ul className="space-y-2">
                    {((selected.items as any[]) ?? []).map((i, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3"
                      >
                        {i.image && (
                          <img
                            src={i.image}
                            alt=""
                            className="h-12 w-12 rounded-lg border border-zinc-800 object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-xs font-black uppercase tracking-wide text-zinc-200 truncate">
                            {i.title}
                          </div>
                          {i.options?.length > 0 && (
                            <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                              {i.options.map((o: any) => `${o.name}: ${o.value}`).join(" • ")}
                            </div>
                          )}
                          <div className="text-[11px] text-zinc-400 font-mono mt-1">
                            Qty: <span className="font-bold text-zinc-200">{i.qty}</span> ×{" "}
                            {formatPrice(i.price, selected.currency)}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-xs text-zinc-200 shrink-0">
                          {formatPrice(i.price * i.qty, selected.currency)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Segment 5: Financial Accumulation */}
                <div className="flex justify-between items-center border-t border-zinc-800 pt-4 bg-zinc-950/20 p-3 rounded-xl border border-zinc-800/40">
                  <span className="font-display text-xs font-black tracking-widest text-zinc-400 uppercase">
                    Valuation Aggregate
                  </span>
                  <span className="font-mono text-xl font-black text-yellow-400 tracking-tight">
                    {formatPrice(Number(selected.total), selected.currency)}
                  </span>
                </div>

                {/* Segment 6: Pipeline Workflow Mutation */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Mutate Operational Status Node
                  </Label>
                  <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v as Status)}>
                    <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 font-bold uppercase tracking-wider text-xs h-11 focus:ring-yellow-400 text-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs font-semibold uppercase tracking-wider">
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="focus:bg-yellow-400 focus:text-zinc-950 uppercase">
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
