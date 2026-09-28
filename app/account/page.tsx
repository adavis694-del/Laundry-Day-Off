"use client";
import Link from "next/link";
import { useState } from "react";
import { useOrders } from "@/components/useOrders";
import { signOut, useAuth } from "@/components/useAuth";
import AuthForm from "@/components/AuthForm";
import StatusTracker from "@/components/StatusTracker";
import { changeMyOrder } from "@/lib/store";
import { money } from "@/lib/pricing";
import { prettyDate } from "@/lib/dates";
import { WINDOWS } from "@/lib/config";

const windowLabel = (id: string) => { const w = WINDOWS.find((x) => x.id === id)!; return `${w.label} ${w.time}`; };

export default function Account() {
  const { user, ready: authReady } = useAuth();
  const { orders, ready, error, reload } = useOrders(!!user);
  const [busy, setBusy] = useState(false);
  const [actionErr, setActionErr] = useState("");
  const active = orders.filter((o) => o.status !== "Delivered");
  const past = orders.filter((o) => o.status === "Delivered");
  // Newest upcoming recurring order drives the plan (orders are sorted newest first).
  const rec = active.find((o) => o.plan !== "once" && o.status === "Scheduled");

  async function change(c: { window?: string; plan?: string }) {
    if (!rec) return;
    setBusy(true); setActionErr("");
    try { await changeMyOrder(rec.id, c); await reload(); }
    catch (e) { setActionErr(e instanceof Error ? e.message : "Couldn't update your plan."); }
    finally { setBusy(false); }
  }

  if (!authReady) return <div className="mx-auto max-w-4xl px-4 py-10"><p>Loading…</p></div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-extrabold sm:text-4xl">My account</h1>
        <AuthForm title="Sign in to your account" intro="Track your orders and manage your recurring pickups." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold sm:text-4xl">My account</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-ink/70">{user.email}</span>
          <button className="btn-ghost !px-4 !py-1.5 text-sm" onClick={signOut}>Sign out</button>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-[#B4232F]">{error}</p>}

      <h2 className="mt-8 text-2xl font-extrabold">Live orders</h2>
      {!ready ? <p className="mt-3">Loading…</p> : active.length === 0 ? (
        <div className="card mt-3 text-center"><p>Nothing in the wash right now.</p><Link href="/book" className="btn-primary mt-3">Schedule a pickup</Link></div>
      ) : active.map((o) => (
        <div key={o.id} className="card mt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-extrabold">{o.id}</p>
            <span className="badge bg-rose-soft">{prettyDate(o.date)} · {o.window}</span>
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
                <button className="btn-ghost !py-2 text-sm" disabled={busy} onClick={() => change({ window: windowLabel(rec.window.startsWith("Morning") ? "pm" : "am") })}>Switch window</button>
                <button className="btn-ghost !py-2 text-sm" disabled={busy} onClick={() => change({ plan: rec.plan === "weekly" ? "biweekly" : "weekly" })}>Make it {rec.plan === "weekly" ? "bi-weekly" : "weekly"}</button>
              </div>
              {actionErr && <p role="alert" className="mt-2 text-sm font-bold text-[#B4232F]">{actionErr}</p>}
            </>
          ) : <p className="mt-2 text-ink/70">No upcoming recurring pickup. Pick weekly or bi-weekly when booking to save per lb.</p>}
        </section>
        <section className="card">
          <h2 className="text-xl font-extrabold">Payment</h2>
          <p className="mt-2 text-ink/80">No card saved yet.</p>
          <p className="mt-1 text-sm text-ink/60">Secure card payments are coming soon. Until then, we&apos;ll confirm payment with you directly before your pickup.</p>
        </section>
      </div>

      <h2 className="mt-8 text-2xl font-extrabold">Past orders</h2>
      <div className="mt-3 space-y-3">
        {ready && past.length === 0 && <p className="text-ink/70">No past orders yet.</p>}
        {past.map((o) => (
          <div key={o.id} className="card flex flex-wrap items-center justify-between gap-2 !p-4">
            <div><p className="font-extrabold">{o.id}</p><p className="text-sm text-ink/70">{prettyDate(o.date)} · {o.finalLbs ?? o.estLbs} lbs</p></div>
            <p className="text-lg font-extrabold">{o.total != null ? money(o.total) : "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
