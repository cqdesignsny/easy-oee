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
- ⚪ **Provision Neon Postgres via Vercel Marketplace** (NEXT STEP)
- ⚪ `vercel env pull .env.local`
- ⚪ Generate first migration with `pnpm db:generate`
- ⚪ Push schema with `pnpm db:push`
- ⚪ Write idempotent seed script `src/lib/db/seed.ts` (Maple Manufacturing + 2 lines + 1 manager + 1 operator + 3 historical shifts)
- ⚪ `withTenant(companyId)` helper in `src/lib/db/scoped.ts`

### OEE math
- 🟢 `src/lib/oee.ts` — `computeOEE()`, `formatPercent()`, `oeeBucket()`
- 🟢 `src/lib/oee.test.ts` — 11/11 tests passing (happy path, zero planned/parts/rate, over-stop, perf cap, formatting, bucketing)

### Operator flow (THE NEXT BIG THING)
- ⚪ `/operator` — shift setup form
  - Server action: `startShift()` → insert Shift, redirect to `/shift/[id]`
- ⚪ `/shift/[id]` — live shift tracking
  - 10 stop reason buttons (use `STOP_REASONS` from `src/lib/stop-reasons.ts`)
  - Good/bad parts +1/+10 counters
  - End Shift button
  - `useOptimistic` for tap responsiveness
  - Server actions: `logStop`, `closeStop`, `updateParts`, `endShift`
  - `endShift()` MUST call `computeOEE()` and persist the four metrics
- ⚪ `/shift/[id]/summary` — full OEE breakdown with color-coded factors
- ⚪ Glove-friendly UI: 56px+ tap targets, big type, high contrast

### Manager dashboard
- ⚪ `/dashboard` — replace placeholder
  - "Today's OEE" big number
  - Live shifts panel (polled, `revalidate = 10`)
  - Recent shifts table (last 10) with color-coded OEE
  - Top stop reasons today (Pareto-style)
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

- **2026-04-07** — Repo relocated to portable SSD at `/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee` so it can be worked on from any machine. HANDOFF + PROJECT docs updated with new canonical path. iMac (`cqmarketing`) confirmed bare — toolchain install pending.
- **2026-04-06** — Marketing site ported to new teal/cyan palette matching live easy-oee.com. First production deploy on Vercel (currently behind 401 deployment protection). GitHub repo + auto-deploy wired. Handoff doc written for laptop continuation.
- **2026-04-06** — OEE math + 11 tests + Drizzle schema + initial scaffold.
