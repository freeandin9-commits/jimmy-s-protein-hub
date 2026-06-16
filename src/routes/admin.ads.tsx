import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Upload, Plus, Settings2, Megaphone, CheckCircle2, RotateCcw } from "lucide-react";
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
    toast.success("Ad published");
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("ads").update({ active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    qc.invalidateQueries({ queryKey: ["ads", "public"] });
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
    if (!confirm("Delete this ad?")) return;
    await supabase.from("ads").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "ads"] });
    qc.invalidateQueries({ queryKey: ["ads", "public"] });
    toast.success("Ad deleted");
  };

  return (
    <div className="space-y-10 bg-zinc-950 text-zinc-100 antialiased min-h-screen pb-12">
      {/* Header Section */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-400/10">
          <Megaphone className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-wider text-yellow-400">Campaign Ads</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-0.5">
            Manage interactive banner placements for the home showcase.
          </p>
        </div>
      </div>

      {/* Creation Canvas Form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <h2 className="font-display text-lg font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
            <Plus className="h-5 w-5 text-yellow-400 stroke-[2.5]" /> Compose New Placement
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Campaign Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., BLACK FRIDAY MASS GAINERS"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-yellow-400 placeholder:text-zinc-600 font-medium uppercase tracking-wider text-xs h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Redirection Route</Label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="e.g., /products/whey-protein-isolate"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-yellow-400 placeholder:text-zinc-600 font-mono text-xs h-11"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Media Source Asset</Label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste high-res image URL sequence or select file below"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-yellow-400 placeholder:text-zinc-600 text-xs h-11"
              />
              <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 hover:text-yellow-400 transition-all active:scale-95 shrink-0 select-none">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Upload file"}
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

        <div className="space-y-2 border-t border-zinc-800/60 pt-4">
          <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block">
            Perspective Adjustment Frame
          </Label>
          <div className="rounded-lg border border-zinc-800 p-1.5 bg-zinc-950">
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

        <div className="flex justify-end pt-2 border-t border-zinc-800/60">
          <Button
            onClick={addAd}
            disabled={saving || uploading}
            className="bg-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-widest hover:bg-yellow-300 px-6 h-11 shadow-md shadow-yellow-400/5 active:scale-98 transition-transform"
          >
            {saving ? "Publishing Stream…" : "Publish Live Asset"}
          </Button>
        </div>
      </div>

      {/* Campaign Inventory Feed */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-xl space-y-4">
        <h2 className="font-display text-lg font-black uppercase tracking-wider text-zinc-300 border-b border-zinc-800/60 pb-3">
          Active Live Grid
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-xs uppercase font-bold tracking-widest text-zinc-500 animate-pulse">
              Synchronizing active data layer…
            </div>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              No active promotional inventory items deployed
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {ads.map((ad) => (
              <li
                key={ad.id}
                className="rounded-xl border border-zinc-800/80 bg-zinc-900 p-4 hover:border-zinc-700/80 transition-all duration-200"
              >
                {/* Responsive Image Card Display */}
                <div className="relative aspect-[16/5] w-full overflow-hidden rounded-lg border border-zinc-950 bg-zinc-950 md:aspect-[16/3.5] shadow-inner group">
                  <img
                    src={ad.image_url}
                    alt={ad.title || "Ad placement metadata"}
                    className="h-full w-full object-cover transition-transform duration-300"
                    style={{
                      objectPosition: `${ad.focal_x}% ${ad.focal_y}%`,
                      transform: ad.zoom !== 1 ? `scale(${ad.zoom})` : undefined,
                    }}
                  />
                  {!ad.active && (
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="border border-zinc-700 px-3 py-1 text-[10px] uppercase font-black tracking-widest text-zinc-400 bg-zinc-900 rounded-md">
                        Deactivated Status
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Dashboard Sub-Grid */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/60 pt-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-black uppercase tracking-wider text-yellow-400">
                      {ad.title || "(Untitled Campaign Matrix)"}
                    </div>
                    <div className="truncate font-mono text-[10px] text-zinc-400 mt-0.5">
                      {ad.link_url || "Direct Root (No Destination Link Assigned)"}
                    </div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mt-1">
                      Render Config: {ad.fit_mode} • Focal: {Math.round(ad.focal_x)}%/{Math.round(ad.focal_y)}% • Scale:{" "}
                      {ad.zoom.toFixed(2)}x
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === ad.id ? null : ad.id)}
                      className={`h-9 border-zinc-800 text-[11px] font-bold uppercase tracking-wider px-3 transition-colors ${
                        expandedId === ad.id
                          ? "bg-yellow-400 text-zinc-950 border-transparent"
                          : "bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <Settings2 className="mr-1.5 h-3.5 w-3.5" /> Configure Aspect
                    </Button>

                    <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-950 h-9 rounded-md px-3">
                      <Switch
                        checked={ad.active}
                        onCheckedChange={(v) => toggleActive(ad.id, v)}
                        className="data-[state=checked]:bg-yellow-400 data-[state=unchecked]:bg-zinc-800"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest w-6 text-zinc-400">
                        {ad.active ? "On" : "Off"}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(ad.id)}
                      className="h-9 w-9 border border-transparent bg-zinc-950/40 hover:bg-red-500/10 hover:border-red-500/20 text-zinc-500 hover:text-red-400 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Micro Adjustment Box drawer */}
                {expandedId === ad.id && (
                  <div className="mt-4 border-t border-zinc-800/80 pt-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/50">
                    <AdEditor ad={ad} onSave={(patch) => updateFit(ad.id, patch)} />
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
      <div className="flex justify-end gap-2 border-t border-zinc-800/50 pt-3">
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
          className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 h-9 text-[11px] font-bold uppercase tracking-wider"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Frame
        </Button>
        <Button
          size="sm"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ fit_mode: fitMode, focal_x: focalX, focal_y: focalY, zoom });
              toast.success("Saved configuration shifts");
            } catch (e: any) {
              toast.error(e?.message ?? "Save failed");
            } finally {
              setSaving(false);
            }
          }}
          className="bg-yellow-400 text-zinc-950 font-black h-9 text-[11px] uppercase tracking-wider hover:bg-yellow-300"
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
          {saving ? "Commiting Shifts…" : "Save Frame Matrix"}
        </Button>
      </div>
    </div>
  );
}
