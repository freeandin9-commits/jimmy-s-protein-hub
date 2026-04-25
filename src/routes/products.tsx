import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";

export const Route = createFileRoute("/products")({
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

function ProductsPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts(50).then((p) => {
      setProducts(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">The Lineup</p>
        <h1 className="mt-2 font-display text-5xl uppercase tracking-wide md:text-6xl">Shop All</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Every flavor. Every size. Built for the grind.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <h2 className="font-display text-3xl uppercase tracking-wide">No products yet</h2>
          <p className="mt-3 text-muted-foreground">
            Tell us what to add — name, price, flavors — and we'll create it in the store.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => <ProductCard key={p.node.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
