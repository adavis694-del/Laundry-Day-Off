"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FEATURES, PREFS, PRICING, SERVICE_ZIPS, WEIGHT_GUIDE, WINDOWS } from "@/lib/config";
import { ACK_ITEMS, AGREEMENT_VERSION, MISSING_TERMS, agreementHash } from "@/lib/agreement";
import RulesList from "./RulesList";
import DraftBanner from "./DraftBanner";
import { computeOrder, money } from "@/lib/pricing";
import { addOrder, newId } from "@/lib/store";
import { localISODate } from "@/lib/dates";

const STEPS = ["ZIP", "Schedule", "Preferences", "Bag size", "Rules", "Payment"] as const;
type Errors = Record<string, string>;

function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return { iso: localISODate(d), dow: d.toLocaleDateString("en-US", { weekday: "short" }), md: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), sun: d.getDay() === 0 };
  }).filter((d) => !d.sun);
}

export default function BookingFlow() {
  const sp = useSearchParams();
  const days = useMemo(() => nextDays(9), []);
  const [step, setStep] = useState(sp.get("zip") && SERVICE_ZIPS[sp.get("zip")!] ? 1 : 0);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<string | null>(null);

  const [f, setF] = useState({
    zip: sp.get("zip") || "", name: "", phone: "", email: "", address: "",
    date: "", window: "" as string, rush: false,
    detergent: "linen", softener: "yes", temp: "cold",
    hang: 0, bleach: false, stain: false, notes: "", dropoff: "porch", gate: "", contact: "text",
    lbs: 20, plan: "once" as "once" | "weekly" | "biweekly", bulky: {} as Record<string, number>,
    card: "", exp: "", cvc: "", ack: {} as Record<string, boolean>,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const o = computeOrder({ lbs: f.lbs, bulky: f.bulky, plan: f.plan, rush: f.rush, hangers: f.hang });
  const hold = Math.ceil((o.total * 1.25) / 5) * 5;
  const area = SERVICE_ZIPS[f.zip];

  // keep the current step visible in the (horizontally scrolling) progress bar on small screens
  useEffect(() => {
    document.querySelector('[aria-label="Progress"] [aria-current="step"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [step]);

  function toggleAck(id: string, v: boolean) {
    const next = { ...f.ack, [id]: v };
    set("ack", next);
    setErrors((p) => {
      const n = { ...p };
      if (v) delete n[`ack_${id}`];
      if (ACK_ITEMS.every((a) => next[a.id])) delete n.ack;
      return n;
    });
  }

  function validate(s: number): Errors {
    const e: Errors = {};
    if (s === 0) {
      if (!/^\d{5}$/.test(f.zip)) e.zip = "Enter a valid 5-digit ZIP.";
      else if (!area) e.zip = `Sorry, we don't service ${f.zip} yet.`;
    }
    if (s === 1) {
      if (!f.name.trim()) e.name = "Your name is required.";
      if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit phone number.";
      if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email.";
      if (f.address.trim().length < 5) e.address = "Enter your street address.";
      if (!f.date) e.date = "Choose a pickup day.";
      if (!f.window) e.window = "Choose a time window.";
    }
    if (s === 3 && f.lbs < 1) e.lbs = "Choose an estimated weight.";
    if (s === 4) {
      ACK_ITEMS.forEach((a) => { if (!f.ack[a.id]) e[`ack_${a.id}`] = "Please check this box to continue."; });
      if (Object.keys(e).length) e.ack = "Please confirm each item above to continue.";
    }
    if (s === 5) {
      if (f.card.replace(/\s/g, "").length < 15) e.card = "Enter a valid card number.";
      const m = /^(\d{2})\/(\d{2})$/.exec(f.exp);
      if (!m || +m[1] < 1 || +m[1] > 12) e.exp = "Use MM/YY.";
      else {
        const now = new Date();
        const yy = now.getFullYear() % 100, mm = now.getMonth() + 1;
        if (+m[2] < yy || (+m[2] === yy && +m[1] < mm)) e.exp = "This card has expired.";
      }
      if (f.cvc.length < 3) e.cvc = "3–4 digits.";
    }
    return e;
  }
  function next() {
    const e = validate(step); setErrors(e);
    if (Object.keys(e).length) return;
    if (step === STEPS.length - 1) return submit();
    setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1)); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function submit() {
    if (done) return;
    const id = newId();
    const w = WINDOWS.find((x) => x.id === f.window)!;
    addOrder({
      id, createdAt: new Date().toISOString().slice(0, 10), name: f.name, phone: f.phone, email: f.email,
      address: f.address, zip: f.zip, date: f.date, window: `${w.label} ${w.time}`, plan: f.plan,
      prefs: { detergent: f.detergent, softener: f.softener, temp: f.temp, hang: String(f.hang), bleach: String(f.bleach), stain: String(f.stain), dropoff: f.dropoff, gate: f.gate, contact: f.contact },
      notes: f.notes, estLbs: f.lbs, finalLbs: null,
      bulky: Object.fromEntries(Object.entries(f.bulky).filter(([, n]) => n > 0)), hangers: f.hang, rush: f.rush, authHold: hold, total: null, status: "Scheduled", driver: null,
      agreement: { version: AGREEMENT_VERSION, hash: agreementHash(), acceptedAt: new Date().toISOString(), confirmed: ACK_ITEMS.filter((a) => f.ack[a.id]).map((a) => a.id), draft: MISSING_TERMS.length > 0 },
    });
    setDone(id);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="card bg-teal-soft">
          <div className="text-6xl" aria-hidden>🎉</div>
          <h1 className="mt-2 text-3xl font-extrabold">You're booked. Enjoy the day off!</h1>
          <p className="mt-2">Order <b>{done}</b> is scheduled for {days.find((d) => d.iso === f.date)?.md}. We'll text you when the driver is on the way.</p>
          <p className="mt-2 text-sm text-ink/70">A {money(hold)} hold was placed. You're only charged the final weighed amount.</p>
          <p className="mt-1 text-xs text-ink/60">You accepted the <Link href="/rules" className="underline">Service Rules</Link> (v{AGREEMENT_VERSION}).</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/account" className="btn-primary">Track my order</Link>
            <Link href="/" className="btn-ghost">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const err = (k: string) => errors[k] ? <p role="alert" className="mt-1 text-sm font-bold text-[#B4232F]">{errors[k]}</p> : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Schedule a pickup</h1>
      <ol className="mt-5 flex gap-1 overflow-x-auto pb-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}
            className={`flex-1 whitespace-nowrap rounded-full border-2 border-ink px-3 py-1.5 text-center text-xs font-extrabold sm:text-sm ${i === step ? "bg-rose" : i < step ? "bg-teal text-white" : "bg-white"}`}>
            {i < step ? "✓ " : `${i + 1}. `}{s}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-extrabold">Let's check your ZIP</h2>
              <label htmlFor="bz" className="label mt-4">ZIP code</label>
              <input id="bz" className="input max-w-[220px]" inputMode="numeric" maxLength={5} value={f.zip} onChange={(e) => set("zip", e.target.value.replace(/\D/g, ""))} />
              {err("zip")}
              {area && <p className="mt-2 font-bold text-teal-deep">✓ We deliver to {area}.</p>}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold">When &amp; where?</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="n">Full name</label><input id="n" className="input" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />{err("name")}</div>
                <div><label className="label" htmlFor="p">Mobile phone</label><input id="p" className="input" inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />{err("phone")}</div>
                <div><label className="label" htmlFor="e">Email</label><input id="e" className="input" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />{err("email")}</div>
                <div><label className="label" htmlFor="a">Street address</label><input id="a" className="input" value={f.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />{err("address")}</div>
              </div>
              <div>
                <p className="label">Pickup day</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                  {days.map((d) => (
                    <button key={d.iso} type="button" onClick={() => set("date", d.iso)} aria-pressed={f.date === d.iso}
                      className={`rounded-2xl border-2 border-ink py-2 text-center ${f.date === d.iso ? "bg-rose shadow-retro-sm" : "bg-white hover:bg-teal-soft"}`}>
                      <span className="block text-xs font-bold uppercase">{d.dow}</span><span className="font-extrabold">{d.md}</span>
                    </button>
                  ))}
                </div>
                {err("date")}
              </div>
              <div>
                <p className="label">Time window</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {WINDOWS.map((w) => (
                    <button key={w.id} type="button" onClick={() => set("window", w.id)} aria-pressed={f.window === w.id}
                      className={`rounded-2xl border-2 border-ink p-3 text-left ${f.window === w.id ? "bg-teal text-white shadow-retro-sm" : "bg-white hover:bg-teal-soft"}`}>
                      <b>{w.label}</b> · {w.time}
                    </button>
                  ))}
                </div>
                {err("window")}
              </div>
              {FEATURES.sameDayRush && (
                <label className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-ink p-3">
                  <input type="checkbox" className="h-5 w-5 accent-[#2E8B99]" checked={f.rush} onChange={(e) => set("rush", e.target.checked)} />
                  <span><b>Same-day rush</b> (+{money(PRICING.rushFee)}) — subject to route capacity</span>
                </label>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold">Your laundry, your way</h2>
              <Choice title="Detergent" value={f.detergent} onChange={(v) => set("detergent", v)} opts={PREFS.detergent.map((d) => ({ id: d.id, label: d.label, sub: d.sub }))} />
              {f.detergent === "own" && <p className="-mt-3 rounded-2xl bg-teal-soft p-3 text-sm">Tell us in the notes below which products to use. For baby or sensitive-skin laundry, Free &amp; Clear (fragrance-free) or your own products work best.</p>}
              <Choice title="Softener & dryer sheets" value={f.softener} onChange={(v) => set("softener", v)} opts={PREFS.softener.map((d) => ({ id: d.id, label: d.label }))} />
              <Choice title="Water temp & drying heat" value={f.temp} onChange={(v) => set("temp", v)} opts={PREFS.temp.map((d) => ({ id: d.id, label: d.label }))} />
              <div>
                <p className="label">Special handling</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border-2 border-ink bg-cream p-3">
                    <label htmlFor="hang" className="text-sm font-bold">Hang-dry items ({money(PRICING.hangerFee)} each)</label>
                    <input id="hang" type="number" min={0} max={30} className="input mt-1" value={f.hang} onChange={(e) => set("hang", Math.min(30, Math.max(0, Math.floor(+e.target.value) || 0)))} />
                  </div>
                  <Toggle label="Authorize bleach on whites (off = no bleach)" v={f.bleach} on={(v) => set("bleach", v)} />
                  <Toggle label="Spot-treat stains (not guaranteed)" v={f.stain} on={(v) => set("stain", v)} />
                </div>
              </div>
              <div>
                <p className="label">Driver instructions</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><label htmlFor="dp" className="text-sm font-bold">Drop location</label>
                    <select id="dp" className="input mt-1" value={f.dropoff} onChange={(e) => set("dropoff", e.target.value)}>
                      <option value="porch">Front porch</option><option value="door">Hand to me</option><option value="side">Side/back door</option><option value="lobby">Lobby / front desk</option>
                    </select></div>
                  <div><label htmlFor="gc" className="text-sm font-bold">Gate / door code</label><input id="gc" className="input mt-1" value={f.gate} onChange={(e) => set("gate", e.target.value)} /></div>
                  <div><label htmlFor="ct" className="text-sm font-bold">On arrival</label>
                    <select id="ct" className="input mt-1" value={f.contact} onChange={(e) => set("contact", e.target.value)}>
                      <option value="text">Text me</option><option value="knock">Knock</option><option value="none">No contact</option>
                    </select></div>
                </div>
                <label htmlFor="notes" className="label mt-3">Anything else we should know?</label>
                <textarea id="notes" rows={2} className="input" value={f.notes} onChange={(e) => set("notes", e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">How much laundry?</h2>
              <p className="rounded-2xl bg-teal-soft p-3 text-sm">Your bag needs to close normally. Anything that overflows is treated as an additional bag. Comforters and oversized blankets are priced separately below and don't go in your standard bag.</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {WEIGHT_GUIDE.map((w) => (
                  <button key={w.id} type="button" onClick={() => set("lbs", w.lbs)} aria-pressed={f.lbs === w.lbs}
                    className={`rounded-2xl border-2 border-ink p-3 text-left text-sm ${f.lbs === w.lbs ? "bg-rose shadow-retro-sm" : "bg-cream hover:bg-teal-soft"}`}>
                    <b className="block">{w.label}</b>{w.note}
                  </button>
                ))}
              </div>
              <div>
                <label htmlFor="bl" className="label">Fine-tune: <span className="text-teal-deep">{f.lbs} lbs</span></label>
                <input id="bl" type="range" min={5} max={100} value={f.lbs} onChange={(e) => set("lbs", +e.target.value)} className="w-full accent-[#2E8B99]" />
                {err("lbs")}
              </div>
              <div>
                <p className="label">Plan</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {([["once", "One-time", PRICING.perLb], ["weekly", "Weekly", PRICING.perLbSubscriber], ["biweekly", "Bi-weekly", PRICING.perLbSubscriber]] as const).map(([id, l, p]) => (
                    <button key={id} type="button" onClick={() => set("plan", id)} aria-pressed={f.plan === id}
                      className={`rounded-2xl border-2 border-ink p-3 text-left ${f.plan === id ? "bg-teal text-white shadow-retro-sm" : "bg-white hover:bg-teal-soft"}`}>
                      <b className="block">{l}</b>{money(p)}/lb
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="label">Bulky items</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PRICING.bulky.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-2xl border-2 border-ink bg-cream px-3 py-2">
                      <span className="min-w-0 pr-2 text-sm"><b>{b.label}</b> · {money(b.price)}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <button type="button" aria-label={`Remove ${b.label}`} className="h-8 w-8 rounded-full border-2 border-ink bg-white font-bold" onClick={() => set("bulky", { ...f.bulky, [b.id]: Math.max(0, (f.bulky[b.id] || 0) - 1) })}>−</button>
                        <span className="w-4 text-center font-bold">{f.bulky[b.id] || 0}</span>
                        <button type="button" aria-label={`Add ${b.label}`} className="h-8 w-8 rounded-full border-2 border-ink bg-white font-bold" onClick={() => set("bulky", { ...f.bulky, [b.id]: (f.bulky[b.id] || 0) + 1 })}>+</button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold">Service rules</h2>
                <p className="mt-1 text-ink/80">A quick read so we're on the same page. These protect you and us.</p>
              </div>
              <DraftBanner />
              <fieldset className="space-y-3">
                <legend className="label">Please confirm the essentials</legend>
                {ACK_ITEMS.filter((a) => a.id !== "agree").map((a) => (
                  <div key={a.id}>
                    <AckBox checked={!!f.ack[a.id]} onChange={(v) => toggleAck(a.id, v)}>{a.label}</AckBox>
                    {err(`ack_${a.id}`)}
                  </div>
                ))}
              </fieldset>
              <details className="rounded-2xl border-2 border-ink bg-cream p-4" open>
                <summary className="cursor-pointer font-extrabold">Full Service Rules (v{AGREEMENT_VERSION})</summary>
                <div className="mt-4"><RulesList /></div>
              </details>
              <div>
                <AckBox checked={!!f.ack.agree} onChange={(v) => toggleAck("agree", v)}>{ACK_ITEMS.find((a) => a.id === "agree")!.label}</AckBox>
                {err("ack_agree")}
              </div>
              {err("ack")}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold">Payment</h2>
              <p className="rounded-2xl bg-teal-soft p-3 text-sm">We'll place a <b>{money(hold)}</b> authorization hold now. You're charged only the final weighed total after we wash.</p>
              <p className="rounded-2xl border-2 border-dashed border-ink p-3 text-xs">🧪 <b>Demo mode:</b> no real card is processed or stored. In production this step is replaced by Stripe Elements (see README).</p>
              <div><label htmlFor="cn" className="label">Card number</label><input id="cn" className="input" inputMode="numeric" placeholder="4242 4242 4242 4242" value={f.card} onChange={(e) => set("card", e.target.value.replace(/[^\d ]/g, "").slice(0, 19))} autoComplete="off" />{err("card")}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label htmlFor="ex" className="label">Expiry</label><input id="ex" className="input" placeholder="MM/YY" value={f.exp} onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                  set("exp", d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                }} inputMode="numeric" autoComplete="off" />{err("exp")}</div>
                <div><label htmlFor="cv" className="label">CVC</label><input id="cv" className="input" inputMode="numeric" value={f.cvc} onChange={(e) => set("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))} autoComplete="off" />{err("cvc")}</div>
              </div>
              <p className="text-xs text-ink/70">By booking, you're confirming the <Link href="/rules" target="_blank" className="underline">Service Rules</Link> you accepted in the previous step, including the payment authorization.</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button type="button" className="btn-ghost" disabled={step === 0} onClick={back} style={{ opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
            <button type="button" className="btn-primary" onClick={next}>{step === STEPS.length - 1 ? `Book it · hold ${money(hold)}` : "Continue →"}</button>
          </div>
        </div>

        <aside className="card h-fit bg-teal-soft lg:sticky lg:top-24" aria-live="polite">
          <h2 className="text-xl font-extrabold">Order summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {f.date && <div className="flex justify-between"><dt>Pickup</dt><dd className="text-right font-bold">{days.find((d) => d.iso === f.date)?.md}{f.window ? `, ${WINDOWS.find((w) => w.id === f.window)?.label}` : ""}</dd></div>}
            <div className="flex justify-between"><dt>{f.lbs} lbs × {money(o.rate)}</dt><dd>{money(f.lbs * o.rate)}</dd></div>
            {o.minApplied && <div className="flex justify-between text-ink/70"><dt>Minimum applied</dt><dd>{money(o.wash)}</dd></div>}
            {o.bulky > 0 && <div className="flex justify-between"><dt>Bulky items</dt><dd>{money(o.bulky)}</dd></div>}
            {o.hangers > 0 && <div className="flex justify-between"><dt>Hang-dry ({f.hang})</dt><dd>{money(o.hangers)}</dd></div>}
            {o.rush > 0 && <div className="flex justify-between"><dt>Same-day rush</dt><dd>{money(o.rush)}</dd></div>}
            <div className="flex justify-between border-t-2 border-ink pt-2 text-lg font-extrabold"><dt>Estimated total</dt><dd>{money(o.total)}</dd></div>
          </dl>
          <p className="mt-2 text-xs text-ink/60">Final price uses actual weighed pounds.</p>
        </aside>
      </div>
    </div>
  );
}

function AckBox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-ink p-3 ${checked ? "bg-teal-soft" : "bg-white"}`}>
      <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#2E8B99]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm">{children}</span>
    </label>
  );
}

function Choice({ title, value, onChange, opts }: { title: string; value: string; onChange: (v: string) => void; opts: { id: string; label: string; sub?: string }[] }) {
  return (
    <fieldset>
      <legend className="label">{title}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {opts.map((o) => (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} aria-pressed={value === o.id}
            className={`rounded-2xl border-2 border-ink p-3 text-left ${value === o.id ? "bg-rose shadow-retro-sm" : "bg-white hover:bg-teal-soft"}`}>
            <b className="block">{o.label}</b>{o.sub && <span className="text-xs text-ink/70">{o.sub}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={v} onClick={() => on(!v)}
      className={`rounded-2xl border-2 border-ink p-3 text-left font-bold ${v ? "bg-teal text-white shadow-retro-sm" : "bg-cream"}`}>
      {v ? "✓ " : ""}{label}
    </button>
  );
}
