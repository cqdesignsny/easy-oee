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
- 🟢 **Live machines grid at top of `/dashboard`** — per-line cards, running/stopped/idle pill, big OEE, operator, parts, elapsed timer, top stop today, auto-refreshes every 10s
- 🟢 **Trial countdown banner** when a tenant is in trial, expired variant when past due
- 🟢 `/dashboard/lines` — manage lines (incl. board token rotation, target OEE)
- 🟢 `/dashboard/operators` — create operators + set PINs
- 🟢 `/dashboard/shifts` — full history with filters + 14-day calendar grid + edit-shift workflow + Job # column
- 🟢 Sidebar nav for manager routes (collapses to top bar on mobile, lang + sign-out share a row)
- 🟢 **Scan code → clipboard** utility in dashboard header

### Auth
- 🟢 **Per-company HMAC manager auth (pre-Clerk)** — email + bcrypt `password_hash`, signed `eo_admin` cookie 14-day TTL with `userId` + `companyId`, legacy `ADMIN_PASSWORD` env var still resolves to seed tenant for backwards compat
- 🟢 **Self-serve signup at `/sign-up`** — creates `company` + manager `user` with 7-day `trial_ends_at`, sets cookie, lands on `/dashboard`
- 🟢 **`/demo` no-login entrypoint** — sets admin + operator cookies on the seeded tenant + `eo_demo` marker cookie. Sticky DEMO MODE banner across all `(app)` routes with `Sign Up Free` CTA + per-route tip cards.
- 🟢 Operator PIN flow (`/pin`, `eo_op` cookie, 12h TTL, `OPERATOR_SESSION_SECRET`)
- ⚪ Migrate to Clerk for managers when growth demands it (schema already has `user.clerk_user_id`; migration is additive)

### Polish
- 🟢 App shell layout with sidebar nav for managers
- 🟢 Operator-mode layout (full-screen, no chrome)
- 🟢 Favicon (uses easy-oee-logo.svg)
- 🟢 Mobile hamburger nav + body scroll lock + close-on-route
- 🟢 Animated hero gauge graphic (responsive 280-820px)
- 🟢 Round buttons across the entire app (pill style, 999px radius)
- 🟢 Brand logo wired across nav, footer, sidebar, all auth screens
- 🟢 Favicon + Apple touch icon + Open Graph + Twitter image (real PNGs via sharp, logo on teal background, regenerable via `node scripts/generate-brand-images.mjs`)
- 🟢 Auto-migrations: every Vercel build runs `scripts/migrate.mjs` as `prebuild` so schema is in sync before code that depends on it ships
- ⚪ `loading.tsx`, `error.tsx`, on-brand 404
- ⚪ Sentry error tracking

### Internationalization (NEW — shipped 2026-04-07)
- 🟢 EN/ES/FR dictionaries (~200 keys per locale)
- 🟢 React Context provider via `useSyncExternalStore` (SSR-safe)
- 🟢 Cookie-first persistence with browser-language fallback on first visit
- 🟢 Server-side `getServerT()` helper for server components
- 🟢 Switching language calls `router.refresh()` to re-render server components
- 🟢 Language switcher in nav (always visible, mobile + desktop) + dashboard sidebar + sign-in
- 🟢 Wired surfaces: nav, footer, homepage (hero + all sections), how-it-works, roi-calculator, pricing, contact, privacy, terms, sign-in, pin, operator, live shift, summary, dashboard, manager nav

## Phase 2 — Sell

- 🟡 Stripe billing scaffold (Starter $39 / Professional $99 USD/mo with line overage / Enterprise custom)
  - 🟢 `src/lib/pricing.ts` config with USD prices and CAD reference
  - 🟢 `/sign-up` page with plan + line count + email capture
  - 🟢 `/api/checkout/session` and `/api/webhooks/stripe` route stubs (return 501)
  - 🟢 Schema fields: company.stripe_subscription_id / stripe_price_id / licensed_lines / subscription_status
  - ⚪ Wire actual Stripe SDK once Stripe account + price IDs are created
  - ⚪ Trial countdown banner + plan limits enforcement
