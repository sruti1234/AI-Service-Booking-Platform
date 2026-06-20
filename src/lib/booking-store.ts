import { useEffect, useState } from "react";
import { INITIAL_BOOKINGS, type Booking } from "./data";

const KEY = "asbp:bookings:v1";

function load(): Booking[] {
  if (typeof window === "undefined") return INITIAL_BOOKINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return INITIAL_BOOKINGS;
    return JSON.parse(raw) as Booking[];
  } catch {
    return INITIAL_BOOKINGS;
  }
}

function save(b: Booking[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(b));
}

const listeners = new Set<(b: Booking[]) => void>();
let state: Booking[] | null = null;

function get() {
  if (state === null) state = load();
  return state;
}

function set(updater: (cur: Booking[]) => Booking[]) {
  state = updater(get());
  save(state);
  listeners.forEach((l) => l(state!));
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>(() => get());
  useEffect(() => {
    const l = (b: Booking[]) => setBookings([...b]);
    listeners.add(l);
    setBookings([...get()]);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return {
    bookings,
    addBooking: (b: Booking) => set((c) => [b, ...c]),
    cancelBooking: (id: string) =>
      set((c) => c.map((x) => (x.id === id ? { ...x, status: "Cancelled" } : x))),
    updateStatus: (id: string, status: Booking["status"]) =>
      set((c) => c.map((x) => (x.id === id ? { ...x, status } : x))),
  };
}
