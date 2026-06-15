import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Upload, Plus, Settings2, Image as ImageIcon } from "lucide-react";
import { AdFitPreview } from "@/components/admin/AdFitPreview";

export const Route = createFileRoute("/admin/shop-ads")({
  component: ShopAdsPage,
});

type ShopAd = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  category_id: string | null;
  active: boolean;
  sort_order: number;
  fit_mode: "cover" | "contain";
  focal_x: number;
  focal_y: number;
  zoom: number;
};

type Category = { id: string; name: string; slug: string };

const ALL_VALUE = "__all__";

function ShopAdsPage() {
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories", "shop-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["admin", "shop_ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_ads")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((a) => ({
        ...a,
        fit_mode: (a.fit_mode ?? "cover") as "cover" | "contain",
        focal_x: Number(a.focal_x ?? 50),
        focal_y: Number(a.focal_y ?? 50),
        zoom: Number(a.zoom ?? 1),
      })) as ShopAd[];
    },
  });

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [categoryId, setCategoryId] = useState<string>(ALL_VALUE);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [focalX, setFocalX] = useState(50);
  const [focalY, setFocalY] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `shop-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("ads").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = await supabase.storage.from("ads").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (!data?.signedUrl) throw new Error("Failed to get URL");
      setImageUrl(data.signedUrl);
      toast.success("Image uploaded — adjust fit then publish");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addAd = async () => {
    if (!imageUrl) {
      toast.error("Add an image URL or upload a file");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("shop_ads").insert({
      title,
      image_url: imageUrl,
      link_url: linkUrl || null,
      category_id: categoryId === ALL_VALUE ? null : categoryId,
      active: true,
      sort_order: ads.length,
      fit_mode: fitMode,
      focal_x: focalX,
      focal_y: focalY,
      zoom,
    } as any);
    setSaving(false);
    if (error) return toast.error(error.message);
    setTitle("");
    setImageUrl("");
    setLinkUrl("");
    setCategoryId(ALL_VALUE);
    setFitMode("cover");
    setFocalX(50);
    setFocalY(50);
    setZoom(1);
    qc.invalidateQueries({ queryKey: ["admin", "shop_ads"] });
    qc.invalidateQueries({ queryKey: ["shop_ads", "public"] });
    toast.success("Shop banner published");
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("shop_ads").update({ active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "shop_ads"] });
    qc.invalidateQueries({ queryKey: ["shop_ads", "public"] });
  };

  const updateCategory = async (id: string, value: string) => {
    const newCategoryId = value === ALL_VALUE ? null : value;
    await supabase.from("shop_ads").update({ category_id: newCategoryId }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "shop_ads"] });
    qc.invalidateQueries({ queryKey: ["shop_ads", "public"] });
  };

  const updateFit = async (
    id: string,
    patch: { fit_mode?: string; focal_x?: number; focal_y?: number; zoom?: number },
  ) => {
    await supabase.from("shop_ads").update(patch as any).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "shop_ads"] });
    qc.invalidateQueries({ queryKey: ["shop_ads", "public"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await supabase.from("shop_ads").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "shop_ads"] });
    qc.invalidateQueries({ queryKey: ["shop_ads", "public"] });
    toast.success("Banner deleted");
  };

  const categoryName = (id: string | null) =>
    id ? categories.find((c) => c.id === id)?.name ?? "—" : "All Products";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide flex items-center gap-2">
          <ImageIcon className="h-7 w-7" /> Shop Banners
        </h1>
        <p className="text-sm text-muted-foreground">
          Slider banners shown on the Shop page under the search bar. Pick a category to show the banner only on that
          category — or choose <strong>All Products</strong> to show it when no category is selected.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-display text-2xl uppercase tracking-wide flex items-center gap-2">
          <Plus className="h-5 w-5" /> New Banner
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer Sale" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Products (shown when no category selected)</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Link URL (optional)</Label>
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/products or https://…" />
          </div>
          <div className="md:col-span-2">
            <Label>Image URL</Label>
            <div className="flex gap-2">
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://… or upload" />
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-semibold hover:bg-secondary">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Fit & Position Preview</Label>
          <AdFitPreview
            imageUrl={imageUrl}
            fitMode={fitMode}
            focalX={focalX}
            focalY={focalY}
            zoom={zoom}
            onChange={(v) => {
              setFitMode(v.fitMode);
              setFocalX(v.focalX);
              setFocalY(v.focalY);
              setZoom(v.zoom);
            }}
          />
        </div>

        <Button onClick={addAd} disabled={saving || uploading}>
          {saving ? "Publishing…" : "Publish Banner"}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide">All Banners</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : ads.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No banners yet.</p>
        ) : (
          <ul className="mt-4 space-y-5">
            {ads.map((ad) => (
              <li key={ad.id} className="rounded-lg border border-border p-3">
                <div className="relative aspect-[16/6] w-full overflow-hidden rounded-lg border border-border bg-card md:aspect-[21/7]">
                  <img
                    src={ad.image_url}
                    alt={ad.title || "Banner preview"}
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: `${ad.focal_x}% ${ad.focal_y}%`,
                      transform: ad.zoom !== 1 ? `scale(${ad.zoom})` : undefined,
                    }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{ad.title || "(no title)"}</div>
                    <div className="text-xs text-muted-foreground">
                      Category: <span className="font-semibold">{categoryName(ad.category_id)}</span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{ad.link_url || "no link"}</div>
                  </div>

                  <Select
                    value={ad.category_id ?? ALL_VALUE}
                    onValueChange={(v) => updateCategory(ad.id, v)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_VALUE}>All Products</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === ad.id ? null : ad.id)}
                  >
                    <Settings2 className="mr-1 h-4 w-4" /> Adjust
                  </Button>
                  <div className="flex items-center gap-2">
                    <Switch checked={ad.active} onCheckedChange={(v) => toggleActive(ad.id, v)} />
                    <span className="text-xs">{ad.active ? "On" : "Off"}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(ad.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {expandedId === ad.id && (
                  <div className="mt-4 border-t border-border pt-4">
                    <BannerFitEditor ad={ad} onSave={(patch) => updateFit(ad.id, patch)} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BannerFitEditor({
  ad,
  onSave,
}: {
  ad: ShopAd;
  onSave: (patch: { fit_mode: string; focal_x: number; focal_y: number; zoom: number }) => Promise<void> | void;
}) {
  const [fitMode, setFitMode] = useState<"cover" | "contain">(ad.fit_mode);
  const [focalX, setFocalX] = useState(ad.focal_x);
  const [focalY, setFocalY] = useState(ad.focal_y);
  const [zoom, setZoom] = useState(ad.zoom);
  const [saving, setSaving] = useState(false);
  const dirty =
    fitMode !== ad.fit_mode || focalX !== ad.focal_x || focalY !== ad.focal_y || zoom !== ad.zoom;

  return (
    <div className="space-y-3">
      <AdFitPreview
        imageUrl={ad.image_url}
        fitMode={fitMode}
        focalX={focalX}
        focalY={focalY}
        zoom={zoom}
        onChange={(v) => {
          setFitMode(v.fitMode);
          setFocalX(v.focalX);
          setFocalY(v.focalY);
          setZoom(v.zoom);
        }}
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!dirty || saving}
          onClick={() => {
            setFitMode(ad.fit_mode);
            setFocalX(ad.focal_x);
            setFocalY(ad.focal_y);
            setZoom(ad.zoom);
          }}
        >
          Reset
        </Button>
        <Button
          size="sm"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ fit_mode: fitMode, focal_x: focalX, focal_y: focalY, zoom });
              toast.success("Saved");
            } catch (e: any) {
              toast.error(e?.message ?? "Save failed");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
