import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl tracking-wider text-primary">JIMMY'S PROTEIN</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Real fuel. No junk. Built for athletes who train hard.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-primary">All Products</Link></li>
            <li><Link to="/about" className="hover:text-primary">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/contact" className="hover:text-primary">Help & FAQ</Link></li>
            <li><a href="https://wa.me/910000000000" className="hover:text-primary">Order on WhatsApp</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Follow</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><Youtube className="h-4 w-4" /></a>
            <a href="mailto:hello@jimmysprotein.com" aria-label="Email" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Jimmy's Protein. All rights reserved.
      </div>
    </footer>
  );
}
