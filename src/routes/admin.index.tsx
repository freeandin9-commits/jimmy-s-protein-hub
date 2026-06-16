import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, DollarSign, Clock, TrendingUp, LayoutDashboard, Calendar, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, currency, status, created_at, items")
        .order("created_at", { ascending: false });
      return orders ?? [];
    },
  });

  const orders = data ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const todayCount = orders.filter((o) => new Date(o.created_at) >= today).length;
  const currency = orders[0]?.currency ?? "INR";

  const stats = [
    {
      label: "Total Conversions",
      value: totalOrders,
      icon: ShoppingBag,
      color: "text-yellow-400",
      bg: "bg-yellow-400/5",
    },
    {
      label: "Gross Revenue",
      value: formatPrice(totalRevenue, currency),
      icon: DollarSign,
      color: "text-yellow-400",
      bg: "bg-yellow-400/5",
    },
    { label: "Pending Processing", value: pending, icon: Clock, color: "text-zinc-400", bg: "bg-zinc-800/40" },
    { label: "Today's Inflow", value: todayCount, icon: TrendingUp, color: "text-yellow-400", bg: "bg-yellow-400/5" },
  ];

  // Helper utility for premium badging status fields
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "border-zinc-800 bg-zinc-900 text-zinc-400";
      case "completed":
      case "delivered":
        return "border-yellow-400/30 bg-yellow-400/10 text-yellow-400";
      default:
        return "border-zinc-800 bg-zinc-900 text-zinc-400";
    }
  };

  return (
    <div className="space-y-8 bg-zinc-950 text-zinc-100 antialiased min-h-screen pb-12">
      {/* Upper Brand Control Module */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-400/10">
            <LayoutDashboard className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-wider text-yellow-400">
              Control Center
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-0.5">
              Live automated data feed streaming from custom client WhatsApp checkouts.
            </p>
          </div>
        </div>

        {/* Dynamic Timestamp Sync Display */}
        <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3.5 text-xs font-bold uppercase tracking-wider text-zinc-400 select-none">
          <Calendar className="h-3.5 w-3.5 text-yellow-400" />
          <span>Realtime Metrics Sync Active</span>
        </div>
      </div>

      {/* Grid Block 1: Analytical Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5 shadow-xl transition-all duration-200 hover:border-zinc-700/60"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{s.label}</span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-md ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
            <div className="mt-4 font-display text-2xl font-black tracking-tight text-zinc-100">
              {isLoading ? (
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 animate-pulse">
                  Syncing…
                </span>
              ) : (
                s.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Block 2: Order Stream Deck */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-yellow-400" />
            <h2 className="font-display text-sm font-black uppercase tracking-widest text-zinc-300">
              Recent Checkout Dispatch
            </h2>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-sm border border-zinc-900">
            Latest 5 Logs
          </span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs uppercase font-black tracking-widest text-zinc-500 animate-pulse">
            Pulling recent operational stack…
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              No orders logged yet. live checkouts will populate here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-950 bg-zinc-950/60">
            <ul className="divide-y divide-zinc-900/80">
              {orders.slice(0, 5).map((o) => {
                const items = (o.items as any[]) ?? [];
                return (
                  <li
                    key={o.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-zinc-900/30 transition-colors duration-150 group"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 group-hover:text-yellow-400 transition-colors truncate">
                        {items.map((i) => i.title).join(", ") || "Protein Product Package"}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">
                        <span className="font-mono text-zinc-400">{new Date(o.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider border uppercase ${getStatusStyle(o.status)}`}
                        >
                          {o.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-zinc-900/60 pt-2 sm:pt-0 shrink-0">
                      <div className="font-mono font-black text-sm text-yellow-400 tracking-tight sm:text-right">
                        {formatPrice(Number(o.total), o.currency)}
                      </div>
                      <ChevronRight className="hidden sm:block h-4 w-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
