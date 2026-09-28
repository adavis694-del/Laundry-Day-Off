"use client";
import { useEffect, useState } from "react";
import { useOrders } from "@/components/useOrders";
import { signOut, useAuth } from "@/components/useAuth";
import AuthForm from "@/components/AuthForm";
import { fetchInquiries, isOperator, updateOrder } from "@/lib/store";
import { STATUSES, Status } from "@/lib/config";
import { computeOrder, money } from "@/lib/pricing";
import { prettyDate } from "@/lib/dates";
import type { Order } from "@/lib/store";

const DRIVERS = ["Marcus", "Tanya", "Devon"];

type Inq = Awaited<ReturnType<typeof fetchInquiries>>[number];

export default function Admin() {
  const { user, ready: authReady } = useAuth();
  const [op, setOp] = useState<boolean | null>(null);
  const { orders, ready, error, reload } = useOrders(!!user && op === true);
  const [log, setLog] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [actionErr, setActionErr] = useState("");
  const [inquiries, setInquiries] = useState<Inq[]>([]);

  // Operator status comes from the database (public.operators); RLS enforces it on every query too.
  useEffect(() => {
    if (!user) { setOp(null); return; }
    let live = true;
    isOperator().then((v) => live && setOp(v)).catch(() => live && setOp(false));
    return () => { live = false; };
  }, [user]);
  useEffect(() => {
    if (op) fetchInquiries().then(setInquiries).catch(() => {});
  }, [op]);

  if (!authReady || (user && op === null)) return <div className="mx-auto max-w-6xl px-4 py-10"><p>Loading…</p></div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <AuthForm title="Operator login" intro="Sign in with your operator account." />
      </div>
    );
  }
  if (!op) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="card">
          <h1 className="text-2xl font-extrabold">Not an operator account</h1>
          <p className="mt-2 text-sm text-ink/80">{user.email} is signed in, but isn&apos;t on the operator list. The owner can add it in Supabase (see README, step &ldquo;Make yourself an operator&rdquo;).</p>
          <button className="btn-ghost mt-4" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  }

  const notify = (o: { id: string; phone: string }, s: Status) =>
    setLog((l) => [`${new Date().toLocaleTimeString()} — SMS to ${o.phone}: "Laundry Day Off: order ${o.id} is now ${s}."`, ...l].slice(0, 8));

  async function save(id: string, patch: Parameters<typeof updateOrder>[1]) {
    setActionErr("");
    try { await updateOrder(id, patch); await reload(); return true; }
    catch (e) { setActionErr(`${id}: ${e instanceof Error ? e.message : "update failed"}`); return false; }
  }
  async function setStatus(o: Order, s: Status) { if (await save(o.id, { status: s })) notify(o, s); }
  async function logWeight(o: Order) {
    const w = parseFloat(weights[o.id]);
    if (!Number.isFinite(w) || w <= 0) return;
    const plan = o.plan === "weekly" || o.plan === "biweekly" ? o.plan : "once";
    const { total } = computeOrder({ lbs: w, bulky: o.bulky ?? {}, plan, rush: !!o.rush, hangers: o.hangers ?? 0 });
    if (await save(o.id, { finalLbs: w, total: Math.round(total * 100) / 100, status: "In Wash" })) notify(o, "In Wash");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-extrabold">Route dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="badge bg-teal-soft">{orders.filter((o) => o.status !== "Delivered").length} active</span>
          <button className="btn-ghost !px-4 !py-1.5 text-sm" onClick={signOut}>Sign out</button>
        </div>
      </div>
      {(error || actionErr) && <p role="alert" className="mt-3 text-sm font-bold text-[#B4232F]">{error || actionErr}</p>}
      <p className="mt-1 text-xs text-ink/60">🧪 Demo: status changes queue simulated SMS/email (Twilio/SendGrid wiring in README).</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] border-separate border-spacing-y-2 text-left text-sm">
          <thead><tr className="text-xs uppercase tracking-wider text-ink/60">
            {["Order", "Customer", "Pickup", "Weight (lb)", "Driver", "Status"].map((h) => <th key={h} className="px-3 py-1">{h}</th>)}
          </tr></thead>
          <tbody>
            {!ready ? <tr><td className="p-3">Loading…</td></tr> : orders.length === 0 ? <tr><td colSpan={6} className="p-3 text-ink/60">No orders yet. New bookings appear here.</td></tr> : orders.map((o) => (
              <tr key={o.id} className="bg-white [&>td]:border-y-2 [&>td]:border-ink [&>td:first-child]:rounded-l-2xl [&>td:first-child]:border-l-2 [&>td:last-child]:rounded-r-2xl [&>td:last-child]:border-r-2">
                <td className="p-3 font-extrabold">{o.id}</td>
                <td className="p-3">{o.name}<span className="block text-xs text-ink/60">{o.address}, {o.zip}</span>
                  <span className="block text-xs text-ink/60">Detergent: {o.prefs.detergent ?? "—"} · Bleach: {o.prefs.bleach === "true" ? <b className="text-[#B4232F]">AUTHORIZED</b> : "none"}</span>
                  <span className="block text-xs text-ink/60">{o.agreement ? `Rules v${o.agreement.version} accepted ✓` : "Rules: not on file"}</span></td>
                <td className="p-3">{prettyDate(o.date)}<span className="block text-xs text-ink/60">{o.window}</span></td>
                <td className="p-3">
                  {o.finalLbs != null ? <b>{o.finalLbs} lb · {o.total != null ? money(o.total) : ""}</b> : (
                    <div className="flex gap-1">
                      <label className="sr-only" htmlFor={`w-${o.id}`}>Weight for {o.id}</label>
                      <input id={`w-${o.id}`} className="input !w-20 !px-2 !py-1" inputMode="decimal" placeholder={`~${o.estLbs}`} value={weights[o.id] || ""} onChange={(e) => setWeights({ ...weights, [o.id]: e.target.value })} />
                      <button className="btn-teal !px-3 !py-1 text-xs" onClick={() => logWeight(o)}>Log</button>
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <label className="sr-only" htmlFor={`d-${o.id}`}>Driver for {o.id}</label>
                  <select id={`d-${o.id}`} className="input !px-2 !py-1" value={o.driver || ""} onChange={(e) => save(o.id, { driver: e.target.value || null })}>
                    <option value="">Unassigned</option>{DRIVERS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <label className="sr-only" htmlFor={`s-${o.id}`}>Status for {o.id}</label>
                  <select id={`s-${o.id}`} className="input !px-2 !py-1" value={o.status} onChange={(e) => setStatus(o, e.target.value as Status)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card mt-8 bg-cream" aria-live="polite">
        <h2 className="text-lg font-extrabold">Outgoing notifications (simulated)</h2>
        <ul className="mt-2 space-y-1 font-mono text-xs">{log.length ? log.map((l, i) => <li key={i}>{l}</li>) : <li className="text-ink/50">Change a status to queue a text.</li>}</ul>
      </section>

      <section className="card mt-8">
        <h2 className="text-lg font-extrabold">Business &amp; service-area inquiries</h2>
        {inquiries.length === 0 ? <p className="mt-2 text-sm text-ink/60">No inquiries yet.</p> : (
          <ul className="mt-3 space-y-3 text-sm">
            {inquiries.map((q) => (
              <li key={q.id} className="rounded-2xl border-2 border-ink bg-cream p-3">
                <p className="font-extrabold">{q.biz} <span className="font-normal text-ink/60">· {q.type} · {new Date(q.created_at).toLocaleDateString()}</span></p>
                <p>{q.contact} · <a className="underline" href={`mailto:${q.email}`}>{q.email}</a> · <a className="underline" href={`tel:${q.phone}`}>{q.phone}</a></p>
                {q.vol && <p className="text-ink/70">Volume: {q.vol}</p>}
                {q.msg && <p className="text-ink/70">{q.msg}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
