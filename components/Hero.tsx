import Link from "next/link";
import ZipChecker from "./ZipChecker";
import Starburst from "./Starburst";

export default function Hero() {
  return (
    <section className="sunburst relative overflow-hidden border-b-2 border-ink">
      <Starburst className="absolute right-6 top-6 h-8 w-8 opacity-80 lg:left-6 lg:right-auto lg:top-10 lg:h-10 lg:w-10" />
      <Starburst className="absolute right-10 top-24 h-7 w-7" color="#2E8B99" />
      <Starburst className="absolute bottom-10 left-1/3 h-6 w-6" color="#2E8B99" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge mb-4">🚚 Pickup &amp; delivery to your door</span>
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Laundry taking over your day?{" "}
            <span className="font-script font-normal text-rose">Take the day off.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink/80">
            Professional wash, dry, fold &amp; door-to-door delivery. Reclaim your weekend.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/book" className="btn-primary text-lg">Schedule a Pickup</Link>
            <Link href="/#pricing" className="btn-ghost">See pricing</Link>
          </div>
          <div className="card mt-8 !p-5">
            <p className="font-extrabold">Do we deliver to you?</p>
            <ZipChecker compact />
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            <li className="badge">🌿 Eco-friendly options</li>
            <li className="badge">🔒 Sealed &amp; tracked</li>
            <li className="badge">🧺 Never mixed with others</li>
          </ul>
        </div>

        <div className="relative pb-6 lg:pl-6">
          <div className="rounded-retro border-2 border-ink bg-white p-3 shadow-retro-teal">
            <video className="aspect-video w-full rounded-[1.25rem] object-cover" src="/hero.mp4" poster="/hero-poster.jpg"
              autoPlay muted loop playsInline preload="metadata" aria-label="Laundry Day Off story: from laundry chaos to a relaxing day off" />
          </div>
          <img src="/logo.png" alt="Laundry Day Off logo" className="absolute -bottom-8 right-4 h-28 w-28 rotate-[6deg] lg:-left-6 lg:right-auto lg:rotate-[-6deg] rounded-full border-2 border-ink bg-cream object-cover shadow-retro-sm sm:h-36 sm:w-36" />
        </div>
      </div>
    </section>
  );
}
