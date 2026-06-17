import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/products";
import {
  Zap,
  Shield,
  Flame,
  ArrowRight,
  Phone,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  MessageCircle, // Added for WhatsApp icon
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { AdsStrip } from "@/components/AdsStrip";
import { SearchBar } from "@/components/SearchBar";
import { CategoriesSection } from "@/components/CategoriesSection";
import { InstagramSection } from "@/components/InstagramSection";
import { TrustBadges } from "@/components/TrustBadges";

// ... (Route definition remains the same)

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const { settings } = useSiteSettings();

  const whatsappNumber = settings?.whatsapp_number || "919142027275";
  const displayPhone = settings?.contact_phone || "919142027275";
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi,%20I'm%20interested%20in%20your%20products!`;

  // ... (scroll and toggleMute functions remain the same)

  // ... (useEffect remains the same)

  return (
    <div className="relative w-full">
      {/* SEARCH BAR & ADS STRIP */}
      <div className="sticky top-[73px] z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
        <SearchBar />
        <AdsStrip />
      </div>

      <CategoriesSection />

      {/* ... (Rest of your sections: Hero, Benefits, Products, TrustBadges, Instagram) */}

      {/* WhatsApp Floating Widget */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#128C7E]"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="h-8 w-8" />
      </a>
    </div>
  );
}
