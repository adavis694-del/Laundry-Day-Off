import Link from "next/link";
import RulesList from "@/components/RulesList";
import DraftBanner from "@/components/DraftBanner";
import { AGREEMENT_VERSION } from "@/lib/agreement";

export const metadata = { title: "Service Rules — Laundry Day Off" };

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Service Rules</h1>
      <p className="mt-2 text-ink/80">
        Simple ground rules that protect you and us. You'll confirm these when you book.
      </p>
      <p className="mt-1 text-xs text-ink/50">Version {AGREEMENT_VERSION}</p>
      <div className="mt-4"><DraftBanner /></div>
      <div className="card mt-6"><RulesList /></div>
      <div className="mt-8 text-center">
        <Link href="/book" className="btn-primary">Schedule a Pickup</Link>
      </div>
    </div>
  );
}
