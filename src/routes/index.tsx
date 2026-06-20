import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Search,
  Star,
  ShieldCheck,
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Wind,
  Cog,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { CATEGORIES, recommendProviders } from "@/lib/data";
import { ProviderCard } from "@/components/ProviderCard";

const ICON_MAP: Record<string, typeof Zap> = {
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Wind,
  Sparkles,
  Cog,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ServiceAI — AI-Enhanced Service Provider Booking Platform" },
      {
        name: "description",
        content:
          "Discover trusted electricians, plumbers, cleaners and more. AI-powered recommendations, instant booking, real reviews.",
      },
      { property: "og:title", content: "ServiceAI — Book trusted local pros, intelligently" },
      {
        property: "og:description",
        content:
          "AI-powered service booking platform with KNN recommendations and provider insights.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const top = recommendProviders({}, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-background/70 border-b">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold leading-none">ServiceAI</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Booking Platform
              </div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/providers" className="hover:text-primary">
              Browse
            </Link>
            <Link to="/insights" className="hover:text-primary">
              AI Insights
            </Link>
            <Link to="/provider-portal" className="hover:text-primary">
              For Providers
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium hover:text-primary"
            >
              Sign in
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-white shadow-glow"
            >
              Open dashboard <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-white/90 mb-6 animate-fade-up">
            <Sparkles className="size-3.5 text-accent" />
            Powered by KNN recommendations & generative AI
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight animate-fade-up">
            Book trusted local pros,
            <br />
            <span className="bg-gradient-to-r from-accent to-primary-glow bg-clip-text text-transparent">
              intelligently.
            </span>
          </h1>
          <p
            className="mt-6 text-lg text-white/70 max-w-2xl mx-auto animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            From electricians to home cleaning — find the right professional in seconds with
            AI-curated matches based on rating, experience, and proximity.
          </p>

          <form
            className="mt-10 mx-auto max-w-3xl flex flex-col sm:flex-row gap-3 p-3 rounded-2xl glass animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex-1 flex items-center gap-3 px-4 bg-white/10 rounded-xl">
              <Search className="size-5 text-white/60" />
              <input
                placeholder="What service do you need? (e.g. AC repair)"
                className="flex-1 bg-transparent text-white placeholder:text-white/50 py-3 outline-none"
              />
            </div>
            <Link
              to="/providers"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-medium text-white shadow-glow"
            >
              Search <ArrowRight className="size-4" />
            </Link>
          </form>

          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent" /> Verified providers
            </span>
            <span className="inline-flex items-center gap-2">
              <Star className="size-4 text-accent" /> 50,000+ reviews
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4 text-accent" /> Money-back guarantee
            </span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon];
            return (
              <Link
                key={cat.name}
                to="/providers"
                search={{ category: cat.name }}
                className="group rounded-2xl border bg-card p-5 text-center card-hover"
              >
                <div
                  className={`mx-auto size-12 rounded-xl bg-gradient-to-br ${cat.color} grid place-items-center mb-3 shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon className="size-6 text-white" />
                </div>
                <div className="text-xs font-medium">{cat.name}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Top recommended */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary mb-2">
              <Sparkles className="size-3.5" /> AI RECOMMENDED
            </div>
            <h2 className="text-3xl font-display font-bold">Top providers near you</h2>
            <p className="text-muted-foreground mt-1">
              Ranked by our KNN model on rating, experience, popularity & demand.
            </p>
          </div>
          <Link
            to="/providers"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {top.map((p, i) => (
            <ProviderCard key={p.id} provider={p} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary text-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-display font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                t: "Search & discover",
                d: "Filter by category, location, and rating. Our AI surfaces the best matches.",
              },
              {
                t: "Book in seconds",
                d: "Pick a date, add notes and confirm. Provider accepts and you're done.",
              },
              {
                t: "Rate & repeat",
                d: "Leave a review. The model learns and gets smarter for everyone.",
              },
            ].map((s, i) => (
              <div key={s.t} className="rounded-2xl glass p-6">
                <div className="size-10 rounded-xl bg-gradient-primary grid place-items-center font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.t}</h3>
                <p className="text-sm text-white/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-6">
          © 2026 ServiceAI · Academic project · Built with TanStack Start, Lovable AI & KNN
        </div>
      </footer>
    </div>
  );
}
