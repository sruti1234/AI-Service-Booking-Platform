import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Star, MapPin, BadgeCheck, Briefcase, ArrowRight, ShoppingCart, Check } from "lucide-react";
import type { Provider } from "@/lib/data";
import { useCart } from "@/lib/cart-store";

function getDefaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

function getFirstAvailableSlot(providerId: string, date: string) {
  const ALL_SLOTS = [
    "09:00 AM", "10:30 AM", "12:00 PM", "01:30 PM",
    "03:00 PM", "04:30 PM", "06:00 PM", "07:30 PM",
  ];
  const seed = [...(providerId + date)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const busy = new Set(ALL_SLOTS.filter((_, i) => ((seed + i * 7) % 5) === 0));
  return ALL_SLOTS.find((s) => !busy.has(s)) ?? ALL_SLOTS[0];
}

export function ProviderCard({ provider, rank }: { provider: Provider; rank?: number }) {
  const { addToCart, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.some((i) => i.providerId === provider.id);

  const date = getDefaultDate();
  const slot = getFirstAvailableSlot(provider.id, date);

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    addToCart({
      id: "ci_" + Date.now(),
      providerId: provider.id,
      providerName: provider.name,
      providerAvatar: provider.avatar,
      category: provider.category,
      date,
      hours: 2,
      hourlyRate: provider.hourlyRate,
      notes: `${slot}`,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <div className="group relative rounded-2xl border bg-gradient-card p-5 card-hover overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 flex flex-col">
      {rank !== undefined && (
        <div className="absolute top-3 right-3 size-7 rounded-full bg-gradient-primary text-white text-xs font-bold grid place-items-center shadow-glow z-10">
          {rank}
        </div>
      )}

      <Link
        to="/providers/$id"
        params={{ id: provider.id }}
        aria-label={`View profile of ${provider.name}`}
        className="block flex-1"
      >
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="size-14 rounded-xl object-cover ring-2 ring-border"
            />
            {provider.verified && (
              <BadgeCheck className="absolute -bottom-1 -right-1 size-5 text-primary fill-primary/20 bg-background rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {provider.name}
              </h3>
              <div className="flex items-center gap-1 text-sm shrink-0">
                <Star className="size-3.5 fill-warning text-warning" />
                <span className="font-semibold">{provider.rating}</span>
                <span className="text-muted-foreground">({provider.reviews})</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{provider.category}</div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {provider.city}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="size-3" />
                {provider.experience} yrs exp
              </span>
              <span>{provider.bookings} bookings</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground">Starting at</div>
          <div className="font-display font-bold text-lg">
            ₹{provider.hourlyRate}
            <span className="text-xs font-normal text-muted-foreground">/hr</span>
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-2">
        <Link
          to="/providers/$id"
          params={{ id: provider.id }}
          className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium px-3 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          View profile <ArrowRight className="size-3.5" />
        </Link>
        <button
          onClick={handleAddToCart}
          disabled={justAdded}
          className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border transition shrink-0 ${
            justAdded
              ? "bg-success text-success-foreground border-success"
              : inCart
                ? "bg-muted text-foreground border-muted-foreground/30"
                : "bg-background text-foreground hover:bg-muted border-border"
          }`}
          title={inCart && !justAdded ? "Already in cart" : "Add to cart"}
        >
          {justAdded ? (
            <>
              <Check className="size-3.5" /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="size-3.5" /> {inCart ? "In cart" : "Add to cart"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
