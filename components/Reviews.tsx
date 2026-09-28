const reviews = [
  { q: "I got my entire Sunday back. Everything came back folded like a department store display.", n: "Renee T.", k: "Weekly subscriber" },
  { q: "The linen scent is unreal. And porch pickup means I never have to plan around it.", n: "Marcus D.", k: "Remote worker" },
  { q: "Two kids, two jobs. This is the best money I spend all month.", n: "Alicia P.", k: "Busy parent" },
];
export default function Reviews() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-24">
      <h2 className="text-center text-4xl font-extrabold">Loved by busy people</h2>
      <p className="mt-1 text-center text-xs text-ink/50">Sample testimonials — replace with real customer reviews before launch.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {reviews.map((r, i) => (
          <figure key={r.n} className={`card ${i === 1 ? "bg-teal-soft" : "bg-white"}`}>
            <div className="text-rose" aria-label="5 out of 5 stars">★★★★★</div>
            <blockquote className="mt-2 text-lg font-bold leading-snug">“{r.q}”</blockquote>
            <figcaption className="mt-4 text-sm text-ink/70">— {r.n}, {r.k}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
