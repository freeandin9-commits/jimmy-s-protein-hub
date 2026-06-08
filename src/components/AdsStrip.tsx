import { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Ad = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  focal_x?: number | null;
  focal_y?: number | null;
  zoom?: number | null;
};

export function AdsStrip() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: ads = [] } = useQuery({
    queryKey: ["ads", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, image_url, link_url, focal_x, focal_y, zoom")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Ad[];
    },
  });

  // Automatically next slide-lekk povanulla function
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000); // Prathi 4 second-il slide marum (4000ms)

    return () => clearInterval(interval);
  }, [ads, currentIndex]);

  if (ads.length === 0) return null;

  // Slide position smooth aayi scroll cheyyan
  const scrollToSlide = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    
    el.scrollTo({
      left: el.clientWidth * index,
      behavior: "smooth"
    });
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    const nextIndex = currentIndex === 0 ? ads.length - 1 : currentIndex - 1;
    scrollToSlide(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = currentIndex === ads.length - 1 ? 0 : currentIndex + 1;
    scrollToSlide(nextIndex);
  };

  return (
    <section className="bg-background">
      <div className="container relative mx-auto px-4 pt-4">
        {/* Main Slider Wrapper */}
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ads.map((ad) => {
            const fx = ad.focal_x ?? 50;
            const fy = ad.focal_y ?? 50;
            const z = ad.zoom ?? 1;
            const card = (
              <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/8] h-full w-full overflow-hidden rounded-xl border border-border bg-black">
                <img
                  src={ad.image_url}
                  alt={ad.title || "Ad"}
                  className="h-full w-full object-contain"
                  style={{
                    objectPosition: `${fx}% ${fy}%`,
                    transform: z !== 1 ? `scale(${z})` : undefined,
                  }}
                  loading="lazy"
                />
              </div>
            );
            return (
              <div
                key={ad.id}
                className="w-full shrink-0 snap-start" // Ee bhagath w-full nalkiyathinal oru samayath oru slide mathrame kanikku
              >
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

        {/* Left & Right Control Buttons */}
        {ads.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Scroll ads left"
              className="absolute left-6 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur transition-opacity hover:bg-background md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Scroll ads right"
              className="absolute right-6 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur transition-opacity hover:bg-background md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            {/* Slide Indicators (Chinna dots thazhe kanikkan) */}
            <div className="flex justify-center gap-1.5 mt-2">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === index ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
