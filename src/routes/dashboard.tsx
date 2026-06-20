import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Phone,
  MessageSquare,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProviderCard } from "@/components/ProviderCard";
import { recommendProviders } from "@/lib/data";
import { useBookings } from "@/lib/booking-store";
import { useAuth } from "@/lib/auth-store";
import { useProviders } from "@/lib/provider-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ServiceAI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const { getById } = useProviders();
  const isProvider = user?.role === "provider";

  // For providers, show their incoming bookings instead of their own outgoing.
  const myBookings = isProvider
    ? bookings.filter((b) => b.providerId === user?.providerId)
    : bookings;

  const upcoming = myBookings.filter((b) => b.status === "Pending" || b.status === "Accepted");
  const completed = myBookings.filter((b) => b.status === "Completed");
  const recs = recommendProviders({}, 4);

  const stats = isProvider
    ? [
        { label: "Pending", value: myBookings.filter((b) => b.status === "Pending").length, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
        { label: "Accepted", value: myBookings.filter((b) => b.status === "Accepted").length, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
        { label: "Completed", value: completed.length, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
        { label: "Earnings", value: "₹" + completed.reduce((s, b) => s + b.amount, 0), icon: Sparkles, color: "text-warning", bg: "bg-warning/10" },
      ]
    : [
        { label: "Upcoming", value: upcoming.length, icon: Clock, color: "text-primary", bg: "bg-primary/10" },
        { label: "Completed", value: completed.length, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
        {
          label: "Total spent",
          value: "₹" + bookings.reduce((s, b) => s + (b.status !== "Cancelled" ? b.amount : 0), 0),
          icon: TrendingUp,
          color: "text-accent-foreground",
          bg: "bg-accent/30",
        },
        { label: "Avg rating given", value: "4.7", icon: Sparkles, color: "text-warning", bg: "bg-warning/10" },
      ];

  return (
    <AppShell title="Dashboard">
      <div className="rounded-2xl bg-gradient-hero text-white p-8 mb-6 relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 size-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative">
          <div className="text-sm text-white/70">Welcome back,</div>
          <h2 className="text-3xl font-display font-bold mt-1">
            {user?.name || "Guest"} 👋
          </h2>
          <p className="mt-2 text-white/70 max-w-lg">
            {isProvider ? (
              <>
                You have{" "}
                <strong className="text-white">{stats[0].value} pending requests</strong>. Accept
                or decline them from your provider portal.
              </>
            ) : (
              <>
                You have{" "}
                <strong className="text-white">{upcoming.length} upcoming bookings</strong> and our
                AI has fresh recommendations for you today.
              </>
            )}
          </p>
          <Link
            to={isProvider ? "/provider-portal" : "/providers"}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white text-secondary px-4 py-2 text-sm font-medium"
          >
            {isProvider ? "Open provider portal" : "Book a service"} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border bg-card p-5 card-hover">
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {isProvider ? "Incoming bookings" : "Upcoming bookings"}
            </h3>
            <Link
              to={isProvider ? "/provider-portal" : "/bookings"}
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              See all <ArrowRight className="size-3" />
            </Link>
          </div>
          {upcoming.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No upcoming bookings yet.
            </div>
          )}
          <div className="space-y-3">
            {upcoming.slice(0, 4).map((b) => {
              const prov = getById(b.providerId);
              const phoneDigits = prov?.phone.replace(/[^\d+]/g, "") || "";
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-4 p-3 rounded-xl border hover:bg-muted/40 transition-colors"
                >
                  <div className="size-11 rounded-xl bg-gradient-primary grid place-items-center text-white">
                    <CalendarCheck className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/providers/$id"
                      params={{ id: b.providerId }}
                      className="font-medium text-sm truncate hover:text-primary"
                    >
                      {b.providerName}
                    </Link>
                    <div className="text-xs text-muted-foreground truncate">
                      {b.category} · {b.notes}
                    </div>
                  </div>
                  {!isProvider && phoneDigits && (
                    <div className="hidden sm:flex gap-1">
                      <a
                        href={`tel:${phoneDigits}`}
                        className="size-8 rounded-lg border grid place-items-center hover:bg-muted"
                        title="Call"
                      >
                        <Phone className="size-3.5" />
                      </a>
                      <a
                        href={`sms:${phoneDigits}`}
                        className="size-8 rounded-lg border grid place-items-center hover:bg-muted"
                        title="Text"
                      >
                        <MessageSquare className="size-3.5" />
                      </a>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{b.date}</div>
                    <span
                      className={`inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        b.status === "Accepted"
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning-foreground"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border bg-gradient-ai p-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 size-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary mb-3">
              <Sparkles className="size-3.5" /> AI INSIGHTS
            </div>
            <h3 className="font-semibold mb-2">
              {isProvider ? "Grow your bookings" : "Your service profile"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isProvider
                ? "Customers in your category prefer providers with verified profiles, fast response times, and 4.5★+ ratings. Keep your profile up to date and respond within 2 hours."
                : "Based on your booking history, you tend to prioritize highly-rated providers with 5+ years of experience. Today's recommendations are ranked accordingly."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-background p-3">
                <div className="text-muted-foreground">Match accuracy</div>
                <div className="font-display font-bold text-lg text-primary">94%</div>
              </div>
              <div className="rounded-lg bg-background p-3">
                <div className="text-muted-foreground">KNN neighbors</div>
                <div className="font-display font-bold text-lg text-primary">k=5</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isProvider && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" /> RECOMMENDED FOR YOU
              </div>
              <h3 className="text-xl font-display font-bold mt-1">Top 4 providers · KNN model</h3>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recs.map((p, i) => (
              <ProviderCard key={p.id} provider={p} rank={i + 1} />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
