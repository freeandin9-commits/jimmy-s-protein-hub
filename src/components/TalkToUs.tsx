import { Mail, MessageCircle, Instagram } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function TalkToUs() {
  const { settings } = useSiteSettings();

  const whatsappNumber = (settings?.whatsapp_number || "").replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Nutrin Sports — I have a question about ")}`;
  const emailHref = settings?.contact_email ? `mailto:${settings.contact_email}` : "#";
  const instagramHref = settings?.instagram_url || "#";

  const getInstagramUsername = (url: string | undefined) => {
    if (!url) return "@nutrinsports";
    try {
      const pathname = new URL(url).pathname.replace(/\//g, "");
      return pathname ? `@${pathname}` : "@nutrinsports";
    } catch {
      return "@nutrinsports";
    }
  };

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">Get in touch</p>
      <h2 className="mt-2 font-display text-4xl uppercase tracking-wide md:text-6xl">Talk to us</h2>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Orders, refills, wholesale, sponsorships — easiest way is WhatsApp. We reply fast.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-[var(--shadow-glow)]"
        >
          <MessageCircle className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-display text-2xl uppercase tracking-wide">WhatsApp</h3>
          <p className="mt-1 text-sm text-muted-foreground">Fastest reply. Order, ask anything.</p>
          <p className="mt-3 text-sm font-bold text-primary group-hover:underline">Chat now →</p>
        </a>

        <a
          href={emailHref}
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-[var(--shadow-glow)]"
        >
          <Mail className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-display text-2xl uppercase tracking-wide">Email</h3>
          <p className="mt-1 text-sm text-muted-foreground">For wholesale & detailed enquiries.</p>
          <p className="mt-3 text-sm font-bold text-primary group-hover:underline break-all">
            {settings?.contact_email || "Email not available"}
          </p>
        </a>

        <a
          href={instagramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-[var(--shadow-glow)]"
        >
          <Instagram className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-display text-2xl uppercase tracking-wide">Instagram</h3>
          <p className="mt-1 text-sm text-muted-foreground">Drops, athlete content, behind the scenes.</p>
          <p className="mt-3 text-sm font-bold text-primary group-hover:underline">
            {getInstagramUsername(settings?.instagram_url)}
          </p>
        </a>
      </div>
    </section>
  );
}
