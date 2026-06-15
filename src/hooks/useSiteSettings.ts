import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  whatsapp_number: string;
  hero_headline: string;
  hero_subtext: string;
  hero_badge_text: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_image_url: string | null;
  hero_video_url: string | null;
  hero_media_type: "image" | "video";
  contact_email: string;
  contact_phone: string;
  instagram_url: string;
  facebook_url: string;
  address: string;
  business_hours: string;
  logo_url: string | null;
}

const FALLBACK: SiteSettings = {
  id: "",
  whatsapp_number: "910000000000",
  hero_headline: "Real Fuel. No Junk.",
  hero_subtext: "Premium protein for athletes who train hard.",
  hero_badge_text: "100% Premium Quality",
  hero_cta_text: "Buy Now",
  hero_cta_link: "/products",
  hero_image_url: null,
  hero_video_url: null,
  hero_media_type: "image",
  contact_email: "hello@jimmysprotein.com",
  contact_phone: "",
  instagram_url: "",
  facebook_url: "",
  address: "",
  business_hours: "Mon-Sat 10am-8pm",
  logo_url: null,
};

export function useSiteSettings() {
  const query = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as SiteSettings) ?? FALLBACK;
    },
    staleTime: 60_000,
  });

  return {
    settings: query.data ?? FALLBACK,
    isLoading: query.isLoading,
  };
}
