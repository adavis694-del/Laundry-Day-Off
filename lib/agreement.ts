import { money } from "./pricing";

/**
 * Laundry Day Off — Service Rules (customer agreement).
 * SINGLE SOURCE OF TRUTH: the /rules page and the booking "Rules" step both render from this file.
 * Bump AGREEMENT_VERSION whenever wording changes so every order records exactly what was accepted.
 *
 * ⚠ DRAFT: not legally reviewed. Have an attorney review before launch.
 */
export const AGREEMENT_VERSION = "2026-09-draft-1";

// Values still to be decided. While any is null, the site shows a loud yellow DRAFT banner
// and marks the missing text with [... TBD]. Fill these in, then the banner disappears on its own.
export const TERMS = {
  turnaroundText: null as string | null, // e.g. "within 3 business days of pickup" (after capacity testing)
  freeCancelHours: null as number | null, // free cancellation up to N hours before the pickup window
  lateCancelFee: null as number | null, // $ fee: late cancellation OR arriving and unable to access laundry
  claimWindowHours: null as number | null, // hours after delivery to report a missing/damaged item
  liabilityCap: null as string | null, // claim liability wording, after insurance review
  wearWording: null as string | null, // final pre-existing damage / normal wear wording
  petHairFee: null as number | null, // $ fee for excessive pet hair
};

export const TERM_LABELS: Record<keyof typeof TERMS, string> = {
  turnaroundText: "official turnaround time",
  freeCancelHours: "free-cancellation cutoff",
  lateCancelFee: "late-cancel / no-access fee",
  claimWindowHours: "claims window",
  liabilityCap: "claim liability wording",
  wearWording: "damage / normal-wear wording",
  petHairFee: "pet-hair fee",
};

export const MISSING_TERMS = (Object.keys(TERMS) as (keyof typeof TERMS)[]).filter((k) => TERMS[k] == null);

const tbd = (l: string) => `[${l} TBD]`;
const hrs = (n: number | null, l: string) => (n == null ? tbd(l) : `${n} hours`);
const fee = (n: number | null, l: string) => (n == null ? tbd(l) : money(n));

export const GROUPS = [
  "Before pickup",
  "What we accept",
  "Care, stains & damage",
  "Timing, cancellations & claims",
  "Payment",
  "How we track your order",
] as const;

export type Rule = { id: string; group: (typeof GROUPS)[number]; title: string; body: string };

