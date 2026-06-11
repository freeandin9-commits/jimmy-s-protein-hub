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

const productsSearchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(productsSearchSchema),
  head: () => ({
    meta: [
      { title: "Shop Protein — Jimmy's Protein" },
      { name: "description", content: "Browse the full range of Jimmy's protein powders. Clean ingredients, bold flavors, built for athletes." },
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

  useEffect(() => {
    fetchProducts(200).then((p) => {
      setProducts(p);
      setLoading(false);
    }).catch(() => setLoading(false));
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

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === category) || null,
    [categories, category],
  );

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
    <div className="theme-light bg-background text-foreground">
      <SearchBar />

      {/* Hero header */}
      <div
        className="relative overflow-hidden border-b border-border"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: "var(--gradient-mesh)" }}
        />
        <div className="container relative mx-auto px-4 py-14 md:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            The Lineup
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase tracking-tight text-foreground md:text-7xl">
            {activeCategory ? activeCategory.name : q ? `Results for "${q}"` : "Shop All"}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Every flavor. Every size. Built for the grind.
          </p>
          {(q || activeCategory) && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {q && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium shadow-sm">
                  Search: {q}
                  <Link to="/products" search={{ q: "", category }} aria-label="Clear search">
                    <X className="h-3 w-3" />
                  </Link>
                </span>
              )}
              {activeCategory && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium shadow-sm">
                  Category: {activeCategory.name}
                  <Link to="/products" search={{ q, category: "" }} aria-label="Clear category">
                    <X className="h-3 w-3" />
                  </Link>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 font-display text-xs uppercase tracking-[0.2em] text-primary">
                Categories
              </h2>
              <nav className="flex flex-col gap-1">
                <Link
                  to="/products"
                  search={{ q, category: "" }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    !activeCategory
                      ? "bg-primary/15 font-semibold text-foreground"
                      : "text-foreground/75 hover:bg-secondary"
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
                        active
                          ? "bg-primary/15 font-semibold text-foreground"
                          : "text-foreground/75 hover:bg-secondary"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {categoryCounts[c.id] ?? 0}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div>
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
                <h2 className="font-display text-3xl uppercase tracking-wide">No products found</h2>
                <p className="mt-3 text-muted-foreground">
                  {q || activeCategory ? "Try a different search or category." : "Add products from the admin panel to see them here."}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                    {filtered.length === 1 ? "product" : "products"}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

