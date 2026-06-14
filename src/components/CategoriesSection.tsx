import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export function CategoriesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  // സ്ക്രോൾ പൊസിഷൻ ചെക്ക് ചെയ്യാനുള്ള ഫങ്ഷൻ
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      // 1px ബഫർ നൽകിയിട്ടുണ്ട് കൃത്യത ഉറപ്പാക്കാൻ
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  // ബട്ടൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ സ്ക്രോൾ ചെയ്യാനുള്ള ആക്ഷൻ
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // ഒരു ക്ലിക്കിൽ എത്ര ദൂരം സ്ക്രോൾ ചെയ്യണം
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (categories.length === 0) return null;

  return (
    <section className="bg-background relative group/section">
      <div className="container mx-auto px-3 py-5 md:py-7 relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background border shadow-md p-2 rounded-full hidden md:flex items-center justify-center transition-all duration-200"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background border shadow-md p-2 rounded-full hidden md:flex items-center justify-center transition-all duration-200"
            aria-label="Scroll Right"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        )}

        {/* Categories Wrapper */}
        <div
          ref={scrollContainerRef}
          className="-mx-3 flex gap-4 overflow-x-auto px-3 pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
        >
          <Link
            to="/products"
            className="group flex w-[104px] shrink-0 flex-col items-center gap-2 sm:w-[124px] md:w-[140px]"
          >
            <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:scale-105 sm:h-[112px] sm:w-[112px] md:h-[128px] md:w-[128px]">
              <LayoutGrid className="h-9 w-9 md:h-10 md:w-10" strokeWidth={2.5} />
            </div>
            <h3 className="text-center text-sm font-semibold leading-tight text-foreground sm:text-base">Categories</h3>
          </Link>

          {categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="group flex w-[104px] shrink-0 flex-col items-center gap-2 sm:w-[124px] md:w-[140px]"
            >
              <div className="relative h-[96px] w-[96px] overflow-hidden rounded-full bg-primary transition-transform duration-300 group-hover:scale-105 sm:h-[112px] sm:w-[112px] md:h-[128px] md:w-[128px]">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-base font-bold uppercase text-primary-foreground">
                    {c.name.slice(0, 2)}
                  </div>
                )}
              </div>
              <h3 className="text-center text-sm font-semibold leading-tight text-foreground sm:text-base">{c.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
