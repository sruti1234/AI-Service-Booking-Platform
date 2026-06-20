import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, Star, TrendingUp, XCircle, Pencil, Save, ExternalLink, Phone, MessageSquare, Bell } from "lucide-react";
import { useState } from "react";
import type { Booking } from "@/lib/data";
import { AppShell } from "@/components/AppShell";
import { AIInsightCard } from "@/components/AIInsightCard";
import { useAuth } from "@/lib/auth-store";
import { useProviders } from "@/lib/provider-store";
import { useBookings } from "@/lib/booking-store";
import { CATEGORIES, type Category } from "@/lib/data";

export const Route = createFileRoute("/provider-portal")({
  head: () => ({ meta: [{ title: "Provider Portal — ServiceAI" }] }),
  component: ProviderPortal,
});

function ProviderPortal() {
  const { user } = useAuth();
  const { getById, updateProvider } = useProviders();
  const { bookings, updateStatus } = useBookings();
  const navigate = useNavigate();

  const me = user?.providerId ? getById(user.providerId) : undefined;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => ({
    name: me?.name ?? "",
    category: (me?.category ?? "Electrician") as Category,
    city: me?.city ?? "",
    phone: me?.phone ?? "",
    hourlyRate: me?.hourlyRate ?? 400,
    experience: me?.experience ?? 1,
    bio: me?.bio ?? "",
  }));

  if (!user) {
    return (
      <AppShell title="Provider Portal">
        <p>Please sign in.</p>
      </AppShell>
    );
  }

  if (user.role !== "provider" || !me) {
    return (
      <AppShell title="Provider Portal">
        <div className="rounded-2xl border bg-card p-8 text-center">
          <h2 className="text-xl font-display font-bold">Provider account required</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Sign up as a service provider to list your services and manage bookings.
          </p>
          <button
            onClick={() => navigate({ to: "/auth" })}
            className="mt-4 rounded-lg bg-gradient-primary text-white text-sm px-4 py-2 font-medium"
          >
            Become a provider
          </button>
        </div>
      </AppShell>
    );
  }

  const myRequests = bookings.filter((b) => b.providerId === me.id);
  const stats = {
    pending: myRequests.filter((b) => b.status === "Pending").length,
    accepted: myRequests.filter((b) => b.status === "Accepted").length,
    completed: myRequests.filter((b) => b.status === "Completed").length,
  };

  function save() {
    updateProvider(me!.id, draft);
    setEditing(false);
  }

  return (
    <AppShell title="Provider Portal">
      <div className="rounded-2xl bg-gradient-hero text-white p-6 mb-6 flex flex-col sm:flex-row items-start gap-5">
        <img
          src={me.avatar}
          alt={me.name}
          className="size-20 rounded-2xl object-cover ring-4 ring-white/20"
        />
        <div className="flex-1">
          <div className="text-xs text-white/70 uppercase tracking-widest">Signed in as</div>
          <h2 className="text-2xl font-display font-bold mt-1">{me.name}</h2>
          <div className="text-sm text-white/80 mt-1">
            {me.category} · {me.city} · ⭐ {me.rating} ({me.reviews} reviews)
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setEditing((e) => !e)}
              className="rounded-lg bg-white text-secondary text-xs font-medium px-3 py-1.5 inline-flex items-center gap-1"
            >
              <Pencil className="size-3" />
              {editing ? "Close editor" : "Edit my services"}
            </button>
            <Link
              to="/providers/$id"
              params={{ id: me.id }}
              className="rounded-lg bg-white/10 text-white text-xs font-medium px-3 py-1.5 border border-white/20 inline-flex items-center gap-1"
            >
              <ExternalLink className="size-3" />
              View public profile
            </Link>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="rounded-2xl border bg-card p-6 mb-6">
          <h3 className="font-semibold mb-4">Edit my listing</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <div>
              <label className="text-xs font-medium">Service category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
                className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <Input label="City" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} />
            <Input label="Phone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
            <Input
              label="Hourly rate (₹)"
              type="number"
              value={String(draft.hourlyRate)}
              onChange={(v) => setDraft({ ...draft, hourlyRate: +v })}
            />
            <Input
              label="Years experience"
              type="number"
              value={String(draft.experience)}
              onChange={(v) => setDraft({ ...draft, experience: +v })}
            />
            <div className="sm:col-span-2">
              <label className="text-xs font-medium">Bio</label>
              <textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                rows={3}
                className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={save}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-primary text-white px-4 py-2 text-sm font-medium"
            >
              <Save className="size-3.5" /> Save changes
            </button>
            <button onClick={() => setEditing(false)} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-warning-foreground", bg: "bg-warning/15" },
          { label: "Accepted", value: stats.accepted, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
          { label: "Completed", value: stats.completed, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
          { label: "Avg rating", value: me.rating, icon: Star, color: "text-warning", bg: "bg-warning/10" },
        ].map((s) => {
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
        <div className="lg:col-span-2 space-y-6">
          {stats.pending > 0 && (
            <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 flex items-center gap-3 animate-fade-up">
              <div className="size-10 rounded-lg bg-warning/20 grid place-items-center">
                <Bell className="size-5 text-warning-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  You have a new service request
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.pending} pending booking{stats.pending > 1 ? "s" : ""} awaiting your action.
                </div>
              </div>
            </div>
          )}

          <BookingSection
            title="New Requests"
            badge={stats.pending}
            badgeTone="warning"
            empty="No new requests right now."
            rows={myRequests.filter((b) => b.status === "Pending")}
            actions={(r) => (
              <div className="inline-flex gap-2">
                <button
                  onClick={() => updateStatus(r.id, "Accepted")}
                  className="rounded-md bg-success/15 text-success text-xs font-medium px-2.5 py-1 inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="size-3" /> Accept
                </button>
                <button
                  onClick={() => updateStatus(r.id, "Rejected")}
                  className="rounded-md bg-destructive/15 text-destructive text-xs font-medium px-2.5 py-1 inline-flex items-center gap-1"
                >
                  <XCircle className="size-3" /> Reject
                </button>
              </div>
            )}
          />

          <BookingSection
            title="Accepted Services"
            badge={stats.accepted}
            badgeTone="primary"
            empty="No accepted bookings yet."
            rows={myRequests.filter((b) => b.status === "Accepted")}
            actions={(r) => (
              <button
                onClick={() => updateStatus(r.id, "Completed")}
                className="rounded-md bg-primary/15 text-primary text-xs font-medium px-2.5 py-1"
              >
                Mark completed
              </button>
            )}
          />

          <BookingSection
            title="Completed Services"
            badge={stats.completed}
            badgeTone="success"
            empty="No completed services yet."
            rows={myRequests.filter((b) => b.status === "Completed" || b.status === "Rejected" || b.status === "Cancelled")}
            actions={(r) => <span className="text-xs text-muted-foreground">{r.status}</span>}
          />
        </div>

        <AIInsightCard provider={me} />
      </div>
    </AppShell>
  );
}

