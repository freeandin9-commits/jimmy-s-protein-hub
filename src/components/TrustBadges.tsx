import { ShieldCheck, Truck, Coins, BadgeCheck } from "lucide-react";

const badges = [
  { icon: ShieldCheck, title: "100% Safe & Secure Payments" },
  { icon: Truck, title: "Available Shipping" },
  { icon: Coins, title: "Shop with us & earn MB Cash" },
  { icon: BadgeCheck, title: "Authenticity Guaranteed" },
];

export function TrustBadges() {
  return (
    <section className="border-y border-border bg-card/30">
      <div className="container mx-auto grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border px-0 py-0 md:grid-cols-4">
        {badges.map((b) => (
          <div
            key={b.title}
            className="flex flex-col items-center justify-center gap-3 bg-background px-4 py-8 text-center"
          >
            <b.icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-foreground sm:text-base">
              {b.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
