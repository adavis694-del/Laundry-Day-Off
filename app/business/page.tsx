"use client";
import { useState } from "react";

const TYPES = ["Airbnb / short-term rental", "Gym / fitness studio", "Salon / spa", "Office", "Restaurant", "Other"];

export default function Business() {
  const [f, setF] = useState({ biz: "", type: TYPES[0], contact: "", email: "", phone: "", vol: "", msg: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!f.biz.trim()) x.biz = "Business name required.";
    if (!f.contact.trim()) x.contact = "Contact name required.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = "Valid email required.";
    if (f.phone.replace(/\D/g, "").length < 10) x.phone = "10-digit phone required.";
    setErr(x);
    if (!Object.keys(x).length) setSent(true); // TODO: POST to /api/inquiries
  }
  const fieldErr = (k: string) => err[k] ? <p role="alert" className="mt-1 text-sm font-bold text-[#B4232F]">{err[k]}</p> : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Laundry for business &amp; hosts</h1>
      <p className="mt-2 max-w-2xl text-ink/80">Reliable linen service for Airbnb turnovers, gyms, salons and offices. Scheduled routes, volume pricing, and one invoice a month.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-5">
        <ul className="card space-y-3 bg-teal-soft md:col-span-2">
          {["Same-day and next-morning turnovers", "Bulk sheets, towels & robes", "Volume pricing + monthly invoicing", "Dedicated route & driver", "Pickup from lockbox or property manager"].map((t) => <li key={t} className="flex gap-2"><span aria-hidden>✓</span>{t}</li>)}
        </ul>
        <div className="card md:col-span-3">
          {sent ? (
            <div className="text-center"><div className="text-5xl" aria-hidden>📬</div><h2 className="mt-2 text-2xl font-extrabold">Thanks, {f.contact.trim().split(/\s+/)[0]}!</h2><p className="mt-1">We'll reach out within one business day with a custom quote.</p></div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="b1">Business name</label><input id="b1" className="input" value={f.biz} onChange={(e) => set("biz", e.target.value)} />{fieldErr("biz")}</div>
              <div><label className="label" htmlFor="b2">Type</label><select id="b2" className="input" value={f.type} onChange={(e) => set("type", e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div><label className="label" htmlFor="b3">Your name</label><input id="b3" className="input" value={f.contact} onChange={(e) => set("contact", e.target.value)} />{fieldErr("contact")}</div>
              <div><label className="label" htmlFor="b4">Phone</label><input id="b4" className="input" inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} />{fieldErr("phone")}</div>
              <div className="sm:col-span-2"><label className="label" htmlFor="b5">Email</label><input id="b5" type="email" className="input" value={f.email} onChange={(e) => set("email", e.target.value)} />{fieldErr("email")}</div>
              <div className="sm:col-span-2"><label className="label" htmlFor="b6">Estimated weekly volume (lbs or # of units)</label><input id="b6" className="input" value={f.vol} onChange={(e) => set("vol", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor="b7">Anything else?</label><textarea id="b7" rows={3} className="input" value={f.msg} onChange={(e) => set("msg", e.target.value)} /></div>
              <button className="btn-primary sm:col-span-2">Request a quote</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
