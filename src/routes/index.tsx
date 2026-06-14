import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/products";
import { Zap, Shield, Flame, ArrowRight, Phone, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { AdsStrip } from "@/components/AdsStrip";
import { SearchBar } from "@/components/SearchBar";
import { CategoriesSection } from "@/components/CategoriesSection";
import { InstagramSection } from "@/components/InstagramSection";
import { TrustBadges } from "@/components/TrustBadges";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jimmy's Protein — Real Fuel. No Junk." },
      {
        name: "description",
        content:
          "Premium protein powder for athletes who train hard. 25g protein per scoop, clean ingredients, bold flavors.",
      },
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  useEffect(() => {
    fetchProducts(6)
      .then((p) => {
        setProducts(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const benefits = [
    { icon: Zap, title: "25g Protein", desc: "Per single scoop. No skimping." },
    { icon: Shield, title: "Zero Junk", desc: "No fillers, no hidden sugars, no BS." },
    { icon: Flame, title: "Bold Flavors", desc: "Tastes incredible. Mixes clean." },
  ];

  return (
    <div>
      <SearchBar />
      <AdsStrip />
      <CategoriesSection />

      {/* HERO SECTION */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0B0B0D 0%,#151518 40%,#1C1C21 100%)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-0 h-[600px] w-[600px] rounded-full bg-accent/15 blur-[140px]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 mesh-bg opacity-60" />
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
            <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">{settings.hero_subtext}</p>
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
            <div
              aria-hidden
              className="absolute inset-10 rounded-full bg-primary/30 blur-3xl animate-[glow-pulse_3s_ease-in-out_infinite]"
            />
            <div aria-hidden className="absolute inset-20 rounded-full bg-accent/25 blur-2xl" />
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
              <div
                aria-hidden
                className="absolute inset-x-6 -bottom-16 h-24 rounded-[50%] blur-xl"
                style={{ background: "oklch(0.72 0.16 160 / 0.5)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS — ATTRACTIVE ANIMATED 3D CARDS */}
      <section className="relative border-y border-border/40 bg-gradient-to-r from-dark-surface/40 via-dark-surface/80 to-dark-surface/40 backdrop-blur-sm">
        <div className="container mx-auto grid gap-6 px-4 py-16 sm:py-20 md:grid-cols-3">
          {benefits.map((b, index) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 50, rotateY: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                type: "spring",
                bounce: 0.4,
              }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 },
              }}
              className="group relative flex items-start gap-5 rounded-2xl border border-border/50 bg-card/30 p-6 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-primary/40 hover:bg-card/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] [transform-style:preserve-3d]"
            >
              {/* Decorative inner ambient glow on card hover */}
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Animated Icon Container */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
                className="rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary/50 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              >
                <b.icon className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
              </motion.div>

              {/* Text Container */}
              <div className="space-y-1">
                <h3 className="font-display text-2xl uppercase tracking-wide text-foreground transition-colors duration-300 group-hover:text-primary">
                  {b.title}
                </h3>
                <p className="text-sm text-muted-foreground/90 transition-colors duration-300 group-hover:text-muted-foreground">
                  {b.desc}
                </p>
              </div>
            </motion.div>
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
          <Link
            to="/products"
            className="hidden text-sm font-bold uppercase tracking-wider text-primary hover:underline md:inline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] w-[280px] flex-shrink-0 animate-pulse rounded-xl bg-card sm:w-[320px]"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-lg text-muted-foreground">No products yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Tell us what to add and we'll create it.</p>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg ring-1 ring-border backdrop-blur-sm hover:bg-background transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div
              ref={scrollRef}
              className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <AnimatePresence>
                {products.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="w-[280px] flex-shrink-0 snap-start sm:w-[320px] lg:w-[360px]"
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg ring-1 ring-border backdrop-blur-sm hover:bg-background transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>

      <TrustBadges />
      <InstagramSection />

      {/* CTA STRIP */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-12 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="font-display text-3xl uppercase tracking-wide md:text-4xl">Ready to level up?</h3>
            <p className="mt-1 opacity-80">Order on WhatsApp. Fast confirmation. No checkout headache.</p>
          </div>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-primary-foreground bg-transparent px-8 font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <Link to="/products">Shop the range</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
