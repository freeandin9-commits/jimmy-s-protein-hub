import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Upload, Plus, Settings2, Megaphone, Eye, RefreshCw, Link2, Image as ImageIcon } from "lucide-react";
import { AdFitPreview } from "@/components/admin/AdFitPreview";

export const Route = createFileRoute("/admin/ads")({
  component: AdsPage,
});

type Ad = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  active: boolean;
  sort_order: number;
  fit_mode: "cover" | "contain";
  focal_x: number;
  focal_y: number;
  zoom: number;
};

function AdsPage() {
  const qc = useQueryClient();
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["admin", "ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
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
      })) as Ad[];
    },
  });

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
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
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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
      toast.error("Please add an image URL or upload a file");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("ads").insert({
      title,
      image_url: imageUrl,
      link_url: linkUrl,
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
    setFitMode("cover");
    setFocalX(50);
    setFocalY(50);
    setZoom(1);
    qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    qc.invalidateQueries({ queryKey: ["ads", "public"] });
    toast.success("New promotion published live");
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("ads").update({ active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    qc.invalidateQueries({ queryKey: ["ads", "public"] });
    toast.success(active ? "Ad activated" : "Ad deactivated");
  };

  const updateFit = async (
    id: string,
    patch: { fit_mode?: string; focal_x?: number; focal_y?: number; zoom?: number },
  ) => {
    await supabase
      .from("ads")
      .update(patch as any)
      .eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    qc.invalidateQueries({ queryKey: ["ads", "public"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this ad?")) return;
    await supabase.from("ads").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    qc.invalidateQueries({ queryKey: ["ads", "public"] });
    toast.success("Ad entry removed");
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Megaphone className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
            Promotional Ads
          </h1>
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-12">
          Manage dynamic header and banner marketing ads shown on the landing page storefront.
        </p>
      </div>

      {/* Grid Layout Container */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Creator Form */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sticky top-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200">
              Create Campaign Ad
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold tracking-wider text-zinc-500">
                Campaign Title (Optional)
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ultimate Summer Flash Sale"
                className="h-10 text-xs font-medium placeholder:text-zinc-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold tracking-wider text-zinc-500">
                Redirect Link URL (Optional)
              </Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="e.g., /products/protein-deals"
                className="h-10 text-xs font-medium placeholder:text-zinc-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold tracking-wider text-zinc-500">Creative Asset Image</Label>
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste direct CDN link or upload"
                  className="h-10 text-xs font-medium placeholder:text-zinc-400"
                />
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors shrink-0">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading" : "Upload"}
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

          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <Label className="text-xs uppercase font-bold tracking-wider text-zinc-500 block">
              Focal Alignment & Zoom Preview
            </Label>
            <div className="rounded-xl overflow-hidden border border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
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

          <Button
            onClick={addAd}
            disabled={saving || uploading}
            className="w-full h-11 text-xs font-bold uppercase tracking-wider shadow-sm transition-transform active:scale-[0.99]"
          >
            {saving ? "Publishing Active Ad..." : "Publish Campaign Live"}
          </Button>
        </div>

        {/* Right Column: Dynamic Feed List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-zinc-400" />
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200">
                Active Board Pipeline ({ads.length})
              </h2>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Fetching Ads Feed...
              </p>
            </div>
          ) : ads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl mb-3 text-zinc-400">
                <ImageIcon className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                No banner creatives found
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Fill out the campaign form to publish your first display header ad.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className={`group rounded-2xl border bg-white shadow-sm dark:bg-zinc-900 overflow-hidden transition-all duration-200 ${
                    ad.active
                      ? "border-zinc-200 dark:border-zinc-800"
                      : "border-zinc-200/50 opacity-65 dark:border-zinc-800/40"
                  }`}
                >
                  {/* Banner Creative Canvas */}
                  <div className="relative aspect-[16/4.5] w-full overflow-hidden bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                    <img
                      src={ad.image_url}
                      alt={ad.title || "Ad placement template"}
                      className="h-full w-full object-cover select-none transition-transform duration-300 group-hover:scale-[1.01]"
                      style={{
                        objectPosition: `${ad.focal_x}% ${ad.focal_y}%`,
                        transform: ad.zoom !== 1 ? `scale(${ad.zoom})` : undefined,
                      }}
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-100 shadow-sm border border-white/10">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${ad.active ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`}
                      />
                      {ad.active ? "Live" : "Inactive"}
                    </div>
                  </div>

                  {/* Operational Settings Dashboard Row */}
                  <div className="p-4 flex flex-wrap items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                          {ad.title || (
                            <span className="italic opacity-60 font-medium lowercase">(Untitled Campaign)</span>
                          )}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground font-medium">
                        {ad.link_url && (
                          <div className="flex items-center gap-1 text-primary lowercase truncate">
                            <Link2 className="h-3 w-3 shrink-0" />
                            {ad.link_url}
                          </div>
                        )}
                        <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                          Pos: {Math.round(ad.focal_x)}%x/{Math.round(ad.focal_y)}%y · Scale: {ad.zoom.toFixed(2)}x ·
                          Order #{ad.sort_order}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Controls Toggle */}
                      <div className="flex items-center gap-2 rounded-lg bg-white border border-zinc-200 px-3 py-1.5 dark:bg-zinc-950 dark:border-zinc-800 shadow-sm">
                        <Switch
                          checked={ad.active}
                          onCheckedChange={(v) => toggleActive(ad.id, v)}
                          className="scale-90"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 min-w-[24px]">
                          {ad.active ? "ON" : "OFF"}
                        </span>
                      </div>

                      {/* Adjust Panel Toggle */}
                      <Button
                        variant={expandedId === ad.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setExpandedId(expandedId === ad.id ? null : ad.id)}
                        className="h-8 text-xs font-bold uppercase tracking-wider gap-1"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        {expandedId === ad.id ? "Close" : "Adjust"}
                      </Button>

                      {/* Delete Trigger */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(ad.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Inline Nested Editing Panel */}
                  {expandedId === ad.id && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950 animate-fade-in">
                      <AdEditor ad={ad} onSave={(patch) => updateFit(ad.id, patch)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdEditor({
  ad,
  onSave,
}: {
  ad: Ad;
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
      <div className="rounded-xl overflow-hidden border border-zinc-200/80 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
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

      <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
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
          className="h-8 text-[11px] font-bold uppercase tracking-wider gap-1"
        >
          <RefreshCw className="h-3 w-3" /> Revert
        </Button>
        <Button
          size="sm"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ fit_mode: fitMode, focal_x: focalX, focal_y: focalY, zoom });
              toast.success("Alignment rules updated");
            } catch (e: any) {
              toast.error(e?.message ?? "Save adjustments failed");
            } finally {
              setSaving(false);
            }
          }}
          className="h-8 text-[11px] font-bold uppercase tracking-wider"
        >
          {saving ? "Saving Changes..." : "Save Alignments"}
        </Button>
      </div>
    </div>
  );
}
