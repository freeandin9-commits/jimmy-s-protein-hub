import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  if (isLoading || !form) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

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
        <Button type="submit" disabled={saving} className="bg-primary font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90">
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
