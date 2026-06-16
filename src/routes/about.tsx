import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Leaf, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const [content, setContent] = useState({
    title_line1: "Built in the gym.",
    title_line2: "Made for the",
    title_highlight: "grind",
    story_p1: "Jimmy started lifting when he was 16. By 22, he was sick of protein powders that tasted like chalk...",
    story_p2: "So he built his own. One flavor at a time...",
    story_footer: "Real fuel. No junk. That's the whole brand.",
    feature1_title: "Athlete-tested",
    feature1_desc: "Every flavor blind-tested by real athletes before it ever hits the shelf.",
    feature2_title: "Clean sourcing",
    feature2_desc: "Whey from grass-fed sources...",
    feature3_title: "Lab-verified",
    feature3_desc: "Every batch independently tested...",
  });

  useEffect(() => {
    async function loadContent() {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "about_page_content").single();
      if (data?.value) setContent(data.value as any);
    }
    loadContent();
  }, []);

  return (
    <div>
      <section className="border-b border-border bg-card/40">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Our Story</p>
          <h1 className="mt-2 max-w-3xl font-display text-5xl uppercase leading-tight tracking-wide md:text-7xl">
            {content.title_line1}
            <br />
            {content.title_line2} <span className="text-primary">{content.title_highlight}</span>
          </h1>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-4 text-lg text-muted-foreground">
          <p>{content.story_p1}</p>
          <p>{content.story_p2}</p>
          <p className="font-bold text-foreground">{content.story_footer}</p>
        </div>
        <div className="grid gap-4">
          {[
            { icon: Dumbbell, title: content.feature1_title, desc: content.feature1_desc },
            { icon: Leaf, title: content.feature2_title, desc: content.feature2_desc },
            { icon: Award, title: content.feature3_title, desc: content.feature3_desc },
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
