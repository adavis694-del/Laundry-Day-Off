import { PRICING } from "./config";

export type OrderInput = {
  lbs: number;
  bulky: Record<string, number>;
  plan: "once" | "weekly" | "biweekly";
  rush: boolean;
  hangers: number;
};

export function computeOrder(o: OrderInput) {
  const rate = o.plan === "once" ? PRICING.perLb : PRICING.perLbSubscriber;
  const washRaw = o.lbs * rate;
  const wash = o.lbs > 0 ? Math.max(washRaw, PRICING.minimum) : 0;
  const minApplied = o.lbs > 0 && washRaw < PRICING.minimum;
  const bulky = PRICING.bulky.reduce((s, b) => s + (o.bulky[b.id] || 0) * b.price, 0);
  const hangers = o.hangers * PRICING.hangerFee;
  const rush = o.rush ? PRICING.rushFee : 0;
  const total = wash + bulky + hangers + rush;
  return { rate, wash, minApplied, bulky, hangers, rush, total };
}

export const money = (n: number) => `$${n.toFixed(2)}`;
