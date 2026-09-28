import { Status } from "./config";

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

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Drop the sample orders older builds seeded into every visitor's browser.
      if (Array.isArray(parsed)) return parsed.filter((o: Order) => o.email !== "demo@example.com");
    }
  } catch {}
  return [];
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
