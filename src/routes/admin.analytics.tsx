import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

const COLORS = ["#a3e635", "#3b82f6", "#a855f7", "#22c55e", "#ef4444"];

function AnalyticsPage() {
  const [days, setDays] = useState("30");
  const since = new Date(); since.setDate(since.getDate() - parseInt(days));

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics", days],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("created_at, total, status, items, currency")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const orders = data ?? [];

  // Aggregate revenue per day
  const byDay: Record<string, { date: string; revenue: number; orders: number }> = {};
  orders.forEach((o) => {
    const d = new Date(o.created_at).toISOString().slice(0, 10);
    if (!byDay[d]) byDay[d] = { date: d, revenue: 0, orders: 0 };
    byDay[d].revenue += Number(o.total);
    byDay[d].orders += 1;
  });
  const dailySeries = Object.values(byDay);

  // Status breakdown
  const statusMap: Record<string, number> = {};
  orders.forEach((o) => { statusMap[o.status] = (statusMap[o.status] ?? 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Top products
  const productMap: Record<string, number> = {};
  orders.forEach((o) => {
    ((o.items as any[]) ?? []).forEach((i) => {
      productMap[i.title] = (productMap[i.title] ?? 0) + i.qty;
    });
  });
  const topProducts = Object.entries(productMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-wide">Analytics</h1>
          <p className="text-sm text-muted-foreground">Sales insights from logged WhatsApp orders.</p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No orders in this period yet.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Revenue over time">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" fontSize={11} stroke="#888" />
                <YAxis fontSize={11} stroke="#888" />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} />
                <Line type="monotone" dataKey="revenue" stroke="#a3e635" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Orders per day">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" fontSize={11} stroke="#888" />
                <YAxis fontSize={11} stroke="#888" />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} />
                <Bar dataKey="orders" fill="#a3e635" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top products">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" fontSize={11} stroke="#888" />
                <YAxis dataKey="name" type="category" fontSize={11} stroke="#888" width={100} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} />
                <Bar dataKey="qty" fill="#a3e635" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Status breakdown">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-lg uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}
