import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Trash2, Image as ImageIcon, Film, Save, Phone, Sliders, Type } from "lucide-react";

export const Route = createFileRoute("/admin/hero")({
  component: HeroAdminPage,
});

type HeroForm = {
  id: string;
  hero_headline: string;
  hero_subtext: string;
  hero_badge_text: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_image_url: string | null;
  hero_video_url: string | null;
  hero_media_type: "image" | "video";
  whatsapp_number: string;
};

function HeroAdminPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const [form, setForm] = useState<HeroForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    if (data && !form) {
      setForm({
        id: data.id,
        hero_headline: data.hero_headline ?? "",
        hero_subtext: data.hero_subtext ?? "",
        hero_badge_text: data.hero_badge_text ?? "100% Premium Quality",
        hero_cta_text: data.hero_cta_text ?? "Buy Now",
        hero_cta_link: data.hero_cta_link ?? "/products",
        hero_image_url: data.hero_image_url ?? null,
        hero_video_url: data.hero_video_url ?? null,
        hero_media_type: (data.hero_media_type ?? "image") as "image" | "video",
        whatsapp_number: data.whatsapp_number ?? data.contact_phone ?? "",
      });
    }
  }, [data, form]);

  if (isLoading || !form) {
    return (
      <div className="flex justify-center items-center py-24 bg-zinc-950 min-h-screen">
        <div className="text-xs uppercase font-black tracking-widest text-zinc-500 animate-pulse">
          Syncing storefront configuration layer…
        </div>
      </div>
    );
  }

  const update = <K extends keyof HeroForm>(k: K, v: HeroForm[K]) => setForm({ ...form, [k]: v });

  const uploadFile = async (file: File, kind: "image" | "video") => {
    const setBusy = kind === "image" ? setUploadingImage : setUploadingVideo;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || (kind === "image" ? "jpg" : "mp4");
      const path = `hero/${kind}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("ads").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from("ads").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (!signed?.signedUrl) throw new Error("Failed to get URL");
      const patch =
        kind === "image"
          ? { hero_image_url: signed.signedUrl, hero_media_type: "image" as const }
          : { hero_video_url: signed.signedUrl, hero_media_type: "video" as const };
      const { error } = await supabase
        .from("site_settings")
        .update(patch as any)
        .eq("id", form.id);
      if (error) throw error;
      setForm({ ...form, ...patch });
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success(`${kind === "image" ? "Image" : "Video"} media resource deployed`);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const removeMedia = async (kind: "image" | "video") => {
    if (!confirm(`Remove the hero ${kind}?`)) return;
    const patch = kind === "image" ? { hero_image_url: null } : { hero_video_url: null };
    const { error } = await supabase
      .from("site_settings")
      .update(patch as any)
      .eq("id", form.id);
    if (error) return toast.error(error.message);
    setForm({ ...form, ...patch });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    toast.success("Media asset dropped");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        hero_headline: form.hero_headline,
        hero_subtext: form.hero_subtext,
        hero_badge_text: form.hero_badge_text,
        hero_cta_text: form.hero_cta_text,
        hero_cta_link: form.hero_cta_link,
        hero_media_type: form.hero_media_type,
        whatsapp_number: form.whatsapp_number,
        contact_phone: form.whatsapp_number,
      } as any)
      .eq("id", form.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    toast.success("Store config metrics saved successfully");
  };

  return (
    <div className="max-w-4xl space-y-10 bg-zinc-950 text-zinc-100 antialiased min-h-screen pb-12">
      {/* Top Header Node */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-400/10">
          <Sliders className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-wider text-yellow-400">
            Hero & Store Matrix
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-0.5">
            Configure prime landing layout copy, active broadcast media, and business phone routing channels.
          </p>
        </div>
      </div>

      {/* SECTION 1: CONTACT ROUTE */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
          <Phone className="h-5 w-5 text-yellow-400" />
          <h2 className="font-display text-base font-black uppercase tracking-wider text-zinc-200">
            Customer Communication Route
          </h2>
        </div>
        <div className="max-w-md space-y-1.5">
          <Label htmlFor="contactPhone" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            WhatsApp Broadcast Line
          </Label>
          <div className="relative">
            <Input
              id="contactPhone"
              type="tel"
              value={form.whatsapp_number}
              onChange={(e) => update("whatsapp_number", e.target.value)}
              placeholder="+91 9876543210"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-yellow-400 placeholder:text-zinc-700 font-mono text-sm h-11 pl-4"
            />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mt-1">
            * Direct target link for instantly transmitting customer orders to WhatsApp.
          </p>
        </div>
      </div>

      {/* SECTION 2: COMPONENT MEDIA OVERLAYS */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-yellow-400" />
            <h2 className="font-display text-base font-black uppercase tracking-wider text-zinc-200">
              Hero Showcase Display Media
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 shrink-0">
              Active Source Matrix:
            </span>
            <Select
              value={form.hero_media_type}
              onValueChange={(v) => update("hero_media_type", v as "image" | "video")}
            >
              <SelectTrigger className="w-36 bg-zinc-950 border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300 h-9 focus:ring-yellow-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs font-semibold uppercase tracking-wider">
                <SelectItem value="image" className="focus:bg-yellow-400 focus:text-zinc-950">
                  Static Image
                </SelectItem>
                <SelectItem value="video" className="focus:bg-yellow-400 focus:text-zinc-950">
                  Active Video
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Box 1: Image Resource Frame */}
          <div
            className={`space-y-4 rounded-xl border p-4 bg-zinc-900/20 transition-colors ${form.hero_media_type === "image" ? "border-yellow-400/40 bg-yellow-400/[0.01]" : "border-zinc-800"}`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-300">
                <ImageIcon className="h-3.5 w-3.5 text-yellow-400" /> Graphic Image
              </div>
              {form.hero_media_type === "image" && (
                <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-400 text-zinc-950 px-2 py-0.5 rounded-sm">
                  Active Rendering
                </span>
              )}
            </div>

            <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-zinc-950 bg-zinc-950 shadow-inner relative group">
              {form.hero_image_url ? (
                <img
                  src={form.hero_image_url}
                  alt="Showcase layout structural route"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  No Image Asset Present
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Resource Pipeline URL
              </Label>
              <Input
                value={form.hero_image_url ?? ""}
                onChange={(e) => update("hero_image_url", e.target.value || null)}
                placeholder="https://… high resolution link route"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs focus-visible:ring-yellow-400 h-9"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 hover:text-yellow-400 transition-all select-none">
                <Upload className="h-3.5 w-3.5" />
                {uploadingImage ? "Uploading…" : "Upload asset File"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "image")}
                />
              </label>
              {form.hero_image_url && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeMedia("image")}
                  className="h-9 border-zinc-800 bg-zinc-950 text-zinc-400 text-[11px] font-bold uppercase tracking-wider hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 px-3"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Box 2: Video Stream Frame */}
          <div
            className={`space-y-4 rounded-xl border p-4 bg-zinc-900/20 transition-colors ${form.hero_media_type === "video" ? "border-yellow-400/40 bg-yellow-400/[0.01]" : "border-zinc-800"}`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-300">
                <Film className="h-3.5 w-3.5 text-yellow-400" /> Stream Video
              </div>
              {form.hero_media_type === "video" && (
                <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-400 text-zinc-950 px-2 py-0.5 rounded-sm">
                  Active Rendering
                </span>
              )}
            </div>

            <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-zinc-950 bg-zinc-950 shadow-inner relative">
              {form.hero_video_url ? (
                <video src={form.hero_video_url} className="h-full w-full object-cover" controls muted playsInline />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  No Video Asset Present
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Resource Pipeline URL
              </Label>
              <Input
                value={form.hero_video_url ?? ""}
                onChange={(e) => update("hero_video_url", e.target.value || null)}
                placeholder="https://… direct stream mp4 file route"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs focus-visible:ring-yellow-400 h-9"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 hover:text-yellow-400 transition-all select-none">
                <Upload className="h-3.5 w-3.5" />
                {uploadingVideo ? "Uploading…" : "Upload stream mp4"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "video")}
                />
              </label>
              {form.hero_video_url && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeMedia("video")}
                  className="h-9 border-zinc-800 bg-zinc-950 text-zinc-400 text-[11px] font-bold uppercase tracking-wider hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 px-3"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: TEXT METRICS MATRIX */}
      <form
        onSubmit={save}
        className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 shadow-xl space-y-5"
      >
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
          <Type className="h-5 w-5 text-yellow-400" />
          <h2 className="font-display text-base font-black uppercase tracking-wider text-zinc-200">
            Layout Headings & Interactive CTA Button
          </h2>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="badge" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Micro Badge Intro Text
          </Label>
          <Input
            id="badge"
            value={form.hero_badge_text}
            onChange={(e) => update("hero_badge_text", e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-zinc-100 font-bold uppercase tracking-wider text-xs h-11 focus-visible:ring-yellow-400"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="head" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Prime Banner Headline Title
          </Label>
          <Input
            id="head"
            value={form.hero_headline}
            onChange={(e) => update("hero_headline", e.target.value)}
            className="bg-zinc-950 border-zinc-800 text-zinc-100 font-black uppercase tracking-wider text-sm h-11 focus-visible:ring-yellow-400 text-yellow-400"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sub" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Supporting Content Subtext Block
          </Label>
          <Textarea
            id="sub"
            value={form.hero_subtext}
            onChange={(e) => update("hero_subtext", e.target.value)}
            rows={3}
            className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs focus-visible:ring-yellow-400 leading-relaxed resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-zinc-800/40">
          <div className="space-y-1.5">
            <Label htmlFor="cta" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              CTA Direct Button Label Text
            </Label>
            <Input
              id="cta"
              value={form.hero_cta_text}
              onChange={(e) => update("hero_cta_text", e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-zinc-100 font-bold uppercase tracking-wider text-xs h-11 focus-visible:ring-yellow-400"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ctaLink" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Button Direct Target Path Route
            </Label>
            <Input
              id="ctaLink"
              value={form.hero_cta_link}
              onChange={(e) => update("hero_cta_link", e.target.value)}
              placeholder="/products or explicit absolute link https://…"
              className="bg-zinc-950 border-zinc-800 text-zinc-100 font-mono text-xs h-11 focus-visible:ring-yellow-400"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/60">
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-widest hover:bg-yellow-300 h-12 shadow-lg shadow-yellow-400/5 transition-transform active:scale-99"
          >
            <Save className="mr-2 h-4 w-4 stroke-[2.5]" />
            {saving ? "Commiting Changes Matrix…" : "Save All Configuration Shifts"}
          </Button>
        </div>
      </form>
    </div>
  );
}
