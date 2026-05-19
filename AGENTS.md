<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Easy OEE — Agent Instructions

> Read this before making changes. Loaded automatically by Claude Code (and similar agents) via `CLAUDE.md` → `AGENTS.md`.

## Project in one paragraph

Easy OEE is a SaaS app for SME manufacturers (Canada + US) to track Overall Equipment Effectiveness (OEE) in real time. Operators tap a tablet on the shop floor to log shift data and machine stops; plant managers see live dashboards. We are rebuilding a buggy Bubble prototype as a production Next.js app on Vercel + Neon Postgres. The founder is Louis (CQ's cousin); CQ Marketing is the engineering lead. Domain: easy-oee.com. Site is in three languages: EN / ES / FR.

## Required reading order

1. `README.md` — what this is, how to run it
2. `PROJECT.md` — full product, business, and market context
3. `docs/ARCHITECTURE.md` — system design and decisions
4. `docs/SCHEMA.md` — data model
5. `docs/OEE_MATH.md` — the math (don't improvise)
6. `docs/ROADMAP.md` — what's done, what's next

## Stack — non-negotiable defaults

- **Next.js 16** App Router + **TypeScript** strict. Middleware lives at `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`).
- **Tailwind v4** + **shadcn/ui** for all UI primitives
- **Drizzle ORM** + **Neon Postgres** (Marketplace integration on `easyoeepro` Vercel team)
- **Clerk** for all manager auth (`@clerk/nextjs@7.3.2`), powering the branded `/sign-in` + `/sign-up` pages via the legacy `useSignIn` / `useSignUp` hooks from `@clerk/nextjs/legacy`. Google + Microsoft SSO buttons call `authenticateWithRedirect`; email/password on `/sign-in` calls `signIn.create` then falls back to the HMAC bcrypt `signInAdmin` server action for users not yet migrated. On HMAC success that action eagerly creates the Clerk user (invisible migration). `/onboarding` collects company info for new Clerk users; `/post-clerk-signin` is the post-auth bridge that sets the HMAC `eo_admin` cookie so every existing `getAdminSession()` call keeps working. Operator auth stays on the custom 4-digit PIN flow (Clerk is wrong for shared shop-floor tablets).
- **Stripe** live mode wired against Louis's "Easy OEE Pro" account (`acct_1TRaMUBt1JkiFLKl`). `src/lib/stripe.ts` is the SDK entry. `/api/checkout/session` creates subscription Checkout Sessions with `quantity = lineCount`. `/api/webhooks/stripe` verifies signatures and handles the 5 subscription-lifecycle events.
- **AI Gateway** for any LLM call. Use `@ai-sdk/gateway` + `ai`'s `generateText` / `generateObject`. Model strings use dots (`anthropic/claude-sonnet-4.6`, `anthropic/claude-haiku-4.5`). Do NOT add `@anthropic-ai/sdk` or call `api.anthropic.com` directly — OIDC handles auth via `vercel env pull`.
- **i18n via React Context** — EN/ES/FR dictionaries in `src/components/i18n/dictionaries.ts`. Client components use `useT()`, server components use `await getServerT()`. Locale persisted in `eo-locale` cookie. **When adding user-facing copy, add the key in all 3 languages.**
- **Server Actions** over API routes for mutations whenever possible
- **Zod** for validation at all server boundaries
- **pnpm** as the package manager (never npm/yarn)
- Deploy to **Vercel** (`easyoeepro` team)

Don't introduce alternatives (Prisma, NextAuth, Supabase, direct Anthropic SDK, etc.) without an explicit ADR in `docs/decisions/`.

## Code conventions

- File-based routing under `src/app/`. Marketing pages under `src/app/(marketing)/`. App pages under `src/app/(app)/`.
- Server Components by default. Add `"use client"` only when you need interactivity.
- Database queries go through `src/lib/db/queries/*.ts`, never inline in components.
- All percentages stored as decimals (0.812), formatted for display only.
- All time stored as `timestamptz`, converted to plant timezone in the UI.
- Validate user input with **Zod** at every server action boundary.

## Multi-tenancy

Every query that touches `shift`, `stop`, `line`, `user` MUST be scoped by `company_id`. The current user's `company_id` comes from the Clerk session (manager) or the operator session token. **Never** trust a `company_id` from the client. Use the `withTenant()` helper in `src/lib/db/scoped.ts`.

## OEE math

Single source of truth: `src/lib/oee.ts`. Don't reimplement inline. Edge cases documented in `docs/OEE_MATH.md` and tested in `src/lib/oee.test.ts`.

## Bugs we are NOT going to repeat from the Bubble version

The Bubble prototype had four data-persistence bugs (see `PROJECT.md` §3). The schema and server actions in this rebuild make these bugs **structurally impossible**:

1. **`shift.company_id` is NOT NULL** with FK — can't create an orphan shift
2. **`stop.shift_id` is NOT NULL** with FK — can't create an orphan stop
3. **`stop.minutes` is computed server-side** in the close-stop action — never set by the client
4. **OEE is computed in `src/lib/oee.ts`**, called from the end-shift server action — never on the client

If you find yourself bypassing any of these, stop and re-read this section.

## Hardware-ready

Louis wants a future hardware add-on (Pi/ESP32/industrial gateway) reading PLCs. The schema and ingest layer must accommodate this without rewrites:
- `shift.data_source` enum: `manual` | `device`
- `device` table with API key per company
- `/api/ingest` route stub accepting signed POSTs

Don't build hardware yet, but don't paint us into a corner.

## Things to NEVER do

- ❌ Calculate OEE outside `src/lib/oee.ts`
- ❌ Write a query without a `company_id` filter
- ❌ Use `npm` or `yarn` — always `pnpm`
- ❌ Add a client component when a server component would work
- ❌ Trust `companyId` from a request body or query string
- ❌ Edit a migration file after it's been applied
- ❌ Commit `.env*` files
- ❌ Style with anything other than Tailwind

## Things to ALWAYS do

- ✅ Update `docs/ROADMAP.md` when you finish a task
- ✅ Update `PROJECT.md` when a product decision changes
- ✅ Update `docs/SCHEMA.md` when the schema changes
- ✅ Run `pnpm typecheck && pnpm lint && pnpm test` before saying "done"
- ✅ Use `useOptimistic` for any operator tap that hits the network
- ✅ Add a test to `oee.test.ts` whenever you touch OEE logic
- ✅ Keep operator screens glove-friendly (56px tap targets, big type)

## When in doubt

Read existing code first; match the pattern. If there's no pattern, propose one in `docs/ARCHITECTURE.md` and follow it consistently. Ask the user before adding a new top-level dependency.
