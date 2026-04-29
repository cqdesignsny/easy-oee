# HANDOFF — Pick this up on a different machine

> **You are switching machines mid-build.** Read this top-to-bottom before doing anything else. Everything you need to continue is in this repo. Last updated: 2026-04-29 (analytics module + light/dark theme toggle + style sweep).

## State of the world right now

- ✅ App is **deployed and working** at https://easy-oee.vercel.app
- ✅ **Analytics module live** at `/dashboard/analytics` — overview (OEE / A / P / Q for last 30 days, 14-day sparkline, drill-in cards), plus three deep-dives: by shift type, by machine (with vs-target bars), by operator (leaderboard cards + table). Multi-tenant, scoped via `getAdminSession` with seed fallback. Adapted from Louis's spec into i18n + real theme tokens.
- ✅ **Light / dark theme toggle** on every surface — manager sidebar, operator setup, sign-in, pin, demo landing, marketing nav (desktop + mobile). `eo-theme` cookie read SSR-side so first paint matches preference. Both themes share the brand teal accent; light theme flips background + text.
- ✅ **Sales demo path live** at `/demo` — prospects pick "Enter as Manager" or "Enter as Operator" with no login. Sticky `DEMO MODE` banner across every app screen with `Sign Up Free` CTA + per-route tip cards (now including all four analytics routes).
- ✅ **Self-serve signup live** at `/sign-up` — real flow creates company + manager user (bcrypt password) with a 7-day trial, lands on `/dashboard` with countdown banner. No credit card. Stripe billing wires in later.
- ✅ **Live machines grid** at top of `/dashboard` — per-line cards with running/stopped pill, big OEE, current operator, parts, elapsed timer, top stop today. Auto-refreshes every 10s.
- ✅ **Barcode/QR scanner** wired for **job numbers** — scan or type a work-order/job number on operator shift setup AND on manager edit-shift; visible on live shift, summary, dashboards, CSV export. Native `BarcodeDetector` API with `@zxing/browser` fallback. Plus a header "Scan code → clipboard" utility on the manager dashboard.
- ✅ **Mobile audit complete** — fixed broken hamburger menu (backdrop-filter containing-block trap), dashboard header overlap on phones, manager sidebar bottom-row layout. Verified at 375×812 across all marketing + app routes.
- ✅ **Style sweep done** — em-dash pause-breaks gone from user-facing strings (EN/ES/FR), JSDoc headers cleaned. No decoration emojis in user strings. `"—"` still used as null-data placeholder in tables (that's correct typography).
- ✅ All Tier 1-4 product upgrades from the Apr 7 batch still live: live shift timers, downtime card, long-stop notes, hand-off, shift comparison, loss tree, calendar grid, edit-shift, TV Board, daily digest cron, weekly anomaly cron, PWA manifest.
- ✅ Schema is **in sync with Neon** (auto-applied via `prebuild` migration runner; runner bug that silently skipped comment-headed migrations was fixed in `scripts/migrate.mjs`).
- ✅ `pnpm test` 13/13 · `pnpm typecheck` clean · `pnpm lint` clean · `pnpm build` clean
- 🟡 Stripe still on stub (501) — wires into the existing `/sign-up` schema fields whenever you're ready.
- 🟡 Resend still on stub — `src/server/actions/shift-export.ts` already validates input, just needs `resend.emails.send()` swapped in.
- 🟡 Clerk migration is open — current per-company HMAC password works, can move to Clerk later without breaking accounts.
- 🟡 Loading/error/404 states + Sentry still pending.

**To test the live app:**

1. **Quickest demo (no login):** visit https://easy-oee.vercel.app/demo → pick **Enter as Manager** for the dashboard or **Enter as Operator** for the tablet flow. The DEMO MODE banner has a Sign Up Free CTA at the top.
2. **Real signup (creates a tenant):** https://easy-oee.vercel.app/sign-up → fill form → land on `/dashboard` with a 7-day trial banner.
3. **Legacy demo password (still works for backwards compat):** https://easy-oee.vercel.app/sign-in with any email + `EasyOEE2026Admin` lands you in the seeded Maple Manufacturing tenant.
4. **Operator tablet flow:** https://easy-oee.vercel.app/pin → pick **Pierre Lavoie**, PIN `1234`.

---

## ⚡ Canonical working path (portable SSD)

The project now lives on the **CQ-PRO-4TB external SSD** so it's portable across machines:

```
/Volumes/CQ-PRO-4TB/Easy OEE/
├── easy-oee/                    ← THE REPO (work here)
├── easy-oee-master.md           ← original Bubble-era spec (reference only)
├── easy-oee-project-brief.md    ← original brief (reference only)
└── Project Blueprint.docx
```

**On any new machine:** plug in the SSD, `cd "/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee"`, and you're working in the same checkout. No re-cloning needed. `git pull` to sync with GitHub before starting.

> ⚠️ **Do NOT clone this repo into Dropbox.** node_modules + .next will thrash Dropbox sync and melt your CPU. The SSD is the canonical location now. If you ever need a non-SSD workspace, use `~/Code/easy-oee` instead.

---

## TL;DR — what to do on a new machine

**Auto-sync is live.** Every commit auto-pushes; every 3 minutes the SSD pulls
from origin. You don't need `git pull`/`git push` manually — just work.

```bash
# 1. Plug in CQ-PRO-4TB SSD, cd into the repo
cd "/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee"

# 2. Install the auto-sync hook + launchd agent (one-shot)
./scripts/install-sync.sh

# 3. Install the Node toolchain — sudo-free, into ~/.local
#    (No Homebrew, no admin rights, no touching system paths.)
mkdir -p ~/.local && cd ~/.local
curl -fsSL https://nodejs.org/dist/v22.20.0/node-v22.20.0-darwin-arm64.tar.xz -o n.tar.xz
tar -xf n.tar.xz && rm n.tar.xz && mv node-v22.20.0-darwin-arm64 node
cat >> ~/.zshrc <<'EOF'

# Easy OEE toolchain (user-local, no sudo)
export PATH="$HOME/.local/node/bin:$PATH"
export npm_config_cache="$HOME/.local/npm-cache"
EOF
source ~/.zshrc
mkdir -p ~/.local/npm-cache

# 4. Install pnpm + vercel globally via the bundled npm
#    (Use the direct npm-cli.js path to bypass the corepack shim.)
node ~/.local/node/lib/node_modules/npm/bin/npm-cli.js install -g pnpm@10 vercel

# 5. Back to the repo, install project deps, run verification
cd "/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee"
pnpm install
pnpm test       # → 11/11 OEE math tests
pnpm typecheck  # → clean
pnpm lint       # → clean
pnpm build      # → full production build clean

# 6. (Optional) pull env vars from Vercel for local dev against Neon
vercel link --yes --project easy-oee
vercel env pull .env.local

# 7. Run it
pnpm dev        # → http://localhost:3000
```

Then open `docs/ROADMAP.md` and continue from the first 🟡/⚪ task. Or jump straight to the **"Resume here"** section at the bottom of this file.

### Why the toolchain dance?

Homebrew wants sudo. This project ships on a **bare user account without admin
rights**, so we install Node directly from the nodejs.org tarball into `~/.local`.
Three gotchas that will waste your time if you don't know about them:

1. **Node version matters:** you need **22.20+** (or any ≥ 22.12). Node 22.11
   doesn't allow `require(esm)`, which makes `pnpm test` crash inside vitest's
   `std-env` import. 22.20 is the known-good version.
2. **`~/.npm` is probably broken** (owned by uid 501:20 from a previous admin
   install). Don't `sudo chown` it — just set `npm_config_cache=~/.local/npm-cache`
   in your shell profile, which we do above.
3. **Corepack shim breaks the pnpm install.** Node's bundled `npm` is a corepack
   shim that tries to fetch a newer pnpm version and fails on signature
   verification. Bypass it by calling `node ~/.local/node/lib/node_modules/npm/bin/npm-cli.js`
   directly (as shown in step 4).

Once the toolchain is up, everything in `package.json` Just Works.

---

## Project at a glance

| | |
|---|---|
| **Product** | Easy OEE — real-time OEE tracking SaaS for Canadian SME manufacturers |
| **Domain (live marketing)** | https://easy-oee.com (still serving Louis's static HTML) |
| **GitHub** | https://github.com/cqdesignsny/easy-oee (private) |
| **Vercel project** | `cq-marketings-projects/easy-oee` |
| **Vercel prod URL** | https://easy-oee.vercel.app |
| **GitHub account** | cqdesignsny |
| **Vercel account** | cqdesignsny |
| **Founder** | Louis (CQ's cousin) |
| **Engineering lead** | CQ |

## Stack snapshot

- **Next.js 16.2.2** App Router + **TypeScript strict** + **Turbopack**
- **Tailwind v4**
- **Drizzle ORM** + **Neon Postgres** (not yet provisioned — see "Open work" below)
- **Clerk** (managers) + custom **PIN login** (operators) — not yet wired
- **pnpm** package manager (never npm/yarn)
- **Vercel** hosting, GitHub auto-deploys on push to `main`

Read `AGENTS.md` (= `CLAUDE.md`) for coding conventions before changing code. Read `PROJECT.md` for the full product context.

---

## Cross-machine sync

The SSD working copy is kept continuously in sync with `origin/main`:

- **Post-commit hook** (`.git/hooks/post-commit`) — every `git commit` triggers
  `scripts/auto-sync.sh` in the background, which pushes immediately.
- **launchd agent** (`~/Library/LaunchAgents/com.cqdesigns.easyoee.autosync.plist`)
  — runs `scripts/auto-sync.sh` every 3 minutes and once at login.
- **`scripts/auto-sync.sh`** (in repo, travels with the SSD):
  PID-locked single-instance, auto-commits stray local changes as
  `auto-sync: working changes from <hostname>`, runs
  `git pull --rebase --autostash`, pushes if ahead, logs to `.git/auto-sync.log`,
  pops a macOS notification on failure.
- **`scripts/install-sync.sh`** — one-command setup for a new Mac. Installs the
  hook, copies + loads the launchd plist, sets `git config --global
  credential.helper osxkeychain`, runs an initial sync.

Just plug the SSD into either Mac, run `./scripts/install-sync.sh` once, and
forget about `git pull`/`git push` forever. Both machines stay in sync within 3
minutes of any change.

If something goes sideways: `tail -f "/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee/.git/auto-sync.log"`.

## What's done ✅

### Foundation
- Next.js 16 scaffold with TypeScript strict, Tailwind v4, Turbopack
- Bebas Neue / DM Sans / DM Mono via `next/font/google`
- pnpm + Vitest + Drizzle Kit set up
- Vercel project linked, GitHub repo connected, prod deploys on every push to `main`
- Build is clean: `pnpm typecheck && pnpm test && pnpm build` all pass

### OEE math (`src/lib/oee.ts`)
- `computeOEE()` — pure function, all edge cases handled
- `formatPercent()`, `oeeBucket()` helpers
- **11/11 unit tests passing** — covers happy path, zero-planned, zero-parts, zero-rate, over-stop, perf cap
- Documented in `docs/OEE_MATH.md`

### Database schema (`src/lib/db/schema.ts`)
Drizzle schema with these tables — all multi-tenant via `company_id`, all structurally bug-proof against the four Bubble bugs:
- `company` (tenants)
- `user` (managers via Clerk + operators via PIN, both in one table with `role`)
- `line` (production lines)
- `shift` (one production run, with the snapshotted `idealRate` + computed OEE columns)
- `stop` (downtime events, FK to shift, `minutes` computed server-side on close)
- `device` (Phase 4 hardware ingest stub)
- `demo_lead` (marketing /contact form leads)

`src/lib/db/client.ts` is a **lazy** Drizzle/Neon client — won't crash at build time if `DATABASE_URL` is missing.

### Marketing site (`src/app/(marketing)/`)
Ported **1:1 from the live easy-oee.com** with the latest teal/cyan design:

- Palette: `--black: #003038` / `--white: #EFF5F9` / `--accent: #03BFB5` / `--red: #018076` / `--mid: #004146`
- `/` — full landing page (hero with "YOU DON'T KNOW YOUR REAL OEE", stats bar, problem + dashboard mock, solution with pills + pullquote, how-it-works, features, social proof, pricing teaser with ROI box, CTA band)
- `/pricing` — Starter / Professional / Enterprise CAD tiers (basic version, may need restyling to match new teal palette)
- `/contact` — demo request form, server action → `demo_lead` table, Zod validated. **Will throw at runtime until Neon is provisioned** (since the insert needs a real DB).

Components:
- `src/components/marketing/SiteNav.tsx` — How It Works / Features / Pricing / ROI Calculator / Book a Demo
- `src/components/marketing/SiteFooter.tsx` — Made in Canada 🍁
- `src/components/marketing/FadeIn.tsx` — single IntersectionObserver that mirrors the live site's `.fi/.on` scroll-in animation

Styles live in `src/app/globals.css` — the entire CSS from the live site, ported with `var(--font-bebas)` etc. instead of Google Font links.

### Project documentation (`docs/`)
- `README.md` — public overview
- `PROJECT.md` — full product/business context
- `AGENTS.md` (= `CLAUDE.md`) — coding conventions for AI agents
- `docs/ARCHITECTURE.md` — system design + decisions
- `docs/SCHEMA.md` — database tables and indexes (might be slightly out of sync — schema source of truth is `src/lib/db/schema.ts`)
- `docs/OEE_MATH.md` — math reference + test canon
- `docs/ROADMAP.md` — phased plan, **the live build plan, update this as you ship**
- `docs/HARDWARE-INTEGRATION.md` — Phase 4 PLC ingest design
- `docs/HANDOFF.md` — this file

---

## Open work — pick up here 👇

### Immediate next steps (in this exact order)

#### 1. Provision Neon Postgres + run first migration
```bash
# Easiest: via Vercel Marketplace, which auto-injects DATABASE_URL
# Option A — through the Vercel dashboard:
#   vercel.com → easy-oee project → Storage → Create Database → Neon → "Easy OEE Dev"
#   (creates a free dev branch, auto-adds DATABASE_URL to all envs)
#
# Option B — CLI (faster):
vercel link --yes --project easy-oee   # if not already linked
# Then go to dashboard for the marketplace flow ^^

# After provisioning, pull env vars locally:
vercel env pull .env.local

# Generate the first migration from schema:
pnpm db:generate
# (creates files in drizzle/)

# Push schema to Neon (dev iteration — no migration history needed yet):
pnpm db:push

# Or properly run migrations:
pnpm db:migrate

# Sanity check with Drizzle Studio:
pnpm db:studio
```

After this, the **/contact form will actually save leads** — test it locally then redeploy.

#### 2. Seed demo data
Create `src/lib/db/seed.ts` that idempotently inserts:
- 1 Company: "Maple Manufacturing"
- 2 Lines: "Machine 1" (idealRate 120), "Machine 2" (idealRate 60)
- 1 Manager user
- 1 Operator user with PIN 1234
- A few historical Shifts with computed OEE so the dashboard isn't empty

Add `"db:seed": "tsx src/lib/db/seed.ts"` to package.json scripts.

#### 3. Build the operator shift flow

Routes (under `src/app/(app)/`):
- `/operator` — start shift form: pick line, shift type (Morning/Afternoon/Night), product, planned minutes (default 480), ideal rate (defaults from line). Server action: `startShift()` → insert Shift, redirect to `/shift/[id]`.
- `/shift/[id]` — live tracking. Big machine status indicator. 10 stop reason buttons in a 2-column grid (use `STOP_REASONS` from `src/lib/stop-reasons.ts`). Good/bad parts +1/+10 buttons. End Shift button. Use `useOptimistic` for tap responsiveness.
  - Server actions: `logStop(shiftId, reason)`, `closeStop(stopId)`, `updateParts(shiftId, type, delta)`, `endShift(shiftId)`.
  - `endShift()` MUST call `computeOEE()` from `src/lib/oee.ts` and write the four metrics + `status='complete'` to the row in one transaction.
- `/shift/[id]/summary` — read-only OEE breakdown with color-coded factors via `oeeBucket()`.

Convention reminder (from `AGENTS.md`):
- Operator screens are **glove-friendly** — minimum 56px tap targets, big type, high contrast
- Default to Server Components, only `"use client"` when you actually need interactivity
- Every query through `withTenant(companyId)` (helper not yet written — create it in `src/lib/db/scoped.ts` when you need it)

#### 4. Build the manager dashboard
Route: `/dashboard` (the placeholder page already exists at `src/app/(app)/dashboard/page.tsx`)
- Big "Today's OEE" number for the company
- Live shifts panel (in-progress shifts with current OEE estimate, polled via `revalidate = 10`)
- Recent shifts table (last 10) with color-coded OEE
- Top stop reasons today (Pareto-style horizontal bars)
- Sidebar nav: Dashboard / Lines / Operators / Shifts / Settings

#### 5. Wire Clerk auth
Defer until #1–4 are working with the seeded demo company. Then:
- `pnpm add @clerk/nextjs` (already installed)
- Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` to `.env.local` and Vercel
- Add `<ClerkProvider>` to root layout
- Create `src/middleware.ts` with Clerk middleware scoped to `(app)` routes only
- Create `(auth)/sign-in/[[...rest]]/page.tsx` and `(auth)/sign-up/[[...rest]]/page.tsx`
- Webhook handler at `src/app/api/webhooks/clerk/route.ts` — on `user.created`, create a Company and set `publicMetadata.companyId`

#### 6. Wire operator PIN session
- Build `/pin` page: name picker + 4-digit PIN entry
- `src/lib/auth/operator-session.ts` — sign/verify HTTP-only cookie containing `{ operatorId, companyId, exp }`
- Use `OPERATOR_SESSION_SECRET` env var (32+ random chars)

### Things to remember while you build

1. **Never calculate OEE outside `src/lib/oee.ts`** — it's tested, just call `computeOEE()`.
2. **Every DB query must scope by `company_id`** — write a `withTenant()` helper as soon as you need it.
3. **Server Actions over API routes** for mutations. API routes only for webhooks + the future `/api/ingest`.
4. **`pnpm db:push` before `pnpm db:generate`** — push for dev iteration, generate when you want to lock a migration.
5. **Update `docs/ROADMAP.md`** as you finish tasks. Update `PROJECT.md` if a product decision changes.

---

## State of credentials & secrets

| Where | What | Status |
|---|---|---|
| GitHub | `cqdesignsny` account, `easy-oee` private repo | ✅ pushed |
| Vercel | `cqdesignsny` account, `cq-marketings-projects/easy-oee` | ✅ linked, auto-deploys |
| Neon Postgres | — | ⏳ not provisioned |
| Clerk | — | ⏳ not provisioned |
| Stripe | — | ⏳ Phase 2 |
| `easy-oee.com` DNS | Currently pointing at the static HTML host (whoever Louis used) | ⏳ DON'T touch until v1 is ready |
| `.env.local` | not committed (in .gitignore) | ⏳ generate on each machine via `vercel env pull` |

The `.env.example` at the repo root lists every variable you'll eventually need.

---

## Files you should NOT need to touch (unless rewriting features)

- `src/lib/oee.ts` + `src/lib/oee.test.ts` — OEE math, locked-in
- `src/lib/db/schema.ts` — DB schema (edit + `pnpm db:generate` if you add tables)
- `src/lib/stop-reasons.ts` — the 10 standardized stop reasons
- `src/app/globals.css` — the entire ported design system from easy-oee.com (don't add Tailwind utilities to override these unless you know why)
- `src/components/marketing/*` — the marketing nav/footer/fade observer
- All `docs/*.md` — read-only context, but **update `ROADMAP.md` as you ship**

## Files you'll be touching next

- `src/app/(app)/operator/page.tsx` (create)
- `src/app/(app)/shift/[id]/page.tsx` (create)
- `src/app/(app)/shift/[id]/summary/page.tsx` (create)
- `src/app/(app)/dashboard/page.tsx` (replace placeholder with real dashboard)
- `src/server/actions/*.ts` (create — start-shift, log-stop, close-stop, end-shift, update-parts)
- `src/lib/db/scoped.ts` (create — `withTenant()` helper)
- `src/lib/db/seed.ts` (create)
- `src/middleware.ts` (create — Clerk middleware, eventually)

---

## Quick reference commands

```bash
pnpm dev              # local dev, http://localhost:3000
pnpm build            # production build
pnpm test             # vitest run (OEE math tests)
pnpm test:watch       # vitest watch
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint

pnpm db:generate      # create migration from schema diff
pnpm db:push          # push schema to DB (dev shortcut, no migration file)
pnpm db:migrate       # apply pending migrations (prod)
pnpm db:studio        # open Drizzle Studio in browser

vercel deploy         # preview deploy
vercel deploy --prod  # production deploy (also happens automatically on push to main)
vercel env pull .env.local  # download env vars from Vercel into local file
vercel logs           # tail production logs
```

---

## What got shipped today (2026-04-07 mega-batch)

After the initial Phase 1 core flow, the following was added in the same day:

**i18n (EN / ES / FR)**
- Full translation system: dictionaries (~200 keys × 3 languages), `LanguageProvider` (`useSyncExternalStore`-based, SSR-safe), server-side `getServerT()` helper that reads the `eo-locale` cookie, language switcher dropdown.
- Switching language calls `router.refresh()` so server components re-render with the new cookie.
- Wired into: nav, footer, homepage (all sections), how-it-works, roi-calculator, pricing, contact, privacy, terms, sign-in, pin, operator, live shift, summary, dashboard, manager nav.
- Switcher always visible in nav (desktop AND mobile next to hamburger), dashboard sidebar, sign-in page.

**Branding**
- `public/easy-oee-logo.svg` wired across nav (56px), footer (72px), dashboard sidebar (42px), sign-in (56px), pin (56px), operator pages (42–48px).
- Favicon points to the same SVG.
- Animated hero gauge (`src/components/marketing/HeroGauge.tsx`) — pure SVG with CSS keyframe needle revving from 0 to max, bouncing twice, then resetting. Sized 600px (default) → 660px (1280+) → 720px (1440+) → 800px (1800+) on desktop, stacks above text on mobile (380px / 280px on small phones). Respects `prefers-reduced-motion`.
- All buttons rounded to full pill (999px), card-style operator/parts/pin keys at 22px.

**Mobile**
- Hamburger menu in `SiteNav` with full-screen overlay, body scroll lock, closes on route change.
- Tables wrapped in `.card { overflow-x: auto }` so they scroll horizontally.
- Body baseline 17px, drops to 16px on mobile per ui-ux-pro-max.
- Sub-hero h1 clamps further on phones.

**Auth (temporary, until Clerk lands)**
- `/sign-in` admin login: email + password (any email, password from `ADMIN_PASSWORD` env var), Google/Microsoft SSO buttons present as disabled placeholders. HMAC cookie session, 14-day TTL.
- Demo password: `EasyOEE2026Admin` (in Vercel env vars across all 3 environments).

**Stripe scaffold**
- `src/lib/pricing.ts` — single source of truth: USD prices, USD→CAD conversion (1.37), per-plan stripePriceId slot, monthlyCostUSD function.
- `/pricing` rebuilt: line-count slider, 3 tiers, USD primary with CAD reference shown as `≈ $X CAD/mo`, "Start Free Trial" buttons link to `/sign-up?plan=pro&lines=3`.
- `/sign-up` page (client component) with plan toggle, line slider, company name, work email, "START FREE TRIAL" button. Currently shows a "you're on the list" success state instead of redirecting to Stripe.
- `/api/checkout/session` and `/api/webhooks/stripe` route stubs returning 501. Documented exactly what to wire when Stripe is added.
- Schema additions: `company.stripe_subscription_id`, `stripe_price_id`, `licensed_lines`, `subscription_status`. Already pushed to Neon.

**Copy cleanup**
- All em/en dashes removed from user-facing strings.
- "No hardware" mentions removed across all 3 locales (hardware is now a future paid upsell — see new "Works on Any Device" feature card teasing it).
- Hero eyebrow: "Built for Canadian manufacturers" → "Built for smart manufacturers" (US launch incoming).
- Footer: maple leaf emoji removed, "Made in Canada" line removed, body text bumped to 17px white, links 16px.
- Generic emojis ★ ✓ 🍁 replaced with inline SVGs.

## Database migrations are now automatic

Anytime you change `src/lib/db/schema.ts`:

```bash
pnpm db:generate              # writes drizzle/000N_*.sql
git add drizzle/ && git commit -m "..."
git push                      # auto-sync handles this
```

On the next Vercel build, the `prebuild` script (`scripts/migrate.mjs`) walks
`drizzle/*.sql` in order, applies anything not yet recorded in `_eo_migrations`,
**then** runs `next build`. Atomic. Safe. The dashboard 500-on-deploy that
happened earlier today will not happen again.

To apply migrations manually (e.g. on a fresh dev branch):
```bash
pnpm db:migrate    # = node --env-file=.env.local scripts/migrate.mjs
```

## 2026-04-07 — Tier 1-4 product upgrades (live shift, dashboard, board mode, polish)

Massive single-session batch turning the live shift screen into a real-time
scoreboard, the manager dashboard into a decision-making surface, and adding
a public TV-board view that's the kind of thing that makes Easy OEE *spread*
inside a plant. All four tiers shipped with full EN/ES/FR i18n.

**Tier 1 — live shift screen** (`src/app/(app)/shift/[id]/live-shift.tsx`):
elapsed/projected/stop-time timers in big mono digits, live OEE estimate
ticking with target delta + color buckets, pulsing red downtime card with
the current-stop clock, long-stop note prompt that fires after 10+ minute
stops, hand-off button that lets the next operator slide in mid-shift with
their PIN (records `shift.endingOperatorId`, rotates the cookie).

**Tier 2 — manager dashboard** (`src/app/(app)/dashboard/page.tsx`): three
shift-type comparison cards (morning/afternoon/night, 7-day avg). Pareto
already shipped earlier. Daily digest cron at `/api/cron/daily-digest`
assembles per-line OEE + best/worst + top 3 stops + 7-day delta and
optionally calls Claude Haiku 4.5 for a 2-3 sentence narrative summary.
Weekly anomaly scan at `/api/cron/anomaly-scan` flags lines whose 7-day
avg dropped > 5pp vs the prior 4-week baseline. Both registered in
`vercel.json`. Auth via `x-vercel-cron` header or `Bearer CRON_SECRET`.

**Tier 3 — TV Board mode + loss tree:**
- `/board/[token]` is a public read-only fullscreen route designed for a
  55" display bolted above a line. No login. Manager rotates the token
  from `/dashboard/lines`. Big OEE numeral, RUNNING/STOPPED pill,
  operator + product subtitle, side panel with parts/elapsed/top-stops,
  idle state when no shift is active. Server revalidates every 10s,
  client keeps timers smooth and triggers `router.refresh()` between pulls.
- Loss-tree stacked-bar card on `/shift/[id]/summary`: partitions all
  planned minutes into Good Output / Quality Loss / Speed Loss / Downtime
  with a legend. Driven by new `computeLossTree()` in `src/lib/oee.ts`
  (2 new tests, 13/13 passing).

**Tier 4 — polish:**
- PWA manifest at `src/app/manifest.ts` — operators "Add to Home Screen"
  on a tablet, launches `/pin` standalone with the teal background and
  branded icons.
- Edit-shift workflow: `editShift()` server action + new
  `/dashboard/shifts/[id]/edit` page with audit-reason field. If shift is
  already complete, OEE numbers are recomputed automatically from the new
  values + existing stops.
- Calendar grid: "Last 14 Days · Calendar" card on `/dashboard/shifts`
  showing morning/afternoon/night × 14 days, color-coded by oeeBucket.
- Plant timezone column on company (`America/Toronto` default) — wired
  into the schema, ready for `getCompanyDay()` helper to use it.

**Schema additions** — all backwards compatible, push when convenient:

| Table     | Column                | Type                                       |
|-----------|-----------------------|---------------------------------------------|
| `company` | `timezone`            | `text NOT NULL DEFAULT 'America/Toronto'`   |
| `line`    | `target_oee`          | `numeric(5,4) NOT NULL DEFAULT 0.85`        |
| `line`    | `board_token`         | `text UNIQUE`                               |
| `shift`   | `ending_operator_id`  | `uuid REFERENCES user(id)`                  |

```bash
pnpm db:push   # apply to dev branch
```

**New env vars (all optional, all degrade gracefully):**
- `ANTHROPIC_API_KEY` — turns on AI digest summaries via Claude Haiku 4.5
- `CRON_SECRET` — `Authorization: Bearer ${CRON_SECRET}` for manual
  triggering of `/api/cron/*` from outside Vercel Cron

**i18n:** ~40 new keys × 3 languages (EN/ES/FR) covering all the new
strings on live shift, dashboard, summary, board.

**CSS additions** (`src/app/globals.css`): `.timer-row`,
`.progress-track`, `.liveoee-*`, `.downtime-card` (reduced-motion-aware
pulse), `.app-input`, `.loss-tree`, `.board-*`, `.shift-compare`,
`.calendar-grid`, `.cal-cell`.

**Verified clean:** `pnpm test` 13/13, `pnpm typecheck`, `pnpm lint`,
`pnpm build` all green.

## Late additions (2026-04-07 evening)

- **Cross-machine auto-sync** — see "Cross-machine sync" section above. Hook +
  launchd agent + `install-sync.sh`. Lives in `scripts/`.
- **Sudo-free toolchain** — Node 22.20 / pnpm 10 / Vercel CLI installed into
  `~/.local` on the bare iMac without Homebrew or admin rights. PATH persisted
  in `~/.zshrc`. See the "Why the toolchain dance?" callout in the TL;DR for
  the three gotchas (Node ≥ 22.12 required, broken `~/.npm` perms, corepack
  shim conflict).
- **Branded favicon + OG image** — `src/app/icon.tsx`, `apple-icon.tsx`,
  `opengraph-image.tsx` use `next/og` `ImageResponse` to generate PNGs at build
  time: the `easy-oee-logo.svg` centered on the `#003038` teal background.
  Sizes: 512×512 (favicon), 180×180 (Apple touch icon), 1200×630 (Open Graph
  for Slack/iMessage/Twitter/LinkedIn previews). The old default
  `src/app/favicon.ico` was deleted so the new icon convention wins everywhere.
- **Shift summary header buttons** — "Start New Shift" + "Dashboard" buttons
  moved from the bottom of `/shift/[id]/summary` to a flex row next to the
  page title for one-tap post-shift navigation. Wraps cleanly on phones; hidden
  in print output.
- **Vitest fix** — `@rolldown/binding-darwin-arm64` added as an explicit
  devDependency because pnpm 10 was filtering it out of rolldown's optional
  deps on Apple Silicon, breaking `pnpm test` startup. Lockfile now ships the
  binding so any arm64 Mac is good immediately.

## Late additions in the same session (post mega-batch)

- **Operator/live-shift/summary centering** — those three screens were full-width left-aligned (the `.op-shell` class doesn't constrain width). Now wrapped at `maxWidth: 880px` with auto margins so they sit centered on big monitors.
- **Language switcher on live-shift + summary** — was missing from those two screens, now in the header next to the logo.
- **Shift export** — new card at the bottom of `/shift/[id]/summary`:
  - **Download CSV** → `/api/shifts/[id]/csv` route handler (`src/app/api/shifts/[id]/csv/route.ts`). Auth-scoped to operator session OR admin session. Streams a full per-shift CSV: header info, OEE metrics, production detail, every downtime event with timestamps.
  - **Print or save PDF** → `window.print()`. New `@media print` block in `globals.css` hides `.no-print` chrome, switches body to white background + black text, adds borders to cards, prevents bad page breaks. Browser save-as-PDF gives a clean one-pager.
  - **Email it** → expands an inline form. Server action `emailShiftSummary` in `src/server/actions/shift-export.ts` validates the email + shift, currently returns a placeholder confirmation. To wire: install Resend, create `src/emails/ShiftSummary.tsx` React Email template, replace the `console.log` with `resend.emails.send()`. Env vars needed: `RESEND_API_KEY`, `EASY_OEE_FROM_EMAIL`.
- All new export strings translated EN/ES/FR (`export.title`, `export.csv`, `export.print`, `export.email`, `export.send`, `export.sending`, `export.emailLabel`).

## What's left for the immediate next session

1. **Wire actual Stripe** — create products + prices in your Stripe dashboard, paste the price IDs into `src/lib/pricing.ts`, add `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to Vercel env, replace the 501 stubs in `/api/checkout/session/route.ts` and `/api/webhooks/stripe/route.ts` with real Stripe Checkout Session creation and webhook handling. Schema is already in place.
2. **Wire actual Resend** — `pnpm add resend @react-email/components`, create `src/emails/ShiftSummary.tsx`, add `RESEND_API_KEY` + `EASY_OEE_FROM_EMAIL` to Vercel env, swap the `console.log` in `src/server/actions/shift-export.ts` for `resend.emails.send({ from: process.env.EASY_OEE_FROM_EMAIL, to, subject, react: <ShiftSummary {...} /> })`. Then optionally trigger it automatically from `endShift()` for managers who opt in via a settings page.
3. **Wire actual Clerk** for managers — create Clerk app, paste keys, replace `/sign-in` admin password with Clerk sign-in. Replace `getManagerCompanyId()` (currently the seeded-tenant stub) with a Clerk session lookup. The `(auth)/sign-in` pattern is already set up in the URL.
4. **Loading and error states** — `loading.tsx`, `error.tsx`, on-brand 404 page.
5. **Sentry** for error tracking.
6. **Domain cutover** — point `easy-oee.com` from GitHub Pages to Vercel once you're confident the new app is the better landing.

## Resume here 👇 (the literal next thing to do — as of 2026-04-07)

**Current machine state (iMac `cqmarketing`):** Toolchain is now **fully
installed and verified** — Node 22.20 + pnpm 10 + Vercel CLI in `~/.local`,
auto-sync hook + launchd agent active, project deps installed, all
verification commands green (`pnpm test` 11/11, `pnpm typecheck` clean,
`pnpm lint` clean, `pnpm build` clean). Just plug in the SSD and start
working.

**On a fresh Mac that doesn't have any of this yet:** follow the TL;DR at the
top of this file (auto-sync setup → Node tarball → pnpm via direct npm-cli →
`pnpm install` → verify). It's a copy-paste sequence, no admin rights needed.

**Then:** Provision Neon Postgres via Vercel Marketplace (see "Open work" Step
1 below), `pnpm db:push`, write `src/lib/db/seed.ts`, then start the operator
flow.

**Known issues to investigate after auth:**
- Vercel preview URL `https://easy-fnqyp90da-cq-marketings-projects.vercel.app` returns **HTTP 401** — likely Vercel deployment protection / SSO. Disable in project Settings → Deployment Protection if you want public preview.
- `easy-oee.com` is currently served from **GitHub Pages** (Louis's static HTML), NOT Vercel. DON'T cut over DNS until app v1 is ready.
- Louis's contact-form leads from the live site: destination unknown. Fetch the live `contact.html` and inspect the form action to locate them (Formspree / Netlify Forms / email).

If anything looks wrong, the source of truth is the GitHub repo — the local copy you make should match. Re-clone if in doubt.

Good luck, future you. 🚀

---

## 2026-04-28 — Sales-ready batch (live demo, signup, live grid, scanner, mobile audit)

Single-day push to make the app demo-able to Louis's prospects and let real
trials start. Six commits, all green.

### What shipped

**1. `/demo` route — live sales demo with no login**
- Two entrypoints: **Enter as Manager** (lands on `/dashboard` with the seeded
  Maple Manufacturing tenant) and **Enter as Operator** (lands on `/operator`
  signed in as Pierre Lavoie).
- New `eo_demo` cookie + `setDemoCookie()` helper at
  `src/lib/auth/demo-mode.ts`. Server actions in `src/server/actions/demo.ts`
  set admin + operator cookies pointing at the seed user IDs and toggle the
  banner.
- Sticky **DEMO MODE** banner across every `(app)` route via the layout.
  Banner has a **Sign Up Free** CTA that pushes prospects to `/sign-up` and
  an Exit demo link. White button text on the dark pill — visibility bug
  fixed in commit `cb1750d`.
- Per-route tip card (`<DemoBanner />` is a client component using
  `usePathname()`) explains what the prospect is looking at on dashboard,
  lines admin, operators admin, shifts admin, operator setup, live shift,
  summary, and PIN entry.
- Marketing nav has a **See it Live** link going to `/demo`. Marketing CTA
  switched from "Book a Demo" → "Start Free Trial" pointing at `/sign-up`.
  Sign-in page also has a "Try the Live Demo" button.
- Every demo string in EN/ES/FR.

**2. `/sign-up` is now real — 7-day trial signup**
- Form creates a `company` row (slug auto-generated, plan `'trial'`,
  `trial_ends_at = now + 7 days`, `subscription_status = 'trialing'`) and a
  `user` row with `role = 'manager'` and a bcrypt `password_hash`.
- Sets the admin cookie (now carries `userId` + `companyId`) and redirects to
  `/dashboard`.
- Schema migration: `user.password_hash text` (nullable; null on operators).
  See `drizzle/0001_user_password_hash.sql`.
- `signInAdmin` updated to do an email + bcrypt lookup first, falling back to
  the legacy `ADMIN_PASSWORD` env var which now resolves to the seed manager
  of Maple Manufacturing (kept as a backwards-compat backdoor — you can
  remove the env var when ready).
- New **trial countdown banner** at the top of `/dashboard` showing days
  remaining + a Choose a plan link. Hides itself when `trial_ends_at` is
  null. Red "expired" variant when the trial is past due.
- `getManagerCompanyId()` and the dashboard's company resolver now read from
  the admin session first, falling back to the seed for the legacy demo path.

**3. Live machines grid on `/dashboard`**
- New section above the existing widgets: per-line cards in a responsive
  CSS grid (auto-fill, min 280px). Each card shows running/stopped/idle
  pill, big OEE number, current operator, product, **job number** when
  set, parts, elapsed timer, current open stop with red highlight, top
  stop today.
- Backed by `getCompanyLiveLines(companyId)` in
  `src/lib/db/queries/line-state.ts` — multi-line version of the
  per-line snapshot the TV board uses.
- Client wrapper (`live-lines-grid.tsx`) ticks elapsed timers every
  second and triggers `router.refresh()` every 10s.

**4. Barcode / QR scanner — primary use is job numbers**
- `<ScanModal>` opens fullscreen camera. Tries native `BarcodeDetector`
  API first (Chrome/Edge/Safari TP), falls back to `@zxing/browser`.
  Releases stream cleanly on close. Handles permission denied + no
  camera gracefully.
- `<ScanButton targetInputId={...}>` — drop-in next to any input.
  When triggered, fills the named input. Used for the **Job Number**
  field on `/operator` (operator shift setup) and on `/dashboard/shifts/[id]/edit`.
- `<DashboardScanButton />` lives in the manager dashboard header next
  to Start Shift; scans → clipboard with a green "Copied!" toast.
- Schema: `shift.job_number text` (nullable). See
  `drizzle/0002_shift_job_number.sql`.
- Display: live shift header, summary header (`· Job WO-12345`),
  live machines grid card, dashboard recent shifts table, full shifts
  admin table, per-shift CSV export.

**5. Mobile responsiveness audit + fixes**
- Hamburger menu was effectively broken — only the first link rendered.
  Cause: `<nav>` has `backdrop-filter: blur(16px)` which silently makes
  it a containing block for any `position: fixed` descendant. The
  mobile menu was anchored to the 89px-tall nav instead of the
  viewport. Moved the menu out of `<nav>` as a sibling so its
  `position: fixed` resolves to the viewport.
- Dashboard header (`/dashboard`): switched the inline flex with
  `space-between` to a wrapping `.dash-header` / `.dash-header-actions`
  pair. Under 600px the title block stacks above the action buttons,
  Scan code button text no longer wraps to two lines.
- Manager sidebar (`(app)/dashboard/layout.tsx`): the lang switcher and
  Sign Out used to stack as two full-width blocks on mobile (sidebar
  collapses to top bar). Now wrapped in `.mgr-side-foot`; on mobile
  they sit inline and Sign Out is auto-width.
- Marketing copy: home + pricing trial mentions changed from 14-day to
  **7-day** in EN/ES/FR. The "14-day calendar grid" wording in the
  dashboard tip is correct and stays.
- Verified at 375×812: `/`, `/how-it-works`, `/pricing`,
  `/roi-calculator`, `/contact`, `/sign-in`, `/sign-up`, `/pin`,
  `/demo`, `/dashboard`, `/operator`. All clean.

**6. Migration runner bug fix (root cause of an outage)**
- `scripts/migrate.mjs` `splitStatements()` filtered out any chunk
  whose first character was `--`, intending to skip commented-out
  statements. Both `0001_user_password_hash.sql` and
  `0002_shift_job_number.sql` opened with a doc-block comment header,
  so the entire file got dropped. The runner still recorded each
  migration as applied in `_eo_migrations`, so Drizzle's schema
  believed the columns existed but they didn't — every
  `db.select().from(s.user)` and `db.select().from(s.shift)` threw
  `column "..." does not exist`, which broke `/demo`, signup, and the
  dashboard.
- Fixed: a chunk is dropped only if stripping `-- comment` lines and
  whitespace leaves nothing executable. Files that open with a
  doc-block but contain real DDL are correctly applied.
- Production DB columns were added directly via
  `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so the live deploy
  recovered immediately. The `_eo_migrations` entries still match.

### Schema additions (all backwards-compatible)

| Table | Column | Type | Purpose |
|---|---|---|---|
| `user` | `password_hash` | `text` (nullable) | bcrypt for manager email+password login. Null on operators. |
| `shift` | `job_number` | `text` (nullable) | Optional work-order / job ticket number, set on shift start or via manager edit. |

### New i18n keys (all 3 languages)

`signin.demoPrompt`, `signin.demoCta`, `signin.signupPrompt`,
`signin.signupLink`, full `signup.*` block, full `trial.*` block,
`nav.tryDemo`, `nav.startTrial`, full `demo.*` + `demo.banner.*` +
`demo.tip.*` blocks, full `dashboard.lines.*` block, `dashboard.col.job`,
`shift.job`, `operator.jobNumber*`, full `scan.*` block.

### Auth model summary (where we are pre-Clerk)

- **Operators** sign in at `/pin` with name + 4-digit PIN; bcrypt verify
  against `user.pin_hash`. HMAC-signed cookie `eo_op`, 12h TTL,
  payload `{ operatorId, companyId, exp }`. Unchanged.
- **Managers** sign in at `/sign-in` with email + password. New flow
  looks up the `user` by email, bcrypt-verifies `password_hash`. HMAC-signed
  cookie `eo_admin`, 14d TTL, payload `{ role: "admin", userId, companyId, exp }`.
  Falls back to the legacy `ADMIN_PASSWORD` env var that grants access to the
  seed tenant — kept so older demo bookmarks still work.
- **Demo users** hit `/demo` and click an entry button. The server
  action sets both admin + operator cookies pointing at the seeded
  Maple Manufacturing user IDs and a marker `eo_demo` cookie that
  toggles the demo banner.
- **Self-serve signup** at `/sign-up` creates a fresh company + manager
  user (bcrypt password) and sets the admin cookie. 7-day
  `trial_ends_at` populated; Stripe wiring takes it from there.

### Files added today

```
drizzle/0001_user_password_hash.sql
drizzle/0002_shift_job_number.sql
src/app/demo/page.tsx
src/app/(app)/dashboard/live-lines-grid.tsx
src/app/(app)/dashboard/trial-banner.tsx
src/lib/auth/demo-mode.ts
src/lib/db/queries/line-state.ts
src/server/actions/demo.ts
src/components/demo/DemoBanner.tsx
src/components/scanner/ScanModal.tsx
src/components/scanner/ScanButton.tsx
src/components/scanner/QuickScannerCard.tsx
src/components/scanner/DashboardScanButton.tsx
.gitignore  (added .claude/)
```

### Resume here on the next session

Highest-leverage next steps in order:

1. **Wire actual Stripe** — schema fields are populated already
   (`stripe_subscription_id`, `licensed_lines`, `subscription_status`,
   `trial_ends_at`). Replace 501 stubs in
   `/api/checkout/session/route.ts` and `/api/webhooks/stripe/route.ts`
   with real Checkout Session + webhook handling. Fill in `stripePriceId`
   slots in `src/lib/pricing.ts`. Add `STRIPE_*` keys to Vercel env.
2. **Wire Resend** — server action `emailShiftSummary` already validates
   input. `pnpm add resend @react-email/components`, create
   `src/emails/ShiftSummary.tsx`, swap `console.log` for
   `resend.emails.send()` in `src/server/actions/shift-export.ts`. Add
   `RESEND_API_KEY` + `EASY_OEE_FROM_EMAIL` to Vercel env. Then optionally
   fire on shift end for managers who opt in.
3. **Migrate to Clerk** when you outgrow per-company HMAC. The current
   schema can co-exist with Clerk (`user.clerk_user_id` already exists);
   migrate is additive.
4. **Loading/error/404 states + Sentry** for production polish.
5. **Daily reset cron for the demo tenant** so prospects don't see each
   other's clicks. Wire `resetDemo()` to truncate non-seed shifts +
   stops on a daily schedule (cron path: `/api/cron/reset-demo`).
6. **Domain cutover** — point `easy-oee.com` from GitHub Pages to Vercel
   when you're ready to retire Louis's static HTML.

If anything looks wrong, the source of truth is GitHub. Re-clone if in
doubt. SSD canonical path is `/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee`.
Auto-sync runs every 3 minutes + on every commit; Dropbox docs mirror is
wired into the same script and updates the same cycle.

---

## 2026-04-29 — Analytics module + light/dark theme + style sweep

Two features and a style pass landed in one commit (`5e1f298`).

### What shipped

**1. Analytics module at `/dashboard/analytics`**

Adapted from a spec Louis sent over. Four routes:

- `/dashboard/analytics` — KPI cards (OEE / Availability / Performance /
  Quality over the last 30 days), production volume cards (good parts,
  defective units, total + defect rate), 14-day SVG sparkline with the
  85% target line, and three drill-in cards.
- `/dashboard/analytics/shifts` — per-shift-type cards, full shift
  detail table, and Pareto stops broken out per shift type.
- `/dashboard/analytics/machines` — line summary table with vs-target
  column, OEE-vs-target horizontal bars (green when above, red below,
  vertical white tick at the target), and Pareto stops per line.
- `/dashboard/analytics/operators` — ranked leaderboard cards (#1 gets
  a teal rank pill), full detail table sorted by OEE, and Pareto stops
  per operator.

Backed by `src/lib/db/queries/analytics.ts` — multi-tenant queries
using Drizzle (`avg`, `count`, `sum`, `groupBy`). All queries scoped by
`companyId` and resolved through `getAdminSession()` with a seed
fallback for the legacy demo path.

Sub-nav at the top of every analytics route via
`src/app/(app)/dashboard/analytics/subnav.tsx`. Manager sidebar gets a
new **Analytics** tab between Dashboard and Shifts. Demo banner has
per-route tip cards for all four analytics pages.

Adaptations from Louis's draft (his structure was sound; the polish
needed cleanup):
- All decoration emojis stripped (icons, sun/moon, ✅/❌ in the cards).
- ~95 hardcoded Spanish strings lifted into i18n keys × EN/ES/FR.
- CSS fallback variables replaced with the real theme tokens
  (`--mid`, `--border`, `--border2`, `--accent`, `--white`,
  `--muted2`, `--font-dm-mono`, `--font-bebas`).
- Bucket class typo fixed (`oee-low`, not `oee-poor`).
- Stop reason labels reuse the canonical `stop.NN.label` keys instead
  of being duplicated three times.
- A small helpers file `src/app/(app)/dashboard/analytics/helpers.ts`
  with `getAnalyticsCompanyId()` and `STOP_LABEL_KEYS`.

**2. Light / dark theme toggle**

Wired through every surface. The dark theme is the existing brand teal
look; light theme flips background and text while keeping the same
teal accent.

- Tokens defined in `src/app/globals.css` for both
  `:root[data-theme="dark"]` and `:root[data-theme="light"]`. Smooth
  `transition` on background-color + color + border-color across body,
  cards, nav, sidebar, fields, buttons, scanner, banners.
- `src/lib/theme.ts` — `getServerTheme()` reads the `eo-theme` cookie
  via `next/headers`, defaulting to dark. Used by the root layout to
  set `data-theme` on `<html>` at SSR. No flash of wrong theme on
  first paint.
- `src/components/theme/ThemeToggle.tsx` — client component with two
  variants (`icon` round button, `labeled` with text). Sun/moon SVGs
  (no emoji glyphs). Clicking updates `data-theme`, sets the cookie
  (1-year max-age), and writes localStorage. Hydration-safe via the
  mounted-flag pattern (eslint-disable-next-line on the standard
  set-state-in-effect for the mount toggle).
- Wired into:
  - Manager sidebar bottom row (`mgr-side-foot`)
  - Operator setup (`/operator`)
  - `/sign-in`, `/pin`, `/demo` landing
  - Marketing nav (desktop links + mobile cluster)
- i18n: `theme.light`, `theme.dark`, `theme.toLight`, `theme.toDark`
  in all 3 locales.

**3. Style sweep — em-dashes, AI slop, decoration emojis**

- Em-dash pause-breaks replaced with periods in user-facing strings:
  `shift.longStop.title`, `demo.banner.tip`, `demo.manager.body` in
  EN/ES/FR.
- Em-dashes in JSDoc file headers cleaned (manifest, layout, csv
  route, cron routes, ThemeToggle, ScanModal, dictionaries header) —
  replaced with periods or colons.
- Decoration emojis: none found in user-facing strings. The only
  glyph left is `✓` in `seed.ts` console output — that's a CLI dev
  tool with structural meaning, kept.
- AI-slop phrases: none found.
- `"—"` is still used as a null-data placeholder in tables (e.g.,
  unset job number, no shift data). That's correct typography (the
  character represents absence of value, not a pause-break).

### Schema changes

None this round. Analytics is read-only.

### New i18n keys

About 100 keys × EN/ES/FR. Topical groups: `analytics.*` (overview,
KPI labels, sub-nav, column headers, drill-in card copy, per-page
empty states), `theme.*`, plus extra `demo.tip.analytics.*` for the
per-route demo banner tips, plus `mgr.nav.analytics`.

### Cookies (full inventory after today)

| Cookie | TTL | Set by | Payload | Notes |
|---|---|---|---|---|
| `eo_admin` | 14d | `/sign-in`, `/sign-up`, `/demo` (manager side) | `{ role: "admin", userId, companyId, exp }` | HMAC-signed |
| `eo_op` | 12h | `/pin`, `/demo` (operator side), shift handoff | `{ operatorId, companyId, exp }` | HMAC-signed |
| `eo_demo` | 4h | `/demo` | marker `1` | Toggles the DEMO MODE banner |
| `eo-locale` | 1y | language switcher | `en` / `es` / `fr` | Drives i18n SSR |
| `eo-theme` | 1y | theme toggle | `light` / `dark` | Drives `data-theme` on `<html>` |

### Files added today

```
src/app/(app)/dashboard/analytics/layout.tsx
src/app/(app)/dashboard/analytics/subnav.tsx
src/app/(app)/dashboard/analytics/helpers.ts
src/app/(app)/dashboard/analytics/page.tsx
src/app/(app)/dashboard/analytics/shifts/page.tsx
src/app/(app)/dashboard/analytics/machines/page.tsx
src/app/(app)/dashboard/analytics/operators/page.tsx
src/lib/db/queries/analytics.ts
src/lib/theme.ts
src/components/theme/ThemeToggle.tsx
```

### Resume here on the next session

The "next steps" punch list from the 2026-04-28 entry still applies
(Stripe wiring, Resend wiring, Clerk migration, loading/error/404,
demo reset cron, DNS cutover). Two new items added by today's work:

1. **Add a "Per-line drill-down" deep-dive page** under
   `/dashboard/analytics/machines/[id]` — currently the machine
   summary is a flat list. A per-line page with daily trend +
   shift-by-shift table would round out Phase 3 "Insights".
2. **Theme-aware OG / favicon images** — current PNGs are dark only;
   light-theme users on iMessage previews will still see the dark
   teal background. Low priority but on the list.

Auto-sync runs every 3 min + on every commit. Dropbox docs mirror
follows the same cycle.

### Bug-fix addendum (same day)

After the initial analytics + theme push, four light/demo bugs surfaced
and were fixed:

- **Logo rendered twice in light mode.** `next/image` stamps
  `display: block` into the element's inline style, which beat the
  `display: none` from the `.logo-swap-light/-dark` classes. Fixed
  with `!important` on the swap rules. Without that, both variants
  rendered side-by-side.
- **Sidebar disappeared into the dark teal background in light mode.**
  `.mgr-side` had a hardcoded `background: #002328`. Replaced with a
  set of dedicated tokens (`--mgr-side-bg`, `--mgr-side-text`,
  `--mgr-side-muted`, `--mgr-side-border`, `--mgr-side-hover`,
  `--mgr-side-active-bg`, `--mgr-side-active-text`) so the sidebar can
  stay branded teal in dark mode and be a clean white card in light
  mode.
- **Sidebar wasn't connecting to the demo banner.** Banner is sticky
  at top:0 with z-index 50; sidebar was also sticky at top:0 with
  default z-index, so it disappeared behind the banner whenever the
  user scrolled past the page header. Added `--eo-sticky-top` CSS
  variable on `:root` (default 0px), bumped to 48px via
  `.app-shell:has(> .demo-banner)` rule. The sidebar now uses
  `top: var(--eo-sticky-top)` and `height: calc(100vh - var(--eo-sticky-top))`,
  visually connecting to the banner edge.
- **Per-route demo tip card spanned the full width above the sidebar**,
  pushing `.mgr-shell` (and the sidebar inside it) further down the
  document. The result was a visible gap between the banner and the
  sidebar's top edge. Hid the tip wrapper on routes that contain a
  `.mgr-shell` via `.app-shell:has(.mgr-shell) .demo-tip-wrap { display: none }`.
  The banner copy still conveys the message; tips remain on
  operator/shift/summary/pin where they fit better.
- Marketing nav and operator setup got the theme toggle alongside the
  language switcher. Logo component now renders both `easy-oee-logo.svg`
  (white ink) and `easy-oee-logo-dark.svg` (dark ink) and CSS swaps
  visibility based on `data-theme`. The marketing nav was migrated from
  raw `<Image>` to the shared `<Logo />` component for consistency.

Lightning CSS gotcha: dropped a `.app-shell:has(.mgr-shell) > .app-wrap:has(> .demo-tip)` rule silently during minification (nested `:has()` with child combinators). Worked around it by adding a `demo-tip-wrap` class directly to the wrapper and targeting that.
