import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ShopAd = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  category_id: string | null;
  focal_x: number | null;
  focal_y: number | null;
  zoom: number | null;
};

export function ShopAdsCarousel({ categoryId }: { categoryId: string | null }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const { data: ads = [] } = useQuery({
    queryKey: ["shop_ads", "public", categoryId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("shop_ads")
        .select("id, title, image_url, link_url, category_id, focal_x, focal_y, zoom")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (categoryId) q = q.eq("category_id", categoryId);
      else q = q.is("category_id", null);
      const { data, error } = await q;
      if (error) throw error;
      return data as ShopAd[];
    },
  });

  useEffect(() => {
    setIdx(0);
  }, [categoryId]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => {
        const next = (i + 1) % ads.length;
        scrollerRef.current?.scrollTo({ left: scrollerRef.current.clientWidth * next, behavior: "smooth" });
        return next;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const goto = (i: number) => {
    setIdx(i);
    scrollerRef.current?.scrollTo({ left: scrollerRef.current.clientWidth * i, behavior: "smooth" });
  };

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 pt-4">
        <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {ads.map((ad) => {
              const fx = ad.focal_x ?? 50;
              const fy = ad.focal_y ?? 50;
              const z = ad.zoom ?? 1;
              const card = (
                <div className="relative aspect-[16/6] md:aspect-[21/7] w-full overflow-hidden bg-black">
                  <img
                    src={ad.image_url}
                    alt={ad.title || "Shop banner"}
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: `${fx}% ${fy}%`,
                      transform: z !== 1 ? `scale(${z})` : undefined,
                    }}
                    loading="lazy"
                  />
                </div>
              );
              return (
                <div key={ad.id} className="w-full shrink-0 snap-start">
                  {ad.link_url ? (
                    <a
                      href={ad.link_url}
                      target={ad.link_url.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </div>
              );
            })}
          </div>

          {ads.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goto(idx === 0 ? ads.length - 1 : idx - 1)}
                aria-label="Previous banner"
                className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur hover:bg-background md:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goto((idx + 1) % ads.length)}
                aria-label="Next banner"
                className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur hover:bg-background md:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {ads.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goto(i)}
                    aria-label={`Go to banner ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-primary" : "w-1.5 bg-white/70"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
