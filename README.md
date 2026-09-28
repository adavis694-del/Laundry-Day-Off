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
3. **Connect Supabase** (accounts + orders database), see below.
4. Wire the remaining integrations below (Stripe, Twilio/SendGrid).
5. Deploy (see below). Fonts are fetched from Google at build time, so the build machine needs internet access.

## Deploy to Vercel (recommended, free tier works)
1. Go to https://vercel.com/new and sign in with GitHub.
2. Import this repository. Vercel auto-detects Next.js; keep the default build settings.
3. Under **Environment Variables**, add `NEXT_PUBLIC_SITE_URL` = your domain (e.g. `https://www.laundrydayoff.com`).
4. Click **Deploy**. Every push to the default branch redeploys automatically.
5. Add your custom domain under Project → Settings → Domains.

`/robots.txt` and `/sitemap.xml` are generated from `NEXT_PUBLIC_SITE_URL`; `/admin` and `/account` are excluded from search engines.

## Connect Supabase (accounts + orders)
Customer logins, orders, operator access and business inquiries are stored in Supabase.
Until the two keys are set, `/book`, `/account` and `/admin` show an "Accounts aren't connected yet" notice.

1. **Create the tables.** Supabase Dashboard → **SQL Editor** → New query → paste all of [`supabase/schema.sql`](supabase/schema.sql) → **Run**. (Safe to run again.)
2. **Copy your keys.** Dashboard → **Project Settings → API** (or the **Connect** button): copy the **Project URL** and the **anon / publishable** key. *Never* use the `service_role` / secret key in the website.
3. **Add them to Vercel.** Project → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon / publishable key
   
   Then **Deployments → ⋯ → Redeploy** (the keys are baked in at build time).
4. **Set the login redirect URL.** Supabase → **Authentication → URL Configuration**: set **Site URL** to your live URL (e.g. `https://laundry-day-off.vercel.app`) and add `https://laundry-day-off.vercel.app/**` under **Redirect URLs**. Otherwise confirmation emails link to localhost.
5. **Make yourself an operator.** Create your account on the live site (`/account` → New customer), then run in the SQL Editor:
   ```sql
   insert into public.operators (user_id)
   select id from auth.users where email = 'you@example.com'
   on conflict do nothing;
   ```
   Now `/admin` shows every order and every business inquiry. Repeat for each staff member.

**How security works:** Row Level Security in the database enforces access, not the website. Customers can only read their own orders, can't set weights/totals/status, and can only change the window/plan of their own not-yet-picked-up order. Only operators can read all orders and inquiries or update orders.

**Emails:** Supabase's built-in email sender is rate-limited (a few per hour) and meant for testing. Before launch, add your own SMTP (e.g. Resend, SendGrid) under Authentication → Emails → SMTP Settings.

## What works today
- Home: hero + video, ZIP checker, How It Works, live pricing/weight estimator, service area, reviews, FAQ
- `/book`: 6-step flow (ZIP → Schedule → Preferences → Bag size → Rules → Payment) with validation + live summary
- `/account`: sign in, live order tracker (updates in real time), recurring plan controls, history
- `/admin`: operator-only route dashboard: assign drivers, log weights (final total computed incl. bulky items), change status, business inquiries, simulated SMS log
- `/business`: B2B / Airbnb quote form (saved to Supabase, visible in `/admin`)

Still demo: card entry (Stripe not wired yet) and SMS/email notifications.

## Edit business rules in one place
`lib/config.ts`: prices, minimums, bulky items, windows, **service ZIPs**, statuses.
The ZIPs there are a Winston-Salem/Triad **placeholder**; replace with your real routes.

## Going to production: the integration seams
Everything below is currently mocked. Each has one place to swap.

| Concern | Now | Replace with |
|---|---|---|
| Orders/DB | ✅ Supabase (`lib/store.ts`, `supabase/schema.sql`) | done |
| Auth | ✅ Supabase Auth; operators in `public.operators`, enforced by RLS | done |
| Payments | fake card fields in `BookingFlow` step 5 | Stripe Elements + `PaymentIntent` with `capture_method: "manual"` (auth hold), then capture the weighed amount from `/admin` |
| SMS / email | simulated log in `/admin` | Twilio + SendGrid, fired from an API route on each status change |
| Business form | ✅ saved to `inquiries` table | add an email alert to the owner |

### Security notes (do before launch)
- **Never** collect raw card numbers yourself. Use Stripe Elements so card data never touches your server (PCI).
- `/admin` access is enforced by Supabase Row Level Security; add staff via `public.operators`.
- The authorization-hold amount is computed in the browser; recompute it server-side when Stripe is wired.
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
The acceptance record (version, text fingerprint, timestamp, confirmed boxes) is now saved with each order in Supabase (`orders.agreement`). For stronger evidence, also capture IP address and user-agent server-side and email the customer a copy. Replace the demo `agreementHash()` with a server-side SHA-256.