function BookingSection({
  title,
  badge,
  badgeTone,
  rows,
  empty,
  actions,
}: {
  title: string;
  badge: number;
  badgeTone: "warning" | "primary" | "success";
  rows: Booking[];
  empty: string;
  actions: (r: Booking) => React.ReactNode;
}) {
  const toneCls =
    badgeTone === "warning"
      ? "bg-warning/20 text-warning-foreground"
      : badgeTone === "primary"
      ? "bg-primary/15 text-primary"
      : "bg-success/15 text-success";
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold inline-flex items-center gap-2">
            {title}
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${toneCls}`}>
              {badge}
            </span>
          </h3>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">{empty}</div>
      ) : (
        <ul className="divide-y">
          {rows.map((r) => {
            const phone = (r.customerPhone || "").replace(/[^\d+]/g, "");
            return (
              <li key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {r.customerName || "Customer"} · {r.category}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{r.notes}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    📅 {r.date} · ₹{r.amount}
                    {r.customerPhone ? ` · ${r.customerPhone}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {phone && (
                    <>
                      <a
                        href={`tel:${phone}`}
                        className="size-8 rounded-lg border grid place-items-center hover:bg-muted"
                        title="Call customer"
                      >
                        <Phone className="size-3.5" />
                      </a>
                      <a
                        href={`sms:${phone}`}
                        className="size-8 rounded-lg border grid place-items-center hover:bg-muted"
                        title="Text customer"
                      >
                        <MessageSquare className="size-3.5" />
                      </a>
                    </>
                  )}
                  {actions(r)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
