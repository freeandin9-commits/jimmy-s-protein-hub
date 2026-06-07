import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Ad = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  fit_mode?: string | null;
  focal_x?: number | null;
  focal_y?: number | null;
  zoom?: number | null;
};

export function AdsCarousel() {
  const { data: ads = [] } = useQuery({
    queryKey: ["ads", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, image_url, link_url, fit_mode, focal_x, focal_y, zoom")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Ad[];
    },
  });

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (ads.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % ads.length), 4000);
    return () => clearInterval(t);
  }, [ads.length]);

  if (ads.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 pt-4">
        <div className="relative aspect-[16/5] w-full overflow-hidden rounded-xl border border-border bg-card md:aspect-[16/4]">
          {ads.map((ad, i) => {
            const fx = ad.focal_x ?? 50;
            const fy = ad.focal_y ?? 50;
            const z = ad.zoom ?? 1;
            const img = (
              <img
                src={ad.image_url}
                alt={ad.title || "Ad"}
                className="h-full w-full object-cover"
                style={{ objectPosition: `${fx}% ${fy}%`, transform: z !== 1 ? `scale(${z})` : undefined }}
                loading={i === 0 ? "eager" : "lazy"}
              />
            );
            return (
              <div
                key={ad.id}
                className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
              >
                {ad.link_url ? (
                  <a href={ad.link_url} target={ad.link_url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block h-full w-full">
                    {img}
                  </a>
                ) : (
                  img
                )}
              </div>
            );
          })}

          {ads.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {ads.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Go to ad ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-2 bg-white/60"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
