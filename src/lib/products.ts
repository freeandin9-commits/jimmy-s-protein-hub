import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  in_stock: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function fetchProducts(limit = 50): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Product | null) ?? null;
}

export function formatPrice(amount: string | number, currency = "INR") {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}
