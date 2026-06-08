import { Instagram } from "lucide-react";

const PROFILE_IMG =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80";

const highlights = [
  { label: "Sponsored", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80" },
  { label: "X'mas", img: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=300&q=80" },
  { label: "Motivation", img: "https://images.unsplash.com/photo-1583500178690-f7fd39b0eb84?auto=format&fit=crop&w=300&q=80" },
  { label: "Ramadan", img: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=300&q=80" },
  { label: "Pintola", img: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=300&q=80" },
  { label: "Highlights", img: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80" },
  { label: "Nutritions", img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=300&q=80" },
];

const posts = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80",
];

const PROFILE_URL = "https://www.instagram.com/nutrinsports/";

export function InstagramSection() {
  return (
    <section className="bg-black text-foreground">
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-20">
        {/* Profile header */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="shrink-0"
          >
            <div className="rounded-full p-[3px] bg-gradient-to-tr from-primary via-accent to-primary">
              <img
                src={PROFILE_IMG}
                alt="Nutrin Sports Instagram"
                className="h-24 w-24 rounded-full border-2 border-black object-cover sm:h-32 sm:w-32"
              />
            </div>
          </a>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <a
                href={PROFILE_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xl font-light tracking-wide text-white hover:text-primary"
              >
                nutrinsports
              </a>
              <a
                href={PROFILE_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
              >
                <Instagram className="h-4 w-4" /> Follow
              </a>
            </div>
            <p className="mt-2 text-sm font-semibold text-white/90">Nutrin Sports</p>
            <div className="mt-3 flex flex-wrap justify-center gap-6 text-sm text-white/80 sm:justify-start">
              <span><b className="text-white">86</b> posts</span>
              <span><b className="text-white">309</b> followers</span>
              <span><b className="text-white">800</b> following</span>
            </div>
            <div className="mt-3 text-sm text-white/70">
              <p className="font-semibold text-white/90">Health Food Store</p>
              <p>Nutritions and Fitness Solutions</p>
              <p>Changaramkulam, Malapuram — Kerala, India.</p>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-10 flex gap-5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {highlights.map((h) => (
            <a
              key={h.label}
              href={PROFILE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex w-[80px] shrink-0 flex-col items-center gap-2 sm:w-[92px]"
            >
              <div className="rounded-full p-[2px] ring-1 ring-white/30 group-hover:ring-primary">
                <img
                  src={h.img}
                  alt={h.label}
                  className="h-[72px] w-[72px] rounded-full border-2 border-black object-cover sm:h-[84px] sm:w-[84px]"
                />
              </div>
              <span className="text-xs font-medium text-white/80 group-hover:text-primary">
                {h.label}
              </span>
            </a>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex justify-center gap-16 border-t border-white/15 pt-4 text-xs font-bold uppercase tracking-[0.25em] text-white/60">
          <span className="border-t border-white pt-3 -mt-[1px] text-white">Posts</span>
          <span>Reels</span>
          <span>Tagged</span>
        </div>

        {/* Posts grid */}
        <div className="mt-2 grid grid-cols-3 gap-1 sm:gap-2">
          {posts.map((src, i) => (
            <a
              key={i}
              href={PROFILE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative block aspect-square overflow-hidden"
            >
              <img
                src={src}
                alt={`Instagram post ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/40" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
