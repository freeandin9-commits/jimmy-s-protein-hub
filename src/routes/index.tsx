import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/products";
import { Zap, Shield, Flame, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jimmy's Protein — Real Fuel. No Junk." },
      { name: "description", content: "Premium protein powder for athletes who train hard. 25g protein per scoop, clean ingredients, bold flavors." },
      { property: "og:title", content: "Jimmy's Protein — Real Fuel. No Junk." },
      { property: "og:description", content: "Premium protein powder for athletes who train hard." },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  useEffect(() => {
    fetchProducts(6).then((p) => {
      setProducts(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-2 md:py-24 lg:py-32">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <Zap className="h-3 w-3" /> New batch dropped
            </span>
            <h1 className="font-display text-6xl uppercase leading-[0.9] tracking-wide md:text-7xl lg:text-8xl">
              {settings.hero_headline}
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              {settings.hero_subtext}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 bg-primary px-8 font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90">
                <Link to="/products">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-foreground/20 px-8 font-bold uppercase tracking-wider hover:bg-foreground/10">
                <Link to="/about">Our Story</Link>
              </Button>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
            <img
              src={heroImg}
              alt="Jimmy's Protein tub"
              className="relative max-h-[500px] w-auto rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-y border-border bg-card/40">
        <div className="container mx-auto grid gap-6 px-4 py-12 md:grid-cols-3">
          {[
            { icon: Zap, title: "25g Protein", desc: "Per single scoop. No skimping." },
            { icon: Shield, title: "Zero Junk", desc: "No fillers, no hidden sugars, no BS." },
            { icon: Flame, title: "Bold Flavors", desc: "Tastes incredible. Mixes clean." },
          ].map((b) => (
            <div key={b.title} className="flex items-start gap-4 rounded-lg p-4">
              <div className="rounded-lg bg-primary/15 p-3 text-primary">
                <b.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl uppercase tracking-wide">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Best Sellers</p>
            <h2 className="mt-2 font-display text-4xl uppercase tracking-wide md:text-5xl">Fuel the Grind</h2>
          </div>
          <Link to="/products" className="hidden text-sm font-bold uppercase tracking-wider text-primary hover:underline md:inline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-lg text-muted-foreground">No products yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Tell us what to add and we'll create it.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA STRIP */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-12 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="font-display text-3xl uppercase tracking-wide md:text-4xl">Ready to level up?</h3>
            <p className="mt-1 opacity-80">Order on WhatsApp. Fast confirmation. No checkout headache.</p>
          </div>
          <Button asChild size="lg" variant="outline" className="h-12 border-primary-foreground bg-transparent px-8 font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            <Link to="/products">Shop the range</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
