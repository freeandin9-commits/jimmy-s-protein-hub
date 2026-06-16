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

  const waUrl = `https://wa.me/${phone || "919142027275"}?text=Hi,%20I'm%20interested%20in%20your%20products!`;

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

  return (
    <div className="relative">
      <SearchBar />
      <AdsStrip />
      <CategoriesSection />

      {/* HERO SECTION */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0B0B0D 0%,#151518 40%,#1C1C21 100%)" }}
      >
        {/* layered ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-0 h-[600px] w-[600px] rounded-full bg-accent/15 blur-[140px]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 mesh-bg opacity-60" />

        {/* animated background image — ken burns */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-luminosity"
          style={{
            backgroundImage: `url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            animation: "ken-burns 18s ease-in-out infinite",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
        />

        {/* floating image orbs */}
        <img
          src={heroImg}
          aria-hidden
          alt=""
          className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full object-cover blur-sm"
          style={{ animation: "drift-slow 12s ease-in-out infinite", opacity: 0.22 }}
        />
        <img
          src={heroImg}
          aria-hidden
          alt=""
          className="pointer-events-none absolute right-4 bottom-8 h-56 w-56 rounded-full object-cover blur-sm hidden md:block"
          style={{ animation: "drift-reverse 15s ease-in-out infinite", opacity: 0.2 }}
        />

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
            {settings.hero_badge_text && (
              <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-primary backdrop-blur-sm">
                <Dumbbell className="h-3.5 w-3.5" /> {settings.hero_badge_text}
              </span>
            )}
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
                {settings.hero_cta_link?.startsWith("http") ? (
                  <a href={settings.hero_cta_link}>
                    {settings.hero_cta_text || "Buy Now"} <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <Link to={(settings.hero_cta_link || "/products") as any}>
                    {settings.hero_cta_text || "Buy Now"} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
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
            <div
              aria-hidden
              className="absolute inset-10 rounded-full bg-primary/30 blur-3xl animate-[glow-pulse_3s_ease-in-out_infinite]"
            />
            <div aria-hidden className="absolute inset-20 rounded-full bg-accent/25 blur-2xl" />
            {/* orbit ring */}
            <div aria-hidden className="absolute h-[420px] w-[420px] rounded-full border border-primary/20" />
            <div aria-hidden className="absolute h-[480px] w-[480px] rounded-full border border-accent/10" />

            <div className="relative animate-[float_6s_ease-in-out_infinite] [transform-style:preserve-3d] [transform:rotateY(-8deg)_rotateX(4deg)]">
              {settings.hero_media_type === "video" && settings.hero_video_url ? (
                <video
                  src={settings.hero_video_url}
                  className="relative max-h-[520px] w-auto rounded-2xl object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    boxShadow:
                      "0 50px 80px -20px oklch(0 0 0 / 0.7), 0 25px 40px -15px oklch(0.72 0.16 160 / 0.45), 0 0 0 1px oklch(1 0 0 / 0.05) inset",
                  }}
                />
              ) : (
                <img
                  src={settings.hero_image_url || heroImg}
                  alt="Jimmy's Protein"
                  className="relative max-h-[520px] w-auto rounded-2xl object-cover"
                  style={{
                    boxShadow:
                      "0 50px 80px -20px oklch(0 0 0 / 0.7), 0 25px 40px -15px oklch(0.72 0.16 160 / 0.45), 0 0 0 1px oklch(1 0 0 / 0.05) inset",
                  }}
                />
              )}
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
            <div key={b.title} className="card-3d card-3d-hover group flex items-start gap-4 rounded-2xl p-6">
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
              {products.map((p) => (
                <div key={p.id} className="w-[280px] flex-shrink-0 snap-start sm:w-[320px] lg:w-[360px]">
                  <ProductCard product={p} />
                </div>
              ))}
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

      {/* INSTAGRAM SECTION WITH FIXED PARALLAX BACKGROUND EFFECT */}
      <section
        className="relative py-20 md:py-28 overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-cover before:bg-center before:bg-no-repeat before:bg-fixed before:pointer-events-none"
        style={{ "--bg-image": `url(${heroImg})` } as React.CSSProperties}
      >
        <style>{`
          section[style*="--bg-image"]::before {
            background-image: var(--bg-image);
          }
        `}</style>

        <div className="absolute inset-0 bg-black/60" aria-hidden />

        <div className="relative z-10 [&_section]:bg-transparent [&_div]:bg-transparent [&_header]:bg-transparent">
          <InstagramSection />
        </div>
      </section>

      {/* CTA STRIP WITH PHONE CALL BUTTON */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-12 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div>
              <h3 className="font-display text-3xl uppercase tracking-wide md:text-4xl">Ready to level up?</h3>
              <p className="mt-1 opacity-80">Order on WhatsApp. Fast confirmation. No checkout headache.</p>
            </div>

            <a
              href="tel:+919142027275"
              className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-bold tracking-wide text-primary-foreground hover:bg-primary-foreground/20 transition-all border border-primary-foreground/20"
              title="Call Us Now"
            >
              <Phone className="h-4 w-4 animate-[pulse_2s_infinite]" />
              <span>+91 91420 27275</span>
            </a>
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

      {/* FLOATING WHATSAPP POP-UP WIDGET (LEFT SIDE POSITION) */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center group">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform duration-300 hover:scale-110 relative"
          aria-label="Chat on WhatsApp"
        >
          {/* Wave animation effect */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />

          {/* Official Solid Logo */}
          <svg className="h-7 w-7 fill-current relative z-10" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.452 5.705 1.453h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
        <span className="absolute left-20 scale-0 transition-all rounded bg-card border border-border px-3 py-1.5 text-xs font-semibold text-foreground shadow-xl group-hover:scale-100 whitespace-nowrap origin-left">
          Chat with us! 💬
        </span>
      </div>
    </div>
  );
}
