"use client";
import Link from "next/link";
import { useState } from "react";
import { PRICING, WEIGHT_GUIDE } from "@/lib/config";
import { computeOrder, money } from "@/lib/pricing";

export default function Pricing() {
  const [lbs, setLbs] = useState(20);
  const [plan, setPlan] = useState<"once" | "weekly" | "biweekly">("once");
  const [bulky, setBulky] = useState<Record<string, number>>({});
  const o = computeOrder({ lbs, bulky, plan, rush: false, hangers: 0 });
  const savings = computeOrder({ lbs, bulky, plan: "once", rush: false, hangers: 0 }).total - o.total;

  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24">
      <h2 className="text-center text-4xl font-extrabold">Simple, honest pricing</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-ink/70">
        {money(PRICING.perLb)}/lb, {money(PRICING.minimum)} minimum. Subscribe and drop to {money(PRICING.perLbSubscriber)}/lb.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-3">
          <h3 className="text-2xl font-extrabold">Estimate your order</h3>

          <p className="label mt-5">Not sure of the weight? Tap a guide:</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {WEIGHT_GUIDE.map((w) => (
              <button key={w.id} onClick={() => setLbs(w.lbs)} aria-pressed={lbs === w.lbs}
                className={`rounded-2xl border-2 border-ink p-3 text-left text-sm transition ${lbs === w.lbs ? "bg-rose shadow-retro-sm" : "bg-cream hover:bg-teal-soft"}`}>
                <span className="block font-extrabold">{w.label}</span>
                <span className="text-ink/70">{w.note}</span>
              </button>
            ))}
          </div>

          <label htmlFor="lbs" className="label mt-6">Estimated weight: <span className="text-teal-deep">{lbs} lbs</span></label>
          <input id="lbs" type="range" min={5} max={100} value={lbs} onChange={(e) => setLbs(+e.target.value)} className="w-full accent-[#2E8B99]" />

          <p className="label mt-6">Plan</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {([["once", "Pay as you go", money(PRICING.perLb) + "/lb"], ["weekly", "Weekly", money(PRICING.perLbSubscriber) + "/lb"], ["biweekly", "Bi-weekly", money(PRICING.perLbSubscriber) + "/lb"]] as const).map(([id, l, p]) => (
              <button key={id} onClick={() => setPlan(id)} aria-pressed={plan === id}
                className={`rounded-2xl border-2 border-ink p-3 text-left ${plan === id ? "bg-teal text-white shadow-retro-sm" : "bg-white hover:bg-teal-soft"}`}>
                <span className="block font-extrabold">{l}</span><span className="text-sm opacity-90">{p}</span>
              </button>
            ))}
          </div>

          <p className="label mt-6">Bulky &amp; specialty items (flat rate)</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PRICING.bulky.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-2xl border-2 border-ink bg-cream px-3 py-2">
                <span className="min-w-0 pr-2 text-sm"><span className="font-bold">{b.label}</span> · {money(b.price)}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <button aria-label={`Remove ${b.label}`} className="h-8 w-8 rounded-full border-2 border-ink bg-white font-bold"
                    onClick={() => setBulky({ ...bulky, [b.id]: Math.max(0, (bulky[b.id] || 0) - 1) })}>−</button>
                  <span className="w-4 text-center font-bold" aria-live="polite">{bulky[b.id] || 0}</span>
                  <button aria-label={`Add ${b.label}`} className="h-8 w-8 rounded-full border-2 border-ink bg-white font-bold"
                    onClick={() => setBulky({ ...bulky, [b.id]: (bulky[b.id] || 0) + 1 })}>+</button>
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside className="card h-fit bg-teal-soft lg:col-span-2 lg:sticky lg:top-24" aria-live="polite">
          <h3 className="text-2xl font-extrabold">Your estimate</h3>
          <dl className="mt-4 space-y-2">
            <div className="flex justify-between"><dt>{lbs} lbs × {money(o.rate)}</dt><dd>{money(lbs * o.rate)}</dd></div>
            {o.minApplied && <div className="flex justify-between text-sm text-ink/70"><dt>Minimum order applied</dt><dd>{money(o.wash)}</dd></div>}
            {o.bulky > 0 && <div className="flex justify-between"><dt>Bulky items</dt><dd>{money(o.bulky)}</dd></div>}
            <div className="flex justify-between border-t-2 border-ink pt-3 text-2xl font-extrabold"><dt>Estimated total</dt><dd>{money(o.total)}</dd></div>
          </dl>
          {savings > 0.005 && <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-bold text-teal-deep">🎉 Subscribing saves you {money(savings)} per order</p>}
          <p className="mt-3 text-xs text-ink/60">Final charge is based on actual weighed pounds. We only place a hold now.</p>
          <Link href="/book" className="btn-primary mt-5 w-full">Schedule a Pickup</Link>
        </aside>
      </div>
    </section>
  );
}
