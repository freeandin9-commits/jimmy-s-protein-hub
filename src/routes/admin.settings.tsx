import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Trash2, Plus, Settings, Sliders, Image, HelpCircle, Save, Eye, Sun, Moon } from "lucide-react";

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

  const [previewBg, setPreviewBg] = useState<"dark" | "light" | "grid">("grid");
  const [imageFit, setImageFit] = useState<"contain" | "cover" | "scale-down">("contain");
  const [logoPadding, setLogoPadding] = useState<string>("p-4");

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

  if (isLoading || !form) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F17] text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
          <span className="text-sm font-medium">Loading premium settings...</span>
        </div>
      </div>
    );
  }

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

  // ഹെഡറിൽ ലോഗോ കാണാത്ത പ്രശ്നം പരിഹരിച്ച ഫങ്ക്ഷൻ
  const onLogoFile = async (file: File) => {
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // 1. ഫയൽ അപ്‌ലോഡ് ചെയ്യുന്നു
      const { error: upErr } = await supabase.storage.from("ads").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;

      // 2. പബ്ലിക് URL നിർമ്മിക്കുന്നു (Signed URL ചിലപ്പോൾ എക്സ്പയർ ആകാം, അതുകൊണ്ട് Public URL ആണ് സുരക്ഷിതം)
      const { data: urlData } = supabase.storage.from("ads").getPublicUrl(path);
      const publicUrl = urlData?.publicUrl;

      if (!publicUrl) throw new Error("Failed to generate Public URL");

      // 3. ഡാറ്റാബേസ് പുതിയ പബ്ലിക് യുആർഎൽ വെച്ച് അപ്‌ഡേറ്റ് ചെയ്യുന്നു
      const { error } = await supabase
        .from("site_settings")
        .update({ logo_url: publicUrl } as any)
        .eq("id", form.id);
      if (error) throw error;

      setForm({ ...form, logo_url: publicUrl });

      // 4. ഹെഡറിലും മറ്റ് പേജുകളിലും ഉടനടി മാറ്റം വരാൻ കാഷെ ക്ലിയർ ചെയ്യുന്നു
      await qc.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("Logo updated successfully");
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
    await qc.invalidateQueries({ queryKey: ["site_settings"] });
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
    toast.success("All configurations saved live");
    await qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  const getBgClass = () => {
    if (previewBg === "dark") return "bg-[#0B0F17]";
    if (previewBg === "light") return "bg-white";
    return "bg-[#0B0F17] bg-[linear-gradient(45deg,#141b2b_25%,transparent_25%),linear-gradient(-45deg,#141b2b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#141b2b_75%),linear-gradient(-45deg,transparent_75%,#141b2b_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]";
  };

  return (
    <div className="max-w-3xl space-y-8 bg-[#0B0F17] p-6 rounded-2xl min-h-screen text-slate-100 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 p-2.5 rounded-xl text-[#FACC15] shadow-inner">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide text-white">Settings</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Customize storefront appearance, communications metadata, and content rules.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-xl border border-slate-800 bg-[#141B2B] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-2 text-[#FACC15]">
            <Image className="h-4 w-4" />
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Brand Visual Identity
            </h2>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-slate-800 px-2.5 py-1 rounded-full text-slate-400">
            <Eye className="h-3 w-3 text-[#FACC15]" /> Live Preview Engine
          </span>
        </div>

        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          The main logomark serves as the primary visual indicator in the header stack. Transparency-optimized PNG
          configurations are highly recommended. Use the tools below to check visibility on various themes.
        </p>

        <div className="grid gap-6 md:grid-cols-5 items-start pt-2">
          <div className="md:col-span-3 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Canvas View</span>
            <div
              className={`relative flex h-44 w-full items-center justify-center rounded-xl border border-slate-800 transition-colors duration-300 overflow-hidden ${getBgClass()} ${logoPadding}`}
            >
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt="Active Identity Brand"
                  className={`max-h-full max-w-full transition-all duration-200 object-${imageFit}`}
                />
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
                  Fallback Text Logo Active
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 bg-[#0B0F17]/50 p-4 rounded-xl border border-slate-800/60 h-full justify-between flex flex-col">
            <div>
              <span className="text-[10px] font-bold text-[#FACC15] uppercase tracking-widest block mb-2.5">
                Preview Effects Filter
              </span>

              <div className="space-y-1.5 mb-3">
                <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                  Canvas Background
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewBg("grid")}
                    className={`h-7 rounded text-[11px] font-bold uppercase transition-all ${previewBg === "grid" ? "bg-[#FACC15] text-black" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                  >
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBg("dark")}
                    className={`h-7 rounded text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${previewBg === "dark" ? "bg-slate-700 text-white border border-slate-500" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                  >
                    <Moon className="h-2.5 w-2.5" /> Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBg("light")}
                    className={`h-7 rounded text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${previewBg === "light" ? "bg-white text-black font-extrabold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                  >
                    <Sun className="h-2.5 w-2.5" /> Light
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                  Image Fit Style
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["contain", "cover", "scale-down"] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setImageFit(fit)}
                      className={`h-7 rounded text-[10px] font-bold uppercase transition-all ${imageFit === fit ? "bg-slate-300 text-black" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                      {fit === "scale-down" ? "Scale" : fit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                  Viewport Margins
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "None", val: "p-0" },
                    { label: "Medium", val: "p-4" },
                    { label: "Large", val: "p-8" },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setLogoPadding(p.val)}
                      className={`h-7 rounded text-[10px] font-bold uppercase transition-all ${logoPadding === p.val ? "bg-slate-300 text-black" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/40">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#FACC15] px-4 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#E2B80D] transition-colors shadow-md shadow-yellow-500/5">
            <Upload className="h-4 w-4 stroke-[2.5]" />
            {uploadingLogo ? "Processing Image..." : form.logo_url ? "Replace Identity" : "Upload Custom Logo"}
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
              className="h-10 px-4 text-xs font-bold uppercase bg-slate-900/60 border border-slate-800 text-slate-400 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 transition-all"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Reset Default
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={save} className="space-y-6 rounded-xl border border-slate-800 bg-[#141B2B] p-6 shadow-xl">
        <div className="flex items-center gap-2 text-[#FACC15] pb-2 border-b border-slate-800/60">
          <Sliders className="h-4 w-4" />
          <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">System Configuration</h2>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wa" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Primary WhatsApp Link Gateway
          </Label>
          <Input
            id="wa"
            value={form.whatsapp_number || ""}
            onChange={(e) => update("whatsapp_number", e.target.value)}
            placeholder="e.g. 919876543210"
            className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15] font-mono tracking-wide"
          />
          <p className="text-[11px] text-slate-500">
            Provide the complete international dialing code without any symbols, operators, or leading zeros (e.g.,
            India prefix sequence: 91XXXXXXXXXX).
          </p>
        </div>

        <div className="space-y-4 rounded-xl bg-[#0B0F17]/40 p-4 border border-slate-800/40">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#FACC15]">Hero Showcase Settings</p>

          <div className="space-y-1.5">
            <Label htmlFor="head" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Prominent Header Text
            </Label>
            <Input
              id="head"
              value={form.hero_headline || ""}
              onChange={(e) => update("hero_headline", e.target.value)}
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
              placeholder="Inject core value statement headline..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sub" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Subtext Context Segment
            </Label>
            <Textarea
              id="sub"
              value={form.hero_subtext || ""}
              onChange={(e) => update("hero_subtext", e.target.value)}
              rows={2}
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15] text-sm"
              placeholder="Inject secondary descriptive messaging hooks..."
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Support Email Vector
            </Label>
            <Input
              id="email"
              type="email"
              value={form.contact_email || ""}
              onChange={(e) => update("contact_email", e.target.value)}
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
              placeholder="operations@brand.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Dedicated Contact Line
            </Label>
            <Input
              id="phone"
              value={form.contact_phone || ""}
              onChange={(e) => update("contact_phone", e.target.value)}
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ig" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Instagram Handle Link
            </Label>
            <Input
              id="ig"
              value={form.instagram_url || ""}
              onChange={(e) => update("instagram_url", e.target.value)}
              placeholder="https://instagram.com/brand_id"
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Facebook Brand Location
            </Label>
            <Input
              id="fb"
              value={form.facebook_url || ""}
              onChange={(e) => update("facebook_url", e.target.value)}
              placeholder="https://facebook.com/brand_page"
              className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="addr" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Physical Office Premises
          </Label>
          <Textarea
            id="addr"
            value={form.address || ""}
            onChange={(e) => update("address", e.target.value)}
            rows={2}
            className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15] text-sm"
            placeholder="Provide registered mailing physical warehouse coordinate entries..."
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bh" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Operational Schedule Parameters
          </Label>
          <Input
            id="bh"
            value={form.business_hours ?? ""}
            onChange={(e) => update("business_hours", e.target.value)}
            placeholder="e.g. Monday - Saturday: 09:00 AM - 06:00 PM"
            className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
          />
          <p className="text-[11px] text-slate-500">
            This string displays transparently within active checkout steps and pre-filled user payloads.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/40">
            <div className="flex items-center gap-2 text-[#FACC15]">
              <HelpCircle className="h-4 w-4" />
              <Label className="text-lg font-bold uppercase tracking-wider text-white cursor-default">
                Knowledge Base Configuration
              </Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addFaq}
              className="bg-slate-800 text-slate-200 hover:bg-[#FACC15] hover:text-black text-xs font-bold uppercase tracking-wider self-start sm:self-auto transition-all"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5 stroke-[3]" /> Add FAQ Node
            </Button>
          </div>
          <p className="text-xs text-slate-400">
            Maintain customer self-service modules published on the global storefront layout.
          </p>

          <div className="space-y-4 pt-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="relative space-y-3 rounded-xl border border-slate-800/80 bg-[#0B0F17]/60 p-4 shadow-inner transition-all hover:border-slate-700/60"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-3 h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                  onClick={() => removeFaq(index)}
                  title="Remove Item Node"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="pr-8 space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Query Variable {index + 1}
                  </Label>
                  <Input
                    value={faq?.q || ""}
                    onChange={(e) => handleFaqChange(index, "q", e.target.value)}
                    placeholder="Enter interactive customer query prompt string..."
                    className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15] h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Resolution Statement Output
                  </Label>
                  <Textarea
                    value={faq?.a || ""}
                    onChange={(e) => handleFaqChange(index, "a", e.target.value)}
                    placeholder="Enter comprehensive supporting explanation paragraph content..."
                    rows={2}
                    className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15] text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/60">
          <Button
            type="submit"
            disabled={saving}
            className="w-full h-11 bg-[#FACC15] font-extrabold uppercase tracking-widest text-black hover:bg-[#E2B80D] disabled:opacity-50 transition-all duration-200 text-xs shadow-lg shadow-yellow-500/5 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4 stroke-[2.5]" />
            {saving ? "Deploying Parameters Live..." : "Commit Settings Live"}
          </Button>
        </div>
      </form>
    </div>
  );
}
