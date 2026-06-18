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
  const [isMuted, setIsMuted] = useState(true); // Default to muted
  const { settings } = useSiteSettings();

  const whatsappNumber = settings?.whatsapp_number || "919142027275";
  const displayPhone = settings?.contact_phone || "919142027275";
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Intersection Observer to auto-mute when video leaves viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          // If the video is in view, use the current isMuted state
          // If the video is out of view, force mute it
          videoRef.current.muted = entry.isIntersecting ? isMuted : true;
        }
      },
      { threshold: 0.5 },
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isMuted]); // Re-run when isMuted changes

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuteState = !videoRef.current.muted;
      videoRef.current.muted = newMuteState;
      setIsMuted(newMuteState);
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

  return (
    <div className="relative w-full">
      {/* SEARCH BAR & ADS STRIP */}
      <div className="sticky top-[73px] z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
        <SearchBar />
        <AdsStrip />
      </div>

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

        <div className="container relative mx-auto grid min-h-[640px] gap-10 px-4 py-16 md:grid-cols-2 md:py-20 lg:py-28">
          <div className="relative z-10 flex flex-col justify-center">
            <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight md:text-6xl lg:text-7xl xl:text-[5.5rem]">
              <span className="text-foreground">{settings?.hero_headline}</span>
            </h1>
          </div>

          <div className="relative z-10 flex items-center justify-center [perspective:1200px]">
            <div className="relative animate-[float_6s_ease-in-out_infinite]">
              {settings?.hero_media_type === "video" && settings?.hero_video_url ? (
                <div className="relative group/video">
                  <video
                    ref={videoRef}
                    src={settings.hero_video_url}
                    className="relative max-h-[520px] w-auto rounded-2xl object-cover"
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                  />
                  <button
                    onClick={toggleMute}
                    type="button"
                    className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-destructive" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-primary" />
                    )}
                  </button>
                </div>
              ) : (
                <img
                  src={settings?.hero_image_url || heroImg}
                  alt="Jimmy's Protein"
                  className="relative max-h-[520px] w-auto rounded-2xl"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Rest of your content... */}
    </div>
  );
}
