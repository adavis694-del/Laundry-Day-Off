"use client";
import { useState } from "react";
import { useOrders } from "@/components/useOrders";
import { updateOrder } from "@/lib/store";
import { STATUSES, Status } from "@/lib/config";
import { computeOrder, money } from "@/lib/pricing";
import { prettyDate } from "@/lib/dates";
import type { Order } from "@/lib/store";

const DRIVERS = ["Marcus", "Tanya", "Devon"];
const PIN = "1234"; // DEMO ONLY. Replace with real role-based auth.

export default function Admin() {
  const { orders, ready } = useOrders();
  const [pin, setPin] = useState("");
  const [ok, setOk] = useState(false);
  const [pinErr, setPinErr] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, string>>({});

  if (!ok) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <form className="card" onSubmit={(e) => { e.preventDefault(); if (pin === PIN) setOk(true); else { setPinErr(true); setPin(""); } }}>
          <h1 className="text-2xl font-extrabold">Operator login</h1>
          <p className="mt-1 text-xs text-ink/60">Demo PIN: 1234</p>
          <label htmlFor="pin" className="label mt-4">PIN</label>
          <input id="pin" type="password" className="input" value={pin} onChange={(e) => { setPin(e.target.value); setPinErr(false); }} />
          {pinErr && <p role="alert" className="mt-1 text-sm font-bold text-[#B4232F]">Incorrect PIN.</p>}
          <button className="btn-teal mt-4 w-full">Enter</button>
        </form>
      </div>
    );
  }

  const notify = (o: { id: string; phone: string }, s: Status) =>
    setLog((l) => [`${new Date().toLocaleTimeString()} — SMS to ${o.phone}: "Laundry Day Off: order ${o.id} is now ${s}."`, ...l].slice(0, 8));

  function setStatus(id: string, phone: string, s: Status) { updateOrder(id, { status: s }); notify({ id, phone }, s); }
  function logWeight(o: Order) {
    const w = parseFloat(weights[o.id]);
    if (!Number.isFinite(w) || w <= 0) return;
    const plan = o.plan === "weekly" || o.plan === "biweekly" ? o.plan : "once";
    const { total } = computeOrder({ lbs: w, bulky: o.bulky ?? {}, plan, rush: !!o.rush, hangers: o.hangers ?? 0 });
    updateOrder(o.id, { finalLbs: w, total: Math.round(total * 100) / 100, status: "In Wash" });
    notify(o, "In Wash");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-extrabold">Route dashboard</h1>
        <span className="badge bg-teal-soft">{orders.filter((o) => o.status !== "Delivered").length} active</span>
      </div>
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
                  <select id={`d-${o.id}`} className="input !px-2 !py-1" value={o.driver || ""} onChange={(e) => updateOrder(o.id, { driver: e.target.value || null })}>
                    <option value="">Unassigned</option>{DRIVERS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <label className="sr-only" htmlFor={`s-${o.id}`}>Status for {o.id}</label>
                  <select id={`s-${o.id}`} className="input !px-2 !py-1" value={o.status} onChange={(e) => setStatus(o.id, o.phone, e.target.value as Status)}>
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
    </div>
  );
}
