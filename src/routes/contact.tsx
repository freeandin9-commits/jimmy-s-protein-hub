import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Instagram } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Jimmy's Protein" },
      {
        name: "description",
        content: "Questions about products, orders, or wholesale? Reach Jimmy's Protein on WhatsApp, email, or social.",
      },
      { property: "og:title", content: "Contact — Jimmy's Protein" },
      { property: "og:description", content: "Get in touch with Jimmy's Protein." },
    ],
  }),
  component: ContactPage,
});

interface FAQItem {
  q: string;
  a: string;
}

function ContactPage() {
  const { settings, isLoading } = useSiteSettings();

  // Settings ലോഡ് ആകുന്നത് വരെ ഒരു സിമ്പിൾ ലോഡിങ് കാണിക്കുന്നു
  if (isLoading || !settings) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading contact details...</p>
      </div>
    );
  }

  // Admin settings-ൽ നിന്നുള്ള ഡാറ്റ വെച്ച് ലിങ്കുകൾ ഡൈനാമിക് ആക്കുന്നു
  const whatsappNumber = settings.whatsapp_number?.replace(/[^0-9]/g, "") || "";
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Jimmy's — I have a question about ")}`;
  const emailHref = settings.contact_email ? `mailto:${settings.contact_email}` : "#";
  const instagramHref = settings.instagram_url || "#";

  // Dynamic FAQs admin settings-ൽ നിന്ന് എടുക്കുന്നു (ഇല്ലെങ്കിൽ ഒരു default fallback അറേ)
  const faqList: FAQItem[] = Array.isArray(settings.faq)
    ? settings.faq
    : [
        {
          q: "How does ordering work?",
          a: "Add what you want to the cart, hit 'Order on WhatsApp' — we confirm stock, share payment details, and ship out.",
        },
        {
          q: "What payment methods do you accept?",
          a: "UPI, bank transfer, and cash on delivery in select areas. We confirm options on WhatsApp.",
        },
        {
          q: "How long does delivery take?",
          a: "2–5 business days for most metros, 5–8 for the rest. Tracking shared on WhatsApp.",
        },
        { q: "Do you do wholesale?", a: "Yes. Email hello@jimmysprotein.com or WhatsApp us with your store details." },
      ];

  // Instagram യൂസർനെയിം URL-ൽ നിന്ന് വേർതിരിച്ചെടുക്കാൻ
  const getInstagramUsername = (url: string) => {
    if (!url || url === "#") return "@jimmysprotein";
    try {
      const pathname = new URL(url).pathname;
      const cleanPath = pathname.replace(/\//g, "");
      return cleanPath ? `@${cleanPath}` : "@jimmysprotein";
    } catch (e) {
      return "@jimmysprotein";
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">Get in touch</p>
      <h1 className="mt-2 font-display text-5xl uppercase tracking-wide md:text-6xl">Talk to us</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Orders, refills, wholesale, sponsorships — easiest way is WhatsApp. We reply fast.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {/* WhatsApp Card */}
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

        {/* Email Card */}
        <a
          href={emailHref}
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-[var(--shadow-glow)]"
        >
          <Mail className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-display text-2xl uppercase tracking-wide">Email</h3>
          <p className="mt-1 text-sm text-muted-foreground">For wholesale & detailed enquiries.</p>
          <p className="mt-3 text-sm font-bold text-primary group-hover:underline break-all">
            {settings.contact_email || "Email not available"}
          </p>
        </a>

        {/* Instagram Card */}
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
            {getInstagramUsername(settings.instagram_url)}
          </p>
        </a>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl uppercase tracking-wide">FAQ</h2>
        <div className="mt-6 space-y-4">
          {faqList.map((f, i) => (
            <details key={i} className="group rounded-lg border border-border bg-card p-4">
              <summary className="cursor-pointer font-bold">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10">
          <Button
            asChild
            size="lg"
            className="h-12 bg-[var(--whatsapp)] px-8 font-bold uppercase tracking-wider text-[var(--whatsapp-foreground)] hover:bg-[var(--whatsapp)]/90"
          >
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              Message us on WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
