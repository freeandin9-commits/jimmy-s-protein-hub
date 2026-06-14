import { ShieldCheck, Truck, Coins, BadgeCheck } from "lucide-react";

const badges = [
  { icon: ShieldCheck, title: "100% Safe & Secure Payments" },
  { icon: Truck, title: "Available Shipping" },
  { icon: Coins, title: "Shop with us & earn MB Cash" },
  { icon: BadgeCheck, title: "Authenticity Guaranteed" },
];

export function TrustBadges() {
  return (
    // Changed bg-card/30 to bg-white
    <section className="border-y border-border bg-white py-4">
      <div className="container mx-auto grid grid-cols-2 gap-4 px-4 md:grid-cols-4">
        {badges.map((b, index) => (
          <div
            key={b.title}
            style={{ animationDelay: `${index * 100}ms` }}
            // Changed bg-background to bg-yellow-400 (or use bg-[#facc15])
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-yellow-400 px-4 py-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-black/30 hover:shadow-md hover:bg-yellow-500 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          >
            {/* Changed bg-primary/10 to bg-black/10 and group-hover bg */}
            <div className="rounded-full bg-black/10 p-3 transition-transform duration-300 group-hover:scale-110 group-hover:bg-black/20">
              <b.icon
                // Changed text-primary to text-black
                className="h-8 w-8 text-black transition-transform duration-500 group-hover:rotate-[360deg]"
                strokeWidth={1.5}
              />
            </div>
            {/* Changed text-foreground to text-black and removed primary text hover */}
            <p className="text-sm font-semibold text-black sm:text-base transition-colors duration-300">{b.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
