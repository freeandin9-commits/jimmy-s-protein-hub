import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchProductById, formatPrice, type Product } from "@/lib/products";
import { useCartStore, pickItemFromProduct } from "@/stores/cartStore";
import { ChevronLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ params }) => {
    const product = await fetchProductById(params.handle);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product — Jimmy's Protein" }] };
    return {
      meta: [
        { title: `${p.title} — Jimmy's Protein` },
        { name: "description", content: p.description.slice(0, 155) || `Buy ${p.title} from Jimmy's Protein.` },
        { property: "og:title", content: `${p.title} — Jimmy's Protein` },
        { property: "og:description", content: p.description.slice(0, 155) },
        ...(p.image_url ? [{ property: "og:image", content: p.image_url }, { name: "twitter:image", content: p.image_url }] : []),
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-5xl uppercase tracking-wide">Product not found</h1>
      <Link to="/products" className="mt-6 inline-block text-primary hover:underline">← Back to shop</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-3xl uppercase tracking-wide">Something went wrong</h1>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
      <Link to="/products" className="mt-6 inline-block text-primary hover:underline">← Back to shop</Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);

  const handleAdd = () => {
    if (!product.in_stock) return;
    addItem(pickItemFromProduct(product), qty);
    toast.success(`Added ${qty} × ${product.title}`);
    open();
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-card">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="font-display text-4xl uppercase leading-tight tracking-wide md:text-5xl">{product.title}</h1>
          <p className="mt-3 text-3xl font-bold text-primary">
            {formatPrice(product.price, product.currency)}
          </p>
          <p className="mt-6 whitespace-pre-line text-muted-foreground">{product.description}</p>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleAdd}
              disabled={!product.in_stock}
              className="h-12 flex-1 bg-primary text-base font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4" />
              {product.in_stock ? "Add to Cart" : "Sold Out"}
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Checkout via WhatsApp — confirm your order with us directly.
          </p>
        </div>
      </div>
    </div>
  );
}
