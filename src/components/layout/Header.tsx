import { Link } from "@tanstack/react-router";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.jpg";

export function Header() {
  const items = useCartStore((s) => s.items);
  const open = useCartStore((s) => s.open);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkProps = {
    className: "text-sm font-semibold uppercase tracking-wider text-foreground/80 hover:text-primary transition-colors",
    activeProps: { className: "text-primary" },
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Nutrin Sports home">
          <img src={logoImg} alt="Nutrin Sports" className="h-10 w-auto md:h-12" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" {...navLinkProps}>Home</Link>
          <Link to="/products" {...navLinkProps}>Shop</Link>
          <Link to="/about" {...navLinkProps}>About</Link>
          <Link to="/contact" {...navLinkProps}>Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex font-bold uppercase tracking-wider"
          >
            <Link to="/login">Admin</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={open}
            className="relative"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border/60 bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Shop" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wider text-foreground/80 hover:bg-secondary hover:text-primary"
                activeProps={{ className: "text-primary bg-secondary" }}
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
