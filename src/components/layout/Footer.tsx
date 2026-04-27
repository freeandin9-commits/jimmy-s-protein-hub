import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function Footer() {
  const { settings } = useSiteSettings();
  const waUrl = `https://wa.me/${settings.whatsapp_number}`;
  const emailUrl = `mailto:${settings.contact_email}`;

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
            <li><a href={waUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Order on WhatsApp</a></li>
            <li><Link to="/login" className="text-xs hover:text-primary">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Follow</h4>
          <div className="flex flex-wrap gap-3">
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><Instagram className="h-4 w-4" /></a>
            )}
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><Facebook className="h-4 w-4" /></a>
            )}
            <a href={waUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><MessageCircle className="h-4 w-4" /></a>
            <a href={emailUrl} aria-label="Email" className="rounded-full border border-border p-2 hover:border-primary hover:text-primary"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Jimmy's Protein. All rights reserved.
      </div>
    </footer>
  );
}
