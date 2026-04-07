# Roadmap

Phased plan from "prototype to demo to prospects" → enterprise + hardware.

---

## Phase 0 — Foundation (in progress)

- [x] Approve stack + repo location
- [ ] Install macOS dev toolchain (Homebrew, node, pnpm, git, gh)
- [ ] Scaffold Next.js 16 + TS + Tailwind + shadcn at `~/Code/easy-oee`
- [ ] Initialize GitHub repo
- [ ] Connect Vercel + provision Neon via Marketplace
- [ ] Wire Clerk (dev instance)
- [ ] Drizzle schema + first migration
- [ ] `lib/oee.ts` with full unit tests

## Phase 1 — Prototype for prospect demos (THE GOAL)

What Louis can show on a Zoom call to a plant manager and have them say "yes, send me a trial."

- [ ] Marketing site ported into App Router (`/`, `/pricing`, `/contact`)
- [ ] Demo request form → writes to DB + email notification
- [ ] Manager signup + company creation (Clerk webhook)
- [ ] `/team` — manager creates operators + sets PINs
- [ ] `/lines` — manager creates production lines
- [ ] `/operator-login` — name picker + PIN
- [ ] `/shift/new` — shift setup form
- [ ] `/shift/[id]` — live tracking: machine status, 10 stop buttons, parts counter (+/- big buttons), end shift
- [ ] `/shift/[id]/summary` — full OEE breakdown with real numbers
- [ ] `/dashboard` — live shifts across all lines + last 7 days of OEE
- [ ] Seeded demo company so Louis can log in to a populated account on a call
- [ ] Deploy to `easy-oee.com` (apex) — marketing + app on one domain
- [ ] Mobile responsive everything

## Phase 2 — MVP (first paying customers)

- [ ] Stripe billing (Starter / Pro / Enterprise) with trial flow
- [ ] `/shifts` history list with filters (line, date range, operator)
- [ ] CSV export of shifts + stops
- [ ] Email shift-summary to manager on shift end (Resend)
- [ ] Downtime Pareto chart on dashboard
- [ ] Shift-to-shift comparison (morning vs afternoon vs night)
- [ ] Onboarding flow for new companies (create first line, first operator, sample shift)
- [ ] Audit log of who-did-what
- [ ] Production-grade error handling + Sentry

## Phase 3 — Growth

- [ ] Multi-line comparison view
- [ ] Weekly/monthly OEE trend charts
- [ ] Custom stop reasons per company
- [ ] Plant manager invitation flow (invite team)
- [ ] PWA install + offline shift logging (sync on reconnect)
- [ ] French (Quebec) translation
- [ ] In-app notifications
- [ ] Public marketing blog (`/blog`) for SEO

## Phase 4 — Enterprise

- [ ] Multi-plant rollup dashboard
- [ ] Role-based access (operator / supervisor / manager / admin)
- [ ] SAML / SSO
- [ ] REST API + API keys
- [ ] Webhooks
- [ ] White-label option
- [ ] SLA + dedicated support tier

## Phase 5 — Hardware add-on

- [ ] Hardware spec: target PLC protocols (Modbus TCP, OPC UA, digital IO)
- [ ] Reference device (Raspberry Pi 4 + HAT) running a small ingest agent
- [ ] `device` table + per-device API keys
- [ ] `/api/ingest` route accepting signed payloads (count tick, stop start, stop end)
- [ ] Pairing flow: manager scans QR on device, links it to a line
- [ ] Mixed-mode shifts (operator manual + device counts) with conflict resolution
- [ ] OTA firmware update channel
- [ ] Physical product packaging + Canadian distribution

See [`HARDWARE.md`](./HARDWARE.md) for the design notes.
