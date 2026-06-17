import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/products";
import { formatOrderRef } from "@/stores/cartStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

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

  const clearHistory = async () => {
    const { error } = await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      toast.error("Failed to clear history");
      return;
    }
    toast.success("Order history cleared successfully");
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-wider text-zinc-100">
            Order <span className="text-amber-400">Management</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">
              All WhatsApp checkout orders are auto-logged here.
            </p>
            {/* Clear History Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors border border-rose-500/20 px-2 py-1 rounded">
                  <Trash2 className="h-3 w-3" /> Clear All
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    This action will permanently delete all order history. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 text-zinc-100">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearHistory} className="bg-rose-600 hover:bg-rose-700 text-white">
                    Permanently Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 hidden sm:inline">Status:</span>
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-1 focus:ring-amber-400">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
              <SelectItem value="all">All Orders</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="uppercase text-xs font-bold">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Container (Original Format) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
        {/* ... (നിങ്ങളുടെ പഴയ ടേബിൾ കോഡ് ഇവിടെ നൽകുക) ... */}
        {/* ടേബിൾ കോഡ് മാറ്റമില്ലാതെ താഴെ ചേർത്തിട്ടുണ്ട് */}
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
                  <td colSpan={7} className="p-12 text-center text-zinc-500">
                    Loading Orders...
                  </td>
                </tr>
              ) : (data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                (data ?? []).map((o: any) => {
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
                      <td className="p-4 font-mono text-xs font-bold text-amber-400">{orderRef}</td>
                      <td className="p-4 text-xs text-zinc-400">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-xs font-bold text-zinc-200">{o.customer_name}</td>
                      <td className="p-4 text-xs text-zinc-300 truncate max-w-xs">{summary}</td>
                      <td className="p-4 font-extrabold text-zinc-100 text-sm">
                        {formatPrice(Number(o.total), o.currency)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${statusColors[o.status as Status]}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-amber-400 font-bold text-xs underline">View →</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Side Details Drawer - (നിങ്ങളുടെ പഴയ ഷീറ്റ് കോഡ് ഇവിടെ തുടരുക) */}
    </div>
  );
}
