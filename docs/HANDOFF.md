# HANDOFF — Pick this up on a different machine

> **You are switching machines mid-build.** Read this top-to-bottom before doing anything else. Everything you need to continue is in this repo. Last updated: 2026-04-07 (auto-sync + sudo-free toolchain + branded favicon/OG).

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
