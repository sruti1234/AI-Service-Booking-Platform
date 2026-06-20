import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, TrendingUp, Star, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AIInsightCard } from "@/components/AIInsightCard";
import { CATEGORIES, PROVIDERS, recommendProviders } from "@/lib/data";
import { ProviderCard } from "@/components/ProviderCard";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "AI Insights — ServiceAI" }] }),
  component: Insights,
});

function Insights() {
  const top = recommendProviders({}, 3);
  const stats = CATEGORIES.map((c) => {
    const list = PROVIDERS.filter((p) => p.category === c.name);
    const avg = list.reduce((s, p) => s + p.rating, 0) / list.length;
    return { ...c, count: list.length, avg };
  });

  return (
    <AppShell title="AI Insights">
      <div className="rounded-2xl bg-gradient-ai border p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <Sparkles className="size-3.5" /> POWERED BY OPENAI + KNN
          </div>
          <h2 className="text-2xl font-display font-bold">
            
            Smart insights across our entire network of providers
          </h2>
          <p className="text-muted-foreground mt-2">
            Our K-Nearest-Neighbors recommender ranks providers using rating, experience,
            popularity and booking history. Generative AI then writes customer-friendly summaries.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total providers", value: PROVIDERS.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          {
            label: "Avg platform rating",
            value: (PROVIDERS.reduce((s, p) => s + p.rating, 0) / PROVIDERS.length).toFixed(2),
            icon: Star,
            color: "text-warning",
            bg: "bg-warning/10",
          },
          { label: "Categories", value: CATEGORIES.length, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
          { label: "Model", value: "KNN k=5", icon: Sparkles, color: "text-accent-foreground", bg: "bg-accent/30" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                <div className={`size-9 rounded-lg grid place-items-center ${s.bg} ${s.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-display font-bold">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Category breakdown</h3>
          <div className="space-y-3">
            {stats.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{s.name}</div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary"
                    style={{ width: `${(s.count / 30) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground w-28 text-right">
                  {s.count} pros · ⭐ {s.avg.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <AIInsightCard provider={top[0]} />
      </div>

      <h3 className="text-xl font-display font-bold mb-4">Top 3 across the platform</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {top.map((p, i) => (
          <ProviderCard key={p.id} provider={p} rank={i + 1} />
        ))}
      </div>
    </AppShell>
  );
}
