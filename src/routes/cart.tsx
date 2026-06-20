import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, Minus, Plus, ShoppingCart, CreditCard, CheckCircle2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useCart } from "@/lib/cart-store";
import { useBookings } from "@/lib/booking-store";
import { useAuth } from "@/lib/auth-store";
import type { Category } from "@/lib/data";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — ServiceAI" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, total, removeFromCart, updateHours, clearCart } = useCart();
  const { addBooking } = useBookings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paid, setPaid] = useState(false);
  const [method, setMethod] = useState<"upi" | "card" | "cod">("upi");

  const tax = Math.round(total * 0.18);
  const grand = total + tax;

  function checkout() {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    items.forEach((i) => {
      addBooking({
        id: "bk_" + Date.now() + "_" + i.id,
        providerId: i.providerId,
        providerName: i.providerName,
        category: i.category as Category,
        date: i.date,
        status: "Pending",
        notes: i.notes || `${i.category} service`,
        amount: i.hours * i.hourlyRate,
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        createdAt: new Date().toISOString(),
      });
    });
    clearCart();
    setPaid(true);
    setTimeout(() => navigate({ to: "/bookings" }), 1800);
  }

  return (
    <AppShell title="Your cart">
      <button
        onClick={() => history.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      {paid ? (
        <div className="rounded-2xl border bg-card p-10 text-center max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-success/10 grid place-items-center mx-auto">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <h2 className="mt-4 text-2xl font-display font-bold">Payment successful</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your bookings have been placed. Redirecting to My Bookings…
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <ShoppingCart className="size-10 text-muted-foreground mx-auto" />
          <h2 className="mt-3 font-display font-semibold text-lg">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground">
            Browse providers and add services to your cart.
          </p>
          <Link
            to="/providers"
            className="mt-4 inline-flex rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-white"
          >
            Find providers
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((i) => (
              <div key={i.id} className="rounded-2xl border bg-card p-4 flex gap-4">
                <img
                  src={i.providerAvatar}
                  alt={i.providerName}
                  className="size-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to="/providers/$id"
                        params={{ id: i.providerId }}
                        className="font-semibold hover:text-primary"
                      >
                        {i.providerName}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {i.category} · {i.date}
                      </div>
                      {i.notes && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          “{i.notes}”
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(i.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="Remove"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-lg border">
                      <button
                        onClick={() => updateHours(i.id, i.hours - 1)}
                        className="p-1.5 hover:bg-muted"
                        aria-label="Decrease hours"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="px-3 text-sm font-medium">{i.hours} hr</span>
                      <button
                        onClick={() => updateHours(i.id, i.hours + 1)}
                        className="p-1.5 hover:bg-muted"
                        aria-label="Increase hours"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        ₹{i.hourlyRate}/hr × {i.hours}
                      </div>
                      <div className="font-display font-bold">
                        ₹{i.hourlyRate * i.hours}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-semibold">Order summary</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>₹{total}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">GST (18%)</dt>
                  <dd>₹{tax}</dd>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold text-base">
                  <dt>Total payable</dt>
                  <dd>₹{grand}</dd>
                </div>
              </dl>

              <div className="mt-5 space-y-2">
                <div className="text-xs font-medium">Payment method</div>
                {(["upi", "card", "cod"] as const).map((m) => (
                  <label
                    key={m}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm ${
                      method === m ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      checked={method === m}
                      onChange={() => setMethod(m)}
                      className="accent-primary"
                    />
                    {m === "upi" && "UPI / Wallet"}
                    {m === "card" && "Credit / Debit card"}
                    {m === "cod" && "Pay after service"}
                  </label>
                ))}
              </div>

              <button
                onClick={checkout}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary py-3 text-sm font-medium text-white shadow-glow hover:opacity-95"
              >
                <CreditCard className="size-4" /> Pay ₹{grand} & Book
              </button>
              <p className="text-[11px] text-center text-muted-foreground mt-2">
                Demo checkout — no real payment is processed.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
