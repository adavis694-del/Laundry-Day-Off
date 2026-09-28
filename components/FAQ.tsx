import Link from "next/link";
const faqs: [string, React.ReactNode][] = [
  ["How do I separate my clothes?", "You don't. We separate lights and darks for you, and your laundry is never washed with another household's."],
  ["Do I need to be home for pickup or delivery?", "No. Leave your bag in your agreed secure spot during your pickup window. Add your gate code or drop location in the driver instructions."],
  ["Do you offer same-day service?", "Not yet. We'll confirm your expected delivery window when you book."],
  ["What items do you NOT accept?", "Dry-clean-only and specialty-care items, and anything contaminated: biohazards, feces, vomit, heavily blood-soaked items, suspected bedbugs, or hazardous chemicals. We wash normal household clothing and linens."],
  ["Can you use bleach or treat stains?", "Bleach is used only if you authorize it. We'll treat stains when you ask, but we can't guarantee removal."],
  ["When am I charged?", "We place an authorization hold when you book. Your final charge is based on the actual weighed pounds, and we'll contact you before charging more than your hold."],
  ["What if something gets damaged or lost?", <>Tell us as soon as you notice. Our claims window and liability terms are in the <Link href="/rules" className="font-bold underline">Service Rules</Link>.</>],
];
export default function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pt-24">
      <h2 className="text-center text-4xl font-extrabold">Questions, answered</h2>
      <div className="mt-8 space-y-3">
        {faqs.map(([q, a]) => (
          <details key={q} className="card group !p-0 open:bg-teal-soft">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-extrabold">
              {q}<span className="text-2xl transition group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="px-6 pb-5 text-ink/80">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
