# Laundry Day Off

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind. Retro mid-century brand system.

## Run it
Requires **Node 20.9+**.
```bash
npm install
cp .env.example .env.local     # then set NEXT_PUBLIC_SITE_URL to your real domain
npm run dev                    # http://localhost:3000
npm run build && npm start     # production
```

## Launch checklist
1. **Set `NEXT_PUBLIC_SITE_URL`** to your real domain (otherwise social-share previews point at localhost).
2. **Finalize the Service Rules** (see below). A yellow DRAFT banner shows on `/rules` and in checkout until every value is filled in.
2b. Replace placeholders: phone/email in `components/Footer.tsx`, testimonials in `components/Reviews.tsx`, ZIPs/prices in `lib/config.ts`.
3. **Decide the data layer.** Orders currently live in each visitor's own browser (localStorage). Customers and the operator do NOT see each other's data. That is fine for a demo but means **no real orders can be taken until you do step 4**.
4. Wire the integrations below (database, auth, Stripe, Twilio/SendGrid).
5. Deploy (see below). Fonts are fetched from Google at build time, so the build machine needs internet access.

## Deploy to Vercel (recommended, free tier works)
1. Go to https://vercel.com/new and sign in with GitHub.
2. Import this repository. Vercel auto-detects Next.js; keep the default build settings.
3. Under **Environment Variables**, add `NEXT_PUBLIC_SITE_URL` = your domain (e.g. `https://www.laundrydayoff.com`).
4. Click **Deploy**. Every push to the default branch redeploys automatically.
5. Add your custom domain under Project → Settings → Domains.

`/robots.txt` and `/sitemap.xml` are generated from `NEXT_PUBLIC_SITE_URL`; `/admin` and `/account` are excluded from search engines.

## What works today (demo mode)
- Home: hero + video, ZIP checker, How It Works, live pricing/weight estimator, service area, reviews, FAQ
- `/book`: 6-step flow (ZIP → Schedule → Preferences → Bag size → Rules → Payment) with validation + live summary
- `/account`: live order tracker, recurring plan controls, card on file, history
- `/admin`: route dashboard (demo PIN `1234`): assign drivers, log weights, change status, simulated SMS log
- `/business`: B2B / Airbnb quote form

Orders persist in **localStorage** so the whole loop (book → track → operator updates) is demoable with no backend.

## Edit business rules in one place
`lib/config.ts`: prices, minimums, bulky items, windows, **service ZIPs**, statuses.
The ZIPs there are a Winston-Salem/Triad **placeholder**; replace with your real routes.

## Going to production: the integration seams
Everything below is currently mocked. Each has one place to swap.

| Concern | Now | Replace with |
|---|---|---|
| Orders/DB | `lib/store.ts` (localStorage) | Postgres via Prisma/Supabase; keep the same function names |
| Auth | none / demo PIN | NextAuth or Clerk; role `customer` vs `operator`; **protect `/admin` server-side** |
| Payments | fake card fields in `BookingFlow` step 5 | Stripe Elements + `PaymentIntent` with `capture_method: "manual"` (auth hold), then capture the weighed amount from `/admin` |
| SMS / email | simulated log in `/admin` | Twilio + SendGrid, fired from an API route on each status change |
| Business form | client-only | `POST /api/inquiries` + email to owner |

### Security notes (do before launch)
- **Never** collect raw card numbers yourself. Use Stripe Elements so card data never touches your server (PCI).
- The `/admin` PIN is client-side and only a demo gate. Real auth must be enforced on the server.
- Sample testimonials in `components/Reviews.tsx` are placeholders. Use real ones.
- Phone/email/address in the footer are placeholders.

## Assets
`public/logo.png` (brand), `public/hero.mp4` + `hero-poster.jpg` (compressed from your Gemini clip, muted for autoplay).


## Service Rules (customer agreement)
- Wording lives in **one file: `lib/agreement.ts`**. The public `/rules` page and the checkout "Rules" step both render from it.
- Open decisions are the `TERMS` object at the top (turnaround, free-cancel cutoff, late-cancel/no-access fee, claims window, liability wording, pet-hair fee). While any is `null`, the text shows `[... TBD]` in yellow and a DRAFT banner appears. Fill them in and the banner disappears by itself.
- **Change any wording? Bump `AGREEMENT_VERSION`.** Every order stores the version, a fingerprint of the exact text shown, the timestamp, and which boxes were checked (`order.agreement`).
- Checkout requires 4 individual confirmations (pockets, accepted items, bag/bedding, stains/wear) plus a master agreement before payment.
- Same-day rush is off (`FEATURES.sameDayRush` in `lib/config.ts`). No turnaround time is advertised until you set `TERMS.turnaroundText`.
- **Have an attorney review the rules before launch.** Whether liability limits are enforceable varies by state.

### Before real customers use it (agreement evidence)
The acceptance record is currently in the visitor's browser. For it to protect you, save it **server-side** when the order is placed: version, SHA-256 of the text, timestamp, IP address, user-agent, and email the customer a copy. Replace the demo `agreementHash()` with a server-side SHA-256.
