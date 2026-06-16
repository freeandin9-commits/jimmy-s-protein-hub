import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/about" as any)({
  head: () => ({
    meta: [{ title: "Edit About Page — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminAboutPage,
});

function AdminAboutPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title_line1: "Built in the gym.",
    title_line2: "Made for the",
    title_highlight: "grind",
    story_p1: "Jimmy started lifting when he was 16. By 22, he was sick of protein powders that tasted like chalk, hid junk on the label, and treated athletes like marketing targets.",
    story_p2: "So he built his own. One flavor at a time. Tested by real lifters in real gyms. No celebrity endorsements. No fake reviews. Just protein that does its job — and tastes like it should.",
    story_footer: "Real fuel. No junk. That's the whole brand.",
    feature1_title: "Athlete-tested",
    feature1_desc: "Every flavor blind-tested by real athletes before it ever hits the shelf.",
    feature2_title: "Clean sourcing",
    feature2_desc: "Whey from grass-fed sources. No artificial colors, no banned substances.",
    feature3_title: "Lab-verified",
    feature3_desc: "Every batch independently tested for purity, protein content, and contaminants.",
  });

  // Supabase-ൽ നിന്ന് നിലവിലുള്ള വിവരങ്ങൾ എടുക്കുക
  useEffect(() => {
    async function fetchAboutData() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "about_page_content")
          .single();

        if (error && error.code !== "PGRST116") throw error; // PGRST116 means row not found
        if (data?.value) {
          setFormData((prev) => ({ ...prev, ...data.value }));
        }
      } catch (err) {
        console.error("Error fetching about page settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAboutData();
  }, []);

  // Form സബ്മിറ്റ് ചെയ്യുമ്പോൾ Supabase-ലേക്ക് അപ്‌ഡേറ്റ് ചെയ്യുക
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase.from("site_settings").upsert(
        { key: "about_page_content", value: formData },
        { onConflict: "key" }
      );

      if (error) throw error;
      toast.success("About page contents updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-400 text-xs font-bold uppercase tracking-widest">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-yellow-400" /> Pulling configurations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-black tracking-wider text-yellow-400 uppercase font-display flex items-center gap-2">
          <UserCheck className="h-6 w-6 stroke-[2]" /> Edit About Story
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Customize the main titles, descriptions, and feature items displayed on your About page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Header Block Configuration */}
        <div className="p-5 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400">1. Hero Header Section</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Title Line 1</label>
              <input
                type="text"
                value={formData.title_line1}
                onChange={(e) => setFormData({ ...formData, title_line1: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Title Line 2</label>
              <input
                type="text"
                value={formData.title_line2}
                onChange={(e) => setFormData({ ...formData, title_line2: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Highlighted Last Word (Yellow Color)</label>
              <input
                type="text"
                value={formData.title_highlight}
                onChange={(e) => setFormData({ ...formData, title_highlight: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Brand Story Column Paragraphs */}
        <div className="p-5 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400">2. Narrative & Story Line</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Paragraph 1</label>
              <textarea
                rows={3}
                value={formData.story_p1}
                onChange={(e) => setFormData({ ...formData, story_p1: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Paragraph 2</label>
              <textarea
                rows={3}
                value={formData.story_p2}
                onChange={(e) => setFormData({ ...formData, story_p2: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Bold Callout Footer</label>
              <input
                type="text"
                value={formData.story_footer}
                onChange={(e) => setFormData({ ...formData, story_footer: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Feature Checkboxes/Badging block */}
        <div className="p-5 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400">3. Verified Badges / Trust Pillars</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Badge 1 Heading</label>
                <input
                  type="text"
                  value={formData.feature1_title}
                  onChange={(e) => setFormData({ ...formData, feature1_title: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Badge 1 Info Description</label>
                <input
                  type="text"
                  value={formData.feature1_desc}
                  onChange={(e) => setFormData({ ...formData, feature1_desc: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 border-t border-zinc-800/50 pt-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Badge 2 Heading</label>
                <input
                  type="text"
                  value={formData.feature2_title}
                  onChange={(e) => setFormData({ ...formData, feature2_title: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Badge 2 Info Description</label>
                <input
                  type="text"
                  value={formData.feature2_desc}
                  onChange={(e) => setFormData({ ...formData, feature2_desc: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 border-t border-zinc-800/50 pt-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Badge 3 Heading</label>
                <input
                  type="text"
                  value={formData.feature3_title}
                  onChange={(e) => setFormData({ ...formData, feature3_title: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Badge 3 Info Description</label>
                <input
                  type="text"
                  value={formData.feature3_desc}
                  onChange={(e) => setFormData({ ...formData, feature3_desc: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-yellow-400 text-zinc-950 hover:bg-yellow-500 font-bold uppercase tracking-wider text-xs px-6 py-2.5 flex items-center gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4 stroke-[2.5]" />
            )}
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
