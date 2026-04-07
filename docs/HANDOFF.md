# HANDOFF — Pick this up on a different machine

> **You are switching machines mid-build.** Read this top-to-bottom before doing anything else. Everything you need to continue is in this repo. Last updated: 2026-04-06.

---

## TL;DR — what to do on the new machine

```bash
# 1. Make sure you have the toolchain (skip any you already have)
brew install node pnpm git gh vercel-cli postgresql@16

# 2. Authenticate
gh auth login          # GitHub  → cqdesignsny account
vercel login           # Vercel → cqdesignsny account

# 3. Clone the repo (NOT inside Dropbox — node_modules will melt your CPU)
mkdir -p ~/Code && cd ~/Code
git clone https://github.com/cqdesignsny/easy-oee.git
cd easy-oee

# 4. Install deps
pnpm install

# 5. (Optional, if you want the contact form to actually save) — pull env vars from Vercel
vercel link --yes --project easy-oee
vercel env pull .env.local

# 6. Run it
pnpm dev    # → http://localhost:3000
pnpm test   # → 11 OEE math tests should pass
pnpm build  # → production build should pass clean
```

Then open `docs/ROADMAP.md` and continue from the first 🟡/⚪ task. Or jump straight to the **"Resume here"** section at the bottom of this file.

---

## Project at a glance

| | |
|---|---|
| **Product** | Easy OEE — real-time OEE tracking SaaS for Canadian SME manufacturers |
| **Domain (live marketing)** | https://easy-oee.com (still serving Louis's static HTML) |
| **GitHub** | https://github.com/cqdesignsny/easy-oee (private) |
| **Vercel project** | `cq-marketings-projects/easy-oee` |
| **Vercel prod URL** | https://easy-fnqyp90da-cq-marketings-projects.vercel.app |
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

## Resume here 👇 (the literal next thing to do)

1. Open this file on the new machine
2. Run the **TL;DR** commands at the top
3. Confirm `pnpm dev` shows the marketing site at http://localhost:3000 with the teal design
4. Confirm `pnpm test` shows **11/11 OEE tests passing**
5. Confirm `pnpm build` is clean
6. Then go to **"Open work — pick up here"** section above and start with **Step 1: Provision Neon Postgres**.
7. After Neon is up, build the operator flow (Step 3) — that's the demo Louis can show prospects.

If anything looks wrong, the source of truth is the GitHub repo — the local copy you make should match. Re-clone if in doubt.

Good luck, future you. 🚀
