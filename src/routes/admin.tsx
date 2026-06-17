import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client"; // Supabase client import ചെയ്യുക
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
  ImageIcon,
  Sparkles,
  FileText,
  UserCheck,
  Trash2, // Trash2 ഐക്കൺ ഇംപോർട്ട് ചെയ്തു
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Jimmy's Protein" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const navItems: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/blogs", label: "Blogs", icon: FileText },
  { to: "/admin/about", label: "About Page", icon: UserCheck },
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
  const [isClearing, setIsClearing] = useState(false);

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

  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      "തീർച്ചയാണോ? എല്ലാ ഹിസ്റ്ററി ഡാറ്റയും ശാശ്വതമായി നീക്കം ചെയ്യപ്പെടും. ഇത് തിരിച്ചെടുക്കാൻ കഴിയില്ല.",
    );

    if (confirmed) {
      setIsClearing(true);
      try {
        // ഇక్కడ 'your_history_table' മാറ്റി നിങ്ങളുടെ ടേബിളിന്റെ പേര് നൽകുക
        const { error } = await supabase.from("your_history_table").delete().neq("id", 0);

        if (error) throw error;

        toast.success("ഹിസ്റ്ററി വിജയകരമായി ക്ലിയർ ചെയ്തു.");
        window.location.reload();
      } catch (err) {
        toast.error("ഹിസ്റ്ററി ക്ലിയർ ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.");
      } finally {
        setIsClearing(false);
      }
    }
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="h-8 w-8 text-yellow-400 animate-pulse" />
          <div className="text-sm tracking-widest uppercase font-medium text-zinc-400">Loading admin panel…</div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-yellow-400 selection:text-zinc-950">
      <aside className="hidden w-64 flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-md md:flex">
        <div className="flex h-20 items-center gap-2.5 border-b border-zinc-800/80 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-400/10">
            <Dumbbell className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg tracking-wider text-yellow-400 leading-none">JIMMY'S</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mt-0.5">
              Control Center
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 group ${
                  active
                    ? "bg-yellow-400 text-zinc-950 shadow-md shadow-yellow-400/10"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? "stroke-[2.5]" : "group-hover:scale-110"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800/80 p-4 space-y-2 bg-zinc-900/20">
          <button
            onClick={handleClearHistory}
            disabled={isClearing}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isClearing ? "Clearing..." : "Clear Data History"}
          </button>

          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-800/60 hover:text-yellow-400 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Live Storefront
          </Link>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>

          <div className="mt-2 border-t border-zinc-800/50 pt-3 px-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-zinc-500 font-medium truncate flex-1">{user.email}</p>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-zinc-950">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
