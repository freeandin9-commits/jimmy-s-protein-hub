import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchProductById, formatPrice, productGallery, type Product } from "@/lib/products";
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
  const [active, setActive] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);

  const gallery = productGallery(product);

  // Auto-rotate the main gallery image every 3.5s
  useEffect(() => {
    if (gallery.length < 2) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % gallery.length);
    }, 3500);
    return () => clearInterval(id);
  }, [gallery.length]);

  const handleAdd = () => {
    if (!product.in_stock) return;
    addItem(pickItemFromProduct(product), qty);
    toast.success(`Added ${qty} × ${product.title}`);
    open();
  };

  const hasCompare =
    product.compare_at_price != null && product.compare_at_price > product.price;
  const discountPct = hasCompare
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div className="flex gap-3">
          {gallery.length > 1 && (
            <div className="flex flex-col gap-2">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-16 w-16 overflow-hidden rounded-md border-2 transition-all md:h-20 md:w-20 ${
                    i === active
                      ? "border-primary shadow-[var(--shadow-glow)]"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 overflow-hidden rounded-2xl bg-card">
            {gallery.length === 0 ? (
              <div className="flex aspect-square items-center justify-center text-muted-foreground">No image</div>
            ) : (
              gallery.map((src, i) => (
                <img
                  key={src + i}
                  src={src}
                  alt={`${product.title} — view ${i + 1}`}
                  className={`aspect-square w-full object-cover transition-opacity duration-700 ease-in-out ${
                    i === active ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
                  }`}
                />
              ))
            )}

            {hasCompare && (
              <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg">
                -{discountPct}% Off
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="font-display text-3xl uppercase leading-tight tracking-wide sm:text-4xl md:text-5xl">{product.title}</h1>
          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <p className="text-3xl font-bold text-primary">
              {formatPrice(product.price, product.currency)}
            </p>
            {hasCompare && (
              <>
                <p className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price!, product.currency)}
                </p>
                <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                  Save {discountPct}%
                </span>
              </>
            )}
          </div>
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
