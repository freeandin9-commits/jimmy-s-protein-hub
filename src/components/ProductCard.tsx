import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCartStore, pickItemFromProduct } from "@/stores/cartStore";
import { formatPrice, type Product } from "@/lib/products";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.in_stock) {
      toast.error("Out of stock");
      return;
    }
    addItem(pickItemFromProduct(product), 1);
    toast.success(`Added ${product.title}`, { position: "top-center" });
    open();
  };

  return (
    <Link
      to="/product/$handle"
      params={{ handle: product.id }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary hover:shadow-[var(--shadow-glow)]"
    >
      <div className="aspect-square overflow-hidden bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl uppercase tracking-wide">{product.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compare_at_price != null && product.compare_at_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compare_at_price, product.currency)}
              </span>
            )}
          </span>
          <Button
            onClick={handleAdd}
            size="sm"
            disabled={!product.in_stock}
            className="bg-primary font-bold uppercase text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4" /> {product.in_stock ? "Add" : "Sold out"}
          </Button>
        </div>
      </div>
    </Link>
  );
}
