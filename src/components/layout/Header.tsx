import { Link } from "@tanstack/react-router";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logoAsset from "@/assets/logo-nutrin.png.asset.json";

export function Header() {
  const items = useCartStore((s) => s.items);
  const open = useCartStore((s) => s.open);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { settings } = useSiteSettings();
  const logoSrc = settings?.logo_url || logoAsset.url;

  const navLinkProps = {
    className: "text-sm font-semibold uppercase tracking-wider text-white/80 hover:text-[#E2B80D] transition-colors",
    activeProps: { className: "text-[#E2B80D]" },
  };

  return (
    <header className="bg-black text-white border-b border-zinc-800 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* ലോഗോ കൺടൈനർ: flex-shrink-0 ഉപയോഗിച്ച് ഇതിനെ ഇടത് വശത്ത് തന്നെ നിർത്തുന്നു */}
        <div className="flex items-center flex-shrink-0 mr-4">
          <Link to="/" className="flex items-center" aria-label="Nutrin Sports home">
            <img
              src={logoSrc}
              alt="Nutrin Sports"
              className="h-10 w-auto md:h-12 object-contain transition-all duration-300"
            />
          </Link>
        </div>

        {/* Desktop Navigation Links: flex-grow ഇല്ലാത്തതുകൊണ്ട് ഇത് ലോഗോയ്ക്ക് ശേഷം വരുന്നു */}
        <nav className="hidden md:flex items-center gap-8 flex-grow justify-center">
          <Link to="/" {...navLinkProps}>
            Home
          </Link>
          <Link to="/products" {...navLinkProps}>
            Shop
          </Link>
          <Link to="/track" {...navLinkProps}>
            Track Order
          </Link>
          <Link to="/about" {...navLinkProps}>
            About
          </Link>
          <Link to="/blog" {...navLinkProps}>
            Blog
          </Link>
          <Link to="/contact" {...navLinkProps}>
            Contact
          </Link>
        </nav>

        {/* Action Controls: വലത് വശത്ത് ഐക്കണുകൾ */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex font-bold uppercase tracking-wider border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-colors"
          >
            <Link to="/login">Admin</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={open}
            className="relative text-white hover:bg-white/10 hover:text-white"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                {totalItems}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10 hover:text-white"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <nav className="border-t border-zinc-800 bg-black md:hidden transition-all">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Shop" },
              { to: "/track", label: "Track Order" },
              { to: "/about", label: "About" },
              { to: "/blog", label: "Blog" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wider text-white/80 hover:bg-zinc-900 hover:text-[#E2B80D] transition-all"
                activeProps={{ className: "text-[#E2B80D] bg-zinc-900" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
