import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export function CategoriesSection() {
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

  if (categories.length === 0) return null;

  return (
    <section className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Browse</p>
            <h2 className="mt-2 font-display text-3xl uppercase tracking-wide md:text-4xl">
              Shop by Category
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="group flex w-[88px] shrink-0 flex-col items-center gap-2 sm:w-[100px]"
            >
              <div className="relative h-[76px] w-[76px] overflow-hidden rounded-full bg-primary ring-2 ring-primary/40 transition-all duration-300 group-hover:ring-4 group-hover:ring-primary group-hover:scale-105 sm:h-[88px] sm:w-[88px]"
                style={{
                  boxShadow: "0 8px 20px -6px oklch(0.82 0.13 88 / 0.4), inset 0 -4px 10px oklch(0 0 0 / 0.15)",
                }}
              >
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase text-primary-foreground">
                    {c.name.slice(0, 2)}
                  </div>
                )}
              </div>
              <h3 className="text-center text-xs font-semibold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-sm">
                {c.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
