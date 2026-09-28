// Central business config. Edit these to change pricing/coverage site-wide.
export const PRICING = {
  perLb: 1.99,
  perLbSubscriber: 1.69,
  minimum: 30,
  rushFee: 12,
  hangerFee: 1.5,
  bulky: [
    { id: "comforter", label: "Comforter / Duvet", price: 24 },
    { id: "blanket", label: "Heavy Blanket", price: 18 },
    { id: "pillow", label: "Pillow (each)", price: 9 },
    { id: "sleeping", label: "Sleeping Bag", price: 22 },
  ],
} as const;

export const WEIGHT_GUIDE = [
  { id: "kitchen", label: "Kitchen trash bag", lbs: 13, note: "≈ 12–15 lbs" },
  { id: "hamper", label: "Full hamper", lbs: 20, note: "≈ 20 lbs" },
  { id: "twobags", label: "Two big bags", lbs: 28, note: "≈ 25–30 lbs" },
  { id: "weekfam", label: "Family week", lbs: 45, note: "≈ 40–50 lbs" },
] as const;

export const WINDOWS = [
  { id: "am", label: "Morning", time: "8am – 11am" },
  { id: "pm", label: "Evening", time: "5pm – 8pm" },
] as const;

// Demo service area (Winston-Salem / Triad). Replace with the operator's real routes.
export const SERVICE_ZIPS: Record<string, string> = {
  "27101": "Downtown Winston-Salem", "27103": "Ardmore / Buena Vista", "27104": "Ardmore",
  "27105": "North Winston-Salem", "27106": "Northeast Winston-Salem", "27107": "Southeast Winston-Salem",
  "27127": "Southside",
  "27012": "Clemmons", "27023": "Lewisville", "27284": "Kernersville",
  "27401": "Greensboro Downtown", "27403": "Greensboro West", "27408": "Greensboro Fisher Park",
};

export const PREFS = {
  detergent: [
    { id: "linen", label: "Fresh Linen", sub: "Scented" },
    { id: "lavender", label: "Lavender", sub: "Scented" },
    { id: "free", label: "Free & Clear", sub: "Fragrance-free · baby & sensitive" },
    { id: "eco", label: "Eco-Friendly", sub: "Plant-based" },
    { id: "own", label: "I'll provide my own", sub: "Your products" },
  ],
  softener: [
    { id: "yes", label: "Softener + sheets" },
    { id: "no", label: "None" },
    { id: "wool", label: "Wool dryer balls" },
  ],
  temp: [
    { id: "cold", label: "Cold wash only" },
    { id: "delicate", label: "Low-heat delicate" },
    { id: "warm", label: "Standard warm" },
  ],
} as const;

// Flip on only when you actually offer it. Owner decision: no same-day service at launch.
export const FEATURES = { sameDayRush: false } as const;

export const STATUSES = ["Scheduled", "Picked Up", "In Wash", "Out for Delivery", "Delivered"] as const;
export type Status = (typeof STATUSES)[number];
