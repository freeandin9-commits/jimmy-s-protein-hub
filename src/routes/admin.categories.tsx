import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Tags, Layers, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesAdminPage,
});

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
  image_url: string;
  sort_order: string;
  active: boolean;
};

const empty: FormState = { name: "", slug: "", image_url: "", sort_order: "0", active: true };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function CategoriesAdminPage() {
  const qc = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openNew = () => {
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (c: Category) => {
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image_url: c.image_url ?? "",
      sort_order: String(c.sort_order),
      active: c.active,
    });
    setOpen(true);
  };

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    qc.invalidateQueries({ queryKey: ["categories", "public"] });
  };

  const onFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("ads").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = await supabase.storage.from("ads").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (!data?.signedUrl) throw new Error("Failed to get URL");
      setForm((f) => ({ ...f, image_url: data.signedUrl }));
      toast.success("Image uploaded successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    const slug = slugify(form.slug || form.name);
    if (!slug) return toast.error("Slug is required");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug,
      image_url: form.image_url.trim() || null,
      sort_order: parseInt(form.sort_order) || 0,
      active: form.active,
    };
    try {
      if (form.id) {
        const { error } = await supabase.from("categories").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Category updated");
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
        toast.success("Category added");
      }
      setOpen(false);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted successfully");
    refresh();
  };

  const toggleActive = async (c: Category, active: boolean) => {
    await supabase.from("categories").update({ active }).eq("id", c.id);
    refresh();
  };

  return (
    <div className="space-y-8 bg-zinc-950 text-zinc-100 antialiased min-h-screen pb-12">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-400/10">
            <Tags className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-wider text-yellow-400">
              Store Categories
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-0.5">
              Classify supplements and proteins into navigational landing clusters.
            </p>
          </div>
        </div>
        <Button
          onClick={openNew}
          className="bg-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-widest hover:bg-yellow-300 h-11 px-5 shadow-lg shadow-yellow-400/5 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="mr-1.5 h-4 w-4 stroke-[2.5]" /> Add Category
        </Button>
      </div>

      {/* Main Container View */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="text-xs uppercase font-black tracking-widest text-zinc-500 animate-pulse">
            Syncing category matrix layer…
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-16 text-center bg-zinc-900/10 max-w-xl mx-auto mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            No storefront classifications configured yet
          </p>
          <Button
            onClick={openNew}
            className="mt-4 bg-zinc-900 border border-zinc-800 text-yellow-400 hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider px-5 h-10"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Deploy First Category
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm shadow-xl hover:border-zinc-700/80 transition-all duration-200 group flex flex-col"
            >
              {/* Image Preview Canvas */}
              <div className="aspect-[4/3] bg-zinc-950 relative overflow-hidden border-b border-zinc-950">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-zinc-600 gap-2">
                    <ImageIcon className="h-8 w-8 stroke-[1.5]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Asset Uploaded</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Sort Index:</span>
                  <span className="font-mono text-xs text-yellow-400 font-bold">{c.sort_order}</span>
                </div>

                {!c.active && (
                  <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center">
                    <span className="border border-zinc-800 px-3 py-1 text-[10px] uppercase font-black tracking-widest text-zinc-500 bg-zinc-900 rounded-md">
                      Hidden Status
                    </span>
                  </div>
                )}
              </div>

              {/* Data Deck Content */}
              <div className="p-4 flex flex-col flex-1 justify-between bg-zinc-900/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display font-black text-sm uppercase tracking-wider text-zinc-100 group-hover:text-yellow-400 transition-colors">
                      {c.name}
                    </h3>
                    <p className="truncate font-mono text-[10px] text-zinc-500 mt-0.5">/{c.slug}</p>
                  </div>

                  <div className="flex items-center gap-1.5 border border-zinc-800/80 bg-zinc-950/80 px-2 py-1 rounded-md shrink-0">
                    <Switch
                      checked={c.active}
                      onCheckedChange={(v) => toggleActive(c, v)}
                      className="data-[state=checked]:bg-yellow-400 data-[state=unchecked]:bg-zinc-800 size-sm scale-90"
                    />
                    <span className="text-[9px] font-black uppercase tracking-wider w-5 text-zinc-400 select-none text-center">
                      {c.active ? "On" : "Off"}
                    </span>
                  </div>
                </div>

                {/* Control Action Nodes */}
                <div className="mt-4 flex gap-2 border-t border-zinc-800/50 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 text-[11px] font-bold uppercase tracking-wider h-9"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Index
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-[11px] font-bold uppercase tracking-wider h-9 px-3"
                    onClick={() => remove(c)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog Box Component */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl">
          <DialogHeader className="border-b border-zinc-800 pb-3">
            <DialogTitle className="font-display text-xl font-black uppercase tracking-wider text-yellow-400 flex items-center gap-2">
              <Layers className="h-5 w-5 stroke-[2]" />
              {form.id ? "Modify Configuration" : "Deploy New Cluster"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Input Form Module 1 */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Classification Title
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })
                }
                placeholder="e.g., Whey Protein Isolates"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-yellow-400 placeholder:text-zinc-600 font-semibold uppercase tracking-wider text-xs h-11"
              />
            </div>

            {/* Input Form Module 2 */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">SEO Router Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="whey-protein-isolates"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-yellow-400 placeholder:text-zinc-700 font-mono text-xs h-11"
              />
            </div>

            {/* Input Form Module 3 */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Asset Cover Image
              </Label>
              <div className="flex gap-2">
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://… CDN network route or upload file"
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-yellow-400 placeholder:text-zinc-600 text-xs h-11"
                />
                <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-4 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 hover:text-yellow-400 transition-all select-none shrink-0">
                  <Upload className="h-4 w-4" />
                  {uploading ? "…" : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                  />
                </label>
              </div>
              {form.image_url && (
                <div className="mt-2 relative p-1 bg-zinc-950 border border-zinc-800 rounded-lg inline-block">
                  <img
                    src={form.image_url}
                    alt="live validation matrix"
                    className="h-20 w-24 rounded-md object-cover"
                  />
                </div>
              )}
            </div>

            {/* Sub Meta Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/60 pt-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Layout Sequence Position
                </Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 focus-visible:ring-yellow-400 font-mono text-xs h-11"
                />
              </div>

              <div className="flex items-center justify-between border border-zinc-800 bg-zinc-950 rounded-lg h-11 px-4 mt-5">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status Active</span>
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                  className="data-[state=checked]:bg-yellow-400 data-[state=unchecked]:bg-zinc-800"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-zinc-800 pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 h-11 text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-widest hover:bg-yellow-300 h-11 px-6 shadow-md shadow-yellow-400/5 transition-colors"
            >
              {saving ? "Saving Shifts…" : form.id ? "Commit Adjustments" : "Deploy Live Cluster"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
