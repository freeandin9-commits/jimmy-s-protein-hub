import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Trash2, Plus, Settings, Sliders, Image, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data: resData, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return resData as any;
    },
  });

  const [form, setForm] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (data && !form) {
      setForm(data);
      if (data.faq && Array.isArray(data.faq)) {
        setFaqs(data.faq);
      } else {
        setFaqs([
          {
            q: "How does ordering work?",
            a: "Add what you want to the cart, hit 'Order on WhatsApp' — we confirm stock, share payment details, and ship out.",
          },
          {
            q: "What payment methods do you accept?",
            a: "UPI, bank transfer, and cash on delivery in select areas. We confirm options on WhatsApp.",
          },
          {
            q: "How long does delivery take?",
            a: "2–5 business days for most metros, 5–8 for the rest. Tracking shared on WhatsApp.",
          },
          {
            q: "Do you do wholesale?",
            a: "Yes. Email hello@jimmysprotein.com or WhatsApp us with your store details.",
          },
        ]);
      }
    }
  }, [data, form]);

  if (isLoading || !form)
    return <div className="text-sm text-slate-400 p-6 bg-[#0B0F17] min-h-screen">Loading Settings…</div>;

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  const handleFaqChange = (index: number, field: "q" | "a", value: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
    setFaqs(updatedFaqs);
  };

  const addFaq = () => {
    setFaqs([...faqs, { q: "", a: "" }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

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
        .update({ logo_url: signed.signedUrl } as any)
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
      .update({ logo_url: null } as any)
      .eq("id", form.id);
    if (error) return toast.error(error.message);
    setForm({ ...form, logo_url: null });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    toast.success("Logo removed");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const filteredFaqs = faqs.filter((item) => item && item.q && item.q.trim() !== "");

    const updateData: any = {
      whatsapp_number: (form.whatsapp_number || "").replace(/[^0-9]/g, ""),
      hero_headline: form.hero_headline,
      hero_subtext: form.hero_subtext,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      instagram_url: form.instagram_url,
      facebook_url: form.facebook_url,
      address: form.address,
      business_hours: form.business_hours,
    };

    if ("faq" in form || filteredFaqs.length > 0) {
      updateData.faq = filteredFaqs;
    }

    const { error } = await supabase
      .from("site_settings")
      .update(updateData as any)
      .eq("id", form.id);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved successfully");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <div className="max-w-3xl space-y-8 bg-[#0B0F17] p-6 rounded-2xl min-h-screen text-slate-100 pb-16">
      {/* Header Section */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
        <div className="bg-slate-800/80 p-2 rounded-xl text-[#FACC15]">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide text-white">Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Modify platform configuration, contact channels, and global FAQs instantly.
          </p>
        </div>
      </div>

      {/* Logo Component Section */}
      <div className="space-y-4 rounded-xl border border-slate-800/80 bg-[#141B2B] p-6 shadow-xl">
        <div className="flex items-center gap-2 text-[#FACC15] mb-1">
          <Image className="h-4 w-4" />
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">Brand Identity</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-xl">
          This logo displays prominently across the store header. For best presentation, use a transparent background
          PNG, capped around 200px height.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-2">
          <div className="flex h-24 w-48 items-center justify-center rounded-xl border-2 border-dashed border-slate-800 bg-[#0B0F17] p-3 transition-colors hover:border-slate-700">
            {form.logo_url ? (
              <img src={form.logo_url} alt="Brand Logo" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs font-medium text-slate-500">Default Logo Active</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#FACC15] px-4 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#E2B80D] transition-colors shadow-md">
              <Upload className="h-4 w-4 stroke-[2.5]" />
              {uploadingLogo ? "Uploading…" : form.logo_url ? "Replace Logo" : "Upload Logo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingLogo}
                onChange={(e) => e.target.files?.[0] && onLogoFile(e.target.files[0])}
              />
            </label>
            {form.logo_url && (
              <Button
                type="button"
                variant="ghost"
                onClick={deleteLogo}
                className="h-10 px-4 text-xs font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear Custom
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Form Configuration */}
      <form onSubmit={save} className="space-y-6 rounded-xl border border-slate-800/80 bg-[#141B2B] p-6 shadow-xl">
        <div className="flex items-center gap-2 text-[#FACC15] pb-2 border-b border-slate-800/40">
          <Sliders className="h-4 w-4" />
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">General Parameters</h2>
        </div>

        {/* WhatsApp Setup */}
        <div className="space-y-1.5">
          <Label htmlFor="wa" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Gateway WhatsApp Number
          </Label>
          <Input
            id="wa"
            value={form.whatsapp_number || ""}
            onChange={(e) => update("whatsapp_number", e.target.value)}
            placeholder="919876543210"
            className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
          />
          <p className="text-[11px] text-slate-500">
            Include specific country code prefix without any leading '+' or space configurations (e.g., India:
            91XXXXXXXXXX).
          </p>
        </div>

        {/* Hero Section */}
        <div className="grid gap-4 sm:grid-cols-1">
          <div className="space-y-1.5">
            <Label htmlFor="head" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Hero Headline
            </Label>
            <Input
              id="head"
              value={form.hero_headline || ""}
              onChange={(e) => update("hero_headline", e.target.value)}
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
              placeholder="Main welcome text string"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Hero Subtext
            </Label>
            <Textarea
              id="sub"
              value={form.hero_subtext || ""}
              onChange={(e) => update("hero_subtext", e.target.value)}
              rows={2}
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
              placeholder="Supporting subtitle details paragraph"
            />
          </div>
        </div>

        {/* Communications Support channels */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Contact Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={form.contact_email || ""}
              onChange={(e) => update("contact_email", e.target.value)}
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
              placeholder="support@domain.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Support Phone Line
            </Label>
            <Input
              id="phone"
              value={form.contact_phone || ""}
              onChange={(e) => update("contact_phone", e.target.value)}
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ig" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Instagram Channel URL
            </Label>
            <Input
              id="ig"
              value={form.instagram_url || ""}
              onChange={(e) => update("instagram_url", e.target.value)}
              placeholder="https://instagram.com/profile"
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Facebook Page URL
            </Label>
            <Input
              id="fb"
              value={form.facebook_url || ""}
              onChange={(e) => update("facebook_url", e.target.value)}
              placeholder="https://facebook.com/page"
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
            />
          </div>
        </div>

        {/* Physical Address Info */}
        <div className="space-y-1.5">
          <Label htmlFor="addr" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            HQ Physical Address
          </Label>
          <Textarea
            id="addr"
            value={form.address || ""}
            onChange={(e) => update("address", e.target.value)}
            rows={2}
            className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
            placeholder="Office premises details or shop lot layout locations"
          />
        </div>

        {/* Operational Schedule hours */}
        <div className="space-y-1.5">
          <Label htmlFor="bh" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Business Timeline Hours
          </Label>
          <Input
            id="bh"
            value={form.business_hours ?? ""}
            onChange={(e) => update("business_hours", e.target.value)}
            placeholder="Mon-Sat 10:00 AM - 08:00 PM"
            className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
          />
          <p className="text-[11px] text-slate-500">
            Visible to target users inside layout menus and WhatsApp pre-filled strings.
          </p>
        </div>

        {/* --- FAQ Manager Structure --- */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2 text-[#FACC15]">
              <HelpCircle className="h-4 w-4" />
              <Label className="text-xl font-bold uppercase tracking-wide text-white cursor-default">
                Faq Core Manager
              </Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addFaq}
              className="bg-slate-800 text-slate-200 hover:bg-[#FACC15] hover:text-black text-xs font-bold uppercase tracking-wider self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5 mr-1 stroke-[3]" /> Append Accordion
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure core customer queries displayed on your public support channels.
          </p>

          <div className="space-y-4 pt-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="relative space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17]/50 p-4 shadow-inner transition-all hover:border-slate-700/60"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg"
                  onClick={() => removeFaq(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="pr-8 space-y-1">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Question Segment {index + 1}
                  </Label>
                  <Input
                    value={faq?.q || ""}
                    onChange={(e) => handleFaqChange(index, "q", e.target.value)}
                    placeholder="Provide common customer query..."
                    className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15] h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Resolution Content
                  </Label>
                  <Textarea
                    value={faq?.a || ""}
                    onChange={(e) => handleFaqChange(index, "a", e.target.value)}
                    placeholder="Provide explicit clarification response details..."
                    rows={2}
                    className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15] text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Save Trigger Button */}
        <div className="pt-4 border-t border-slate-800/60">
          <Button
            type="submit"
            disabled={saving}
            className="w-full h-11 bg-[#FACC15] font-extrabold uppercase tracking-widest text-black hover:bg-[#E2B80D] disabled:opacity-50 transition-all duration-200 text-xs shadow-lg shadow-yellow-500/5"
          >
            {saving ? "Commiting Updates…" : "Push Settings Live"}
          </Button>
        </div>
      </form>
    </div>
  );
}
