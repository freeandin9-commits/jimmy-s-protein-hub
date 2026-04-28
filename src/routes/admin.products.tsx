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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdminPage,
});

interface FormState {
  id?: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  image_url: string;
  in_stock: boolean;
  sort_order: string;
}

const empty: FormState = {
  title: "",
  description: "",
  price: "",
  currency: "INR",
  image_url: "",
  in_stock: true,
  sort_order: "0",
};

function ProductsAdminPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => fetchProducts(200),
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
      currency: p.currency,
      image_url: p.image_url,
      in_stock: p.in_stock,
      sort_order: String(p.sort_order),
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
      toast.error("Enter a valid price");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description,
      price: priceNum,
      currency: form.currency.trim() || "INR",
      image_url: form.image_url.trim(),
      in_stock: form.in_stock,
      sort_order: parseInt(form.sort_order) || 0,
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
                <p className="text-sm text-muted-foreground">{formatPrice(p.price, p.currency)}</p>
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
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="INR" />
              </div>
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              {form.image_url && (
                <img src={form.image_url} alt="preview" className="mt-2 h-32 w-32 rounded-md border border-border object-cover" />
              )}
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
