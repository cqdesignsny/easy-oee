# Easy OEE — Project Specification

> The full product, business, and technical spec. Load this into any LLM session to continue work with full context.

**Last updated:** 2026-04-06
**Version:** 2.0 (Next.js rebuild)

---

## 1. Product

**Name:** Easy OEE
**Tagline:** Stop Guessing. Start Measuring.
**One-liner:** Real-time OEE tracking for Canadian plant managers — no hardware, no IT department, up and running in one shift.

**Live headline (easy-oee.com):** "You don't know your real OEE. We can fix that."

Easy OEE is a SaaS web app that lets manufacturing operators log shift data and tap-to-record machine stops with categorized reasons. The system automatically calculates Overall Equipment Effectiveness in real time. Plant managers get live dashboards and end-of-shift reports without spreadsheets, paper logs, or expensive MES installations.

## 2. Founders & team

- **Louis** (founder, CQ's cousin) — owns the vision, doing market research, talking to prospective customers
- **CQ** — engineering lead, building the production app
- Working out of Canada, targeting Canadian SME manufacturers first

## 3. Origin & current state

Louis built v0 on **Bubble** (no-code). It works end-to-end (login → operator → shift → summary) but has 4 data-persistence bugs that make OEE numbers unusable. Marketing site (3 HTML pages) was hand-coded and **is already live at easy-oee.com**. Domain is purchased.

We are **abandoning the Bubble version** and rebuilding on Next.js for these reasons:
- Bubble's Privacy Rules are brittle for true multi-tenancy
- We need real Postgres for analytics, exports, and the future device-ingest layer
- Stripe, custom UX (gloved-hands tap targets), PWA, and API are all painful in Bubble
- Vercel deployment is faster and free for prototyping

## 4. Target market

**Geography:** Canada first, English-speaking markets second.

**Buyer:** Plant Manager / Production Manager at a small-to-mid-size Canadian manufacturer.

**ICP:**
- 1–10 production lines
- 10–200 shop-floor employees
- Currently tracking OEE on paper, in Excel, or not at all
- No dedicated MES/ERP module for OEE
- Sectors: metal fab, food & beverage, plastics, automotive parts, packaging

**Pain points we solve:**
1. OEE not measured in real time
2. Vague stop reasons ("machine down")
3. Impossible shift-to-shift comparison
4. Quality losses untracked in the moment
5. Enterprise MES tools are overkill (and $500–$2,000/mo)

## 5. Business model

SaaS monthly subscription, annual at 20% off.

| Plan         | Monthly  | Annual/mo | Target                  |
|--------------|----------|-----------|-------------------------|
| Starter      | $49 CAD  | $39 CAD   | Single-line operations  |
| Professional | $129 CAD | $99 CAD   | Multi-line plants ★     |
| Enterprise   | Custom   | Custom    | 5+ lines, multi-plant   |

(Live site currently shows "$99/line/month" — need to reconcile with Louis.)

14-day free trial, no credit card.

**Targets:** CAC < $200, LTV (Pro 24mo) ~$3,096, LTV:CAC > 10:1.

## 6. OEE fundamentals

```
OEE = Availability × Performance × Quality

Availability = (Planned Minutes − Stop Minutes) / Planned Minutes
Performance  = (Good + Bad parts)  / (Ideal Rate × Run Time)
Quality      = Good Parts          / (Good + Bad parts)
```

World-class: 85%+. Typical: 60–85%. Low: <60%.

Full reference, edge cases, and code: [`OEE_MATH.md`](./OEE_MATH.md).

## 7. Data model (Postgres)

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) §Data Model for the Drizzle schema. Summary:

- **company** — tenant root
- **user** — manager or operator, FK to company
- **operator_pin** — 4-digit PIN per operator for tablet login
- **line** — production line, FK to company
- **shift** — one production run, FK to line + operator + company; stores all inputs and final OEE numbers
- **stop** — downtime event, FK to shift + reason; `minutes` computed on close
- **stop_reason** — enum (Mechanical Failure, No Material, Changeover, Quality Check, Scheduled Break, No Operator, Maintenance, Training, No Production Scheduled, Other)
- **device** *(future)* — physical data-collection device with API key, FK to company

## 8. App pages (v1)

### Marketing (public, ported from existing HTML)
- `/` — landing page
- `/pricing`
- `/contact` (demo request form → DB + email)
- `/roi-calculator` *(referenced in nav, may need to build)*

### Auth
- `/login` — manager email/password (Clerk)
- `/operator-login` — pick name + enter PIN (custom)

### Operator app
- `/shift/new` — shift setup form (line, type, product, planned minutes, ideal rate)
- `/shift/[id]` — live tracking: machine status, 10 stop buttons, parts counter, end shift
- `/shift/[id]/summary` — read-only OEE breakdown

### Manager app
- `/dashboard` — live shifts across all lines + recent OEE history
- `/shifts` — historical list with filters
- `/shifts/[id]` — detailed shift report
- `/lines` — manage production lines
- `/team` — manage operators (create, set PINs)
- `/settings` — company settings

## 9. Roadmap

See [`ROADMAP.md`](./ROADMAP.md) — phased from prototype → MVP → growth → enterprise → hardware.

## 10. Hardware future

Louis wants a hardware add-on (Raspberry Pi / ESP32 / industrial gateway) that reads counts and stop signals directly from PLCs and posts them to Easy OEE. The v1 schema and ingest API are designed to accept this without rewrites. See [`HARDWARE.md`](./HARDWARE.md).

## 11. Brand & design

**Colors** (from live marketing site):
```
--black:   #0a0a0a   /* background */
--white:   #f5f2ed   /* primary text */
--accent:  #e8ff47   /* acid yellow — CTAs, highlights */
--accent2: #ff5c35   /* orange-red — secondary */
--mid:     #1a1a1a   /* section backgrounds */
```

**Typography:**
- **Bebas Neue** — display / headings
- **DM Sans** — body
- **DM Mono** — labels, monospace data

**App UX rules:**
- Operator interactions must work with gloves on a phone or tablet → minimum 48px tap targets
- Minimize text input → radio buttons, dropdowns, single taps
- Machine status must be visible in one glance (green = running, any color = stopped)

## 12. Open questions

- Reconcile pricing: spec says $49/$129/Enterprise; live site says "$99/line/month"
- Confirm Louis's preferred timezone handling (per-company? per-line?)
- Confirm whether operators always belong to one company or can move between plants
- Hardware spec: Pi vs ESP32 vs industrial gateway, target PLC protocols (Modbus? OPC UA? digital IO?)

## 13. Changelog

- **2026-04-06** — Document rewritten for Next.js rebuild. v0 Bubble version archived.
- **2026-03-31** — Initial Bubble prototype + marketing site.
