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
      <div className="container mx-auto px-4 py-3">
        <form onSubmit={onSubmit} className="relative mx-auto flex w-full max-w-2xl items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, categories…"
            aria-label="Search the store"
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-24 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            type="submit"
            className="absolute right-1.5 inline-flex h-8 items-center rounded-full bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
