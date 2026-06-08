import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCartStore, pickItemFromProduct } from "@/stores/cartStore";
import { formatPrice, productGallery, type Product } from "@/lib/products";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);
  const [qty, setQty] = useState(0);

  const gallery = productGallery(product);
  const hasMultiple = gallery.length > 1;
  const [imgIdx, setImgIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!hasMultiple || paused) return;
    const t = setInterval(() => {
      setImgIdx((i) => (i + 1) % gallery.length);
    }, 3000);
    return () => clearInterval(t);
  }, [hasMultiple, paused, gallery.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || !hasMultiple) {
      setPaused(false);
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 30) {
      e.preventDefault();
      e.stopPropagation();
      setImgIdx((i) =>
        dx < 0 ? (i + 1) % gallery.length : (i - 1 + gallery.length) % gallery.length,
      );
    }
    touchStartX.current = null;
    setTimeout(() => setPaused(false), 1500);
  };

  const hasCompare =
    product.compare_at_price != null && product.compare_at_price > product.price;
  const discountPct = hasCompare
    ? Math.round(
        ((product.compare_at_price! - product.price) / product.compare_at_price!) * 100,
      )
    : 0;
  const lineTotal = product.price * qty;
  const lineSaved = hasCompare ? (product.compare_at_price! - product.price) * qty : 0;

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAdd = (e: React.MouseEvent) => {
    stop(e);
    if (!product.in_stock) {
      toast.error("Out of stock");
      return;
    }
    addItem(pickItemFromProduct(product), qty);
    toast.success(`Added ${qty} × ${product.title}`, { position: "top-center" });
    open();
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    stop(e);
    if (!product.in_stock) {
      toast.error("Out of stock");
      return;
    }
    addItem(pickItemFromProduct(product), qty);
    open();
  };

  return (
    <Link
      to="/product/$handle"
      params={{ handle: product.id }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary hover:shadow-[var(--shadow-glow)]"
      style={{ width: "325px", height: "366.95px" }}
    >
      <div
        className="relative aspect-square overflow-hidden bg-secondary"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {gallery.length > 0 ? (
          gallery.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt={product.title}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === imgIdx ? "opacity-100" : "opacity-0"
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        {hasCompare && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg">
            -{discountPct}% Off
          </span>
        )}
        {hasMultiple && (
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {gallery.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImgIdx(i);
                  setPaused(true);
                  setTimeout(() => setPaused(false), 2500);
                }}
                aria-label={`Show image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === imgIdx ? "w-5 bg-primary" : "w-1.5 bg-background/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl uppercase tracking-wide">{product.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-4 flex flex-wrap items-baseline gap-2">
          {hasCompare && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compare_at_price!, product.currency)}
            </span>
          )}
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price, product.currency)}
          </span>
          {hasCompare && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Best Price
            </span>
          )}
        </div>

        {hasCompare && (
          <p className="mt-1 text-xs font-semibold text-emerald-500">
            You save {formatPrice(lineSaved, product.currency)}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <div
            className="flex items-center rounded-md border border-border"
            onClick={stop}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={(e) => {
                stop(e);
                setQty((q) => Math.max(1, q - 1));
              }}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center text-sm font-bold">{qty}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={(e) => {
                stop(e);
                setQty((q) => q + 1);
              }}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleAdd}
            size="sm"
            variant="outline"
            disabled={!product.in_stock}
            className="flex-1 font-bold uppercase"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleBuyNow}
            size="sm"
            disabled={!product.in_stock}
            className="flex-1 bg-primary font-bold uppercase text-primary-foreground hover:bg-primary/90"
          >
            <Zap className="h-4 w-4" />
            {product.in_stock ? "Buy Now" : "Sold out"}
          </Button>
        </div>

        {qty > 1 && product.in_stock && (
          <p className="mt-2 text-xs text-muted-foreground">
            Total:{" "}
            <span className="font-bold text-foreground">
              {formatPrice(lineTotal, product.currency)}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
