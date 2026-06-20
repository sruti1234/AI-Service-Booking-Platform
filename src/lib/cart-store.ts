import { useEffect, useState } from "react";

export type CartItem = {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  category: string;
  date: string;
  hours: number;
  hourlyRate: number;
  notes: string;
};

const KEY = "asbp:cart:v1";

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
}

const listeners = new Set<(items: CartItem[]) => void>();
let state: CartItem[] | null = null;

function get() {
  if (state === null) state = load();
  return state;
}

function set(updater: (cur: CartItem[]) => CartItem[]) {
  state = updater(get());
  save(state);
  listeners.forEach((l) => l(state!));
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.hours * i.hourlyRate, 0);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => get());
  useEffect(() => {
    const l = (b: CartItem[]) => setItems([...b]);
    listeners.add(l);
    setItems([...get()]);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return {
    items,
    total: cartTotal(items),
    addToCart: (item: CartItem) => set((c) => [item, ...c]),
    removeFromCart: (id: string) => set((c) => c.filter((x) => x.id !== id)),
    updateHours: (id: string, hours: number) =>
      set((c) => c.map((x) => (x.id === id ? { ...x, hours: Math.max(1, hours) } : x))),
    clearCart: () => set(() => []),
  };
}
