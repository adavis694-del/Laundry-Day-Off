"use client";
import Link from "next/link";
import { useState } from "react";
import { SERVICE_ZIPS } from "@/lib/config";

export default function ZipChecker({ compact = false }: { compact?: boolean }) {
  const [zip, setZip] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; area?: string }>(null);
  const [err, setErr] = useState("");

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip)) { setErr("Enter a valid 5-digit ZIP code."); setResult(null); return; }
    setErr("");
    const area = SERVICE_ZIPS[zip];
    setResult({ ok: !!area, area });
  }

  return (
    <div className={compact ? "" : "mt-6"}>
      <form onSubmit={check} className="flex flex-col gap-3 sm:flex-row" noValidate>
        <label htmlFor="zip" className="sr-only">ZIP code</label>
        <input id="zip" inputMode="numeric" maxLength={5} value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter your ZIP code" className="input sm:max-w-[240px]" aria-describedby="zip-msg" />
        <button className="btn-teal">Check Availability</button>
      </form>
      <div id="zip-msg" aria-live="polite" className={`text-sm font-bold ${err || result ? "mt-3" : ""}`}>
        {err && <p className="text-rose">{err}</p>}
        {result?.ok && (
          <p className="text-teal-deep">
            ✓ Great news — we deliver to {result.area}!{" "}
            <Link href={`/book?zip=${zip}`} className="underline">Schedule your pickup →</Link>
          </p>
        )}
        {result && !result.ok && (
          <p className="text-ink">
            We're not in {zip} yet. <Link href="/business" className="underline text-teal-deep">Get in touch</Link> and we'll let you know when we are.
          </p>
        )}
      </div>
    </div>
  );
}
