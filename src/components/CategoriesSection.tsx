import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
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
    <section className="bg-background">
      <div className="container mx-auto px-3 py-5 md:py-7">
        <div className="-mx-3 flex gap-4 overflow-x-auto px-3 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6">
          <Link
            to="/products"
            className="group flex w-[78px] shrink-0 flex-col items-center gap-2 sm:w-[92px]"
          >
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:scale-105 sm:h-[84px] sm:w-[84px]">
              <LayoutGrid className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <h3 className="text-center text-xs font-semibold leading-tight text-foreground sm:text-sm">
              Categories
            </h3>
          </Link>

          {categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="group flex w-[78px] shrink-0 flex-col items-center gap-2 sm:w-[92px]"
            >
              <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full bg-primary transition-transform duration-300 group-hover:scale-105 sm:h-[84px] sm:w-[84px]">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-bold uppercase text-primary-foreground">
                    {c.name.slice(0, 2)}
                  </div>
                )}
              </div>
              <h3 className="text-center text-xs font-semibold leading-tight text-foreground sm:text-sm">
                {c.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
