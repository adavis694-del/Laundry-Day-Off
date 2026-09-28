import { Status } from "./config";
import { getSupabase } from "./supabase";

// Data layer backed by Supabase (tables + security rules live in supabase/schema.sql).
export type Order = {
  id: string; createdAt: string; name: string; phone: string; email: string;
  address: string; zip: string; date: string; window: string; plan: string;
  prefs: Record<string, string>; notes: string; estLbs: number; finalLbs: number | null;
  authHold: number; total: number | null; status: Status; driver: string | null;
  // Flat-rate extras chosen at booking, so the final weighed total includes them.
  bulky?: Record<string, number>; hangers?: number; rush?: boolean;
  // Proof of acceptance of the Service Rules.
  agreement?: { version: string; hash: string; acceptedAt: string; confirmed: string[]; draft: boolean } | null;
};
export type NewOrder = Omit<Order, "id" | "createdAt" | "finalLbs" | "total" | "status" | "driver">;

type Row = {
  id: string; created_at: string; name: string; phone: string; email: string; address: string; zip: string;
  pickup_date: string; pickup_window: string; plan: string; prefs: Record<string, string> | null; notes: string;
  est_lbs: number | string; final_lbs: number | string | null; auth_hold: number | string; total: number | string | null;
  status: Status; driver: string | null; bulky: Record<string, number> | null; hangers: number; rush: boolean;
  agreement: Order["agreement"];
};

const num = (v: number | string | null) => (v == null ? null : Number(v));

function fromRow(r: Row): Order {
  return {
    id: r.id, createdAt: r.created_at, name: r.name, phone: r.phone, email: r.email, address: r.address, zip: r.zip,
    date: r.pickup_date, window: r.pickup_window, plan: r.plan, prefs: r.prefs ?? {}, notes: r.notes,
    estLbs: Number(r.est_lbs), finalLbs: num(r.final_lbs), authHold: Number(r.auth_hold), total: num(r.total),
    status: r.status, driver: r.driver, bulky: r.bulky ?? {}, hangers: r.hangers, rush: r.rush, agreement: r.agreement,
  };
}

function db() {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase isn't connected yet. Add the Supabase environment variables (see README).");
  return sb;
}

/** Orders visible to the signed-in user: their own, or every order for operators (enforced by RLS). */
export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await db().from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function createOrder(o: NewOrder): Promise<string> {
  const { data, error } = await db().from("orders").insert({
    name: o.name, phone: o.phone, email: o.email, address: o.address, zip: o.zip,
    pickup_date: o.date, pickup_window: o.window, plan: o.plan, prefs: o.prefs, notes: o.notes,
    est_lbs: o.estLbs, auth_hold: o.authHold, bulky: o.bulky ?? {}, hangers: o.hangers ?? 0, rush: !!o.rush,
    agreement: o.agreement ?? null,
  }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

/** Operator-only (RLS rejects everyone else). */
export async function updateOrder(id: string, patch: Partial<Pick<Order, "status" | "driver" | "finalLbs" | "total">>) {
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.driver !== undefined) row.driver = patch.driver;
  if (patch.finalLbs !== undefined) row.final_lbs = patch.finalLbs;
  if (patch.total !== undefined) row.total = patch.total;
  const { error } = await db().from("orders").update(row).eq("id", id);
  if (error) throw error;
}

/** Customer self-service: change window/plan while the order is still Scheduled. */
export async function changeMyOrder(id: string, change: { window?: string; plan?: string }) {
  const { error } = await db().rpc("change_my_order", { p_id: id, p_window: change.window ?? null, p_plan: change.plan ?? null });
  if (error) throw error;
}

export async function isOperator(): Promise<boolean> {
  const { data, error } = await db().rpc("is_operator");
  if (error) throw error;
  return !!data;
}

export type Inquiry = { biz: string; type: string; contact: string; email: string; phone: string; vol: string; msg: string };

export async function submitInquiry(i: Inquiry) {
  const { error } = await db().from("inquiries").insert(i);
  if (error) throw error;
}

export async function fetchInquiries(): Promise<(Inquiry & { id: number; created_at: string })[]> {
  const { data, error } = await db().from("inquiries").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data;
}
