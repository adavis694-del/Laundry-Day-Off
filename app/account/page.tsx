"use client";
import Link from "next/link";
import { useState } from "react";
import { useOrders } from "@/components/useOrders";
import StatusTracker from "@/components/StatusTracker";
import { updateOrder } from "@/lib/store";
import { money } from "@/lib/pricing";

export default function Account() {
  const { orders, ready } = useOrders();
  const [card, setCard] = useState("•••• 4242");
  const [editing, setEditing] = useState(false);
  const [newCard, setNewCard] = useState("");
  const active = orders.filter((o) => o.status !== "Delivered");
  const past = orders.filter((o) => o.status === "Delivered");
  const rec = orders.find((o) => o.plan !== "once");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">My account</h1>
      <p className="mt-1 rounded-xl border-2 border-dashed border-ink px-3 py-2 text-xs">🧪 Demo mode: sign-in is mocked and data is stored in this browser. Production uses real auth (see README).</p>

      <h2 className="mt-8 text-2xl font-extrabold">Live orders</h2>
      {!ready ? <p className="mt-3">Loading…</p> : active.length === 0 ? (
        <div className="card mt-3 text-center"><p>Nothing in the wash right now.</p><Link href="/book" className="btn-primary mt-3">Schedule a pickup</Link></div>
      ) : active.map((o) => (
        <div key={o.id} className="card mt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-extrabold">{o.id}</p>
            <span className="badge bg-rose-soft">{o.date} · {o.window}</span>
          </div>
          <div className="mt-5"><StatusTracker status={o.status} /></div>
          <p className="mt-5 text-sm text-ink/70">Est. {o.estLbs} lbs · hold {money(o.authHold)}{o.driver ? ` · Driver: ${o.driver}` : ""}</p>
          {o.agreement && <p className="mt-1 text-xs text-ink/60">Service Rules v{o.agreement.version} accepted {new Date(o.agreement.acceptedAt).toLocaleDateString()}. <Link href="/rules" className="underline">View</Link></p>}
        </div>
      ))}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="text-xl font-extrabold">Recurring pickup</h2>
          {rec ? (
            <>
              <p className="mt-2 capitalize">{rec.plan} · {rec.window}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-ghost !py-2 text-sm" onClick={() => updateOrder(rec.id, { window: rec.window.startsWith("Morning") ? "Evening 5pm – 8pm" : "Morning 8am – 11am" })}>Switch window</button>
                <button className="btn-ghost !py-2 text-sm" onClick={() => updateOrder(rec.id, { plan: rec.plan === "weekly" ? "biweekly" : "weekly" })}>Make it {rec.plan === "weekly" ? "bi-weekly" : "weekly"}</button>
              </div>
            </>
          ) : <p className="mt-2 text-ink/70">No recurring plan yet. Pick weekly or bi-weekly when booking to save per lb.</p>}
        </section>
        <section className="card">
          <h2 className="text-xl font-extrabold">Card on file</h2>
          <p className="mt-2 font-bold">{card}</p>
          {editing ? (
            <div className="mt-3 flex gap-2">
              <label htmlFor="nc" className="sr-only">New card number</label>
              <input id="nc" className="input" placeholder="New card number" inputMode="numeric" value={newCard} onChange={(e) => setNewCard(e.target.value.replace(/[^\d ]/g, ""))} />
              <button className="btn-teal !px-4" onClick={() => { const d = newCard.replace(/\s/g, ""); if (d.length >= 15) { setCard("•••• " + d.slice(-4)); setEditing(false); setNewCard(""); } }}>Save</button>
            </div>
          ) : <button className="btn-ghost mt-3 !py-2 text-sm" onClick={() => setEditing(true)}>Update card</button>}
        </section>
      </div>

      <h2 className="mt-8 text-2xl font-extrabold">Past orders</h2>
      <div className="mt-3 space-y-3">
        {past.length === 0 && <p className="text-ink/70">No past orders yet.</p>}
        {past.map((o) => (
          <div key={o.id} className="card flex flex-wrap items-center justify-between gap-2 !p-4">
            <div><p className="font-extrabold">{o.id}</p><p className="text-sm text-ink/70">{o.date} · {o.finalLbs ?? o.estLbs} lbs</p></div>
            <p className="text-lg font-extrabold">{o.total != null ? money(o.total) : "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
