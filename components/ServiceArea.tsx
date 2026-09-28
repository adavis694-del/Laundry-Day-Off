import { SERVICE_ZIPS, WINDOWS, PRICING, FEATURES } from "@/lib/config";
import { money } from "@/lib/pricing";
export default function ServiceArea() {
  return (
    <section id="area" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24">
      <h2 className="text-center text-4xl font-extrabold">Where we deliver</h2>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-xl font-extrabold">Serviced ZIP codes</h3>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.entries(SERVICE_ZIPS).map(([z, a]) => (
              <li key={z} className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2 text-sm">
                <span className="rounded-full border-2 border-ink bg-teal px-2 py-0.5 text-xs font-extrabold text-white">{z}</span>{a}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink/60">Don't see yours? We're expanding — check the ZIP tool above.</p>
        </div>
        <div className="card bg-rose-soft">
          <h3 className="text-xl font-extrabold">Pickup &amp; delivery windows</h3>
          <ul className="mt-4 space-y-3">
            {WINDOWS.map((w) => (
              <li key={w.id} className="flex items-center justify-between rounded-2xl border-2 border-ink bg-white px-4 py-3">
                <span className="font-extrabold">{w.label}</span><span>{w.time}</span>
              </li>
            ))}
          </ul>
          {FEATURES.sameDayRush && (
            <p className="mt-4 rounded-2xl border-2 border-dashed border-ink px-4 py-3 text-sm"><b>⚡ Same-day rush:</b> +{money(PRICING.rushFee)} when you book before 10am (subject to route capacity).</p>
          )}
        </div>
      </div>
    </section>
  );
}
