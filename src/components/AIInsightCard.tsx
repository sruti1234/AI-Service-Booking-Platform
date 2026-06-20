import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateProviderSummary } from "@/lib/ai.functions";
import type { Provider } from "@/lib/data";

export function AIInsightCard({ provider }: { provider: Provider }) {
  const fn = useServerFn(generateProviderSummary);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fn({
        data: {
          name: provider.name,
          category: provider.category,
          city: provider.city,
          experience: provider.experience,
          rating: provider.rating,
          reviews: provider.reviews,
        },
      });
      setSummary(res.summary);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate insight");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-gradient-ai p-6 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 size-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">AI Provider Insight</div>
            <div className="text-xs text-muted-foreground">Powered by Lovable AI</div>
          </div>
        </div>

        {!summary && !loading && !error && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a smart, customer-friendly summary of this provider's strengths and ideal
              use cases.
            </p>
            <button
              onClick={generate}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-white shadow-glow hover:opacity-95 transition-opacity"
            >
              <Sparkles className="size-4" /> Generate insight
            </button>
          </>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
            <Loader2 className="size-4 animate-spin" />
            Analyzing reviews and experience…
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={generate}
              className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <RefreshCw className="size-3" /> Retry
            </button>
          </div>
        )}

        {summary && (
          <div className="space-y-3 animate-fade-up">
            <p className="text-sm leading-relaxed text-foreground">{summary}</p>
            <button
              onClick={generate}
              className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
            >
              <RefreshCw className="size-3" /> Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
