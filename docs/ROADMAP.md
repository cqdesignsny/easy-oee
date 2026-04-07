# Roadmap

> **Live build plan.** Update as work happens. Tasks at the top are happening now.

Legend: 🟢 done · 🟡 in progress · ⚪ queued · 🔵 blocked

---

## Phase 0 — Environment & scaffolding

- 🟢 Install dev toolchain (Homebrew, node, pnpm, git, gh, vercel-cli)
- 🟢 Create `~/Code/easy-oee` (outside Dropbox)
- 🟢 Scaffold Next.js 16 + TS + Tailwind v4 + Turbopack
- 🟢 Install Drizzle, Zod, Clerk, bcryptjs, Vitest, dotenv, tsx
- 🟢 Project docs (README, PROJECT, AGENTS/CLAUDE, ARCHITECTURE, SCHEMA, OEE_MATH, ROADMAP, HARDWARE-INTEGRATION, HANDOFF)
- 🟢 Init git, `.gitignore` properly excluding node_modules / .next / .env*
- 🟢 GitHub repo: https://github.com/cqdesignsny/easy-oee (private)
- 🟢 Vercel project linked: `cq-marketings-projects/easy-oee`
- 🟢 First production deploy: https://easy-oee.vercel.app

## Phase 1 — MVP

### Marketing
- 🟢 Marketing site ported 1:1 from live easy-oee.com (teal palette)
  - 🟢 `/` landing page (hero, stats, problem, solution, how, features, proof, pricing teaser, CTA)
  - 🟢 `/pricing` (Starter / Professional / Enterprise) — basic version, may need teal restyle
  - 🟢 `/contact` — demo request form with Server Action → `demo_lead` table + Zod validation
  - 🟢 Bebas Neue / DM Sans / DM Mono via `next/font/google`
  - 🟢 Fade-in scroll observer (single client component)
