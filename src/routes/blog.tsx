import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Nutrin Sports" },
      { name: "description", content: "Tips, guides, and insights on nutrition, training, and supplements from Nutrin Sports." },
      { property: "og:title", content: "Blog — Nutrin Sports" },
      { property: "og:description", content: "Tips, guides, and insights on nutrition, training, and supplements." },
    ],
  }),
  component: BlogPage,
});

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
};

const posts: Post[] = [
  {
    slug: "whey-vs-isolate",
    title: "Whey Protein vs Isolate: Which One Should You Pick?",
    excerpt: "Understand the difference between whey concentrate and isolate, and choose the right one for your goals.",
    date: "Jun 2, 2026",
    category: "Nutrition",
  },
  {
    slug: "pre-workout-guide",
    title: "A Beginner's Guide to Pre-Workout Supplements",
    excerpt: "What ingredients actually matter, how to time your dose, and when you don't need a pre-workout at all.",
    date: "May 24, 2026",
    category: "Training",
  },
  {
    slug: "creatine-myths",
    title: "Creatine: 5 Common Myths Debunked",
    excerpt: "Creatine is one of the most researched supplements out there — here's what the science actually says.",
    date: "May 10, 2026",
    category: "Supplements",
  },
];

function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Nutrin Journal</p>
        <h1 className="mt-2 font-display text-4xl uppercase tracking-wide md:text-5xl">Blog</h1>
        <p className="mt-3 text-muted-foreground">
          Practical tips on training, nutrition and supplements from the Nutrin Sports team.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.slug}
            className="flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary">{p.category}</span>
            <h2 className="mt-2 font-display text-xl uppercase tracking-wide">{p.title}</h2>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.excerpt}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{p.date}</span>
              <Link to="/blog" className="font-bold uppercase tracking-wider text-primary hover:opacity-80">
                Read →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