- ⚪ Manager invitation flow (invite teammate by email)
- 🟡 Email notifications via Resend
  - 🟢 Server action scaffold (`src/server/actions/shift-export.ts`) — validates email + auth, ready for `resend.emails.send()` swap
  - 🟢 Inline "Email it" form on shift summary
  - ⚪ Wire actual Resend SDK (need RESEND_API_KEY + EASY_OEE_FROM_EMAIL env vars)
  - ⚪ React Email template at `src/emails/ShiftSummary.tsx`
  - ⚪ Automatic on-shift-end delivery (manager opt-in via settings page)
  - ⚪ Daily/weekly digest cron
- 🟢 CSV export of shift data (`/api/shifts/[id]/csv` route handler, downloads a full per-shift CSV)
- 🟢 Print or save as PDF (browser print + dedicated print stylesheet)
- 🟢 PWA manifest (`src/app/manifest.ts`) — operators can Add to Home Screen on a tablet, launches /pin standalone with no chrome
- ⚪ PostHog product analytics

## Phase 3 — Insights

- 🟢 Downtime Pareto chart (already on `/dashboard`, last 7 days)
- 🟢 Shift-vs-shift comparison (morning/afternoon/night cards on `/dashboard`, 7-day avg)
- 🟢 Loss-tree stacked bar on shift summary (good / quality / speed / downtime)
- 🟢 Calendar grid view (last 14 days × 3 shift types) on `/dashboard/shifts`
- 🟢 Live OEE estimate ticking on `/shift/[id]` during the shift
- 🟢 Edit-shift workflow with audit reason field (`/dashboard/shifts/[id]/edit`)
- 🟢 Daily digest cron (`/api/cron/daily-digest`) — assembles per-line OEE, top stops, 7-day delta. Optional Anthropic-powered summary if `ANTHROPIC_API_KEY` is set. Logs today; flip to `resend.emails.send()` once Resend is wired.
- 🟢 Weekly anomaly scan cron (`/api/cron/anomaly-scan`) — flags lines whose 7-day avg dropped > 5pp vs 4-week baseline.
- 🟢 Public TV Board view (`/board/[token]`) — read-only fullscreen for shop floor displays, no login, manager rotates token from `/dashboard/lines`.
- 🟢 **Analytics module at `/dashboard/analytics`** — overview (OEE/A/P/Q over 30 days, 14-day SVG sparkline, drill-in cards) + three deep-dives: by shift, by machine (vs-target bars), by operator (leaderboard cards + table). Multi-tenant, scoped via `getAdminSession` with seed fallback.
- 🟢 **14-day OEE trend sparkline** (analytics overview)
- 🟢 **Operator leaderboard** (`/dashboard/analytics/operators`) — ranked by avg OEE with full A/P/Q breakdown
- ⚪ Weekly + monthly OEE trend lines (longer windows than the 14-day sparkline)
- ⚪ Per-line drill-down page (`/dashboard/analytics/machines/[id]` — currently the machines page is a flat list)
- ⚪ Custom stop reason categories per company

### Barcode / QR scanner (NEW — shipped 2026-04-28)
- 🟢 Reusable `<ScanModal>` using native `BarcodeDetector` API + `@zxing/browser` fallback
- 🟢 `<ScanButton targetInputId>` drop-in, fills any input on detection
- 🟢 **Job number** schema column (`shift.job_number`) + scan-or-type input on operator shift setup + manager edit-shift
- 🟢 Job number displayed on live shift, summary, dashboard recent shifts, full shifts admin, per-shift CSV export
- 🟢 Dashboard header **Scan code → clipboard** utility for ad-hoc reads with green "Copied!" toast

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
- 🟢 French (Quebec) localization (shipped early as part of EN/ES/FR i18n)

---

## Open questions (also in `PROJECT.md`)

- [ ] Final pricing model with Louis ($49/$129 vs $99/line)
- [ ] Domain split (`app.easy-oee.com` vs `/app` prefix)
- [ ] Stripe vs Lemon Squeezy (LS handles Canadian sales tax)
- [ ] Hardware target (Pi vs ESP32 vs industrial gateway)
- [ ] French localization timing

## Recent activity

