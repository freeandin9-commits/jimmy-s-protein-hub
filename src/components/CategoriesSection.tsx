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

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 2);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  // കാറ്റഗറി ഡാറ്റ മാറുമ്പോഴും വിൻഡോ റീസൈസ് ചെയ്യുമ്പോഴും സ്ക്രോൾ ബട്ടണുകൾ അപ്ഡേറ്റ് ചെയ്യാൻ
  useEffect(() => {
    const timeoutId = setTimeout(checkScroll, 300);
    window.addEventListener("resize", checkScroll);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  // മൗസ് വീൽ വശങ്ങളിലേക്ക് സ്ക്രോൾ ചെയ്യാനുള്ള സുരക്ഷിതമായ റിയാക്ട് ഫങ്ക്ഷൻ
  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && e.deltaY !== 0) {
      // ഡെസ്ക്ടോപ്പിൽ താഴേക്ക് സ്ക്രോൾ ചെയ്യുമ്പോൾ കാറ്റഗറി റൈറ്റ് സൈഡിലേക്ക് നീങ്ങും
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (categories.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-background to-muted/30 relative group/section py-6 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border border-border/60 shadow-lg p-3 rounded-full hidden md:flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border border-border/60 shadow-lg p-3 rounded-full hidden md:flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95"
            aria-label="Scroll Right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Categories Wrapper */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onWheel={handleWheelScroll}
          className="-mx-3 flex gap-5 overflow-x-auto px-3 pb-4 pt-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
        >
          {/* All Categories Static Link */}
          <div className="shrink-0">
            <Link to="/products" className="group flex w-[104px] flex-col items-center gap-3 sm:w-[124px] md:w-[140px]">
              <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-foreground text-background shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:bg-primary group-hover:text-primary-foreground sm:h-[112px] sm:w-[112px] md:h-[128px] md:w-[128px]">
                <LayoutGrid
                  className="h-8 w-8 md:h-9 md:w-9 transition-transform duration-500 group-hover:rotate-12"
                  strokeWidth={2}
                />
              </div>
              <h3 className="text-center text-xs font-bold tracking-wide uppercase text-foreground/80 transition-all duration-300 group-hover:text-primary group-hover:translate-y-[-2px] sm:text-sm">
                All Items
              </h3>
            </Link>
          </div>

          {/* Dynamic Categories */}
          {categories.map((c) => (
            <div key={c.id} className="shrink-0">
              <Link
                to="/products"
                search={{ category: c.slug }}
                className="group flex w-[104px] flex-col items-center gap-3 sm:w-[124px] md:w-[140px]"
              >
                <div className="relative h-[96px] w-[96px] overflow-hidden rounded-full bg-muted border border-border/40 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:border-primary/30 sm:h-[112px] sm:w-[112px] md:h-[128px] md:w-[128px]">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      onLoad={checkScroll}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg font-black uppercase bg-gradient-to-br from-primary/10 to-primary/30 text-primary">
                      {c.name.slice(0, 2)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <h3 className="text-center text-xs font-bold tracking-wide uppercase text-foreground/80 transition-all duration-300 group-hover:text-primary group-hover:translate-y-[-2px] sm:text-sm line-clamp-1">
                  {c.name}
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
