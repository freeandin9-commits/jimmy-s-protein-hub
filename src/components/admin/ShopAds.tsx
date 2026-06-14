import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Image, Save, Loader2 } from "lucide-react";

export function ShopAds() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner1, setBanner1] = useState("");
  const [banner2, setBanner2] = useState("");
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // നിലവിലുള്ള സെറ്റിങ്സ് ലോഡ് ചെയ്യുന്നു
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettingsId(data.id);
          // Type casting to bypass TS error if columns don't exist yet in types
          const dataAny = data as any;
          setBanner1(dataAny.shop_side_banner_1 || "");
          setBanner2(dataAny.shop_side_banner_2 || "");
        }
      } catch (error) {
        console.error("Error loading shop ads settings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // മാറ്റങ്ങൾ Supabase-ലേക്ക് സേവ് ചെയ്യുന്നു
  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: any = {
        shop_side_banner_1: banner1.trim(),
        shop_side_banner_2: banner2.trim(),
      };

      let error;
      if (settingsId) {
        const { error: updateError } = await supabase
          .from("site_settings")
          .update(updateData)
          .eq("id", settingsId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("site_settings")
          .insert([updateData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shop Side Banners updated successfully!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: error.message || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-6">
        <Image className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-display text-xl uppercase tracking-wide">Shop Side Banners (Ads)</h2>
          <p className="text-xs text-muted-foreground">
            Manage the promo banners displayed on the left sidebar of the shop page.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* BANNER 1 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground block">
            Side Banner Image URL 1
          </label>
          <Input
            type="text"
            placeholder="https://example.com/banner1.jpg"
            value={banner1}
            onChange={(e) => setBanner1(e.target.value)}
            className="bg-background"
          />
          {banner1 && (
            <div className="mt-2 relative aspect-[4/3] max-w-[180px] overflow-hidden rounded-lg border border-border">
              <img src={banner1} alt="Preview 1" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* BANNER 2 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground block">
            Side Banner Image URL 2
          </label>
          <Input
            type="text"
            placeholder="https://example.com/banner2.jpg"
            value={banner2}
            onChange={(e) => setBanner2(e.target.value)}
            className="bg-background"
          />
          {banner2 && (
            <div className="mt-2 relative aspect-[4/3] max-w-[180px] overflow-hidden rounded-lg border border-border">
              <img src={banner2} alt="Preview 2" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="min-w-[120px] font-bold uppercase tracking-wider text-xs"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
