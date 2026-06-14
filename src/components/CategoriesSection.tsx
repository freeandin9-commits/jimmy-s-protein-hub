import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

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
      setShowLeftArrow(scrollLeft > 0);
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

  // Framer Motion Variants for Staggered Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <section className="bg-gradient-to-b from-background to-muted/20 relative group/section overflow-hidden py-4">
      <div className="container mx-auto px-4 relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border border-border shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-3 rounded-full hidden md:flex items-center justify-center transition-all duration-300 animate-in fade-in zoom-in-75"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border border-border shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-3 rounded-full hidden md:flex items-center justify-center transition-all duration-300 animate-in fade-in zoom-in-75"
            aria-label="Scroll Right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Categories Wrapper with Framer Motion */}
        <motion.div
          ref={scrollContainerRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="-mx-3 flex gap-5 overflow-x-auto px-3 pb-4 pt-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
        >
          {/* Static "All Categories" Link */}
          <motion.div variants={itemVariants} className="shrink-0">
            <Link to="/products" className="group flex w-[104px] flex-col items-center gap-3 sm:w-[124px] md:w-[140px]">
              <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-foreground text-background shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:bg-primary group-hover:text-primary-foreground sm:h-[112px] sm:w-[112px] md:h-[128px] md:w-[128px]">
                <LayoutGrid
                  className="h-8 w-8 md:h-9 md:w-9 transition-transform duration-300 group-hover:rotate-12"
                  strokeWidth={2}
                />
              </div>
              <h3 className="text-center text-xs font-bold tracking-wide uppercase text-foreground/80 transition-colors group-hover:text-primary sm:text-sm">
                All Items
              </h3>
            </Link>
          </motion.div>

          {/* Dynamic Categories */}
          {categories.map((c) => (
            <motion.div variants={itemVariants} key={c.id} className="shrink-0">
              <Link
                to="/products"
                search={{ category: c.slug }}
                className="group flex w-[104px] flex-col items-center gap-3 sm:w-[124px] md:w-[140px]"
              >
                <div className="relative h-[96px] w-[96px] overflow-hidden rounded-full bg-muted border border-border/50 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:border-primary/40 sm:h-[112px] sm:w-[112px] md:h-[128px] md:w-[128px]">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg font-black uppercase bg-gradient-to-br from-primary/20 to-primary text-primary-foreground">
                      {c.name.slice(0, 2)}
                    </div>
                  )}
                  {/* Subtle dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <h3 className="text-center text-xs font-bold tracking-wide uppercase text-foreground/80 transition-all duration-300 group-hover:text-primary group-hover:translate-y-[-2px] sm:text-sm line-clamp-1">
                  {c.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
