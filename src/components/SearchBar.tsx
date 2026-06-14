import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

export function SearchBar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate({ to: "/products", search: term ? { q: term } : {} });
  };

  return (
    <section className="border-b border-border/40 bg-gradient-to-b from-background to-background/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 md:py-5">
        <form onSubmit={onSubmit} className="relative mx-auto flex w-full max-w-3xl items-center">
          {/* Animated Search Icon */}
          <div className="pointer-events-none absolute left-4.5 z-10 flex items-center justify-center text-muted-foreground transition-colors group-focus-within:text-primary md:left-5">
            <Search className="h-5 w-5 md:h-6 md:w-6" />
          </div>

          {/* Premium Input Field */}
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for premium products, brands..."
            aria-label="Search the store"
            className="h-14 w-full rounded-full border border-border/80 bg-card/60 pl-12 pr-32 text-base font-medium shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/80 placeholder:font-normal focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 focus:shadow-md md:h-16 md:pl-14 md:pr-36 md:text-lg"
          />

          {/* Modern & Attractive Search Button */}
          <button
            type="submit"
            className="absolute right-2 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105 hover:opacity-95 hover:shadow-md active:scale-95 md:h-12 md:px-7 md:text-sm"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
