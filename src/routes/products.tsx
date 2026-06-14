import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { fetchProducts, type Product } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const productsSearchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(productsSearchSchema),
  head: () => ({
    meta: [
      { title: "Shop Protein — Jimmy's Protein" },
      {
        name: "description",
        content:
          "Browse the full range of Jimmy's protein powders. Clean ingredients, bold flavors, built for athletes.",
      },
      { property: "og:title", content: "Shop Protein — Jimmy's Protein" },
      { property: "og:description", content: "The full Jimmy's protein lineup." },
    ],
  }),
  component: ProductsPage,
});

type Category = { id: string; name: string; slug: string };

function ProductsPage() {
  const { q, category } = Route.useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  // Build error ഒഴിവാക്കാൻ settings-നെ സുരക്ഷിതമായി (any എന്ന് കാസ്റ്റ് ചെയ്ത്) റീഡ് ചെയ്യുന്നു
  const sideBanners = useMemo(() => {
    if (!settings) return [];
    const anySettings = settings as any;
    return [anySettings.shop_side_banner_1, anySettings.shop_side_banner_2].filter(Boolean) as string[];
  }, [settings]);

  useEffect(() => {
    fetchProducts(200)
      .then((p) => {
        setProducts(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const activeCategory = useMemo(() => categories.find((c) => c.slug === category) || null, [categories, category]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCategory && p.category_id !== activeCategory.id) return false;
      if (term) {
        const hay = `${p.title} ${p.description}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [products, q, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  return (
    <div className="light-theme flex-1 bg-background">
      <SearchBar />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <header className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">The Lineup</p>
          <h1 className="mt-2 font-display text-5xl uppercase tracking-wide md:text-6xl">
            {activeCategory ? activeCategory.name : q ? `Results for "${q}"` : "Shop All"}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Every flavor. Every size. Built for the grind.</p>
          {(q || activeCategory) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {q && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
                  Search: {q}
                  <Link to="/products" search={{ q: "", category }} aria-label="Clear search">
                    <X className="h-3 w-3" />
                  </Link>
                </span>
              )}
              {activeCategory && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
                  Category: {activeCategory.name}
                  <Link to="/products" search={{ q, category: "" }} aria-label="Clear category">
                    <X className="h-3 w-3" />
                  </Link>
                </span>
              )}
            </div>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-6">
            {/* CATEGORIES NAVIGATION */}
            <div className="card-3d rounded-xl border border-border/60 p-5">
              <h2 className="mb-4 font-display text-sm uppercase tracking-widest text-primary">Categories</h2>
              <nav className="flex flex-col gap-1">
                <Link
                  to="/products"
                  search={{ q, category: "" }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    !activeCategory
                      ? "bg-primary/15 font-semibold text-primary"
                      : "hover:bg-secondary/60 text-foreground/80"
                  }`}
                >
                  <span>All Products</span>
                  <span className="text-xs text-muted-foreground">{products.length}</span>
                </Link>
                {categories.map((c) => {
                  const active = activeCategory?.id === c.id;
                  return (
                    <Link
                      key={c.id}
                      to="/products"
                      search={{ q, category: c.slug }}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        active ? "bg-primary/15 font-semibold text-primary" : "hover:bg-secondary/60 text-foreground/80"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-muted-foreground">{categoryCounts[c.id] ?? 0}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* SIDE PROMO BANNERS */}
            {sideBanners.length > 0 && (
              <div className="flex flex-col gap-4">
                {sideBanners.map((url, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-border/60 shadow-md hover:shadow-lg transition-shadow bg-card"
                  >
                    <img
                      src={url}
                      alt={`Promo Banner ${index + 1}`}
                      className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </aside>

          <div>
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-card" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-16 text-center">
                <h2 className="font-display text-3xl uppercase tracking-wide">No products found</h2>
                <p className="mt-3 text-muted-foreground">
                  {q || activeCategory
                    ? "Try a different search or category."
                    : "Add products from the admin panel to see them here."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
