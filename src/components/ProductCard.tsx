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
  const [qty, setQty] = useState(1);

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
      setImgIdx((i) => (dx < 0 ? (i + 1) % gallery.length : (i - 1 + gallery.length) % gallery.length));
    }
    touchStartX.current = null;
    setTimeout(() => setPaused(false), 1500);
  };

  const hasCompare = product.compare_at_price != null && product.compare_at_price > product.price;
  const discountPct = hasCompare
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
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
    toast.success(`Added ${qty} × ${product.title} to cart`, { position: "top-center" });
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
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,255,0,0.15)] h-full"
    >
      {/* Image Section */}
      <div
        className="relative aspect-[4/5] overflow-hidden bg-secondary/40 w-full"
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
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${
                i === imgIdx ? "scale-100 opacity-100" : "scale-105 opacity-0"
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image available
          </div>
        )}

        {/* Stock Badges & Discounts */}
        <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2">
          {!product.in_stock ? (
            <span className="rounded-md bg-destructive/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-destructive-foreground shadow-sm">
              Sold Out
            </span>
          ) : hasCompare ? (
            <span className="rounded-md bg-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary-foreground shadow-md animate-pulse">
              {discountPct}% OFF
            </span>
          ) : (
            <span className="rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              New
            </span>
          )}
        </div>

        {/* Image Slider Indicators */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {gallery.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  stop(e);
                  setImgIdx(i);
                  setPaused(true);
                  setTimeout(() => setPaused(false), 2500);
                }}
                aria-label={`Show image ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === imgIdx ? "w-4 bg-primary" : "w-1 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info Content */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        {/* Title & Description wrapped with min-height */}
        <div className="flex-1 min-h-[76px]">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide line-clamp-1 group-hover:text-primary transition-colors h-[28px] flex items-center">
            {product.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground/80 min-h-[32px]">
            {product.description}
          </p>
        </div>

        {/* Pricing Area with fixed heights */}
        <div className="mt-3 border-t border-border/40 pt-3 min-h-[54px] flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-foreground">{formatPrice(product.price, product.currency)}</span>
            {hasCompare && (
              <span className="text-xs text-muted-foreground line-through decoration-destructive/60">
                {formatPrice(product.compare_at_price!, product.currency)}
              </span>
            )}
          </div>

          <div className="h-4 mt-0.5">
            {hasCompare && (
              <p className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
                ✨ You save {formatPrice(lineSaved, product.currency)}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex flex-col gap-2" onClick={stop}>
          {/* Quantity Selector & Quick Add */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center rounded-lg border border-border bg-secondary/20 p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  stop(e);
                  setQty((q) => Math.max(1, q - 1));
                }}
                disabled={!product.in_stock}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-7 text-center text-xs font-black text-foreground">{qty}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  stop(e);
                  setQty((q) => q + 1);
                }}
                disabled={!product.in_stock}
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              onClick={handleAdd}
              size="sm"
              variant="outline"
              disabled={!product.in_stock}
              className="h-9 flex-1 rounded-lg font-bold uppercase text-xs border-primary/30 hover:bg-primary/10 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Cart
            </Button>
          </div>

          {/* Buy Now Full Button */}
          <Button
            onClick={handleBuyNow}
            size="sm"
            disabled={!product.in_stock}
            className="h-9 w-full rounded-lg bg-primary font-black uppercase text-xs text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary/90 hover:shadow-lg transition-all"
          >
            <Zap className="mr-1.5 h-3.5 w-3.5 fill-current" />
            {product.in_stock ? "Buy Now" : "Out of Stock"}
          </Button>
        </div>

        {/* Total Value container with reserved layout height */}
        <div className="h-[26px] mt-2">
          {qty > 1 && product.in_stock && (
            <div className="text-center text-[11px] text-muted-foreground bg-secondary/30 py-1 rounded-md border border-border/30">
              Total Value: <span className="font-bold text-foreground">{formatPrice(lineTotal, product.currency)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
