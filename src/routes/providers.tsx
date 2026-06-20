import { createFileRoute } from "@tanstack/react-router";
import { Search, Star, Sparkles } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { ProviderCard } from "@/components/ProviderCard";
import { CATEGORIES, recommendProviders, type Category } from "@/lib/data";
import { useProviders } from "@/lib/provider-store";

const searchSchema = z.object({
  category: z.string().optional(),
  city: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/providers")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Find Providers — ServiceAI" }] }),
  component: ProvidersPage,
});

function ProvidersPage() {
  const initial = Route.useSearch();
  const { providers } = useProviders();
  const [category, setCategory] = useState<Category | "">((initial.category as Category) || "");
  const [city, setCity] = useState(initial.city || "");
  const [minRating, setMinRating] = useState(0);
  const [query, setQuery] = useState(initial.q || "");

  const cities = Array.from(new Set(providers.map((p) => p.city))).sort();

  const filtered = providers.filter(
    (p) =>
      (!category || p.category === category) &&
      (!city || p.city === city) &&
      p.rating >= minRating &&
      (!query || p.name.toLowerCase().includes(query.toLowerCase())),
  );

  const aiTop = recommendProviders(
    { category: (category || undefined) as Category | undefined, city: city || undefined, minRating },
    5,
  );

  return (
    <AppShell title="Find providers">
      <div className="rounded-2xl bg-card border p-5 mb-6">
        <div className="grid md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="w-full rounded-lg border bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 ring-primary"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
            className="md:col-span-3 rounded-lg border bg-background px-3 py-2.5 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="md:col-span-3 rounded-lg border bg-background px-3 py-2.5 text-sm"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={minRating}
            onChange={(e) => setMinRating(+e.target.value)}
            className="md:col-span-2 rounded-lg border bg-background px-3 py-2.5 text-sm"
          >
            <option value={0}>Any rating</option>
            <option value={3.5}>3.5+ ⭐</option>
            <option value={4}>4.0+ ⭐</option>
            <option value={4.5}>4.5+ ⭐</option>
          </select>
        </div>
      </div>

      <section className="mb-8 rounded-2xl bg-gradient-ai border p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">AI top picks for these filters</div>
            <div className="text-xs text-muted-foreground">
              KNN model · k=5 · features: rating, experience, popularity, bookings
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {aiTop.map((p, i) => (
            <ProviderCard key={p.id} provider={p} rank={i + 1} />
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">{filtered.length} providers</h2>
        <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <Star className="size-3" /> Sorted by relevance
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, 30).map((p) => (
          <ProviderCard key={p.id} provider={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-sm text-muted-foreground">
          No providers match your filters. Try broadening your search.
        </div>
      )}
    </AppShell>
  );
}
