import { Link } from "@tanstack/react-router";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logoImg from "@/assets/logo.jpg";

export function Header() {
  const items = useCartStore((s) => s.items);
  const open = useCartStore((s) => s.open);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useSiteSettings();
  const logoSrc = settings.logo_url || logoImg;

  // ഡെസ്ക്ടോപ്പ് ലിങ്കുകൾ ശുദ്ധമായ വെള്ള നിറത്തിലും, ഹോവർ ചെയ്യുമ്പോൾ ഗോൾഡ്/പ്രൈമറി നിറത്തിലും വരാൻ
  const navLinkProps = {
    className: "text-sm font-semibold uppercase tracking-wider text-white/90 hover:text-[#FACC15] transition-colors",
    activeProps: { className: "text-[#FACC15]" },
  };

  return (
    // Background pure black (#000000) ആക്കി, ബോർഡർ മാറ്റിയിട്ടുണ്ട്
    <header className="sticky top-0 z-40 bg-black text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Nutrin Sports home">
          {/* ലോഗോ കറുപ്പ് ബാക്ക്ഗ്രൗണ്ടിൽ നന്നായി തെളിയാൻ ഇൻവേർട്ട് ഫിൽട്ടർ ആവശ്യമെങ്കിൽ നൽകാം */}
          <img src={logoSrc} alt="Nutrin Sports" className="h-10 w-auto md:h-12 object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
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

        {/* Action Controls - Icons & Buttons */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex font-bold uppercase tracking-wider border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-colors"
          >
            <Link to="/login">Admin</Link>
          </Button>

          {/* Cart Icon Button - Pure White */}
          <Button
            variant="ghost"
            size="icon"
            onClick={open}
            className="relative text-white hover:bg-white/10 hover:text-white"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FACC15] px-1 text-[10px] font-bold text-black">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Mobile Menu Toggle Button */}
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

      {/* Mobile Drawer Menu - Pure Black with White Text */}
      {mobileOpen && (
        <nav className="border-t border-white/10 bg-black md:hidden transition-all">
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
                className="rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-[#FACC15] transition-all"
                activeProps={{ className: "text-[#FACC15] bg-white/5" }}
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
