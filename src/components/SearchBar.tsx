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
    <section className="border-b border-border/60 bg-background">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <form onSubmit={onSubmit} className="relative mx-auto flex w-full max-w-3xl items-center">
          
          {/* Search Icon - Increased size and adjusted padding */}
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground md:h-6 md:w-6 md:left-5" />
          
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, categories…"
            aria-label="Search the store"
            {/* Increased height, font size, and responsive padding */}
            className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-28 text-base shadow-md outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 md:h-16 md:pl-14 md:pr-32 md:text-lg"
          />
          
          {/* Search Button - Made larger to match the input height */}
          <button
            type="submit"
            className="absolute right-2 inline-flex h-10 items-center rounded-full bg-primary px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 md:h-12 md:px-6 md:text-sm"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}