import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/products";
import { Zap, Shield, Flame, ArrowRight, Phone, BadgeCheck, Truck, Award } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { AdsStrip } from "@/components/AdsStrip";
import { CategoriesSection } from "@/components/CategoriesSection";

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
  const phone = settings.whatsapp_number || "";

  useEffect(() => {
    fetchProducts(6).then((p) => {
      setProducts(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <SearchBar />
      <AdsStrip />
      {/* HERO — Black + emerald + gold 3D */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* layered ambient glows */}
        <div aria-hidden className="pointer-events-none absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 h-[600px] w-[600px] rounded-full bg-accent/15 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 mesh-bg opacity-60" />

        {/* subtle grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.97 0.015 95) 1px, transparent 1px), linear-gradient(90deg, oklch(0.97 0.015 95) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        <div className="container relative mx-auto grid min-h-[640px] gap-10 px-4 py-16 md:grid-cols-2 md:py-20 lg:py-28">
          <div className="relative z-10 flex flex-col justify-center">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-primary backdrop-blur-sm">
              <Dumbbell className="h-3.5 w-3.5" /> 100% Premium Quality
            </span>
            <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight md:text-6xl lg:text-7xl xl:text-[5.5rem]">
              <span className="text-foreground">{settings.hero_headline}</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
              {settings.hero_subtext}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Button
                asChild
                size="lg"
                className="btn-gold h-12 rounded-full px-8 font-bold uppercase tracking-[0.2em]"
              >
                <Link to="/products">
                  Buy Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-3 text-foreground">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span className="text-left">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                      Contact Us Daily
                    </span>
                    <span className="block font-display text-xl tracking-wide">{phone}</span>
                  </span>
                </a>
              )}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center [perspective:1200px]">
            {/* glow rings */}
            <div aria-hidden className="absolute inset-10 rounded-full bg-primary/30 blur-3xl animate-[glow-pulse_3s_ease-in-out_infinite]" />
            <div aria-hidden className="absolute inset-20 rounded-full bg-accent/25 blur-2xl" />
            {/* orbit ring */}
            <div aria-hidden className="absolute h-[420px] w-[420px] rounded-full border border-primary/20" />
            <div aria-hidden className="absolute h-[480px] w-[480px] rounded-full border border-accent/10" />

            <div className="relative animate-[float_6s_ease-in-out_infinite] [transform-style:preserve-3d] [transform:rotateY(-8deg)_rotateX(4deg)]">
              <img
                src={heroImg}
                alt="Jimmy's Protein tub"
                className="relative max-h-[520px] w-auto rounded-2xl object-cover"
                style={{
                  boxShadow:
                    "0 50px 80px -20px oklch(0 0 0 / 0.7), 0 25px 40px -15px oklch(0.72 0.16 160 / 0.45), 0 0 0 1px oklch(1 0 0 / 0.05) inset",
                }}
              />
              {/* reflection */}
              <div
                aria-hidden
                className="absolute inset-x-6 -bottom-16 h-24 rounded-[50%] blur-xl"
                style={{ background: "oklch(0.72 0.16 160 / 0.5)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS — 3D cards */}
      <section className="relative border-y border-border bg-dark-surface/60">
        <div className="container mx-auto grid gap-6 px-4 py-16 md:grid-cols-3">
          {[
            { icon: Zap, title: "25g Protein", desc: "Per single scoop. No skimping." },
            { icon: Shield, title: "Zero Junk", desc: "No fillers, no hidden sugars, no BS." },
            { icon: Flame, title: "Bold Flavors", desc: "Tastes incredible. Mixes clean." },
          ].map((b) => (
            <div
              key={b.title}
              className="card-3d card-3d-hover group flex items-start gap-4 rounded-2xl p-6"
            >
              <div className="rounded-xl bg-primary/15 p-3 text-primary ring-1 ring-primary/30 transition-transform group-hover:scale-110">
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

      <CategoriesSection />

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
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
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