- **2026-04-29** — Analytics module + light/dark theme + style sweep (commit `5e1f298`, all green):
  - **Analytics module at `/dashboard/analytics`** — overview page (OEE / A / P / Q for last 30 days, production volumes, 14-day SVG sparkline with 85% target line, drill-in cards) plus three deep-dives: shifts (per-type cards + table + Pareto), machines (summary table, OEE-vs-target bars, Pareto per line), operators (leaderboard cards with rank + table + Pareto per operator).
  - **Backed by** `src/lib/db/queries/analytics.ts` — Drizzle queries (`avg`, `count`, `sum`, `groupBy`) all multi-tenant scoped. Sub-nav at the top of every analytics route. Manager sidebar gets an Analytics tab. Demo banner has per-route tip cards for all 4 analytics pages.
  - **Adapted from a draft Louis sent over** — kept the structure + queries, replaced hardcoded Spanish with i18n keys × EN/ES/FR (~95 keys), stripped decoration emojis (sun/moon, ✅/❌), swapped fallback CSS vars for the real theme tokens, fixed `oee-poor` → `oee-low` bucket class, reused existing `stop.NN.label` keys instead of duplicating per page.
  - **Light / dark theme toggle** — tokens for `:root[data-theme="dark"]` and `:root[data-theme="light"]` in globals.css with smooth transitions. `eo-theme` cookie read SSR-side via `getServerTheme()` so first paint matches preference. `<ThemeToggle>` client component (sun/moon SVG, no emojis) wired into manager sidebar, operator setup, sign-in, pin, demo landing, marketing nav (desktop + mobile cluster). Persists to cookie + localStorage. i18n: `theme.light` / `theme.dark` / `theme.toLight` / `theme.toDark`.
  - **AI-slop / em-dash sweep** — em-dash pause-breaks replaced with periods in user-facing strings (`shift.longStop.title`, `demo.banner.tip`, `demo.manager.body` × 3 langs). JSDoc headers cleaned across 9 files. `"—"` placeholder for null data in tables stays (correct typography). No decoration emojis in user strings; `✓` in `seed.ts` console output kept (CLI dev tool).
  - **Verified clean:** `pnpm test` 13/13, typecheck, lint, build all green. All 4 analytics routes built.
