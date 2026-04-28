import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, DollarSign, Clock, TrendingUp } from "lucide-react";
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
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const todayCount = orders.filter((o) => new Date(o.created_at) >= today).length;
  const currency = orders[0]?.currency ?? "USD";

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, accent: "text-primary" },
    { label: "Revenue", value: formatPrice(totalRevenue, currency), icon: DollarSign, accent: "text-primary" },
    { label: "Pending", value: pending, icon: Clock, accent: "text-yellow-500" },
    { label: "Today", value: todayCount, icon: TrendingUp, accent: "text-green-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.accent}`} />
            </div>
            <div className="mt-2 font-display text-3xl tracking-wide">{isLoading ? "…" : s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide">Recent Orders</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No orders yet. WhatsApp checkouts will appear here automatically.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {orders.slice(0, 5).map((o) => {
              const items = (o.items as any[]) ?? [];
              return (
                <li key={o.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">
                      {items.map((i) => i.title).join(", ") || "Order"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()} • {o.status}
                    </div>
                  </div>
                  <div className="font-bold">{formatPrice(Number(o.total), o.currency)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
