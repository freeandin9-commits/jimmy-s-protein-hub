import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Dumbbell, Leaf, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Jimmy's Protein" },
      {
        name: "description",
        content:
          "Jimmy's story: built in the gym, made for athletes who don't compromise on what they put in their body.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const [content, setContent] = useState({
    title_line1: "Built in the gym.",
    title_line2: "Made for the",
    title_highlight: "grind",
    story_p1:
      "Jimmy started lifting when he was 16. By 22, he was sick of protein powders that tasted like chalk, hid junk on the label, and treated athletes like marketing targets.",
    story_p2:
      "So he built his own. One flavor at a time. Tested by real lifters in real gyms. No celebrity endorsements. No fake reviews. Just protein that does its job — and tastes like it should.",
    story_footer: "Real fuel. No junk. That's the whole brand.",
    feature1_title: "Athlete-tested",
    feature1_desc: "Every flavor blind-tested by real athletes before it ever hits the shelf.",
    feature2_title: "Clean sourcing",
    feature2_desc: "Whey from grass-fed sources. No artificial colors, no banned substances.",
    feature3_title: "Lab-verified",
    feature3_desc: "Every batch independently tested for purity, protein content, and contaminants.",
  });

  useEffect(() => {
    // LocalStorage-ൽ നിന്ന് ഡാറ്റ എടുക്കുന്നു
    const savedContent = localStorage.getItem("about_page_content");
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch (e) {
        console.error("Error parsing about content", e);
      }
    }
  }, []);

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen">
      <section className="border-b border-zinc-800 bg-zinc-900/20">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">Our Story</p>
          <h1 className="mt-2 max-w-3xl font-display text-5xl font-black uppercase leading-tight tracking-wide md:text-7xl">
            {content.title_line1}
            <br />
            {content.title_line2} <span className="text-yellow-400">{content.title_highlight}</span>
          </h1>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-4 text-lg text-zinc-400">
          <p>{content.story_p1}</p>
          <p>{content.story_p2}</p>
          <p className="font-bold text-zinc-100">{content.story_footer}</p>
        </div>
        <div className="grid gap-4">
          {[
            { icon: Dumbbell, title: content.feature1_title, desc: content.feature1_desc },
            { icon: Leaf, title: content.feature2_title, desc: content.feature2_desc },
            { icon: Award, title: content.feature3_title, desc: content.feature3_desc },
          ].map((b) => (
            <div key={b.title} className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <div className="rounded-lg bg-yellow-400/10 p-3 text-yellow-400 h-12 w-12 flex items-center justify-center shrink-0">
                <b.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-zinc-200">{b.title}</h3>
                <p className="text-sm text-zinc-400 mt-1">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