- **2026-04-28** — Sales-ready batch (6 commits, all green):
  - **`/demo` route + DEMO MODE banner** with per-route tip cards. Two entry buttons (Manager / Operator) drop prospects into the seeded Maple Manufacturing tenant with no login. Marketing nav adds "See it Live" link, sign-in page adds Demo CTA.
  - **Self-serve `/sign-up` is real:** creates a `company` + manager `user` (bcrypt password) with a 7-day `trial_ends_at`, sets the admin cookie, lands on `/dashboard` with a trial countdown banner. Schema migration `0001_user_password_hash.sql`. Marketing CTA switched to "Start Free Trial" → `/sign-up`.
  - **Live machines grid** at the top of `/dashboard` — per-line cards backed by `getCompanyLiveLines()` (multi-line version of the TV board snapshot). Auto-refresh every 10s via `router.refresh()`.
  - **Barcode/QR scanner** wired for **job numbers**: schema column `shift.job_number`, scan-or-type input on `/operator` shift setup AND `/dashboard/shifts/[id]/edit`, displayed on live shift, summary, dashboard recent table, full shifts admin, per-shift CSV export. Also a "Scan code → clipboard" header utility on `/dashboard`.
  - **Mobile responsiveness audit + fixes:** hamburger menu was effectively broken (backdrop-filter on `<nav>` trapped the menu's `position:fixed`); moved menu to be a sibling. Dashboard header now stacks under 600px (was overlapping). Manager sidebar bottom-row (lang + sign-out) shares a row on mobile. Pricing/home trial copy updated 14→7 day in EN/ES/FR.
  - **Migration runner bug fix:** `splitStatements` was dropping any chunk starting with `--`, causing 0001 + 0002 to be silently skipped while still recording as applied — every Drizzle `select().from(s.user)` and `select().from(s.shift)` then 500'd because the columns didn't exist. Fixed the regex; production columns recovered via direct `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
  - **Auth cookies** now carry `userId` + `companyId` in `eo_admin` payload. `signInAdmin` does email + bcrypt lookup first, falls back to legacy `ADMIN_PASSWORD` env var (which now resolves to the seed manager) for backwards compat.
  - **Auto-sync expansion:** `scripts/auto-sync.sh` now mirrors top-level docs + `docs/` to `~/Library/CloudStorage/Dropbox/Easy OEE/easy-oee/` after every successful pull/push (Dropbox = backup of a backup, source code stays out).
  - **i18n:** ~80 new keys × EN/ES/FR for demo, signup, trial, scanner, job number, dashboard live grid, mobile nav.
  - **Verified clean:** `pnpm test` 13/13, `pnpm typecheck`, `pnpm lint`, `pnpm build` all green.
- **2026-04-07 (late night)** — Auto-migration runner shipped. `scripts/migrate.mjs` walks `drizzle/*.sql` in order, applies anything not yet in the `_eo_migrations` tracking table, splits on `--> statement-breakpoint`. Wired into `package.json` as `"prebuild": "node scripts/migrate.mjs"` so every Vercel build runs migrations before `next build`. Workflow now: edit schema → `pnpm db:generate` → commit → push → Vercel applies and deploys atomically. Fixed the dashboard 500 that happened earlier in the day when Tier 1-4 schema changes never reached Neon. Baseline migration `drizzle/0000_baseline_tier_columns.sql` uses `IF NOT EXISTS` so it's safe against the already-patched dev branch.
- **2026-04-07 (evening)** — Branded favicon + OG image actually fixed. The first attempt used `next/og` `ImageResponse` which routes through Satori, and Satori can't parse the logo SVG's `<style>` blocks, so iMessage previews came back blank. Replaced with real PNGs generated by sharp (`scripts/generate-brand-images.mjs`) — 512×512 favicon, 180×180 Apple touch icon, 1200×630 OG + Twitter, all the logo composited centered on the `#003038` teal background. Static files at `src/app/{icon,apple-icon,opengraph-image,twitter-image}.png` so Next.js metadata convention picks them up.
- **2026-04-07 (evening)** — Sudo-free toolchain installed on the iMac (Node 22.20 + pnpm 10 + Vercel CLI in `~/.local`, no Homebrew, no admin rights). Auto-sync infrastructure shipped: post-commit hook + launchd agent (3-min interval) + `scripts/install-sync.sh` one-shot installer. SSD working copy now stays continuously in sync with `origin/main` across machines.
- **2026-04-07 (evening)** — Massive operator + manager UX upgrade batch (Tiers 1-4):
  - **Live shift screen v2:** big elapsed/projected/stop-time timers, live OEE estimate ticking once per second with target delta + color buckets, pulsing red downtime card with the current-stop clock, long-stop note prompt that fires after 10+ minute stops, and a new Hand-Off button that lets the next operator slide in with their PIN mid-shift (records `shift.endingOperatorId`, rotates the cookie).
  - **Schema:** `line.targetOee` (per-line goal, default 0.85), `line.boardToken` (public TV view token), `shift.endingOperatorId` (handoff), `company.timezone` (plant TZ for "today" math).
  - **OEE math:** new `computeLossTree()` partitions planned minutes into Good/Quality/Speed/Downtime. 13/13 tests pass.
  - **Manager dashboard:** shift-type comparison cards (morning/afternoon/night, 7-day avg, color-coded). Pareto stayed.
  - **Lines admin:** target OEE column on create + edit forms. Per-line "TV Board" panel with Generate / Rotate Token + Open ↗.
  - **Shift summary:** new "Where the Time Went" stacked-bar loss-tree card above the production detail table.
  - **Shifts admin:** "Last 14 Days · Calendar" grid above the table (3 shift types × 14 days, color-coded). "Edit" button on every row → `/dashboard/shifts/[id]/edit` with audit-reason field. Edit recomputes OEE if shift is complete.
  - **TV Board mode:** public route `/board/[token]` — fullscreen 55"-display layout with massive OEE numeral, RUNNING/STOPPED pill, operator + product subtitle, side panel with parts/elapsed/top-stops, idle state when no shift. Server revalidates every 10s, client keeps timers smooth and triggers `router.refresh()` between pulls.
  - **Daily digest:** `/api/cron/daily-digest` (vercel.json registers it for 11:00 UTC) — per-company yesterday rollup, best/worst line, top 3 stops, 7-day delta per line. Optional Claude Haiku 4.5 narrative summary if `ANTHROPIC_API_KEY` is set. `renderDigestText()` plaintext fallback in `src/lib/digest-render.ts` (split out so it can be imported outside `"use server"` files).
  - **Weekly anomaly scan:** `/api/cron/anomaly-scan` (Mondays 12:00 UTC) — flags lines whose 7-day avg OEE dropped > 5pp vs the prior 4-week baseline.
  - **PWA:** `src/app/manifest.ts` — operators can Add to Home Screen on a tablet, launches `/pin` standalone with the teal background and branded icons.
  - **i18n:** ~40 new keys × 3 languages (EN/ES/FR) covering all the new live shift, dashboard, and summary strings.
  - **CSS:** new sections for `.timer-row`, `.progress-track`, `.liveoee-*`, `.downtime-card` (reduced-motion-aware pulse), `.app-input`, `.loss-tree`, `.board-*`, `.shift-compare`, `.calendar-grid`, `.cal-cell`.
  - **Cron auth:** `vercel.json` crons + `CRON_SECRET` Bearer fallback for manual triggers.
  - **Schema migration:** `line.target_oee`, `line.board_token`, `shift.ending_operator_id`, `company.timezone` need to be pushed (`pnpm db:push`) on next deploy.
  - **Verified clean:** `pnpm test` 13/13, `pnpm typecheck`, `pnpm lint`, `pnpm build` all green.
- **2026-04-07** — Shift export shipped: CSV download via `/api/shifts/[id]/csv` route handler (auth-scoped, full shift export with OEE metrics + production detail + every downtime event), Print/PDF via `window.print()` with a print stylesheet that hides chrome and switches to white/black, Email-it scaffold via server action `emailShiftSummary` that validates and would call Resend once wired (currently returns a friendly placeholder). Language switcher added to live shift + summary screens (was missing). Operator/live-shift/summary pages now constrained to 880px max-width with auto margins so they don't hug the left edge on big monitors. EN/ES/FR translations for all new export strings.
- **2026-04-07** — i18n + branding + Stripe prep mega-batch. EN/ES/FR translations across nav, footer, homepage (all sections), how-it-works, roi-calculator, pricing, contact, privacy, terms, sign-in, pin, operator, live shift, summary, dashboard. Server-side getServerT() helper. Cookie-first locale persistence. Language switcher always visible (out of hamburger). Animated hero gauge sized 600-820px desktop. Round buttons globally (pill 999px). Brand SVG logo wired across nav, footer, sidebar, all auth screens + favicon. Mobile hamburger menu with body-scroll lock. /pricing rebuilt with USD primary + CAD reference + line count slider. /sign-up Stripe scaffold page. /api/checkout/session + /api/webhooks/stripe route stubs (501). Schema additions: stripe_subscription_id, stripe_price_id, licensed_lines, subscription_status (pushed to Neon). Removed all "no hardware" copy (hardware will be a future paid upsell).
- **2026-04-07** — Admin login system shipped (manager /sign-in with email/password, Google/Microsoft SSO buttons placeholder, ADMIN_PASSWORD env var, HMAC cookie 14-day TTL). Site nav got bigger/bolder text (16px white, 56px logo, pill CTAs). Copy cleanup: removed all em/en dashes from user-facing text, replaced ★ stars and ✓ checks with inline SVGs, removed maple leaf emoji from footer.
- **2026-04-07** — Phase 1 core flow shipped. Neon provisioned via Vercel Marketplace, schema pushed, seed loaded. Operator PIN auth + `/operator` shift setup + `/shift/[id]` live tracking (useOptimistic, 10 stop buttons, parts counters) + `/shift/[id]/summary` (color-coded OEE breakdown) + manager `/dashboard` (Today's OEE, live shifts, recent 10, 7-day Pareto stops) all built and deployed. 11/11 tests pass, lint clean, build clean. Demo creds: operator "Pierre Lavoie" / PIN 1234.
- **2026-04-07** — Repo relocated to portable SSD at `/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee` so it can be worked on from any machine. iMac (`cqmarketing`) toolchain installed (Homebrew, node, pnpm, gh, vercel-cli, postgres@16). SSO Deployment Protection disabled — easy-oee.vercel.app now public.
- **2026-04-06** — Marketing site ported to new teal/cyan palette matching live easy-oee.com. First production deploy on Vercel (currently behind 401 deployment protection). GitHub repo + auto-deploy wired. Handoff doc written for laptop continuation.
- **2026-04-06** — OEE math + 11 tests + Drizzle schema + initial scaffold.
