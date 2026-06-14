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
import { Plus, Pencil, Trash2, Link as LinkIcon, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdminPage,
});

interface FormState {
  id?: string;
  title: string;
  description: string;
  price: string;            // Best / selling price
  compare_at_price: string; // Original (MRP) — shown crossed out
  currency: string;
  image_url: string;
  image_2: string;
  image_3: string;
  in_stock: boolean;
  sort_order: string;
  category_id: string;
  highlights: string; // newline-separated bullets in the form
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
    const extraImages = [form.image_2, form.image_3]
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

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
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Product link copied!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const products = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-wide">Products</h1>
          <p className="text-sm text-muted-foreground">
            Add, edit, and delete products. They appear on your public shop instantly.
          </p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-card" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg text-muted-foreground">No products yet.</p>
          <Button onClick={openNew} className="mt-4 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" /> Add your first product
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-square bg-secondary">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  {!p.in_stock && (
                    <span className="rounded bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                      Sold out
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(p.price, p.currency)}
                  {p.compare_at_price != null && (
                    <span className="ml-2 line-through opacity-60">
                      {formatPrice(p.compare_at_price, p.currency)}
                    </span>
                  )}
                </p>
                <div className="mt-2 flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1">
                  <LinkIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground truncate select-all" title={`/product/${p.id}`}>
                    /product/{p.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyProductLink(p.id)}
                    className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                    title="Copy product link"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="flex-1">
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(p)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase tracking-wide">
              {form.id ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price">Best Price</Label>
                <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 1499" />
                <p className="mt-1 text-[11px] text-muted-foreground">Selling price shown to customers.</p>
              </div>
              <div>
                <Label htmlFor="compare">Original Price</Label>
                <Input
                  id="compare"
                  type="number"
                  step="0.01"
                  value={form.compare_at_price}
                  onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                  placeholder="e.g. 1999"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Optional. Shown crossed out next to best price.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="INR" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="image">Main Image URL</Label>
                <Input id="image" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="mt-2 h-24 w-24 rounded-md border border-border object-cover" />
                )}
              </div>
              <div>
                <Label htmlFor="image2">Side Image 1 (Optional)</Label>
                <Input id="image2" value={form.image_2} onChange={(e) => setForm({ ...form, image_2: e.target.value })} placeholder="https://..." />
                {form.image_2 && (
                  <img src={form.image_2} alt="preview 2" className="mt-2 h-24 w-24 rounded-md border border-border object-cover" />
                )}
              </div>
              <div>
                <Label htmlFor="image3">Side Image 2 (Optional)</Label>
                <Input id="image3" value={form.image_3} onChange={(e) => setForm({ ...form, image_3: e.target.value })} placeholder="https://..." />
                {form.image_3 && (
                  <img src={form.image_3} alt="preview 3" className="mt-2 h-24 w-24 rounded-md border border-border object-cover" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sort">Sort order</Label>
                <Input id="sort" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div className="flex items-end gap-3 pb-2">
                <Switch id="in_stock" checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
                <Label htmlFor="in_stock">In stock</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? "Saving…" : form.id ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
