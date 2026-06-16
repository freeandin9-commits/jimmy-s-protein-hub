import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  BarChart3,
  LogOut,
  Dumbbell,
  ExternalLink,
  Megaphone,
  Tags,
  Image as ImageIcon,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel — Jimmy's Protein" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const navItems: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/hero", label: "Hero Section", icon: Sparkles },
  { to: "/admin/ads", label: "Ads", icon: Megaphone },
  { to: "/admin/shop-ads", label: "Shop Banners", icon: ImageIcon },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!isAdmin) {
      toast.error("You are not authorized to access the admin panel.");
      navigate({ to: "/" });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-xs tracking-wider text-muted-foreground uppercase font-medium">
            Loading Admin Panel...
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-2.5 border-b border-zinc-200/80 px-6 dark:border-zinc-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base font-bold tracking-wider text-zinc-900 dark:text-zinc-50">
              JIMMY'S
            </span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase -mt-0.5">
              Admin Central
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10 font-bold border-l-4 border-primary"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 ${active ? "text-primary-foreground" : "text-zinc-400 dark:text-zinc-500"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Section */}
        <div className="mt-auto border-t border-zinc-200/80 p-4 space-y-3 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            View Live Store
          </Link>

          {/* User Profile Info Card */}
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200/60 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200" title={user.email ?? ""}>
                {user.email?.split("@")[0]}
              </p>
              <p className="truncate text-[10px] text-zinc-400 dark:text-zinc-500">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="group flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 md:hidden shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold tracking-wider text-zinc-900 dark:text-zinc-50">
              JIMMY'S ADMIN
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-zinc-500 hover:text-red-600">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Mobile Sub Navigation Slider */}
        <nav className="flex gap-1.5 overflow-x-auto border-b border-zinc-200/80 bg-white px-3 py-2.5 scrollbar-none md:hidden dark:border-zinc-800 dark:bg-zinc-900">
          {navItems.map((item) => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 selection:bg-primary/10">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
