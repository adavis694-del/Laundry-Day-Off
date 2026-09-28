import Link from "next/link";
export default function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-ink bg-teal-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-script text-3xl">Laundry Day Off</p>
          <p className="mt-2 max-w-sm text-white/80">You deserve a day off too. Wash, dry, fold and delivery straight to your door.</p>
        </div>
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-rose-blush">Contact</p>
          <ul className="space-y-1 text-white/90">
            <li>Text or call: (336) 555-0123</li>
            <li>hello@laundrydayoff.com</li>
            <li>Mon–Sat, 8am–8pm</li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-rose-blush">Company</p>
          <ul className="space-y-1 text-white/90">
            <li><Link href="/book" className="hover:underline">Book a pickup</Link></li>
            <li><Link href="/rules" className="hover:underline">Service rules</Link></li>
            <li><Link href="/business" className="hover:underline">Business & Airbnb</Link></li>
            <li><Link href="/account" className="hover:underline">My account</Link></li>
            <li><Link href="/admin" className="hover:underline">Operator login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 px-4 py-4 text-center text-xs text-white/70">
        <p><Link href="/rules" className="underline">Service Rules</Link> · Terms of Service · Privacy</p>
        <p className="mt-1">© {new Date().getFullYear()} Laundry Day Off. All rights reserved.</p>
      </div>
    </footer>
  );
}
