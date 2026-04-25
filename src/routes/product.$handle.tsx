import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchProductByHandle, formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ChevronLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ params }) => {
    const product = await fetchProductByHandle(params.handle);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product — Jimmy's Protein" }] };
    const img = p.images.edges[0]?.node.url;
    return {
      meta: [
        { title: `${p.title} — Jimmy's Protein` },
        { name: "description", content: p.description.slice(0, 155) || `Buy ${p.title} from Jimmy's Protein.` },
        { property: "og:title", content: `${p.title} — Jimmy's Protein` },
        { property: "og:description", content: p.description.slice(0, 155) },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
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
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const variants = product.variants.edges.map((e) => e.node);
  const [variantId, setVariantId] = useState<string>(
    variants.find((v) => v.availableForSale)?.id ?? variants[0]?.id ?? "",
  );
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const img = product.images.edges[0]?.node;

  const handleAdd = () => {
    if (!variant) return;
    addItem(
      {
        productId: product.id,
        productTitle: product.title,
        productHandle: product.handle,
        image: img?.url,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        selectedOptions: variant.selectedOptions,
      },
      qty,
    );
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
          {img ? (
            <img src={img.url} alt={img.altText ?? product.title} className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="font-display text-4xl uppercase leading-tight tracking-wide md:text-5xl">{product.title}</h1>
          <p className="mt-3 text-3xl font-bold text-primary">
            {variant ? formatPrice(variant.price.amount, variant.price.currencyCode) : "—"}
          </p>
          <p className="mt-6 whitespace-pre-line text-muted-foreground">{product.description}</p>

          {variants.length > 1 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-bold uppercase tracking-wider">Variant</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={!v.availableForSale}
                    className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
                      v.id === variantId
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              disabled={!variant?.availableForSale}
              className="h-12 flex-1 bg-primary text-base font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4" />
              {variant?.availableForSale ? "Add to Cart" : "Sold Out"}
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
