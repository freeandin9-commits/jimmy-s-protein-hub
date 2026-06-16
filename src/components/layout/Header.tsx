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

  // useSiteSettings ഹുക്ക് വഴി ഡാറ്റാബേസിൽ നിന്നുള്ള ഏറ്റവും പുതിയ ലോഗോ യുആർഎൽ എടുക്കുന്നു
  const { settings } = useSiteSettings();
  const logoSrc = settings?.logo_url || logoImg;

  // ഡെസ്ക്ടോപ്പ് ലിങ്കുകൾ വെളുപ്പ് നിറത്തിലും, ഹോവർ ചെയ്യുമ്പോൾ പ്രൈമറി/ഗോൾഡ് നിറത്തിലും വരാൻ
  const navLinkProps = {
    className: "text-sm font-semibold uppercase tracking-wider text-white/80 hover:text-[#E2B80D] transition-colors",
    activeProps: { className: "text-[#E2B80D]" },
  };

  return (
    // Background pure black (#000000) ആക്കി, വെളുത്ത ടെക്സ്റ്റും നേർത്ത ബോർഡറും നൽകിയിട്ടുണ്ട്
    <header className="bg-black text-white border-b border-zinc-800 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Nutrin Sports home">
          {/* ലോഗോ കറുപ്പ് പശ്ചാത്തലത്തിലും വ്യക്തമായി കാണാൻ ഇമേജ് സ്റ്റൈൽ മെച്ചപ്പെടുത്തിയിട്ടുണ്ട്.
            നിങ്ങളുടെ ഒറിജിനൽ ലോഗോ കറുത്തതാണെങ്കിൽ അത് വെളുപ്പിക്കാൻ 'brightness-0 invert' സഹായിക്കും.
          */}
          <img
            src={logoSrc}
            alt="Nutrin Sports"
            className="h-10 w-auto md:h-12 object-contain transition-all duration-300"
          />
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

          {/* Cart Icon Button - Pure White text */}
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
