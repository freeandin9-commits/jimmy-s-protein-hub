import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, formatPrice, SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";
import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdminPage,
});

function ProductsAdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => fetchProducts(50),
  });

  const adminBase = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN.replace(".myshopify.com", "")}.myshopify.com/admin`;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-wide">Products</h1>
          <p className="text-sm text-muted-foreground">
            Products are managed in your Shopify admin. Changes appear on the site automatically.
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <a href={`${adminBase}/products/new`} target="_blank" rel="noopener noreferrer">
            <Plus className="h-4 w-4" /> Add Product
          </a>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-card" />)}
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg text-muted-foreground">No products yet.</p>
          <Button asChild className="mt-4 bg-primary text-primary-foreground">
            <a href={`${adminBase}/products/new`} target="_blank" rel="noopener noreferrer">Add your first product</a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((p) => {
            const node = p.node;
            const img = node.images.edges[0]?.node;
            const id = node.id.split("/").pop();
            return (
              <div key={node.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-square bg-secondary">
                  {img && <img src={img.url} alt={img.altText ?? node.title} className="h-full w-full object-cover" />}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{node.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(node.priceRange.minVariantPrice.amount, node.priceRange.minVariantPrice.currencyCode)}
                    {" • "}{node.variants.edges.length} variant{node.variants.edges.length !== 1 ? "s" : ""}
                  </p>
                  <a
                    href={`${adminBase}/products/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                  >
                    Edit in Shopify <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
