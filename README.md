# Easy OEE

> Real-time OEE tracking for Canadian plant managers — no hardware, no IT department, up and running in one shift.

**Domain:** [easy-oee.com](https://easy-oee.com)
**Status:** In active development — rebuilding from a Bubble prototype to a production Next.js app.

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

Operators tap-to-log shifts and machine stops on a tablet on the shop floor. Plant managers get live OEE dashboards on their phone or laptop. No spreadsheets. No paper. No PLCs required (yet — see [`docs/HARDWARE-INTEGRATION.md`](./docs/HARDWARE-INTEGRATION.md) for the future device-ingest path).

### Core flows
1. **Operator** — login → set up shift → tap stop reasons in real time → end shift
2. **Manager** — live dashboard of all active shifts → shift history → OEE trends → downtime Pareto

## Tech stack

| Layer       | Choice                                          |
|-------------|-------------------------------------------------|
| Framework   | Next.js 16 (App Router) + TypeScript            |
| Styling     | Tailwind CSS v4 + shadcn/ui                     |
| Database    | Neon Postgres (via Vercel Marketplace)          |
| ORM         | Drizzle                                         |
| Auth        | Clerk (managers) + custom PIN flow (operators)  |
| Payments    | Stripe (post-prototype)                         |
| Hosting     | Vercel                                          |
| Domain      | easy-oee.com                                    |

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full rationale.

## Getting started

```bash
pnpm install
cp .env.example .env.local  # fill in Clerk + Neon keys
pnpm db:push                # apply Drizzle schema to Neon
pnpm dev                    # http://localhost:3000
```

## Project docs

- [`PROJECT.md`](./PROJECT.md) — vision, market, business model, full product spec
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — system design, data model, decisions
- [`docs/SCHEMA.md`](./docs/SCHEMA.md) — database tables and relationships
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — phased plan from prototype to enterprise
- [`docs/OEE_MATH.md`](./docs/OEE_MATH.md) — calculation reference and edge cases
- [`docs/HARDWARE-INTEGRATION.md`](./docs/HARDWARE-INTEGRATION.md) — future direct-from-machine ingest
- [`AGENTS.md`](./AGENTS.md) — instructions for AI agents working on this repo
- [`CLAUDE.md`](./CLAUDE.md) — alias to `AGENTS.md` (Claude Code convention)

## Team

- **Louis** — founder, market research, customer development
- **CQ** — co-builder, engineering lead

---

*Made in Canada 🍁*
