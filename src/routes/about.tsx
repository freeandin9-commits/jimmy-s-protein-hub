import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell, Leaf, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Jimmy's Protein" },
      { name: "description", content: "Jimmy's story: built in the gym, made for athletes who don't compromise on what they put in their body." },
      { property: "og:title", content: "About — Jimmy's Protein" },
      { property: "og:description", content: "Built in the gym. Made for athletes." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="border-b border-border bg-card/40">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Our Story</p>
          <h1 className="mt-2 max-w-3xl font-display text-5xl uppercase leading-tight tracking-wide md:text-7xl">
            Built in the gym.<br />
            Made for the <span className="text-primary">grind</span>.
          </h1>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-4 text-lg text-muted-foreground">
          <p>
            Jimmy started lifting when he was 16. By 22, he was sick of protein powders that
            tasted like chalk, hid junk on the label, and treated athletes like marketing targets.
          </p>
          <p>
            So he built his own. One flavor at a time. Tested by real lifters in real gyms.
            No celebrity endorsements. No fake reviews. Just protein that does its job —
            and tastes like it should.
          </p>
          <p className="font-bold text-foreground">
            Real fuel. No junk. That's the whole brand.
          </p>
        </div>
        <div className="grid gap-4">
          {[
            { icon: Dumbbell, title: "Athlete-tested", desc: "Every flavor blind-tested by real athletes before it ever hits the shelf." },
            { icon: Leaf, title: "Clean sourcing", desc: "Whey from grass-fed sources. No artificial colors, no banned substances." },
            { icon: Award, title: "Lab-verified", desc: "Every batch independently tested for purity, protein content, and contaminants." },
          ].map((b) => (
            <div key={b.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <div className="rounded-lg bg-primary/15 p-3 text-primary">
                <b.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl uppercase tracking-wide">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
