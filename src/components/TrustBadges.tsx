import { ShieldCheck, Truck, Coins, BadgeCheck } from "lucide-react";

const badges = [
  { icon: ShieldCheck, title: "100% Safe & Secure Payments" },
  { icon: Truck, title: "Available Shipping" },
  { icon: Coins, title: "Shop with us & earn MB Cash" },
  { icon: BadgeCheck, title: "Authenticity Guaranteed" },
];

export function TrustBadges() {
  return (
    <section className="border-y border-border bg-card/30 py-4">
      <div className="container mx-auto grid grid-cols-2 gap-4 px-4 md:grid-cols-4">
        {badges.map((b, index) => (
          <div
            key={b.title}
            style={{ animationDelay: `${index * 100}ms` }}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md hover:bg-white animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          >
            <div className="rounded-full bg-primary/10 p-3 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
              <b.icon
                className="h-8 w-8 text-primary transition-transform duration-500 group-hover:rotate-[360deg]"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm font-semibold text-foreground sm:text-base transition-colors duration-300 group-hover:text-primary">
              {b.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
