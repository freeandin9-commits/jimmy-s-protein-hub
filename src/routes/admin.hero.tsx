import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Trash2, Image as ImageIcon, Film, Save } from "lucide-react";

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
};

function HeroAdminPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
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
      });
    }
  }, [data, form]);

  if (isLoading || !form) {
    return <div className="text-sm text-muted-foreground p-6">Loading…</div>;
  }

  const update = <K extends keyof HeroForm>(k: K, v: HeroForm[K]) =>
    setForm({ ...form, [k]: v });

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
      const { data: signed } = await supabase.storage
        .from("ads")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
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
      toast.success(`${kind === "image" ? "Image" : "Video"} uploaded`);
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
    toast.success("Removed");
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
      } as any)
      .eq("id", form.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    toast.success("Hero section saved");
  };

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide">Hero Section</h1>
        <p className="text-sm text-muted-foreground">
          Edit the homepage hero — text, button, and the background image or video.
        </p>
      </div>

      {/* MEDIA */}
      <div className="space-y-5 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wide">Hero Media</h2>
            <p className="text-sm text-muted-foreground">Choose what shows on the right side of the hero.</p>
          </div>
          <Select
            value={form.hero_media_type}
            onValueChange={(v) => update("hero_media_type", v as "image" | "video")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Image */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 font-semibold">
              <ImageIcon className="h-4 w-4" /> Image
            </div>
            <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
              {form.hero_image_url ? (
                <img
                  src={form.hero_image_url}
                  alt="Hero"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground">No image yet</span>
              )}
            </div>
            <div>
              <Label className="text-xs">Image URL</Label>
              <Input
                value={form.hero_image_url ?? ""}
                onChange={(e) => update("hero_image_url", e.target.value || null)}
                placeholder="https://… or upload"
                className="mt-1"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-semibold hover:bg-secondary">
                <Upload className="h-4 w-4" />
                {uploadingImage ? "Uploading…" : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "image")}
                />
              </label>
              {form.hero_image_url && (
                <Button type="button" variant="outline" onClick={() => removeMedia("image")}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Film className="h-4 w-4" /> Video
            </div>
            <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
              {form.hero_video_url ? (
                <video
                  src={form.hero_video_url}
                  className="h-full w-full object-cover"
                  controls
                  muted
                  playsInline
                />
              ) : (
                <span className="text-xs text-muted-foreground">No video yet</span>
              )}
            </div>
            <div>
              <Label className="text-xs">Video URL</Label>
              <Input
                value={form.hero_video_url ?? ""}
                onChange={(e) => update("hero_video_url", e.target.value || null)}
                placeholder="https://… or upload mp4"
                className="mt-1"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-semibold hover:bg-secondary">
                <Upload className="h-4 w-4" />
                {uploadingVideo ? "Uploading…" : "Upload Video"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "video")}
                />
              </label>
              {form.hero_video_url && (
                <Button type="button" variant="outline" onClick={() => removeMedia("video")}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TEXT */}
      <form onSubmit={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-2xl uppercase tracking-wide">Hero Text & Button</h2>
        <div>
          <Label htmlFor="badge">Badge Text</Label>
          <Input
            id="badge"
            value={form.hero_badge_text}
            onChange={(e) => update("hero_badge_text", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="head">Headline</Label>
          <Input
            id="head"
            value={form.hero_headline}
            onChange={(e) => update("hero_headline", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="sub">Subtext</Label>
          <Textarea
            id="sub"
            value={form.hero_subtext}
            onChange={(e) => update("hero_subtext", e.target.value)}
            rows={2}
            className="mt-1"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cta">CTA Button Text</Label>
            <Input
              id="cta"
              value={form.hero_cta_text}
              onChange={(e) => update("hero_cta_text", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ctaLink">CTA Button Link</Label>
            <Input
              id="ctaLink"
              value={form.hero_cta_link}
              onChange={(e) => update("hero_cta_link", e.target.value)}
              placeholder="/products or https://…"
              className="mt-1"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-primary font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save Hero Section"}
        </Button>
      </form>
    </div>
  );
}
