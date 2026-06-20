import { useEffect, useState } from "react";
import { PROVIDERS as SEED, type Provider, type Category } from "./data";

const KEY = "asbp:providers:v2";

// Phones are deterministic from seed list; supplement seed providers.
function withPhone(p: Provider): Provider & { phone: string } {
  const seed = p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const num = (9000000000 + (seed * 13037) % 999999999).toString().slice(0, 10);
  return { ...p, phone: "+91 " + num.slice(0, 5) + " " + num.slice(5) };
}

export type FullProvider = Provider & { phone: string; ownerUserId?: string };

function load(): FullProvider[] {
  if (typeof window === "undefined") return SEED.map(withPhone);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED.map(withPhone);
    const stored = JSON.parse(raw) as FullProvider[];
    // merge seed (in case ids added) with stored overrides
    const map = new Map<string, FullProvider>();
    SEED.map(withPhone).forEach((p) => map.set(p.id, p));
    stored.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  } catch {
    return SEED.map(withPhone);
  }
}

function save(list: FullProvider[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(list));
}

const listeners = new Set<(l: FullProvider[]) => void>();
let state: FullProvider[] | null = null;
function get() {
  if (state === null) state = load();
  return state;
}
function set(updater: (cur: FullProvider[]) => FullProvider[]) {
  state = updater(get());
  save(state);
  listeners.forEach((l) => l(state!));
}

export function useProviders() {
  const [list, setList] = useState<FullProvider[]>(() => get());
  useEffect(() => {
    const l = (b: FullProvider[]) => setList([...b]);
    listeners.add(l);
    setList([...get()]);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return {
    providers: list,
    getById: (id: string) => list.find((p) => p.id === id),
    addProvider: (p: FullProvider) => set((c) => [p, ...c]),
    updateProvider: (id: string, patch: Partial<FullProvider>) =>
      set((c) => c.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    removeProvider: (id: string) => set((c) => c.filter((p) => p.id !== id)),
  };
}

export function createProviderRecord(input: {
  ownerUserId: string;
  name: string;
  category: Category;
  city: string;
  phone: string;
  hourlyRate: number;
  experience: number;
  bio: string;
  avatar: string;
}): FullProvider {
  return {
    id: "prov_user_" + Date.now(),
    name: input.name,
    category: input.category,
    city: input.city,
    rating: 4.5,
    reviews: 0,
    experience: input.experience,
    popularity: 50,
    bookings: 0,
    hourlyRate: input.hourlyRate,
    avatar: input.avatar,
    bio: input.bio,
    verified: false,
    phone: input.phone,
    ownerUserId: input.ownerUserId,
  };
}
