import { Instagram, ExternalLink } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function InstagramSection() {
  const { settings } = useSiteSettings();
  const url = settings.instagram_url?.trim();

  if (!url) return null;

  // Derive handle from URL for display
  let handle = "instagram";
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean)[0];
    if (seg) handle = seg;
  } catch {
    /* ignore */
  }

  const profileUrl = `https://www.instagram.com/${handle}/`;
  const embedUrl = `https://www.instagram.com/${handle}/embed`;

  return (
    <section className="bg-black text-foreground">
      <div className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-tr from-primary via-accent to-primary p-[2px]">
              <div className="rounded-md bg-black px-3 py-2">
                <Instagram className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-wider text-white sm:text-2xl">
                @{handle}
              </h2>
              <p className="text-xs text-white/60">Follow us on Instagram</p>
            </div>
          </div>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
          >
            <Instagram className="h-4 w-4" /> Open on Instagram
          </a>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white">
          <iframe
            src={embedUrl}
            title={`Instagram @${handle}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="block h-[720px] w-full md:h-[820px]"
          />
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-md bg-black/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View full profile
          </a>
        </div>
      </div>
    </section>
  );
}
