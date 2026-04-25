import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCartStore, pickDefaultItemFromProduct } from "@/stores/cartStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const p = product.node;
  const img = p.images.edges[0]?.node;
  const price = p.priceRange.minVariantPrice;
  const addItem = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = pickDefaultItemFromProduct(p);
    if (!item) {
      toast.error("Product unavailable");
      return;
    }
    addItem(item, 1);
    toast.success(`Added ${p.title}`, { position: "top-center" });
    open();
  };

  return (
    <Link
      to="/product/$handle"
      params={{ handle: p.handle }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary hover:shadow-[var(--shadow-glow)]"
    >
      <div className="aspect-square overflow-hidden bg-secondary">
        {img ? (
          <img
            src={img.url}
            alt={img.altText ?? p.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl uppercase tracking-wide">{p.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
          <Button
            onClick={handleAdd}
            size="sm"
            className="bg-primary font-bold uppercase text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </Link>
  );
}
