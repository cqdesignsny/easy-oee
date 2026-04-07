# Easy OEE

> Real-time OEE tracking for smart manufacturers. Built for the shop floor. Up and running in one shift.

**Live:** [easy-oee.vercel.app](https://easy-oee.vercel.app)
**Domain:** [easy-oee.com](https://easy-oee.com) (currently serving Louis's static marketing HTML — DNS cutover pending)
**GitHub:** https://github.com/cqdesignsny/easy-oee
**Status:** Phase 1 shipped. Marketing site, operator flow, manager dashboard, admin pages, EN/ES/FR i18n, animated hero gauge, admin login, Stripe scaffold.

> **Picking this up on a new machine?** Start with [`docs/HANDOFF.md`](./docs/HANDOFF.md).

---

## What is OEE?

**Overall Equipment Effectiveness** is the gold-standard manufacturing productivity metric:

```
OEE = Availability × Performance × Quality
```

- **Availability** = (Planned − Stop minutes) / Planned
- **Performance** = Total parts / (Ideal rate × Run time)
- **Quality** = Good parts / Total parts

World-class is 85%+. Most SME plants have no idea what theirs is. We fix that.

## What this app does

Operators tap-to-log shifts and machine stops on a tablet on the shop floor. Plant managers get live OEE dashboards on their phone or laptop. No spreadsheets. No paper. A hardware add-on for direct PLC ingest is on the roadmap as a paid upsell ([`docs/HARDWARE-INTEGRATION.md`](./docs/HARDWARE-INTEGRATION.md)).

### Core flows
1. **Operator** — `/pin` (name + 4-digit PIN) → `/operator` (shift setup) → `/shift/[id]` (live tracking) → `/shift/[id]/summary` (OEE breakdown)
2. **Manager** — `/sign-in` (email + admin password, Google/Microsoft SSO buttons placeholder) → `/dashboard` (today's OEE, live shifts, recent shifts, 7-day Pareto) → `/dashboard/lines`, `/dashboard/operators`, `/dashboard/shifts` (admin CRUD)
3. **Customer** — `/pricing` (USD with CAD reference, line-count slider) → `/sign-up?plan=pro&lines=3` (Stripe checkout, scaffold for now)

## Tech stack

| Layer       | Choice                                          |
|-------------|-------------------------------------------------|
| Framework   | Next.js 16 (App Router) + TypeScript strict     |
| Styling     | Tailwind CSS v4 + custom CSS (ported design)    |
| Database    | Neon Postgres (Vercel Marketplace)              |
| ORM         | Drizzle                                         |
| Auth        | Custom HMAC cookie sessions (admin + operator). Clerk integration planned. |
| Payments    | Stripe (scaffold ready, not yet wired)          |
| i18n        | React Context + cookie + `useSyncExternalStore` (EN/ES/FR) |
| Hosting     | Vercel                                          |
| Package mgr | pnpm                                            |
| Domain      | easy-oee.com                                    |

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full rationale.

## What's done

### Marketing site (all 3 languages)
- `/` — full landing page with animated hero gauge (CSS keyframe needle that revs to max and bounces, sized 600–820px on desktop, 280–380px on mobile)
- `/how-it-works` — 3-step explainer, 10 stop reasons, OEE math, getting started, FAQ
- `/roi-calculator` — interactive client calculator with 6 sliders, +5/+10/+15% improvement targets, USD outputs
- `/pricing` — line-count slider, 3 tiers, USD primary with CAD reference (`≈ $X CAD`)
- `/contact` — demo request form, server action → `demo_lead` table
- `/privacy` and `/terms` — full SaaS legal pages
- `/sign-up` — Stripe trial signup scaffold (plan + line count + email/company)

### App
- `/sign-in` — manager login (email + password, Google/Microsoft SSO placeholder buttons, language switcher)
- `/pin` — operator name picker + 4-digit keypad (bcrypt verify)
- `/operator` — shift setup form, redirects in-progress shifts
- `/shift/[id]` — live tracking with `useOptimistic`, 10 stop buttons, parts counters, end-shift confirm
- `/shift/[id]/summary` — color-coded OEE breakdown
- `/dashboard` — manager home: today's OEE, live shifts, recent shifts, 7-day Pareto stops
- `/dashboard/lines` `/dashboard/operators` `/dashboard/shifts` — admin CRUD pages
- **Shift export** — Download CSV / Print or save PDF / Email it (scaffold) buttons on `/shift/[id]/summary`. CSV via `/api/shifts/[id]/csv` route handler (auth-scoped, full per-shift export). Print uses a dedicated print stylesheet for clean PDF output.
- API stubs at `/api/checkout/session` and `/api/webhooks/stripe` (return 501 until Stripe is wired)

### Internationalization
- 3 locales: **English / Español / Français** with browser-language auto-detect
- ~200 translation keys per language across nav, footer, homepage, marketing pages, app pages, admin
- React Context (`LanguageProvider`) using `useSyncExternalStore` for SSR safety
- Server-side `getServerT()` helper that reads the locale cookie
- Cookie-based persistence (1 year, `eo-locale`)
- Language switcher in nav (always visible, even on mobile next to hamburger), in dashboard sidebar, on /sign-in
- Switching language calls `router.refresh()` so server-rendered pages re-render in the new locale

### UI / branding
- Brand SVG logo (`public/easy-oee-logo.svg`) used in nav (56px), footer (72px), dashboard sidebar (42px), sign-in (56px), pin (56px), operator pages (42–48px), favicon
- Animated hero gauge — pure SVG with CSS keyframe needle revving to max
- All buttons rounded (full pill 999px, or 22px for card-style operator buttons)
- 17px body baseline, line-height 1.65, type scale 12 14 16 18 24 32
- Mobile hamburger menu (full-screen overlay, locks body scroll, closes on route change)
- 56px+ tap targets across operator screens, 16px+ body text on mobile

### Auth (temporary, until Clerk lands)
- **Admin login**: `/sign-in` with shared password from `ADMIN_PASSWORD` env var. HMAC-signed cookie, 14-day TTL. Demo password: `EasyOEE2026Admin`
- **Operator PIN**: `/pin` with name picker + 4-digit PIN, bcrypt-hashed in Postgres. HMAC-signed cookie, 12-hour TTL.
- Google/Microsoft SSO buttons present on `/sign-in` as placeholders (disabled with "Coming soon" tooltip)

## Getting started

```bash
pnpm install
vercel link --yes --project easy-oee
vercel env pull .env.local --environment=production  # pulls Neon DATABASE_URL
pnpm db:push          # apply schema to Neon
pnpm db:seed          # seeds Maple Manufacturing demo tenant
pnpm dev              # http://localhost:3000
```

**Demo credentials:**
- Manager: any email + password `EasyOEE2026Admin` at `/sign-in`
- Operator: pick **Pierre Lavoie**, PIN `1234` at `/pin`

## Resend wiring (when ready)

The shift summary "Email it" button is scaffold-ready. To wire actual email delivery:

1. `pnpm add resend @react-email/components`
2. Create `src/emails/ShiftSummary.tsx` — a React Email template that takes `{ shift, line, operator, stops }` as props and renders a branded summary
3. Add to Vercel env: `RESEND_API_KEY`, `EASY_OEE_FROM_EMAIL` (e.g. `Easy OEE <reports@easy-oee.com>`)
4. In `src/server/actions/shift-export.ts`, replace the `console.log` with:
   ```ts
   import { Resend } from "resend";
   import { ShiftSummary } from "@/emails/ShiftSummary";
   const resend = new Resend(process.env.RESEND_API_KEY!);
   await resend.emails.send({
     from: process.env.EASY_OEE_FROM_EMAIL!,
     to: parsed.data.email,
     subject: `Shift summary: ${lineName} ${shiftDate}`,
     react: <ShiftSummary shift={shiftRow} ... />,
   });
   ```
5. (Optional) Add automatic delivery: in `endShift()`, look up the manager's email preference and fire-and-forget the email.

## Stripe wiring (when ready)

Pricing config lives in [`src/lib/pricing.ts`](./src/lib/pricing.ts). To wire Stripe:

1. Create products + prices in your Stripe dashboard (one base price per plan + a metered "extra line" price for `pro`)
2. Fill in `stripePriceId` and `stripeExtraLinePriceId` for each plan in `pricing.ts`
3. Add to Vercel env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Replace the 501 stubs in `src/app/api/checkout/session/route.ts` and `src/app/api/webhooks/stripe/route.ts`
5. Schema fields are already in place: `company.stripe_subscription_id`, `stripe_price_id`, `licensed_lines`, `subscription_status`

The `/sign-up` page already collects plan + line count + company name + email and is wired to call the checkout endpoint.

## Project docs

- [`PROJECT.md`](./PROJECT.md) — vision, market, business model, product spec
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — system design, data model, decisions
- [`docs/SCHEMA.md`](./docs/SCHEMA.md) — database tables and relationships
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — phased plan, what's done, what's next
- [`docs/OEE_MATH.md`](./docs/OEE_MATH.md) — calculation reference and edge cases
- [`docs/HARDWARE-INTEGRATION.md`](./docs/HARDWARE-INTEGRATION.md) — future PLC ingest path
- [`docs/HANDOFF.md`](./docs/HANDOFF.md) — pick this up on any machine
- [`AGENTS.md`](./AGENTS.md) — instructions for AI agents working on this repo
- [`CLAUDE.md`](./CLAUDE.md) — alias to `AGENTS.md`

## Team

- **Louis** — founder, market research, customer development
- **CQ Marketing** — co-builder, engineering lead
