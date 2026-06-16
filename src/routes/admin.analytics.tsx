import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, ShoppingCart, Activity, PieChart as PieIcon, Layers } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

// Vibrant sports yellow accents with deep charcoal fallback matrix options
const RECHARTS_YELLOW = "#facc15";
const RECHARTS_MUTED_YELLOW = "#ca8a04";
const COLORS = ["#facc15", "#e4e4e7", "#a1a1aa", "#71717a", "#3f3f46"];

function AnalyticsPage() {
  const [days, setDays] = useState("30");
  const since = new Date();
  since.setDate(since.getDate() - parseInt(days));

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

  // Metrics Accumulations
  let totalRevenue = 0;
  let totalItemsSold = 0;

  // Aggregate revenue per day
  const byDay: Record<string, { date: string; revenue: number; orders: number }> = {};
  orders.forEach((o) => {
    const d = new Date(o.created_at).toISOString().slice(0, 10);
    if (!byDay[d]) byDay[d] = { date: d, revenue: 0, orders: 0 };
    byDay[d].revenue += Number(o.total);
    byDay[d].orders += 1;
    totalRevenue += Number(o.total);
  });
  const dailySeries = Object.values(byDay);

  // Status breakdown
  const statusMap: Record<string, number> = {};
  orders.forEach((o) => {
    statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
  });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Top products
  const productMap: Record<string, number> = {};
  orders.forEach((o) => {
    ((o.items as any[]) ?? []).forEach((i) => {
      productMap[i.title] = (productMap[i.title] ?? 0) + i.qty;
      totalItemsSold += i.qty;
    });
  });
  const topProducts = Object.entries(productMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="space-y-8 bg-zinc-950 text-zinc-100 antialiased min-h-screen pb-12">
      {/* Top Heading Module */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-400/10">
            <BarChart3 className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-wider text-yellow-400">
              Data Analytics
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-0.5">
              Real-time performance matrix metrics generated from WhatsApp order streams.
            </p>
          </div>
        </div>

        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300 h-11 focus:ring-yellow-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs font-semibold uppercase tracking-wider">
            <SelectItem value="7" className="focus:bg-yellow-400 focus:text-zinc-950">
              Last 7 Cycles
            </SelectItem>
            <SelectItem value="30" className="focus:bg-yellow-400 focus:text-zinc-950">
              Last 30 Cycles
            </SelectItem>
            <SelectItem value="90" className="focus:bg-yellow-400 focus:text-zinc-950">
              Last 90 Cycles
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="text-xs uppercase font-black tracking-widest text-zinc-500 animate-pulse">
            Assembling server logging metrics...
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-16 text-center bg-zinc-900/10">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            No telemetry log profiles found within requested range.
          </p>
        </div>
      ) : (
        <>
          {/* Quick Metrics Summary Strip */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Gross Revenue</span>
                <h4 className="text-2xl font-black tracking-tight text-zinc-100 mt-0.5">
                  ₹{totalRevenue.toLocaleString()}
                </h4>
              </div>
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Conversions</span>
                <h4 className="text-2xl font-black tracking-tight text-zinc-100 mt-0.5">{orders.length} Orders</h4>
              </div>
              <ShoppingCart className="h-5 w-5 text-yellow-400" />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Volume Moved</span>
                <h4 className="text-2xl font-black tracking-tight text-zinc-100 mt-0.5">{totalItemsSold} Units</h4>
              </div>
              <Layers className="h-5 w-5 text-yellow-400" />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Avg Basket Ticket
                </span>
                <h4 className="text-2xl font-black tracking-tight text-zinc-100 mt-0.5">
                  ₹{(orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0).toLocaleString()}
                </h4>
              </div>
              <Activity className="h-5 w-5 text-yellow-400" />
            </div>
          </div>

          {/* Graphics Data Grid Container */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart Module 1: Revenue (Upgraded to Area Chart for Premium Look) */}
            <ChartCard title="Revenue Stream Timeline" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={dailySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={RECHARTS_YELLOW} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={RECHARTS_YELLOW} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" fontSize={10} stroke="#71717a" tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} stroke="#71717a" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#09090b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    itemStyle={{ color: RECHARTS_YELLOW }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={RECHARTS_YELLOW}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart Module 2: Orders Count Bar Grid */}
            <ChartCard title="Daily Order Deploys" icon={ShoppingCart}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dailySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" fontSize={10} stroke="#71717a" tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} stroke="#71717a" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#09090b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    cursor={{ fill: "#18181b" }}
                  />
                  <Bar dataKey="orders" fill={RECHARTS_YELLOW} radius={[4, 4, 0, 0]} maxBarSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart Module 3: Top Products Sold */}
            <ChartCard title="Top Velocity Products" icon={Layers}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" fontSize={10} stroke="#71717a" tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    fontSize={10}
                    stroke="#a1a1aa"
                    width={100}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#09090b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="qty" fill={RECHARTS_MUTED_YELLOW} radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? RECHARTS_YELLOW : RECHARTS_MUTED_YELLOW} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart Module 4: Order Status Distribution Matrix */}
            <ChartCard title="Status Target Distribution" icon={PieIcon}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 height-[260px]">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={55}
                      paddingAngle={4}
                      stroke="#09090b"
                      strokeWidth={3}
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#09090b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Custom Side Legend Panel */}
                <div className="w-full sm:w-44 shrink-0 space-y-2.5">
                  {statusData.map((entry, i) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          {entry.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-zinc-200 font-bold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}

function ChartCard({ title, icon: Icon, children }: ChartCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-5 shadow-xl space-y-5">
      <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
        <Icon className="h-4 w-4 text-yellow-400" />
        <h3 className="font-display text-[13px] font-black uppercase tracking-widest text-zinc-300">{title}</h3>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
