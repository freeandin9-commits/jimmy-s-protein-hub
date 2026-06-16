import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts, formatPrice, type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Link as LinkIcon, Copy, Package, LayoutGrid, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdminPage,
});

interface FormState {
  id?: string;
  title: string;
  description: string;
  price: string;
  compare_at_price: string;
  currency: string;
  image_url: string;
  image_2: string;
  image_3: string;
  in_stock: boolean;
  sort_order: string;
  category_id: string;
  highlights: string;
  ingredients: string;
  how_to_use: string;
  nutrition: string;
}

const empty: FormState = {
  title: "",
  description: "",
  price: "",
  compare_at_price: "",
  currency: "INR",
  image_url: "",
  image_2: "",
  image_3: "",
  in_stock: true,
  sort_order: "0",
  category_id: "",
  highlights: "",
  ingredients: "",
  how_to_use: "",
  nutrition: "",
};

function ProductsAdminPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => fetchProducts(200),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories", "select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      title: p.title,
      description: p.description,
      price: String(p.price),
      compare_at_price: p.compare_at_price != null ? String(p.compare_at_price) : "",
      currency: p.currency,
      image_url: p.image_url,
      image_2: p.images?.[0] ?? "",
      image_3: p.images?.[1] ?? "",
      in_stock: p.in_stock,
      sort_order: String(p.sort_order),
      category_id: p.category_id ?? "",
      highlights: (p.highlights ?? []).join("\n"),
      ingredients: p.ingredients ?? "",
      how_to_use: p.how_to_use ?? "",
      nutrition: p.nutrition ?? "",
    });
    setOpen(true);
  };

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "products"] });

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Enter a valid best price");
      return;
    }
    let compareNum: number | null = null;
    if (form.compare_at_price.trim() !== "") {
      const n = parseFloat(form.compare_at_price);
      if (isNaN(n) || n < 0) {
        toast.error("Enter a valid original price");
        return;
      }
      if (n <= priceNum) {
        toast.error("Original price must be higher than the best price");
        return;
      }
      compareNum = n;
    }
    const extraImages = [form.image_2, form.image_3].map((s) => s.trim()).filter((s) => s.length > 0);

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description,
      price: priceNum,
      compare_at_price: compareNum,
      currency: form.currency.trim() || "INR",
      image_url: form.image_url.trim(),
      images: extraImages,
      in_stock: form.in_stock,
      sort_order: parseInt(form.sort_order) || 0,
      category_id: form.category_id || null,
      highlights: form.highlights
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      ingredients: form.ingredients,
      how_to_use: form.how_to_use,
      nutrition: form.nutrition,
    };
    try {
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product added");
      }
      setOpen(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    refresh();
  };

  const copyProductLink = (productId: string) => {
    const url = `${window.location.origin}/product/${productId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Product link copied!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const products = data ?? [];

  return (
    <div className="space-y-8 bg-[#0B0F17] p-6 rounded-2xl min-h-screen text-slate-100">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#FACC15] mb-1">
            <Package className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Inventory Management</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide text-white">Products</h1>
          <p className="text-sm text-slate-400 mt-1">
            Add, edit, and manage your items. Changes reflect instantly on the public storefront.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-[#FACC15] text-black font-semibold hover:bg-[#E2B80D] transition-all duration-200 px-5 shadow-lg shadow-yellow-500/10 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-2 stroke-[3]" /> Add Product
        </Button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-16 text-center max-w-xl mx-auto my-12">
          <div className="bg-slate-800/80 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#FACC15]">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <p className="text-lg font-medium text-slate-300">No products added yet.</p>
          <p className="text-sm text-slate-500 mt-1 mb-6">Create your first inventory listing to get started.</p>
          <Button onClick={openNew} className="bg-[#FACC15] text-black font-semibold hover:bg-[#E2B80D]">
            <Plus className="h-4 w-4 mr-2 stroke-[3]" /> Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-xl border border-slate-800/80 bg-[#141B2B] hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Image Wrap */}
                <div className="aspect-square bg-slate-900 relative overflow-hidden border-b border-slate-800/60">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-600 text-sm">
                      No image preview
                    </div>
                  )}

                  {/* Status Overlay */}
                  {!p.in_stock && (
                    <div className="absolute top-3 right-3 rounded-full bg-red-500/10 border border-red-500/30 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                      Sold out
                    </div>
                  )}
                </div>

                {/* Info Container */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-white truncate group-hover:text-[#FACC15] transition-colors">
                      {p.title}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-[#FACC15]">{formatPrice(p.price, p.currency)}</span>
                      {p.compare_at_price != null && (
                        <span className="text-xs line-through text-slate-500 font-medium">
                          {formatPrice(p.compare_at_price, p.currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product URL Action Bar */}
                  <div className="flex items-center gap-2 rounded-lg bg-[#0B0F17] border border-slate-800/60 px-2.5 py-1.5">
                    <LinkIcon className="h-3 w-3 shrink-0 text-slate-500" />
                    <span
                      className="text-[11px] font-mono text-slate-400 truncate select-all"
                      title={`/product/${p.id}`}
                    >
                      /product/{p.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyProductLink(p.id)}
                      className="ml-auto shrink-0 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-[#FACC15] transition-colors"
                      title="Copy Link"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 mt-auto flex gap-2 border-t border-slate-800/40 pt-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(p)}
                  className="flex-1 bg-slate-800/60 text-slate-200 hover:bg-[#FACC15] hover:text-black font-semibold transition-all"
                >
                  <Pencil className="h-3 w-3 mr-1.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(p)}
                  className="bg-slate-900/40 text-slate-400 border border-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl bg-[#0F1624] border border-slate-800 text-slate-100">
          <DialogHeader className="border-b border-slate-800 pb-4">
            <DialogTitle className="font-display text-2xl font-bold uppercase tracking-wide text-white">
              {form.id ? "✏️ Edit Product" : "✨ Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Product Title
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
                placeholder="Whey Protein Isolate 1KG"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Description
              </Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
                placeholder="Describe the item benefits, taste, quality..."
              />
            </div>

            {/* Price Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="price"
                  className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-[#FACC15]"
                >
                  Best Selling Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 1499"
                  className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
                />
                <p className="text-[11px] text-slate-500">Price customers actually pay.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="compare" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Original Price (MRP)
                </Label>
                <Input
                  id="compare"
                  type="number"
                  step="0.01"
                  value={form.compare_at_price}
                  onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                  placeholder="e.g. 1999"
                  className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
                />
                <p className="text-[11px] text-slate-500">Will appear crossed out.</p>
              </div>
            </div>

            {/* Currency & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="currency" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Currency
                </Label>
                <Input
                  id="currency"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  placeholder="INR"
                  className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Category
                </Label>
                <select
                  id="category"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-slate-800 bg-[#0B0F17] px-3 py-1 text-sm text-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FACC15]"
                >
                  <option value="" className="bg-[#0B0F17]">
                    — None —
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0B0F17]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Images Stack */}
            <div className="space-y-3 bg-[#0B0F17]/60 p-4 rounded-xl border border-slate-800/80">
              <p className="text-xs font-bold uppercase tracking-wider text-[#FACC15]">Product Gallery URLs</p>

              <div className="space-y-1.5">
                <Label htmlFor="image" className="text-[11px] text-slate-400">
                  Main Display Image
                </Label>
                <Input
                  id="image"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://image-link.com"
                  className="bg-[#0B0F17] border-slate-800 text-white h-8 text-xs focus-visible:ring-[#FACC15]"
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="mt-2 h-16 w-16 rounded-md border border-slate-700 object-cover"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="image2" className="text-[11px] text-slate-400">
                    Side Image 1
                  </Label>
                  <Input
                    id="image2"
                    value={form.image_2}
                    onChange={(e) => setForm({ ...form, image_2: e.target.value })}
                    placeholder="Optional"
                    className="bg-[#0B0F17] border-slate-800 text-white h-8 text-xs focus-visible:ring-[#FACC15]"
                  />
                  {form.image_2 && (
                    <img
                      src={form.image_2}
                      alt="preview 2"
                      className="mt-2 h-12 w-12 rounded-md border border-slate-700 object-cover"
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="image3" className="text-[11px] text-slate-400">
                    Side Image 2
                  </Label>
                  <Input
                    id="image3"
                    value={form.image_3}
                    onChange={(e) => setForm({ ...form, image_3: e.target.value })}
                    placeholder="Optional"
                    className="bg-[#0B0F17] border-slate-800 text-white h-8 text-xs focus-visible:ring-[#FACC15]"
                  />
                  {form.image_3 && (
                    <img
                      src={form.image_3}
                      alt="preview 3"
                      className="mt-2 h-12 w-12 rounded-md border border-slate-700 object-cover"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Info Grid Content */}
            <div className="space-y-4 rounded-xl border border-slate-800 bg-[#0B0F17]/30 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#FACC15]">Advanced Product Details</p>

              <div className="space-y-1.5">
                <Label htmlFor="highlights" className="text-xs font-semibold text-slate-300">
                  Key Highlights
                </Label>
                <Textarea
                  id="highlights"
                  rows={3}
                  value={form.highlights}
                  onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                  placeholder={"One point per line, e.g.\n25g pure whey protein\nRich in BCAA\nZero added sugar"}
                  className="bg-[#0B0F17] border-slate-800 text-white focus-visible:ring-[#FACC15] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ingredients" className="text-xs font-semibold text-slate-300">
                    Ingredients
                  </Label>
                  <Textarea
                    id="ingredients"
                    rows={2}
                    value={form.ingredients}
                    onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                    className="bg-[#0B0F17] border-slate-800 text-white text-xs"
                    placeholder="Whey, premium cocoa..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="how_to_use" className="text-xs font-semibold text-slate-300">
                    How to Use
                  </Label>
                  <Textarea
                    id="how_to_use"
                    rows={2}
                    value={form.how_to_use}
                    onChange={(e) => setForm({ ...form, how_to_use: e.target.value })}
                    className="bg-[#0B0F17] border-slate-800 text-white text-xs"
                    placeholder="Mix 1 scoop with water..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nutrition" className="text-xs font-semibold text-slate-300">
                  Nutrition Information
                </Label>
                <Textarea
                  id="nutrition"
                  rows={2}
                  value={form.nutrition}
                  onChange={(e) => setForm({ ...form, nutrition: e.target.value })}
                  className="bg-[#0B0F17] border-slate-800 text-white text-xs"
                  placeholder="Per serving: 120 kcal, 25g protein..."
                />
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4 items-center bg-[#0B0F17] p-3 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <Label htmlFor="sort" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Display Order
                </Label>
                <Input
                  id="sort"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="bg-[#0F1624] border-slate-800 text-white h-9 focus-visible:ring-[#FACC15]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Label
                  htmlFor="in_stock"
                  className="text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer"
                >
                  In Stock Status
                </Label>
                <Switch
                  id="in_stock"
                  checked={form.in_stock}
                  onCheckedChange={(v) => setForm({ ...form, in_stock: v })}
                  className="data-[state=checked]:bg-[#FACC15] data-[state=unchecked]:bg-slate-800"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-800 pt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="text-slate-400 hover:text-white hover:bg-slate-900"
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-[#FACC15] text-black font-bold hover:bg-[#E2B80D] min-w-[120px]"
            >
              {saving ? "Saving…" : form.id ? "Update Item" : "Publish Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
