# Easy OEE — Project Context

> **Read this first if you're picking up this project cold.** It contains everything that isn't in the code: who we're building for, why, what's been built, what hasn't, and what the next moves are. Keep this current — when product decisions change, update here.

---

## 1. The product in one paragraph

Easy OEE is a real-time **Overall Equipment Effectiveness** tracker for small and mid-size Canadian manufacturers. Operators tap buttons on a shared shop-floor tablet to log shift starts, machine stops (with categorized reasons), and parts counts. The app calculates Availability × Performance × Quality automatically and shows the plant manager a live dashboard. No hardware required to start; optional PLC-to-cloud devices later. Replaces paper, whiteboards, and Excel.

## 2. Why this exists

OEE is the manufacturing world's gold-standard productivity metric, but most SME plants don't measure it because:
- Enterprise MES tools (Plex, Wonderware, Ignition) cost $500–$2,000/month and need IT projects
- Spreadsheets are end-of-day, not real-time, and rot fast
- Paper logs are lossy and impossible to compare shift-to-shift

We make it $49–$129/month, web-only, and live within one shift.

## 3. People

- **Owner / business lead:** Louis (cousin of the user). Gathering market data, talking to prospective customers, started the original Bubble build.
- **Tech lead:** the user (cqstudio). Helping Louis ship to production.
- **AI collaborator:** Claude (this project's primary build assistant).
- **Customers (target):** Plant managers and ops directors at Canadian SME manufacturers (10–200 employees, 1–10 production lines, sectors: metal fab, food & bev, plastics, automotive parts, packaging).

## 4. Where we are right now

| Asset | Status |
|---|---|
| Brand + name | ✅ Easy OEE |
| Domain `easy-oee.com` | ✅ Purchased, **live** with marketing site |
| Marketing site (3 HTML pages) | ✅ Live at easy-oee.com (built by Louis) |
| Bubble prototype | ⚠️ Built but buggy — being **abandoned** in favor of Next.js |
| Next.js production app | 🚧 In progress (this repo) |
| Postgres (Neon) | 🚧 To provision via Vercel Marketplace |
| Clerk auth | 🚧 To provision |
| Vercel project | 🚧 To create + link |
| Stripe billing | ⏳ Phase 3 |
| Hardware ingest | ⏳ Phase 4 (R&D) |

## 5. Why we abandoned Bubble

Louis got the core flow working in Bubble (Login → Operator → Shift → Summary) but ran into 4 blocking bugs that all trace to Bubble's data persistence + Privacy Rule model:

1. RadioButton dropdowns don't populate (Privacy Rules + missing `company` FK)
2. Start Shift workflow doesn't save `line/operator/shift_type/product/planned_minutes/company`
3. Stop records don't link back to their parent Shift, so `minutes` never gets calculated
4. OEE math is therefore garbage (Avail=1, Perf=0, Qual=0)

These are all fixable in Bubble, but the roadmap (multi-tenant SaaS, Stripe, dashboards, CSV export, API, PWA, multi-plant, hardware ingest) outgrows Bubble fast. Next.js + Postgres makes them all trivial. **Decision: rebuild on Next.js, keep Bubble around as a reference until we ship v1.**

## 6. Business model

**Pricing** (CAD, monthly, with 20% annual discount):

| Plan | Monthly | Annual/mo | Includes |
|---|---|---|---|
| Starter | $49 | $39 | 1 line, 5 operators, 90-day history |
| Professional | $129 | $99 | 5 lines, 25 operators, 1-year history, multi-line dashboard, CSV export |
| Enterprise | Custom | Custom | Unlimited, multi-plant, custom stop reasons, SLA |

**Note:** The live marketing site shows `$99/line/month` flat — that's a more recent positioning Louis tested. We'll need to reconcile pricing copy before launch. **TODO: confirm pricing model with Louis.**

**Trial:** 14-day free, no credit card.

**CAC target:** < $200 (demo-led sales + LinkedIn outreach to plant managers).
**LTV target (Pro, 24mo):** ~$3,096.
**LTV:CAC target:** > 10:1.

## 7. Product scope

### MVP (this repo, what we're building now)

- Marketing site at `easy-oee.com` (port from existing HTML into Next.js)
- Manager auth (Clerk: email/password)
- Operator auth (PIN code on shared tablet, 4-digit, scoped to company)
- Multi-tenant data model (every row scoped to a `company_id`)
- **Operator flow:** Start Shift → Live Shift (stop buttons, parts counter) → End Shift → Summary
- **Manager flow:** Dashboard (live shifts + OEE today + recent history + top stop reasons)
- Real OEE math, stored on shift completion
- Seed data for demoing to prospects
- Deployed on Vercel with Neon Postgres + custom domains

### Phase 2 — Polish & Sell

- Stripe subscription billing (3 plans + trial)
- User invitation flow (manager invites operators)
- Email notifications (shift complete, daily summary)
- CSV export of shift data
- Mobile-optimized PWA (install on tablets)

### Phase 3 — Insights

- Downtime Pareto chart (top stop reasons by time lost)
- Shift comparison (morning vs afternoon vs night)
- Weekly/monthly OEE trend charts
- Custom stop reason categories per company

### Phase 4 — Hardware

- PLC/sensor → cloud ingest (Raspberry Pi or industrial gateway)
- API key per device, POST to `/api/ingest`
- Auto-detect machine state, auto-create stops
- See `docs/HARDWARE-INTEGRATION.md`

### Phase 5 — Enterprise

- Multi-plant dashboard
- Role-based access (operator / supervisor / admin)
- API for ERP integration
- Audit log

## 8. Key product decisions (and why)

| Decision | Reasoning |
|---|---|
| **Next.js 16 over Bubble** | Roadmap outgrows no-code; need multi-tenant, real auth, Stripe, API, hardware ingest |
| **Same Next.js app for marketing + product** | One domain, one codebase, simpler ops, free SEO benefit from being on the same domain |
| **Clerk for managers, PIN for operators** | Managers behave like normal SaaS users; operators are on shared tablets with gloves on — PIN is faster and safer than email/password |
| **Postgres + Drizzle** | Real FKs solve the entire class of bugs we hit in Bubble; Drizzle is type-safe with no codegen |
| **Server Actions for mutations** | Operator taps need to be fast and resilient; Server Actions + optimistic UI gives us that without building a separate API layer |
| **One company = one tenant** | Simple to reason about, scales until we hit multi-plant in Phase 5 |
| **Store calculated OEE on shift end** | Cheap to read, immutable historical record, avoids recalculating on every dashboard load |
| **Build hardware-ingest stub from day 1** | Keeps the data model honest; avoids painful refactor when devices arrive |

## 9. Non-goals (for now)

- ❌ Native mobile apps (PWA is good enough)
- ❌ Offline mode (shop-floor wifi is fine; revisit if customers ask)
- ❌ Machine-learning anomaly detection (manual stop reasons are the value prop)
- ❌ Multi-language i18n (English-only at launch; French Canada in Phase 2 if needed)
- ❌ Self-hosted / on-prem (cloud only)

## 10. Open questions

- [ ] Confirm final pricing model with Louis ($49/$129/$Custom vs $99/line/month)
- [ ] Confirm domain split: `easy-oee.com` (marketing) + `app.easy-oee.com` (app), OR all under root with `/app` prefix
- [ ] Decide on Stripe vs Lemon Squeezy (LS handles Canadian sales tax automatically)
- [ ] What hardware does Louis have in mind? Off-the-shelf gateway (Advantech, Moxa) or custom Pi/ESP32?
- [ ] French (Quebec) localization — required for v1 or Phase 2?

## 11. References

- Live marketing site: https://easy-oee.com (currently GitHub Pages — Louis's static HTML)
- **Canonical working path:** `/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee` (portable SSD — see `docs/HANDOFF.md`)
- Original spec (reference only): `/Volumes/CQ-PRO-4TB/Easy OEE/easy-oee-master.md`
- Bubble app data export: App Data state in master doc Appendix A
- Original HTML files: already ported into `src/app/(marketing)/`

## 12. How to keep this doc useful

Update **PROJECT.md** when:
- A product decision changes
- A phase ships or a milestone is hit
- An open question gets answered
- A new stakeholder joins
- The business model or pricing changes

Update **`docs/ROADMAP.md`** when:
- A task is completed
- The order of priorities changes
- A new phase is planned

Update **`CLAUDE.md`** when:
- A coding convention or pattern is established
- A "don't do this" lesson is learned
- A new tool or library is adopted
