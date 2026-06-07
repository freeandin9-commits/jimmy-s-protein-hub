import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

type Props = {
  imageUrl: string;
  fitMode: "cover" | "contain";
  focalX: number;
  focalY: number;
  zoom: number;
  onChange: (v: { fitMode: "cover" | "contain"; focalX: number; focalY: number; zoom: number }) => void;
};

export function AdFitPreview({ imageUrl, fitMode, focalX, focalY, zoom, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);

  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging || !start.current || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const p = "touches" in e ? e.touches[0] : (e as MouseEvent);
      const dx = p.clientX - start.current.x;
      const dy = p.clientY - start.current.y;
      // Drag image: moving right should reveal left side → focal_x decreases
      const nx = clamp(start.current.fx - (dx / rect.width) * 100);
      const ny = clamp(start.current.fy - (dy / rect.height) * 100);
      onChange({ fitMode, focalX: nx, focalY: ny, zoom });
    };
    const onUp = () => setDragging(false);
    if (dragging) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchend", onUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, fitMode, zoom, onChange]);

  const beginDrag = (clientX: number, clientY: number) => {
    if (fitMode !== "cover") return;
    start.current = { x: clientX, y: clientY, fx: focalX, fy: focalY };
    setDragging(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={fitMode === "contain"}
            onCheckedChange={(v) => onChange({ fitMode: v ? "contain" : "cover", focalX, focalY, zoom })}
          />
          <span className="text-sm">Show full picture (no crop)</span>
        </div>
        <div className="flex min-w-[200px] flex-1 items-center gap-3">
          <Label className="text-xs">Zoom</Label>
          <Slider
            min={1}
            max={3}
            step={0.05}
            value={[zoom]}
            onValueChange={([v]) => onChange({ fitMode, focalX, focalY, zoom: v })}
            disabled={fitMode === "contain"}
          />
          <span className="w-10 text-right text-xs tabular-nums">{zoom.toFixed(2)}x</span>
        </div>
      </div>

      <div
        ref={ref}
        onMouseDown={(e) => beginDrag(e.clientX, e.clientY)}
        onTouchStart={(e) => beginDrag(e.touches[0].clientX, e.touches[0].clientY)}
        className={`relative aspect-[16/5] w-full select-none overflow-hidden rounded-xl border border-border bg-card md:aspect-[16/4] ${fitMode === "cover" ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="preview"
            draggable={false}
            className={`pointer-events-none h-full w-full ${fitMode === "contain" ? "object-contain" : "object-cover"}`}
            style={{
              objectPosition: `${focalX}% ${focalY}%`,
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Upload or paste an image URL to preview
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {fitMode === "cover"
          ? "Drag the image to set focal point. Adjust zoom to fit. This matches how it appears on the homepage."
          : "Full image is shown without cropping. May have empty space on sides."}
      </p>
    </div>
  );
}