- ⚪ `/how-it-works` page (linked from nav, doesn't exist yet)
- ⚪ `/roi-calculator` page (linked from nav, doesn't exist yet)
- ⚪ `/privacy` and `/terms` pages
- ⚪ Vercel Analytics
- ⚪ OG images
- ⚪ Cutover `easy-oee.com` DNS to Vercel (DON'T do until app is ready — Louis's prospects use the static HTML)

### Database
- 🟢 Drizzle schema in `src/lib/db/schema.ts` (company, user, line, shift, stop, device, demo_lead)
- 🟢 Lazy Neon client in `src/lib/db/client.ts`
- 🟢 Documented in `docs/SCHEMA.md`
- 🟢 Provision Neon Postgres via Vercel Marketplace (`easy-oee-dev`)
- 🟢 `vercel env pull .env.local` (DATABASE_URL + Postgres vars)
- 🟢 Push schema with `pnpm db:push`
- 🟢 Idempotent seed script `src/lib/db/seed.ts` (Maple Manufacturing + 2 lines + 1 manager + 1 operator + 3 historical shifts)
- 🟢 `withTenant(companyId)` helper in `src/lib/db/scoped.ts`

### OEE math
- 🟢 `src/lib/oee.ts` — `computeOEE()`, `formatPercent()`, `oeeBucket()`
- 🟢 `src/lib/oee.test.ts` — 11/11 tests passing (happy path, zero planned/parts/rate, over-stop, perf cap, formatting, bucketing)

### Operator flow
- 🟢 `/operator` — shift setup form, `startShift()` server action
- 🟢 `/shift/[id]` — live tracking with 10 stop buttons, parts counters, useOptimistic
- 🟢 `/shift/[id]/summary` — full OEE breakdown with color-coded factors
- 🟢 Server actions: `logStop`, `closeStop`, `updateParts`, `endShift` (calls `computeOEE`)
- 🟢 Glove-friendly UI: 96px stops, 56px+ tap targets, big type, high contrast
- 🟢 `/pin` — operator PIN login (name picker + 4-digit keypad + bcrypt verify)
- 🟢 Operator session cookie (HMAC-signed, 12h TTL, OPERATOR_SESSION_SECRET)

### Manager dashboard
- 🟢 `/dashboard` — Today's OEE big number, live shifts, recent 10 shifts, 7-day Pareto stops (revalidate=10)
- ⚪ `/dashboard/lines` — manage lines
- ⚪ `/dashboard/operators` — create operators + set PINs
- ⚪ `/dashboard/shifts` — full history with filters
- ⚪ Sidebar nav for manager routes

### Auth
- ⚪ Clerk for managers (`@clerk/nextjs` already installed)
  - `<ClerkProvider>` in root layout
  - `src/middleware.ts` scoped to `(app)` routes
  - `(auth)/sign-in/[[...rest]]` + `(auth)/sign-up/[[...rest]]`
  - Webhook `api/webhooks/clerk/route.ts`: on `user.created` → create Company, set `publicMetadata.companyId`
- ⚪ Operator PIN flow
  - `/pin` name-picker + 4-digit entry
  - `src/lib/auth/operator-session.ts` — signed HTTP-only cookie
  - `OPERATOR_SESSION_SECRET` env var

### Polish
- ⚪ App shell layout with sidebar nav for managers
- ⚪ Operator-mode layout (full-screen, no chrome)
- ⚪ `loading.tsx`, `error.tsx`, on-brand 404
- ⚪ Favicon + OG images
- ⚪ Sentry error tracking

## Phase 2 — Sell

- ⚪ Stripe billing (Starter / Professional / Enterprise)
- ⚪ Trial countdown banner + plan limits enforcement
- ⚪ Manager invitation flow (invite teammate by email)
- ⚪ Email notifications (shift complete, daily summary) via Resend
- ⚪ CSV export of shift data
- ⚪ PWA manifest + install prompt for tablets
- ⚪ PostHog product analytics

## Phase 3 — Insights

- ⚪ Downtime Pareto chart over date ranges
- ⚪ Shift-vs-shift comparison (morning / afternoon / night)
- ⚪ Weekly + monthly OEE trend lines
- ⚪ Per-line drill-down
- ⚪ Custom stop reason categories per company

## Phase 4 — Hardware ingest

See `docs/HARDWARE-INTEGRATION.md`.

- ⚪ `/api/ingest` POST endpoint with API-key auth
- ⚪ `device` table CRUD in dashboard
- ⚪ Pairing flow (manager generates an API key for a line)
- ⚪ Reference firmware for Raspberry Pi gateway
- ⚪ Auto-stop detection rules
- ⚪ Mixed-mode shifts (manual + device)

## Phase 5 — Enterprise

- ⚪ Multi-plant dashboard
- ⚪ RBAC (operator / supervisor / manager / admin)
- ⚪ Audit log
- ⚪ REST API + API key management
- ⚪ Postgres Row-Level Security
- ⚪ SOC2 prep
- ⚪ French (Quebec) localization

---

## Open questions (also in `PROJECT.md`)

- [ ] Final pricing model with Louis ($49/$129 vs $99/line)
- [ ] Domain split (`app.easy-oee.com` vs `/app` prefix)
- [ ] Stripe vs Lemon Squeezy (LS handles Canadian sales tax)
- [ ] Hardware target (Pi vs ESP32 vs industrial gateway)
- [ ] French localization timing

## Recent activity

- **2026-04-07** — Phase 1 core flow shipped. Neon provisioned via Vercel Marketplace, schema pushed, seed loaded. Operator PIN auth + `/operator` shift setup + `/shift/[id]` live tracking (useOptimistic, 10 stop buttons, parts counters) + `/shift/[id]/summary` (color-coded OEE breakdown) + manager `/dashboard` (Today's OEE, live shifts, recent 10, 7-day Pareto stops) all built and deployed. 11/11 tests pass, lint clean, build clean. Demo creds: operator "Pierre Lavoie" / PIN 1234.
- **2026-04-07** — Repo relocated to portable SSD at `/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee` so it can be worked on from any machine. iMac (`cqmarketing`) toolchain installed (Homebrew, node, pnpm, gh, vercel-cli, postgres@16). SSO Deployment Protection disabled — easy-oee.vercel.app now public.
- **2026-04-06** — Marketing site ported to new teal/cyan palette matching live easy-oee.com. First production deploy on Vercel (currently behind 401 deployment protection). GitHub repo + auto-deploy wired. Handoff doc written for laptop continuation.
- **2026-04-06** — OEE math + 11 tests + Drizzle schema + initial scaffold.
