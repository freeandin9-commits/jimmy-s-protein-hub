import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/shopify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = typeof STATUSES[number];

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
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/30">
            <tr className="text-left">
              <th className="p-3 font-semibold uppercase tracking-wider text-xs">Date</th>
              <th className="p-3 font-semibold uppercase tracking-wider text-xs">Items</th>
              <th className="p-3 font-semibold uppercase tracking-wider text-xs">Total</th>
              <th className="p-3 font-semibold uppercase tracking-wider text-xs">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
            ) : (data ?? []).length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No orders yet.</td></tr>
            ) : (
              (data ?? []).map((o: any) => {
                const items = (o.items as any[]) ?? [];
                const summary = items.map((i) => `${i.qty}× ${i.title}`).join(", ");
                return (
                  <tr key={o.id} className="border-b border-border hover:bg-secondary/20 cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="p-3 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="p-3 max-w-xs truncate">{summary}</td>
                    <td className="p-3 font-bold">{formatPrice(Number(o.total), o.currency)}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase ${statusColors[o.status as Status]}`}>
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
                <div className="text-xs text-muted-foreground">
                  {new Date(selected.created_at).toLocaleString()}
                </div>
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
                          <div className="text-xs">Qty: {i.qty} × {formatPrice(i.price, selected.currency)}</div>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
