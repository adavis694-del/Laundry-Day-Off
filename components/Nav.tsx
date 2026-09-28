"use client";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#area", label: "Service area" },
  { href: "/business", label: "Business" },
  { href: "/#faq", label: "FAQ" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Laundry Day Off home">
          <span className="font-script text-2xl leading-none text-teal-deep">Laundry</span>
          <span className="rounded-full border-2 border-ink bg-rose px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide">Day Off</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-bold hover:text-teal-deep">{l.label}</Link>
          ))}
          <Link href="/account" className="text-sm font-bold hover:text-teal-deep">My Account</Link>
          <Link href="/book" className="btn-primary !py-2 text-sm">Schedule a Pickup</Link>
        </nav>
        <button className="md:hidden rounded-xl border-2 border-ink px-3 py-2 font-bold" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div className="border-t-2 border-ink bg-cream px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {[...links, { href: "/account", label: "My Account" }].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-teal-soft">{l.label}</Link>
            ))}
            <Link href="/book" onClick={() => setOpen(false)} className="btn-primary mt-2">Schedule a Pickup</Link>
          </div>
        </div>
      )}
    </header>
  );
}
