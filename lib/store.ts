import { Status } from "./config";
import { localISODate } from "./dates";

// Mock persistence via localStorage. Swap each function for a real API/DB call
// (Prisma + Postgres, Supabase, etc.) without touching the UI.
export type Order = {
  id: string; createdAt: string; name: string; phone: string; email: string;
  address: string; zip: string; date: string; window: string; plan: string;
  prefs: Record<string, string>; notes: string; estLbs: number; finalLbs: number | null;
  // Flat-rate extras chosen at booking, so the final weighed total includes them.
  bulky?: Record<string, number>; hangers?: number; rush?: boolean;
  authHold: number; total: number | null; status: Status; driver: string | null;
  // Proof of acceptance of the Service Rules. Demo: stored locally. Production: store server-side
  // with IP + user agent, and email the customer a copy.
  agreement?: { version: string; hash: string; acceptedAt: string; confirmed: string[]; draft: boolean };
};

const KEY = "ldo_orders_v1";

export function seedOrders(): Order[] {
  const d = (n: number) => localISODate(new Date(Date.now() + n * 864e5));
  return [
    { id: "LDO-1042", createdAt: d(-6), name: "Demo Customer", phone: "3365550142", email: "demo@example.com", address: "412 W 4th St", zip: "27101", date: d(-5), window: "Morning 8am – 11am", plan: "weekly", prefs: { detergent: "linen", softener: "yes", temp: "cold" }, notes: "Porch drop", estLbs: 20, finalLbs: 22.4, authHold: 60, total: 38.13, status: "Delivered", driver: "Marcus" },
    { id: "LDO-1057", createdAt: d(-1), name: "Demo Customer", phone: "3365550142", email: "demo@example.com", address: "412 W 4th St", zip: "27101", date: d(1), window: "Evening 5pm – 8pm", plan: "weekly", prefs: { detergent: "linen", softener: "yes", temp: "cold" }, notes: "Porch drop", estLbs: 20, finalLbs: null, authHold: 60, total: null, status: "Scheduled", driver: null },
  ];
}

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  const s = seedOrders();
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  return s;
}
export function saveOrders(o: Order[]) {
  try { localStorage.setItem(KEY, JSON.stringify(o)); } catch {}
  window.dispatchEvent(new Event("ldo-orders"));
}
export function addOrder(o: Order) { saveOrders([o, ...loadOrders()]); }
export function updateOrder(id: string, patch: Partial<Order>) {
  saveOrders(loadOrders().map((x) => (x.id === id ? { ...x, ...patch } : x)));
}
export function newId() {
  const taken = new Set(loadOrders().map((o) => o.id));
  let id: string;
  do { id = `LDO-${1000 + Math.floor(Math.random() * 9000)}`; } while (taken.has(id));
  return id;
}
