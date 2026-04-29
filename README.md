# Easy OEE

> Real-time OEE tracking for smart manufacturers. Built for the shop floor. Up and running in one shift.

**Live:** [easy-oee.vercel.app](https://easy-oee.vercel.app) · **Demo (no login):** [easy-oee.vercel.app/demo](https://easy-oee.vercel.app/demo) · **Sign up (7-day free trial):** [easy-oee.vercel.app/sign-up](https://easy-oee.vercel.app/sign-up)
**Domain:** [easy-oee.com](https://easy-oee.com) (currently serving Louis's static marketing HTML — DNS cutover pending)
**GitHub:** https://github.com/cqdesignsny/easy-oee
**Status:** Phase 1 + Phase 2-foundation + Phase 3 (Insights) shipped. Marketing site, operator flow, manager dashboard, admin pages, EN/ES/FR i18n, animated hero gauge, **live machines grid**, **/demo with banner + per-route tips**, **self-serve 7-day trial signup**, **barcode/QR scanner for job numbers**, **analytics module (overview + by shift / machine / operator)**, **light/dark theme toggle on every surface**, Tier 1-4 product upgrades. Stripe + Resend + Clerk on stubs.

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
1. **Operator** — `/pin` (name + 4-digit PIN) → `/operator` (shift setup with optional **scan/type job number**) → `/shift/[id]` (live tracking) → `/shift/[id]/summary` (OEE breakdown)
2. **Manager** — `/sign-in` (email + password, falls back to a legacy demo password) → `/dashboard` (live machines grid, today's OEE, live shifts, recent shifts, 7-day Pareto) → `/dashboard/lines`, `/dashboard/operators`, `/dashboard/shifts` (admin CRUD with edit-shift)
3. **Customer (live demo)** — `/demo` → pick **Enter as Manager** or **Enter as Operator** → land in the seeded Maple Manufacturing tenant with a sticky DEMO MODE banner that has a Sign Up Free CTA
4. **Customer (real signup)** — `/pricing` → `/sign-up` → fills form → real company + manager user created → `/dashboard` with a 7-day trial countdown banner. Stripe wires in later.

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
- `/sign-in` — manager login (email + bcrypt password lookup, falls back to legacy `ADMIN_PASSWORD` env var, Demo + Sign Up CTAs, language switcher)
- `/sign-up` — **real self-serve signup** with 7-day trial: creates `company` + manager `user`, sets HMAC admin cookie, lands on `/dashboard`. No credit card. Stripe wires in later.
- `/demo` — **live sales demo**: pick "Enter as Manager" or "Enter as Operator" (no login). Both seed into the demo tenant. Sticky DEMO MODE banner with Sign Up Free CTA + per-route tip cards.
- `/pin` — operator name picker + 4-digit keypad (bcrypt verify)
- `/operator` — shift setup form with **optional Job Number** field (type or scan barcode/QR), redirects in-progress shifts
- `/shift/[id]` — live tracking with `useOptimistic`, 10 stop buttons, parts counters, end-shift confirm
- `/shift/[id]/summary` — color-coded OEE breakdown, shows job number when set
- `/dashboard` — manager home: **live machines grid** (per-line cards with running/stopped pill, big OEE, operator, parts, elapsed timer, top stop today, auto-refresh 10s), trial countdown banner, today's OEE, shift comparison, live shifts, recent shifts (with Job # column), 7-day Pareto stops, **Scan code → clipboard** utility button in header
- `/dashboard/analytics` — **analytics overview**: 30-day KPI cards (OEE / A / P / Q), production volumes, 14-day SVG sparkline with target line, drill-in cards
- `/dashboard/analytics/shifts` — per-shift-type comparison + Pareto stops broken out by shift
- `/dashboard/analytics/machines` — per-line summary table, OEE-vs-target horizontal bars, Pareto stops per machine
- `/dashboard/analytics/operators` — leaderboard cards (#1 highlighted), detail table sorted by OEE, Pareto stops per operator
- `/dashboard/lines` `/dashboard/operators` `/dashboard/shifts` — admin CRUD pages. Shifts admin includes Job # column + edit-shift with scanner-enabled job number field.
- `/board/[token]` — public TV board for shop-floor displays
- **Shift export** — Download CSV / Print or save PDF / Email it (scaffold) buttons on `/shift/[id]/summary`. CSV via `/api/shifts/[id]/csv` route handler includes Job Number row.
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

### Auth (HMAC cookies — pre-Clerk)
- **Manager login**: `/sign-in` with email + bcrypt password lookup against `user.password_hash`. HMAC-signed cookie `eo_admin`, 14-day TTL. Cookie payload now carries `userId` + `companyId`.
- **Legacy demo password**: any email + `EasyOEE2026Admin` still works and lands you in the seeded Maple Manufacturing tenant. Backwards-compat backdoor for existing demo bookmarks; remove the env var when ready.
- **Self-serve signup**: `/sign-up` creates a real `company` + manager `user` with bcrypt password and a 7-day `trial_ends_at`. Lands on `/dashboard` with a trial countdown banner.
- **Demo mode**: `/demo` sets admin + operator cookies pointed at the seed user IDs and an `eo_demo` marker cookie that toggles the banner. Exit via the link in the banner.
- **Operator PIN**: `/pin` with name picker + 4-digit PIN, bcrypt-hashed in Postgres. HMAC-signed cookie, 12-hour TTL.
- Google/Microsoft SSO buttons present on `/sign-in` as placeholders (disabled with "Coming soon" tooltip)

### Theme system (light + dark)
- Both themes share the brand teal accent. Dark theme is the existing look; light theme flips background and text while keeping accent colors.
- `eo-theme` cookie read SSR-side by the root layout, so `<html data-theme>` is set before first paint (no flash).
- `<ThemeToggle />` client component (sun/moon SVG, no emoji glyphs) wired into manager sidebar, operator setup, sign-in, pin, demo landing, and the marketing nav (desktop + mobile cluster). Persists to cookie + localStorage.
- Smooth color transitions across body, cards, nav, sidebar, fields, buttons, banners.

### Barcode / QR scanner
- Native `BarcodeDetector` API with `@zxing/browser` fallback for Safari pre-TP.
- **Job Number** input on operator shift setup (`/operator`) and manager edit-shift (`/dashboard/shifts/[id]/edit`) with a scan-icon button next to the input. Tap → camera modal → detected value fills the input.
- Manager dashboard header has a **Scan code → clipboard** utility for ad-hoc reads (parts/material codes, etc.) with a green "Copied!" toast.
- Schema: `shift.job_number text`. Visible on live shift, summary, dashboard recent shifts table, full shifts admin table, per-shift CSV export.

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
- **No-login demo:** [easy-oee.vercel.app/demo](https://easy-oee.vercel.app/demo) — pick a side, click around the seeded tenant
- **Real signup:** [easy-oee.vercel.app/sign-up](https://easy-oee.vercel.app/sign-up) — creates a fresh tenant with a 7-day trial
- Legacy demo password: any email + `EasyOEE2026Admin` at `/sign-in`
- Operator tablet: pick **Pierre Lavoie**, PIN `1234` at `/pin`

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
