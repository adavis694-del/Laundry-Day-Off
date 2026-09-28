import { MISSING_TERMS, TERM_LABELS } from "@/lib/agreement";

// Loud on purpose: it can't be forgotten. It disappears once every value in lib/agreement.ts TERMS is filled in.
export default function DraftBanner() {
  if (!MISSING_TERMS.length) return null;
  return (
    <div role="note" className="rounded-2xl border-2 border-dashed border-ink bg-[#FFF4CC] p-3 text-sm text-ink">
      <b>DRAFT, not for launch.</b> These rules haven't been finalized or legally reviewed. Still to decide:{" "}
      {MISSING_TERMS.map((k) => TERM_LABELS[k]).join(", ")}.
    </div>
  );
}
