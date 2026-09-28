const steps = [
  { n: 1, icon: "📅", t: "Schedule", d: "Pick your pickup day, time window and laundry preferences online." },
  { n: 2, icon: "🛍", t: "Bag It", d: "Fill your Laundry Day Off bag and leave it in your agreed secure spot for your pickup window. No need to be home." },
  { n: 3, icon: "🫧", t: "We Wash & Fold", d: "Sorted lights/darks, washed to your preferences, and never mixed with another household's. Dried and neatly folded." },
  { n: 4, icon: "🚚", t: "Delivered Fresh", d: "Returned to your door sealed and folded, ready to go straight into the drawers." },
];
export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24">
      <h2 className="text-center text-4xl font-extrabold">How it works</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-ink/70">Four easy steps. Zero laundromats.</p>
      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.n} className={`card relative ${i % 2 ? "bg-rose-soft" : "bg-teal-soft"}`}>
            <span className="absolute -top-4 left-5 grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-white font-extrabold">{s.n}</span>
            <div className="mt-2 text-4xl" aria-hidden>{s.icon}</div>
            <h3 className="mt-3 text-xl font-extrabold">{s.t}</h3>
            <p className="mt-1 text-ink/80">{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
