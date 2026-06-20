import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  Star,
  MapPin,
  BadgeCheck,
  Briefcase,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Phone,
  MessageSquare,
  Pencil,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AIInsightCard } from "@/components/AIInsightCard";
import { reviewsFor } from "@/lib/data";
import { useBookings } from "@/lib/booking-store";
import { useProviders } from "@/lib/provider-store";
import { useReviews } from "@/lib/review-store";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";
import { ShoppingCart, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/providers/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Provider profile — ServiceAI` }, { name: "description", content: `Profile for provider ${params.id}` }],
  }),
  notFoundComponent: () => (
    <AppShell title="Not found">
      <p className="text-sm text-muted-foreground">Provider not found.</p>
      <Link to="/providers" className="text-primary text-sm">Back to providers</Link>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell title="Error">
      <p>{error.message}</p>
    </AppShell>
  ),
  component: ProviderDetail,
});

function ProviderDetail() {
  const { id } = Route.useParams();
  const { getById, updateProvider } = useProviders();
  const found = getById(id);
  if (!found) throw notFound();
  const provider = found;

  const seedReviews = reviewsFor(provider.id);
  const { reviews: userReviews, addReview } = useReviews(provider.id);
  const allReviews = [...userReviews, ...seedReviews];
  const { addBooking } = useBookings();
  const { addToCart, items: cartItems } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = user?.role === "provider" && user.providerId === provider.id;

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [hours, setHours] = useState(2);
  const [notes, setNotes] = useState("");
  const [slot, setSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const ALL_SLOTS = [
    "09:00 AM",
    "10:30 AM",
    "12:00 PM",
    "01:30 PM",
    "03:00 PM",
    "04:30 PM",
    "06:00 PM",
    "07:30 PM",
  ];
  // Deterministic "busy" slots per provider+date so SSR matches client
  const seed = [...(provider.id + date)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const busy = new Set(
    ALL_SLOTS.filter((_, i) => ((seed + i * 7) % 5) === 0),
  );

  // Auto-pick the first available slot so booking buttons are usable immediately.
  useEffect(() => {
    if (slot && !busy.has(slot)) return;
    const first = ALL_SLOTS.find((s) => !busy.has(s)) ?? null;
    setSlot(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, provider.id]);

  // Feedback
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState("");
  const [fbSubmitted, setFbSubmitted] = useState(false);

  // Edit profile (provider owner only)
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: provider.name,
    bio: provider.bio,
    hourlyRate: provider.hourlyRate,
    experience: provider.experience,
    city: provider.city,
    phone: provider.phone,
  });

  function bookNow() {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!slot) return;
    addBooking({
      id: "bk_" + Date.now(),
      providerId: provider.id,
      providerName: provider.name,
      category: provider.category,
      date,
      status: "Pending",
      notes: `${slot} · ${notes || provider.category + " service"}`,
      amount: provider.hourlyRate * hours,
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      createdAt: new Date().toISOString(),
    });
    setConfirmed(true);
    setTimeout(() => navigate({ to: "/bookings" }), 1500);
  }

  function addToCartAction() {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!slot) return;
    addToCart({
      id: "ci_" + Date.now(),
      providerId: provider.id,
      providerName: provider.name,
      providerAvatar: provider.avatar,
      category: provider.category,
      date,
      hours,
      hourlyRate: provider.hourlyRate,
      notes: `${slot}${notes ? " · " + notes : ""}`,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  }

  function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!fbComment.trim()) return;
    addReview({
      id: "rev_" + Date.now(),
      providerId: provider.id,
      user: user?.name || "Anonymous",
      rating: fbRating,
      comment: fbComment.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    // bump provider stats
    const newCount = provider.reviews + 1;
    const newRating = +(((provider.rating * provider.reviews) + fbRating) / newCount).toFixed(1);
    updateProvider(provider.id, { reviews: newCount, rating: newRating });
    setFbSubmitted(true);
    setFbComment("");
  }

  function saveEdits() {
    updateProvider(provider.id, draft);
    setEditing(false);
  }

  const phoneDigits = provider.phone.replace(/[^\d+]/g, "");

  return (
    <AppShell>
      <button
        onClick={() => history.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-gradient-card p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="relative shrink-0">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="size-24 rounded-2xl object-cover ring-4 ring-primary/10"
                />
                {provider.verified && (
                  <BadgeCheck className="absolute -bottom-2 -right-2 size-7 text-primary fill-primary/20 bg-background rounded-full" />
                )}
              </div>
              <div className="flex-1">
                {!editing ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-display font-bold">{provider.name}</h1>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {provider.category}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => setEditing(true)}
                          className="ml-auto inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border hover:bg-muted"
                        >
                          <Pencil className="size-3" /> Edit profile
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-4 fill-warning text-warning" />
                        <strong className="text-foreground">{provider.rating}</strong> ({provider.reviews} reviews)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-4" /> {provider.city}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="size-4" /> {provider.experience} yrs
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-4" /> {provider.phone}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{provider.bio}</p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-semibold"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={draft.city}
                        onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                        placeholder="City"
                        className="rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                      <input
                        value={draft.phone}
                        onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                        placeholder="Phone"
                        className="rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        value={draft.hourlyRate}
                        onChange={(e) => setDraft({ ...draft, hourlyRate: +e.target.value })}
                        placeholder="₹/hr"
                        className="rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        value={draft.experience}
                        onChange={(e) => setDraft({ ...draft, experience: +e.target.value })}
                        placeholder="Years experience"
                        className="rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <textarea
                      value={draft.bio}
                      onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdits}
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-primary text-white px-3 py-1.5 text-sm font-medium"
                      >
                        <Save className="size-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="rounded-lg border px-3 py-1.5 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <Stat value={provider.bookings} label="Total bookings" />
              <Stat value={provider.popularity} label="Popularity score" />
              <Stat value={`₹${provider.hourlyRate}`} label="Per hour" />
            </div>

            {/* Contact actions */}
            {!isOwner && (
              <div className="mt-6 grid sm:grid-cols-2 gap-2">
                <a
                  href={`tel:${phoneDigits}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <Phone className="size-4" /> Call {provider.name.split(" ")[0]}
                </a>
                <a
                  href={`sms:${phoneDigits}?body=${encodeURIComponent(`Hi ${provider.name}, I'd like to book a ${provider.category} service.`)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <MessageSquare className="size-4" /> Text message
                </a>
              </div>
            )}
          </div>

          <AIInsightCard provider={provider} />

          {/* Reviews */}
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Reviews ({allReviews.length})</h2>
            <div className="space-y-4">
              {allReviews.map((r) => (
                <div key={r.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{r.user}</div>
                    <div className="flex items-center gap-1 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < r.rating ? "fill-warning text-warning" : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.date}</div>
                  <p className="mt-2 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>

            {/* Feedback form */}
            {!isOwner && user?.role === "customer" && (
              <form onSubmit={submitFeedback} className="mt-6 rounded-xl border bg-muted/30 p-4">
                <div className="font-medium text-sm mb-2">Leave feedback</div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setFbRating(n)}
                      aria-label={`${n} stars`}
                    >
                      <Star
                        className={`size-5 ${
                          n <= fbRating ? "fill-warning text-warning" : "text-border"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={fbComment}
                  onChange={(e) => setFbComment(e.target.value)}
                  rows={2}
                  placeholder="Share your experience…"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  {fbSubmitted ? (
                    <span className="text-xs text-success inline-flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Thanks for the feedback!
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Posted as {user?.name || "guest"}
                    </span>
                  )}
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-primary text-white text-xs font-medium px-3 py-1.5"
                  >
                    Submit review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-elevated">
            {isOwner ? (
              <div>
                <h3 className="font-semibold">This is your public profile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Customers see this page when they discover you. Use Edit profile to update your
                  details.
                </p>
                <Link
                  to="/provider-portal"
                  className="mt-4 inline-flex items-center justify-center w-full rounded-lg bg-gradient-primary py-2.5 text-sm font-medium text-white shadow-glow"
                >
                  Open provider portal
                </Link>
              </div>
            ) : confirmed ? (
              <div className="text-center py-8 animate-fade-up">
                <div className="size-14 rounded-full bg-success/10 grid place-items-center mx-auto">
                  <CheckCircle2 className="size-7 text-success" />
                </div>
                <h3 className="mt-4 font-display font-bold text-lg">Booking confirmed!</h3>
                <p className="text-sm text-muted-foreground mt-1">Redirecting to your bookings…</p>
              </div>
            ) : (
              <>
                <h3 className="font-semibold">Book this provider</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ₹{provider.hourlyRate}/hr · select duration below
                </p>
                <div className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Appointment date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-lg border bg-background pl-9 pr-3 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">

                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Available time slots</label>
                      {slot && (
                        <span className="text-[11px] text-success font-medium">
                          Selected: {slot}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {ALL_SLOTS.map((s) => {
                        const isBusy = busy.has(s);
                        const isActive = slot === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={isBusy}
                            onClick={() => setSlot(s)}
                            className={
                              "rounded-lg border px-2 py-2 text-xs font-medium transition " +
                              (isActive
                                ? "bg-gradient-primary text-white border-transparent shadow-glow"
                                : isBusy
                                  ? "bg-muted/40 text-muted-foreground line-through cursor-not-allowed"
                                  : "bg-background hover:border-primary hover:text-primary")
                            }
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                    {!slot && (
                      <p className="text-[11px] text-muted-foreground">
                        Pick a slot to continue.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">

                    <label className="text-xs font-medium">Duration</label>
                    <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setHours(Math.max(1, hours - 1))}
                        className="p-1 rounded hover:bg-muted"
                        aria-label="Decrease hours"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="text-sm font-medium">{hours} hour{hours > 1 ? "s" : ""}</span>
                      <button
                        type="button"
                        onClick={() => setHours(hours + 1)}
                        className="p-1 rounded hover:bg-muted"
                        aria-label="Increase hours"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Service requirements</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Describe what you need…"
                      className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                    <span className="text-xs text-muted-foreground">Estimated total</span>
                    <span className="font-display font-bold text-lg">
                      ₹{provider.hourlyRate * hours}
                    </span>
                  </div>

                  <button
                    onClick={addToCartAction}
                    disabled={!slot}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border bg-background py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="size-4" />
                    {addedToCart ? "Added to cart ✓" : "Add to cart"}
                  </button>
                  <button
                    onClick={bookNow}
                    disabled={!slot}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary py-3 text-sm font-medium text-white shadow-glow hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {slot ? `Book now · ₹${provider.hourlyRate * hours}` : "Select a time slot"}
                  </button>
                  {cartItems.length > 0 && (
                    <Link
                      to="/cart"
                      className="block text-center text-xs text-primary hover:underline"
                    >
                      View cart ({cartItems.length}) →
                    </Link>
                  )}
                  <p className="text-[11px] text-center text-muted-foreground">
                    Provider will accept or decline within 2 hours.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <div className="text-2xl font-display font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
