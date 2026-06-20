import { useEffect, useState } from "react";

export type Role = "customer" | "provider";

export interface AuthUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  /** If role === "provider", id of the provider record they manage. */
  providerId?: string;
  city?: string;
}

const KEY = "asbp:auth:v1";
const listeners = new Set<(u: AuthUser | null) => void>();
let state: AuthUser | null | undefined;

function load(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persist(u: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(KEY, JSON.stringify(u));
  else localStorage.removeItem(KEY);
}

function get() {
  if (state === undefined) state = load();
  return state ?? null;
}

function setUser(u: AuthUser | null) {
  state = u;
  persist(u);
  listeners.forEach((l) => l(u));
}

export function useAuth() {
  const [user, setU] = useState<AuthUser | null>(() => get());
  useEffect(() => {
    const l = (u: AuthUser | null) => setU(u);
    listeners.add(l);
    setU(get());
    return () => {
      listeners.delete(l);
    };
  }, []);
  return {
    user,
    signIn: (u: AuthUser) => setUser(u),
    signOut: () => setUser(null),
    update: (patch: Partial<AuthUser>) => {
      const cur = get();
      if (cur) setUser({ ...cur, ...patch });
    },
  };
}
