import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logoImg from "@/assets/logo.jpg";

const NAV = [
  { to: "/products", label: "All Products" },
  { to: "/products", label: "Offers", search: { category: "offers" } as any },
  { to: "/track", label: "Track Order" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const items = useCartStore((s) => s.items);
  const open = useCartStore((s) => s.open);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const logoSrc = settings.logo_url || logoImg;

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate({ to: "/products", search: term ? { q: term } : {} });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      {/* TOP ROW — logo / search / actions */}
      <div className="container mx-auto flex h-20 items-center gap-3 px-4 md:gap-6">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Home">
          <img src={logoSrc} alt="Jimmy's Protein" className="h-10 w-auto md:h-12" />
        </Link>

        {/* Search — center, prominent (MB style) */}
        <form onSubmit={onSearch} className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a product name. e.g. Whey Protein."
            aria-label="Search the store"
            className="h-11 w-full rounded-full border border-border bg-secondary/60 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-secondary"
          />
        </form>

        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <Link
            to="/login"
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30 transition hover:bg-primary/25 sm:inline-flex"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </Link>
          <button
            onClick={open}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-secondary"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {totalItems}
            </span>
          </button>
          <Link
            to="/login"
            className="btn-gold hidden h-10 items-center rounded-full px-5 text-xs font-bold uppercase tracking-[0.18em] md:inline-flex"
          >
            Login / Sign Up
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-secondary md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* NAV ROW — bold uppercase (MB style) */}
      <nav className="hidden border-t border-border/40 bg-background/70 md:block">
        <div className="container mx-auto flex items-center justify-center gap-10 px-4 py-3">
          {NAV.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              search={l.search}
              className="text-[12px] font-bold uppercase tracking-[0.22em] text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <nav className="border-t border-border/60 bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {NAV.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                search={l.search}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-bold uppercase tracking-[0.2em] text-foreground/80 hover:bg-secondary hover:text-primary"
                activeProps={{ className: "text-primary bg-secondary" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="btn-gold mt-2 inline-flex h-10 items-center justify-center rounded-full px-5 text-xs font-bold uppercase tracking-[0.18em]"
            >
              Login / Sign Up
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
