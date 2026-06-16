import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Upload, Plus, Settings2, Image as ImageIcon, Sparkles, Sliders } from "lucide-react";
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
      toast.success("Image uploaded successfully");
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
    toast.success("Shop banner published live");
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
    await supabase
      .from("shop_ads")
      .update(patch as any)
      .eq("id", id);
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
    id ? (categories.find((c) => c.id === id)?.name ?? "—") : "All Products";

  return (
    <div className="max-w-4xl space-y-8 bg-[#0B0F17] p-6 rounded-2xl min-h-screen text-slate-100 pb-16">
      {/* Top Main Header */}
      <div className="flex items-center gap-3 border-b border-slate-800/80 pb-6">
        <div className="bg-slate-800/80 p-2.5 rounded-xl text-[#FACC15] shadow-inner">
          <ImageIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide text-white">Shop Banners</h1>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            Configure target sliders positioned directly underneath the storefront search framework.
          </p>
        </div>
      </div>

      {/* Creator Panel Card */}
      <div className="rounded-xl border border-slate-800 bg-[#141B2B] p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 text-[#FACC15] pb-2 border-b border-slate-800/40">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">Create Campaign Banner</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Campaign Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Seasonal Deal Pack"
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Target Grid Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-[#0B0F17] border-slate-800 text-white focus:ring-[#FACC15]">
                <SelectValue placeholder="Select target scope" />
              </SelectTrigger>
              <SelectContent className="bg-[#141B2B] border-slate-800 text-slate-200">
                <SelectItem value={ALL_VALUE} className="focus:bg-[#FACC15] focus:text-black">
                  All Products fallback context
                </SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="focus:bg-[#FACC15] focus:text-black">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Redirection Target URL
            </Label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/collections/protein-isolate or dynamic external links"
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Media Location Source
            </Label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste remote media CDN URL stream or activate localized upload"
                className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
              />
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-4 text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Asset"}
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

        {/* Preview Frame Component Integration */}
        <div className="space-y-2 pt-2">
          <Label className="text-xs font-semibold text-[#FACC15] uppercase tracking-wider block">
            Positioning Tuning Engine
          </Label>
          <div className="rounded-xl border border-slate-800 bg-[#0B0F17]/60 p-1">
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
        </div>

        <div className="pt-2">
          <Button
            onClick={addAd}
            disabled={saving || uploading}
            className="h-11 bg-[#FACC15] font-extrabold uppercase tracking-widest text-black hover:bg-[#E2B80D] disabled:opacity-40 transition-all duration-200 text-xs shadow-lg shadow-yellow-500/5 px-6"
          >
            {saving ? "Deploying Node..." : "Publish Cluster Banner"}
          </Button>
        </div>
      </div>

      {/* Database Node Table Layer */}
      <div className="rounded-xl border border-slate-800 bg-[#141B2B] p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-[#FACC15] pb-2 border-b border-slate-800/40">
          <Sparkles className="h-4 w-4" />
          <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">Active Queue Registry</h2>
        </div>

        {isLoading ? (
          <div className="py-6 flex justify-center items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
            <div className="h-4 w-4 animate-spin rounded-full border border-slate-600 border-t-transparent" />
            Synchronizing data modules...
          </div>
        ) : ads.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 font-medium italic">
            No interactive banner sets mapped into memory.
          </p>
        ) : (
          <ul className="space-y-6 pt-2">
            {ads.map((ad) => (
              <li
                key={ad.id}
                className="rounded-xl border border-slate-800/80 bg-[#0B0F17]/40 p-4 transition-all hover:border-slate-700/60 shadow-inner"
              >
                {/* Visual Viewport Box */}
                <div className="relative aspect-[16/5] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#0B0F17] md:aspect-[21/6]">
                  <img
                    src={ad.image_url}
                    alt={ad.title || "Banner configuration track"}
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: `${ad.focal_x}% ${ad.focal_y}%`,
                      transform: ad.zoom !== 1 ? `scale(${ad.zoom})` : undefined,
                    }}
                  />
                  {!ad.active && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-red-950 text-red-400 border border-red-900/50 px-3 py-1 rounded-full shadow-lg">
                        Offline Queue Locked
                      </span>
                    </div>
                  )}
                </div>

                {/* Configuration Action Bar */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/40">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="truncate text-sm font-bold text-white">{ad.title || "(Untitled Asset Node)"}</div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span>
                        Scope: <strong className="text-slate-300 font-semibold">{categoryName(ad.category_id)}</strong>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="truncate font-mono text-slate-500">
                        {ad.link_url || "No link parameter mapping"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Select value={ad.category_id ?? ALL_VALUE} onValueChange={(v) => updateCategory(ad.id, v)}>
                      <SelectTrigger className="w-[170px] bg-[#0B0F17] border-slate-800 text-xs h-9 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141B2B] border-slate-800 text-slate-200 text-xs">
                        <SelectItem value={ALL_VALUE}>All Products</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === ad.id ? null : ad.id)}
                      className={`h-9 text-xs font-bold uppercase tracking-wider border transition-all ${
                        expandedId === ad.id
                          ? "bg-[#FACC15] text-black border-[#FACC15] hover:bg-[#E2B80D]"
                          : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Settings2 className="mr-1.5 h-3.5 w-3.5" /> Coordinates
                    </Button>

                    <div className="flex items-center gap-2 bg-[#0B0F17] border border-slate-800 px-3 h-9 rounded-lg shadow-inner">
                      <Switch
                        checked={ad.active}
                        onCheckedChange={(v) => toggleActive(ad.id, v)}
                        className="data-[state=checked]:bg-[#FACC15] data-[state=unchecked]:bg-slate-800"
                      />
                      <span className="text-[11px] font-black uppercase tracking-wider w-6 text-center text-slate-400">
                        {ad.active ? "On" : "Off"}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(ad.id)}
                      className="h-9 w-9 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-transparent hover:border-red-900/40 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Sub-Editor Frame Integration */}
                {expandedId === ad.id && (
                  <div className="mt-4 border-t border-slate-800/80 pt-4 bg-[#0B0F17]/30 p-4 rounded-xl border border-slate-800/50">
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
  const dirty = fitMode !== ad.fit_mode || focalX !== ad.focal_x || focalY !== ad.focal_y || zoom !== ad.zoom;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
        <Sliders className="h-3.5 w-3.5 text-[#FACC15]" />
        <span>Active Matrix Fine-Tuning</span>
      </div>

      <div className="rounded-lg border border-slate-800 bg-[#0B0F17] p-1">
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
      </div>

      <div className="flex justify-end gap-2 pt-1">
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
          className="bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white text-xs font-bold uppercase tracking-wider"
        >
          Reset Engine
        </Button>
        <Button
          size="sm"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ fit_mode: fitMode, focal_x: focalX, focal_y: focalY, zoom });
              toast.success("Coordinates updated");
            } catch (e: any) {
              toast.error(e?.message ?? "Save failed");
            } finally {
              setSaving(false);
            }
          }}
          className="bg-[#FACC15] text-black hover:bg-[#E2B80D] text-xs font-bold uppercase tracking-wider px-4"
        >
          {saving ? "Storing Matrix..." : "Apply Matrix"}
        </Button>
      </div>
    </div>
  );
}
