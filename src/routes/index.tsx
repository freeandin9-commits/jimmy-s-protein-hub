import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/products";
import {
  Zap,
  Shield,
  Flame,
  ArrowRight,
  Phone,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { AdsStrip } from "@/components/AdsStrip";
import { SearchBar } from "@/components/SearchBar";
import { CategoriesSection } from "@/components/CategoriesSection";
import { InstagramSection } from "@/components/InstagramSection";
import { TrustBadges } from "@/components/TrustBadges";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const { settings } = useSiteSettings();

  const displayPhone = settings?.contact_phone || "919142027275";
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    fetchProducts(6)
      .then((p) => {
        setProducts(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const ctaLink = settings?.hero_cta_link || "/products";
  const isExternal = ctaLink.startsWith("http");

  return (
    <div className="relative w-full">
      <div className="sticky top-[73px] z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
        <SearchBar />
        <AdsStrip />
      </div>

      <CategoriesSection />

      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0B0B0D 0%,#151518 40%,#1C1C21 100%)" }}
      >
        <div className="container relative mx-auto grid min-h-[640px] gap-10 px-4 py-16 md:grid-cols-2 md:py-20 lg:py-28">
          <div className="relative z-10 flex flex-col justify-center">
            {settings?.hero_badge_text && (
              <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-primary backdrop-blur-sm">
                <Dumbbell className="h-3.5 w-3.5" /> {settings.hero_badge_text}
              </span>
            )}
            <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight md:text-6xl lg:text-7xl xl:text-[5.5rem]">
              <span className="text-foreground">{settings?.hero_headline}</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">{settings?.hero_subtext}</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Button
                asChild
                size="lg"
                className="btn-gold h-12 rounded-full px-8 font-bold uppercase tracking-[0.2em]"
              >
                {isExternal ? (
                  <a href={ctaLink}>
                    {settings?.hero_cta_text || "Buy Now"} <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <Link to={ctaLink as any}>
                    {settings?.hero_cta_text || "Buy Now"} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </Button>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center">
            {settings?.hero_media_type === "video" && settings?.hero_video_url ? (
              <div className="relative group/video">
                <video
                  ref={videoRef}
                  src={settings.hero_video_url}
                  className="max-h-[520px] rounded-2xl"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <button
                  onClick={toggleMute}
                  className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              </div>
            ) : (
              <img src={settings?.hero_image_url || heroImg} alt="Hero" className="max-h-[520px] rounded-2xl" />
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <TrustBadges />
      <InstagramSection />
    </div>
  );
}
