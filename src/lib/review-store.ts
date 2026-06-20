import { useEffect, useState } from "react";

export interface UserReview {
  id: string;
  providerId: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

const KEY = "asbp:reviews:v1";
const listeners = new Set<(r: UserReview[]) => void>();
let state: UserReview[] | null = null;

function load(): UserReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserReview[]) : [];
  } catch {
    return [];
  }
}

function save(r: UserReview[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(r));
}

function get() {
  if (state === null) state = load();
  return state;
}
function set(updater: (cur: UserReview[]) => UserReview[]) {
  state = updater(get());
  save(state);
  listeners.forEach((l) => l(state!));
}

export function useReviews(providerId?: string) {
  const [reviews, setR] = useState<UserReview[]>(() => get());
  useEffect(() => {
    const l = (b: UserReview[]) => setR([...b]);
    listeners.add(l);
    setR([...get()]);
    return () => {
      listeners.delete(l);
    };
  }, []);
  const filtered = providerId ? reviews.filter((r) => r.providerId === providerId) : reviews;
  return {
    reviews: filtered,
    addReview: (r: UserReview) => set((c) => [r, ...c]),
  };
}
