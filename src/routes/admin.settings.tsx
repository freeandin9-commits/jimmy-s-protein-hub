import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  if (isLoading || !form) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const update = (k: string, v: string | null) => setForm({ ...form, [k]: v });

  const onLogoFile = async (file: File) => {
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("ads").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from("ads").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (!signed?.signedUrl) throw new Error("Failed to get URL");
      const { error } = await supabase
        .from("site_settings")
        .update({ logo_url: signed.signedUrl })
        .eq("id", form.id);
      if (error) throw error;
      setForm({ ...form, logo_url: signed.signedUrl });
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("Logo updated");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const deleteLogo = async () => {
    if (!confirm("Remove the logo? The default will be shown.")) return;
    const { error } = await supabase
      .from("site_settings")
      .update({ logo_url: null })
      .eq("id", form.id);
    if (error) return toast.error(error.message);
    setForm({ ...form, logo_url: null });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    toast.success("Logo removed");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        whatsapp_number: form.whatsapp_number.replace(/[^0-9]/g, ""),
        hero_headline: form.hero_headline,
        hero_subtext: form.hero_subtext,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        instagram_url: form.instagram_url,
        facebook_url: form.facebook_url,
        address: form.address,
        business_hours: form.business_hours,
      })
      .eq("id", form.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide">Settings</h1>
        <p className="text-sm text-muted-foreground">Edit your site content and contact info. Changes go live immediately.</p>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-6">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-wide">Logo</h2>
          <p className="text-sm text-muted-foreground">Shown in the site header. Recommended: transparent PNG, max ~200px tall.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-40 items-center justify-center rounded-md border border-border bg-muted/40 p-2">
            {form.logo_url ? (
              <img src={form.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground">No logo (default)</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-semibold hover:bg-secondary">
              <Upload className="h-4 w-4" />
              {uploadingLogo ? "Uploading…" : form.logo_url ? "Change / Upload" : "Upload Logo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onLogoFile(e.target.files[0])}
              />
            </label>
            {form.logo_url && (
              <Button type="button" variant="outline" onClick={deleteLogo}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        </div>
      </div>



      <form onSubmit={save} className="space-y-5 rounded-xl border border-border bg-card p-6">
        <div>
          <Label htmlFor="wa">WhatsApp Number</Label>
          <Input id="wa" value={form.whatsapp_number} onChange={(e) => update("whatsapp_number", e.target.value)} placeholder="919876543210" className="mt-1" />
          <p className="mt-1 text-xs text-muted-foreground">Country code + number, no + or spaces. E.g. India: 919876543210</p>
        </div>
        <div>
          <Label htmlFor="head">Hero Headline</Label>
          <Input id="head" value={form.hero_headline} onChange={(e) => update("hero_headline", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="sub">Hero Subtext</Label>
          <Textarea id="sub" value={form.hero_subtext} onChange={(e) => update("hero_subtext", e.target.value)} rows={2} className="mt-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Contact Email</Label>
            <Input id="email" type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">Contact Phone</Label>
            <Input id="phone" value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ig">Instagram URL</Label>
            <Input id="ig" value={form.instagram_url} onChange={(e) => update("instagram_url", e.target.value)} placeholder="https://instagram.com/..." className="mt-1" />
          </div>
          <div>
            <Label htmlFor="fb">Facebook URL</Label>
            <Input id="fb" value={form.facebook_url} onChange={(e) => update("facebook_url", e.target.value)} placeholder="https://facebook.com/..." className="mt-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="addr">Address</Label>
          <Textarea id="addr" value={form.address} onChange={(e) => update("address", e.target.value)} rows={2} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="bh">Business Hours</Label>
          <Input id="bh" value={form.business_hours ?? ""} onChange={(e) => update("business_hours", e.target.value)} placeholder="Mon-Sat 10am-8pm" className="mt-1" />
          <p className="mt-1 text-xs text-muted-foreground">Shown to customers in the cart and on WhatsApp messages.</p>
        </div>
        <Button type="submit" disabled={saving} className="bg-primary font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90">
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