export const RULES: Rule[] = [
  { id: "pockets", group: "Before pickup", title: "Empty your pockets",
    body: "You're responsible for emptying pockets before pickup. We'll check when we reasonably can, but please don't rely on us to find everything." },
  { id: "bag", group: "Before pickup", title: "Pickup location and access",
    body: `Leave your Laundry Day Off bag in the agreed secure location during your scheduled pickup window. If we arrive and can't access your laundry, a fee of ${fee(TERMS.lateCancelFee, "fee")} may apply.` },
  { id: "overfill", group: "Before pickup", title: "Overfilled bags",
    body: "Your bag has to close normally. Laundry that overflows or keeps the bag from closing is treated as an additional bag/order." },
  { id: "bedding", group: "Before pickup", title: "Comforters and oversized blankets",
    body: "These are priced separately and don't count as normal items in your standard bag." },

  { id: "scope", group: "What we accept", title: "Normal washable household laundry only",
    body: "We wash everyday washable clothing and household linens. We are not accepting dry-clean-only or specialty-cleaning items right now." },
  { id: "contam", group: "What we accept", title: "No contaminated laundry",
    body: "We can't accept laundry containing biohazards, feces, vomit, heavily blood-soaked items, suspected bedbugs, hazardous chemicals, or similar contamination. We handle normal residential laundry, not institutional or nursing-home laundry. If we find any of these, we may decline the order or the affected items." },
  { id: "pethair", group: "What we accept", title: "Pet hair",
    body: `Normal pet hair is fine. Excessive pet hair may carry an additional fee${TERMS.petHairFee == null ? " " + tbd("amount") : " of " + money(TERMS.petHairFee)}, or we may decline the order.` },

  { id: "separation", group: "Care, stains & damage", title: "Your laundry stays yours",
    body: "We never combine laundry from different customers or households in the same wash load." },
  { id: "stains", group: "Care, stains & damage", title: "Stains",
    body: "We can treat stains when you request it, but we can't guarantee removal." },
  { id: "wear", group: "Care, stains & damage", title: "Pre-existing damage and normal wear",
    body: `We're not responsible for pre-existing damage or normal wear, including holes, weak seams, fading, shrinkage inherent to the garment, and worn fabric. ${TERMS.wearWording ?? tbd("Final liability wording")}` },
  { id: "bleach", group: "Care, stains & damage", title: "Bleach",
    body: "We only use bleach when you authorize it in your preferences." },
  { id: "sensitive", group: "Care, stains & damage", title: "Baby and sensitive-skin laundry",
    body: "Choose the fragrance-free option, or provide your own detergent and products." },
  { id: "valuables", group: "Care, stains & damage", title: "Cash and valuables",
    body: "If we find anything valuable, we'll document it and return it to you." },

  { id: "turnaround", group: "Timing, cancellations & claims", title: "Turnaround",
    body: `We don't offer same-day service. ${TERMS.turnaroundText ? "Turnaround: " + TERMS.turnaroundText + "." : tbd("Official turnaround")} Delivery times are estimates.` },
  { id: "cancel", group: "Timing, cancellations & claims", title: "Cancellations and missed pickups",
    body: `You can cancel for free up to ${hrs(TERMS.freeCancelHours, "cutoff")} before your pickup window. Later cancellations, or arriving and being unable to access your scheduled laundry, may incur a fee of ${fee(TERMS.lateCancelFee, "fee")}.` },
  { id: "claims", group: "Timing, cancellations & claims", title: "Lost or damaged item claims",
    body: `Report a missing or damaged item within ${hrs(TERMS.claimWindowHours, "claims window")} after delivery. ${TERMS.liabilityCap ?? tbd("Liability amount/wording, pending insurance review")}` },

  { id: "payment", group: "Payment", title: "Payment authorization",
    body: "By booking, you authorize Laundry Day Off to place a hold on your card now and to charge the final weighed total plus any fees described in these rules (such as additional bags, late cancellation or access fees, and excessive pet hair). If your final total will exceed the hold, we'll contact you first." },

  { id: "tracking", group: "How we track your order", title: "Documentation for every order",
    body: "To protect you and us, every order is traceable. At pickup we record your order number, a unique bag ID, a pickup photo, the bag weight, the pickup date/time, and your laundry preferences. Before delivery we take a photo of your finished, folded order, seal the bag, and record a delivery photo and time." },
];

// Individually-acknowledged items (clickwrap). The last one is the master agreement.
export const ACK_ITEMS = [
  { id: "pockets", label: "I will empty all pockets before pickup." },
  { id: "items", label: "My laundry is normal washable household laundry: no dry-clean-only items, and nothing contaminated (biohazards, feces, vomit, heavily blood-soaked items, suspected bedbugs, or hazardous chemicals)." },
  { id: "bag", label: "My bag will close normally. I understand overflow is treated as an additional bag, and comforters and oversized blankets are priced separately." },
  { id: "wear", label: "I understand stain removal isn't guaranteed, and that Laundry Day Off isn't responsible for pre-existing damage or normal wear (holes, weak seams, fading, inherent shrinkage, worn fabric)." },
  { id: "agree", label: "I have read and agree to the Laundry Day Off Service Rules, and I authorize the payment terms above." },
] as const;

/** Fingerprint of the exact text shown. DEMO ONLY (FNV-1a): compute SHA-256 on the server in production. */
export function agreementHash(): string {
  const s = JSON.stringify([RULES, ACK_ITEMS]);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16);
}
