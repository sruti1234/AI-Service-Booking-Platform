import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, X, MoreHorizontal } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useBookings } from "@/lib/booking-store";
import type { Booking } from "@/lib/data";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "My Bookings — ServiceAI" }] }),
  component: BookingsPage,
});

const STATUS_COLORS: Record<Booking["status"], string> = {
  Pending: "bg-warning/15 text-warning-foreground",
  Accepted: "bg-primary/15 text-primary",
  Completed: "bg-success/15 text-success",
  Rejected: "bg-destructive/15 text-destructive",
  Cancelled: "bg-muted text-muted-foreground",
};

function BookingsPage() {
  const { bookings, cancelBooking } = useBookings();

  return (
    <AppShell title="My bookings">
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b">
          <div>
            <h2 className="font-semibold">All bookings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bookings.length} total · {bookings.filter((b) => b.status === "Pending").length}{" "}
              pending
            </p>
          </div>
          <Link
            to="/providers"
            className="rounded-lg bg-gradient-primary text-white text-sm px-4 py-2 font-medium shadow-glow"
          >
            New booking
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Provider</th>
                <th className="text-left px-5 py-3 font-medium">Service</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-gradient-primary grid place-items-center text-white">
                        <CalendarCheck className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium">{b.providerName}</div>
                        <div className="text-xs text-muted-foreground">{b.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground max-w-[240px] truncate">
                    {b.notes}
                  </td>
                  <td className="px-5 py-3">{b.date}</td>
                  <td className="px-5 py-3 font-medium">₹{b.amount}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full ${STATUS_COLORS[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {(b.status === "Pending" || b.status === "Accepted") && (
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                      >
                        <X className="size-3" /> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
