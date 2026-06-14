import { ShieldCheck, Truck, Coins, BadgeCheck } from "lucide-react";

const badges = [
  { icon: ShieldCheck, title: "100% Safe & Secure Payments" },
  { icon: Truck, title: "Available Shipping" },
  { icon: Coins, title: "Shop with us & earn MB Cash" },
  { icon: BadgeCheck, title: "Authenticity Guaranteed" },
];

export function TrustBadges() {
  return (
    <section className="border-y border-border bg-amber-50/40 dark:bg-amber-950/10 py-6">
      <div className="container mx-auto grid grid-cols-2 gap-4 px-4 md:grid-cols-4">
        {badges.map((b, index) => (
          <div
            key={b.title}
            style={{ animationDelay: `${index * 100}ms` }}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-200/60 dark:border-amber-900/30 bg-amber-500/5 px-4 py-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-md hover:bg-amber-50 dark:hover:bg-amber-950/30 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          >
            <div className="rounded-full bg-amber-500/10 p-3 transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
              <b.icon
                className="h-8 w-8 text-amber-600 dark:text-amber-400 transition-transform duration-500 group-hover:rotate-[360deg]"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm font-semibold text-foreground sm:text-base transition-colors duration-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
              {b.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
