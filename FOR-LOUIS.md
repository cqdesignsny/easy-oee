# Easy OEE — Where We're At

A complete walkthrough for Louis. What the app is, what it does, what's been
built, how to use it, and where it's going.

**Live app:** https://easy-oee.vercel.app
**Last updated:** April 2026

---

## Table of contents

1. [The 60-second pitch](#the-60-second-pitch)
2. [What Easy OEE actually is](#what-easy-oee-actually-is)
3. [Who uses it and how](#who-uses-it-and-how)
4. [Pricing](#pricing)
5. [How to test the app right now](#how-to-test-the-app-right-now)
6. [The operator experience, step by step](#the-operator-experience-step-by-step)
7. [The manager experience, step by step](#the-manager-experience-step-by-step)
8. [The new TV Board mode](#the-new-tv-board-mode)
9. [Languages](#languages)
10. [Everything we've built so far](#everything-weve-built-so-far)
11. [What's next](#whats-next)
12. [Frequently asked questions](#frequently-asked-questions)

---

## The 60-second pitch

Most factories are guessing how well their machines run. They think they're
at 90% efficiency. They're actually at 55%. They lose money every day and
don't know it.

**Easy OEE** is a web app that gives manufacturing operators a tablet on the
shop floor where they tap big buttons to log their shift, downtime, and
parts produced. The app does the math automatically and gives the plant
manager **one number from 0 to 100** that tells them exactly how their
factory is performing — in real time.

- No hardware required (yet — we're building that for Phase 4)
- No spreadsheets, no paper logs
- Up and running in one shift
- Built for Canadian and US small-to-mid-size manufacturers
- $49 to $129 USD per month

That's the whole product.

---

## What Easy OEE actually is

OEE stands for **Overall Equipment Effectiveness**. It's the gold standard
metric for measuring manufacturing productivity, used everywhere from Toyota
to Tesla. It's a single percentage from 0 to 100 that combines three things:

| Component        | What it measures                                              |
|------------------|---------------------------------------------------------------|
| **Availability** | Was the machine running when it was supposed to?              |
| **Performance**  | Was it running at the right speed when it was on?             |
| **Quality**      | Of the parts produced, how many were good?                    |

**OEE = Availability × Performance × Quality**

A score of **85% or higher** is considered world-class. Most plants that
have never measured it are surprised to learn they're at 50-60%. The
moment they start measuring, they start improving — that alone is
worth the price of the software.

Easy OEE handles all the math automatically. The operator just taps
buttons. The manager just reads numbers.

---

## Who uses it and how

There are **two completely different kinds of users** in Easy OEE:

### 1. The Manager (the buyer)
- Pays for the subscription with a credit card
- Logs in with **email + password** from a laptop in their office
- Sees a live dashboard of every machine, every shift, every score
- Adds production lines, invites operators, downloads reports
- Probably never sets foot on the shop floor
- This is **our customer**

### 2. The Operator (the worker)
- **Doesn't have an email or password**
- Walks up to a shared tablet bolted to the machine
- Types a **4-digit PIN** like an ATM
- Their name pops up, they pick the machine, they start their shift
- Taps big buttons all shift to log stops and parts
- At the end, taps "End Shift" → sees their score → walks away
- This is **the user of the product the manager bought**

**Why two systems?** Because a factory worker wearing rubber gloves at
6 AM is not going to type an email and password. They will type four
digits. Anything more complicated than that and they will stop logging
data — which makes the whole product useless. The PIN system isn't a
shortcut. It's the only design that survives contact with a real shop
floor.

---

## Pricing

All prices are in **USD per month**, billed monthly or annually (annual
gets a discount). Approximate Canadian dollar conversions are shown as
a reference but customers are charged in USD.

| Plan             | Price                | Production lines | Operators       | Data history |
|------------------|----------------------|------------------|-----------------|--------------|
| **Starter**      | **$49** USD/mo       | 1 line           | Up to 5         | 90 days      |
| **Professional** | **$129** USD/mo      | Up to 5 lines    | Up to 25        | 1 year       |
| **Enterprise**   | Custom               | Unlimited        | Unlimited       | Forever      |

**You pay per machine, not per worker.** This is the right model because
the value of OEE measurement scales with the number of machines being
measured, not with the number of people. A plant with 100 workers and
2 machines pays the same as a plant with 10 workers and 2 machines —
both get the same insight.

**14-day free trial, no credit card required.**

There's a **line-count slider** on the pricing page so customers can
see exactly what they'd pay for their setup before committing.

### What's in each plan

**Starter ($49/mo) includes:**
- 1 production line
- Up to 5 operator accounts
- All 10 stop reason categories
- Real-time OEE dashboard
- Live shift tracking with timers
- Loss tree on shift summary
- Shift summary reports
- CSV export
- PDF / print export
- 90-day data history

**Professional ($129/mo) includes everything in Starter, plus:**
- Up to 5 production lines
- Up to 25 operator accounts
- Multi-line dashboard with shift comparison
- 7-day Pareto chart of stop reasons
- Calendar grid view of recent shifts
- Edit-shift workflow with audit trail
- Public TV Board mode for shop floor displays
- Email shift summaries
- Daily digest email (when wired to Resend)
- 1-year data history

**Enterprise (custom pricing) includes everything in Professional, plus:**
- Unlimited lines and operators
- Custom stop reason categories
- Multi-plant rollup
- Dedicated onboarding
- SLA + priority support
- Unlimited data history
- Future: hardware integration (PLC ingest)
- Future: API access for ERP integration

---

## How to test the app right now

You can try the entire app yourself in five minutes:

### As a manager

1. Go to **https://easy-oee.vercel.app/sign-in**
2. **Email:** anything (literally any address — the temporary login doesn't validate)
3. **Password:** `EasyOEE2026Admin`
4. You'll land on the **Manager Dashboard** with the seeded demo data
5. Click around: Dashboard, Lines, Operators, Shifts in the sidebar

### As an operator

1. Go to **https://easy-oee.vercel.app/pin**
2. Pick **Pierre Lavoie** from the list
3. **PIN:** `1234`
4. You're now logged in as an operator
5. You'll see the **Start Shift** form — pick a line, shift type, product
6. Tap **Start Shift**
7. You're now on the **Live Shift screen**

### What to try on the live shift screen

- **Tap a stop reason** (e.g., "Mechanical Failure") — the button turns
  yellow, a big red downtime card appears with a clock counting up,
  the OEE estimate starts dropping
- **Wait a few seconds, tap the same button again** to resume — the
  card disappears, the elapsed timer keeps going
- **Tap +1 or +10 on Good Parts** — the parts counter goes up, the live
  OEE estimate updates
- **Look at the timers row** — elapsed shift time, projected end time,
  total stop minutes
- **Look at the Live OEE card** — color-coded against the target, with
  a delta showing how far above or below you are
- **Stop a long stop (10+ minutes)** — when you resume, you'll get a
  prompt asking for a quick note about what happened (this builds
  institutional memory of what actually breaks)
- **Tap Hand Off** — pick another operator, type their PIN, the shift
  continues under their name without resetting anything
- **Tap End Shift** — the server runs the OEE calculation and you land
  on the **Shift Summary** page

### What to try on the shift summary

- **Big OEE number** at the top, color-coded
- **Three component cards** for Availability / Performance / Quality
- **The Loss Tree** — a horizontal stacked bar showing exactly where
  every planned minute went (Good Output / Quality Loss / Speed Loss /
  Downtime). This is one of the most useful charts in OEE and most
  competitors don't show it.
- **Production detail table** with all the numbers
- **Downtime events table** with every stop, time, duration, and notes
- **Three export buttons:**
  - **Download CSV** — full per-shift CSV
  - **Print or save as PDF** — uses the browser's print dialog with a
    custom stylesheet that hides chrome and switches to black-on-white
  - **Email it** — sends the summary to any email address
- **Start New Shift** and **Dashboard** buttons up top for one-tap
  navigation

---

## The operator experience, step by step

A real day for an operator named John, working the morning shift on Bottling Line 1:

**6:55 AM** — John walks up to the tablet bolted to Line 1. Taps the
screen. The PIN page shows a list of names. He taps **John Smith**.
Types **4729**. App says "Hi John."

**6:56 AM** — He's on the shift setup form. He picks Line 1 from the
radio buttons, picks "Morning Shift", types "16oz water bottles" in
the product field. Default planned minutes is 480 (8 hours). Default
ideal rate is pulled from the line settings (120 bottles/min). He
taps **Start Shift**.

**7:00 AM** — He's now on the Live Shift screen. Big "RUNNING" pill in
the top right. The elapsed timer starts ticking. The OEE estimate
shows N/A because there's no data yet.

**7:00 AM – 9:00 AM** — Line is running. John taps **+10 Good Parts**
roughly every minute. The Live OEE card slowly climbs into the green.

**9:14 AM** — A bottle jam. John taps **Mechanical Failure**. The
button turns yellow. The big red downtime card pops up with a clock
counting up. The pill at the top changes to "STOPPED". The OEE
estimate starts dropping in real time.

**9:23 AM** — Jam cleared. John taps the same button again. The card
disappears. **Because the stop ran 9 minutes, no note prompt fires
yet.** The shift resumes.

**12:00 PM** — Lunch break. John taps **Scheduled Break**. The card
appears again with a fresh clock.

**12:30 PM** — Back from lunch. John taps **Scheduled Break** to
resume. **30 minutes is over the 10-minute threshold**, so a note
prompt appears: "That stop ran 30 minutes for Scheduled Break. Leave
a note so the team knows what happened." John types "lunch" and taps
Save Note. The note is now attached to that stop record forever.

**3:00 PM** — End of shift. John taps **End Shift**. A confirmation
asks "End this shift? Final OEE will be calculated and saved." He
taps OK.

**3:00:01 PM** — The server runs the OEE calculation:
- Planned minutes: 480
- Stop minutes: 67 (sum of all stops)
- Run time: 413 minutes
- **Availability = 413/480 = 86%**
- Good parts: 47,840 / Bad parts: 380
- Total parts: 48,220
- **Performance = 48,220 / (120 × 413) = 97%**
- **Quality = 47,840 / 48,220 = 99%**
- **OEE = 86 × 97 × 99 = 82.6%**

**3:00:02 PM** — John lands on the Shift Summary. Big "82.6%" in the
center, color-coded green-ish (a hair below the world-class 85% mark).
He can see the loss tree showing exactly where the time went, the
list of all his stops with notes, and the export buttons. He taps
**Start New Shift** if another worker is taking over, or just walks
away.

That's the operator loop. **It's designed to be usable with one hand,
in gloves, by someone who's never seen the app before, with no
training.**

---

## The manager experience, step by step

Sarah is the production manager. She works in an office one floor up
from the shop floor. She has a laptop. She has email. She has a
credit card. She is our customer.

**Monday, 7:30 AM** — Sarah pours her first coffee, opens her laptop,
goes to easy-oee.com/sign-in, types her email and password. Lands on
the Manager Dashboard.

**Top of the dashboard** — a giant "Today's OEE" number for the whole
plant. It's currently 73% because Pierre on Line 2 had a rough start
to his shift.

**Below that** — three side-by-side cards comparing **Morning vs
Afternoon vs Night** shift averages over the last 7 days. Sarah's
night shift is at 64% vs her morning at 81%. She makes a mental note
to talk to the night supervisor.

**Live Shifts table** — shows every shift currently running across
the plant. She can see Pierre is on Line 2 with 1,200 parts produced
so far, started at 7:00 AM.

**Recent Shifts table** — last 10 completed shifts with their full
A/P/Q breakdown and final OEE, color-coded.

**Top Stop Reasons (Pareto)** — a horizontal bar chart of the last
7 days of downtime, sorted by total minutes lost. "Mechanical Failure"
is the biggest at 142 minutes, "No Material" is next at 67 minutes.
She knows exactly what to fix first.

**She clicks "Lines" in the sidebar** — sees all her production
lines, their ideal rates, their target OEE goals, and **their TV Board
links**. She clicks **Generate** on Line 1, gets a public URL, and
texts it to the maintenance guy who has a TV in his office. Now he
can see Line 1's OEE on the wall all day.

**She clicks "Shifts" in the sidebar** — sees a calendar grid of the
last 14 days, 3 rows (morning/afternoon/night) × 14 columns. Each
cell is colored by OEE bucket. She immediately spots that Wednesday
night was a disaster — bright red. She clicks the OEE number for
that shift and lands on its summary.

**She notices the operator typed the wrong product name** —
"168oz water bottles" instead of "16oz". She clicks **Edit**, fixes
the typo, types "operator typo" in the audit reason field, hits
Save. Done.

**She heads to a meeting** — but before she leaves, she'll get an
**email digest** at 6 AM tomorrow morning summarizing yesterday's
performance per line, the top 3 stop reasons, and a one-paragraph
narrative summary written by Claude AI explaining what to pay
attention to first. (This is wired up — needs Resend account to
actually send the emails.)

**At lunch she gets an SMS** — wait, not yet. SMS alerts aren't built
yet. They're queued for the next phase.

That's the manager loop. **She never has to think about how OEE works
or do any math. The app does it. She just reads the numbers and
makes decisions.**

---

## The new TV Board mode

This is one of the most differentiated features in the product and
nobody else thinks to build it.

The Manager generates a **public board token** for each line from
the Lines admin page. That gives them a URL like
`https://easy-oee.vercel.app/board/aB3cD4eF5gH6...` They open that
URL on a 55-inch TV bolted above the production line. **No login.
No browser chrome. Just numbers.**

What appears on the TV:

- **The line name** in giant Bebas Neue type at the top left
- **A RUNNING / STOPPED pill** at the top right (red when stopped)
- **The current OEE number** in the center, taking up most of the
  screen, color-coded green/yellow/red
- **"LIVE OEE · TARGET 85%"** label underneath
- **When stopped: a flashing red current-stop reason and timer**
- **A side panel** with:
  - Good parts (and bad parts in red)
  - Elapsed shift time
  - Top 3 stop reasons in the last 7 days
- **A footer** with the Easy OEE logo and the current time

The page **refreshes every 10 seconds automatically** so the numbers
stay current. The timers tick smoothly between refreshes.

**Why this matters:** It turns Easy OEE from "software the boss
bought" into "the team's scoreboard." When workers can see their own
score live above the line, they perform better. It's the same
psychology as a fitness tracker. And every time someone walks past
the TV, they see your product. **It spreads inside the plant.**

Manager can rotate the token at any time if they want to revoke
public access.

---

## Languages

The entire app — **every page, every button, every label, every error
message** — is fully translated into:

- 🇨🇦🇺🇸 **English**
- 🇲🇽🇪🇸 **Spanish**
- 🇨🇦🇫🇷 **French (Canadian)**

That's roughly **200 translation keys × 3 languages = 600 strings**
fully localized. The language switcher is always visible in the top
nav (desktop and mobile), in the dashboard sidebar, on the sign-in
page, and on the operator pages.

The choice is **persisted in a cookie** so the next time the user
visits, they land in their language automatically. Server-rendered
pages read the cookie and render in the right language on the first
paint — no flash of English.

This is huge for the Canadian market because **Quebec has French-only
labor law requirements** for workplace software, and it's huge for the
US market because Spanish is the dominant shop-floor language in
many states.

---

## Everything we've built so far

This is the comprehensive list of what's actually in the product right
now, organized by area.

### Marketing site (easy-oee.com)

- **Landing page** with hero, stats bar, problem section, solution
  pills, how-it-works, features grid, social proof, pricing teaser, CTA
- **Pricing page** with line-count slider, three tiers (Starter /
  Professional / Enterprise), USD primary + CAD reference,
  comparison table, FAQ accordion
- **How it Works** explainer page
- **ROI Calculator** — interactive widget that shows how much money
  the customer is leaving on the table
- **Contact page** with demo request form (saves to database, ready
  for Resend wiring)
- **Privacy Policy** + **Terms of Service** pages
- **Sign Up flow** for the Stripe trial (currently a stub waiting
  for Stripe credentials)
- **Animated hero gauge** — pure SVG, needle revs from 0 to max,
  bounces twice, resets. Respects "reduce motion" accessibility setting
- **Mobile hamburger menu** with full-screen overlay
- **Branded favicon and Open Graph image** for link previews on
  Slack, iMessage, Twitter, LinkedIn
- **Made in Canada** branding throughout

### Operator surface

- **PIN login** at `/pin` — pick name from list, type 4-digit PIN,
  bcrypt-verified, signed HTTP-only cookie session, 12-hour TTL
- **Shift setup** at `/operator` — pick line, shift type, product,
  planned minutes, ideal rate (defaults from line)
- **Live shift screen** at `/shift/[id]` — the most important page in
  the app. Includes:
  - **Big elapsed / projected end / total stop time timers** in mono
    digits
  - **Progress bar** that turns red on overrun
  - **Live OEE estimate** updating once per second with A/P/Q
    breakdown and target delta, color-coded
  - **Pulsing red downtime card** with the live current-stop clock,
    appears the instant a stop button is tapped
  - **Long-stop note prompt** that fires automatically when a stop
    runs 10+ minutes
  - **Hand-off button** so the next operator can take over mid-shift
    with their PIN
  - **+1 / +10 parts counters** for good and bad parts
  - **10 stop reason buttons** in a glove-friendly 2-column grid
  - **End Shift button** with confirmation
- **Shift Summary** at `/shift/[id]/summary` — final report including:
  - **Action buttons up top** (Start New Shift, Dashboard) for
    one-tap navigation
  - **Big OEE number** color-coded
  - **Three component cards** for Availability / Performance / Quality
  - **Loss Tree** — stacked horizontal bar showing where every minute
    went (Good Output / Quality Loss / Speed Loss / Downtime) with
    minute totals legend
  - **Production detail table**
  - **Downtime events table** with notes
  - **CSV download** of the full shift
  - **Print or save as PDF** via browser print dialog with custom
    stylesheet
  - **Email it** action that sends the summary to any address
- **PWA manifest** so operators can "Add to Home Screen" on a tablet
  and the app launches fullscreen with no browser chrome

### Manager dashboard

- **Manager sign-in** at `/sign-in` (currently a temporary admin
  password, will be Clerk soon)
- **Dashboard** at `/dashboard`:
  - **Today's OEE** big number (average of completed shifts today)
  - **Shift Comparison cards** — Morning / Afternoon / Night 7-day
    averages, color-coded
  - **Live Shifts table** — every shift currently in progress
  - **Recent Shifts table** — last 10 completed shifts with full
    A/P/Q/OEE breakdown
  - **Pareto chart** — top stop reasons in the last 7 days, sorted
    by total minutes lost, with horizontal bars
- **Lines admin** at `/dashboard/lines`:
  - **Add a line** form (name, ideal rate, target OEE)
  - **List of lines** with inline edit
  - **TV Board panel** per line with Generate / Rotate Token + Open
- **Operators admin** at `/dashboard/operators`:
  - **Add an operator** form (name + 4-digit PIN)
  - **List of operators** with inline edit, PIN reset, deactivate
- **Shifts history** at `/dashboard/shifts`:
  - **Calendar grid** of the last 14 days × 3 shift types,
    color-coded
  - **Full shift table** — last 100 shifts with Edit links
  - **Edit Shift page** at `/dashboard/shifts/[id]/edit` — fix typos,
    correct part counts, with mandatory audit-reason field. OEE is
    recomputed automatically if the shift is already complete

### TV Board mode (the differentiator)

- **Public route** at `/board/[token]` — no login required
- **Designed for 55" displays** with `clamp()`-based responsive sizing
  that scales from a laptop preview to 4K
- **Auto-refreshes every 10 seconds** for a fresh server snapshot
- **Live timers tick smoothly** between refreshes via client clock
- **Shows live OEE, RUNNING/STOPPED status, operator, product, parts,
  elapsed time, top stops**, with an idle state when no shift is
  running

### Insights and automation

- **Loss tree math** — partitions every planned minute into Good /
  Quality / Speed / Downtime
- **Daily digest cron** — runs at 6 AM Eastern via Vercel Cron, builds
  per-company yesterday rollup with best/worst lines and top stops.
  Optional Claude AI narrative summary if `ANTHROPIC_API_KEY` is set.
  Logs today, will email via Resend once that's wired
- **Weekly anomaly scan cron** — runs Mondays at 8 AM Eastern, flags
  any line whose 7-day average OEE dropped more than 5 percentage
  points compared to the prior 4-week baseline

### Foundation that you don't see but matters

- **Multi-tenancy enforced everywhere** — every database query is
  scoped by `company_id`. Customers can never see each other's data,
  even by accident, even if a programmer makes a mistake. This is
  enforced at the lowest level of the code.
- **Bug-proof data layer** — the four bugs from the original Bubble
  prototype are now **structurally impossible**: every shift has a
  required company link, every stop has a required shift link, stop
  durations are computed by the server (not the client), and OEE is
  computed by a tested pure function in one place.
- **Auto-migrations** — every time we change the database schema, the
  next deploy automatically applies the migration before the new code
  runs. The dashboard cannot break because of a schema mismatch.
- **Continuous integration** — every commit runs typecheck, lint,
  tests, and a production build before deploying. Broken code never
  reaches production.
- **Auto-sync across machines** — the developer working copy stays
  continuously in sync between the iMac, the laptop, and GitHub via a
  background process. No manual `git pull` / `git push` needed.

---

## What's next

The product is **ready to demo to real customers right now**. The
remaining work is mostly wiring up external services and polish.

### Immediate next steps (before we charge anyone)

1. **Stripe billing** — the scaffolding is all in place. We need to
   create products in Stripe, paste the price IDs, and replace the
   501 stub endpoints with real Stripe Checkout and webhook handling.
   Schema is ready.

2. **Clerk authentication** — replace the temporary admin password
   with real manager email/password sign-in. This is the only thing
   blocking real customer pilots because right now everyone shares
   one admin password.

3. **Resend email** — replace the email-it stub on the shift summary
   page with real email sending, and turn on the automatic daily
   digest delivery (the cron is already running, it just logs
   instead of emailing right now).

### Medium-term (for the launch)

4. **Loading and error states** — proper "loading..." and "something
   went wrong" pages instead of blank screens
5. **Sentry** for error tracking so we know when things break in
   production
6. **Domain cutover** — point easy-oee.com from the old static HTML to
   the new app. (Currently the marketing site is the new app on
   easy-oee.vercel.app, but easy-oee.com still serves the old version.
   We'll cut over once we're confident.)
7. **PostHog product analytics** — see what features people actually
   use

### Phase 4 — Hardware integration

This is the big one. The schema and ingest layer are already designed
for it. We add a small device (Raspberry Pi or similar) that connects
to the machine's PLC over Wi-Fi and feeds data automatically. The
operator doesn't have to tap any buttons — the device counts parts
and detects stops in real time.

This becomes a paid upsell on top of the SaaS subscription. Hardware
margin + recurring revenue. **Everything in the database already has
a `data_source` column** (`manual` vs `device`) so the same dashboards
work for both.

### Phase 5 — Enterprise features

- Multi-plant rollup (one customer with 5 facilities sees all of them
  on one dashboard)
- Role-based access (operator / supervisor / manager / admin)
- Custom stop reason categories per company
- REST API for ERP integration
- SOC2 prep
- Operator leaderboard (gamification, manager-toggled)
- SMS / Slack alerts when a line goes down for too long

---

## Frequently asked questions

### How long does setup take for a new customer?

Less than an hour. The manager signs up, adds their production lines,
adds their operators with PINs, prints out the PIN cheat sheet, walks
it down to the shop floor. Operators can start logging shifts on the
next shift change.

### What if the wifi goes down on the shop floor?

Right now: the operator's last few taps might not save until the
connection comes back. We have **offline mode** queued for a future
release where the tablet stores everything locally and syncs when
the connection returns.

### What if an operator forgets their PIN?

The manager can reset it from the Operators admin page in two clicks.

### Can two operators be on the same machine at the same time?

No — one shift per machine at a time. But they can **hand off**
seamlessly with the new Hand-Off button. The shift continues without
resetting any timers or counters; both operators are recorded.

### What if the manager wants to fix a typo after the shift is over?

They can. There's a full **edit-shift workflow** in the manager
dashboard that requires an audit reason and recomputes OEE
automatically.

### How do I see what's happening on the shop floor without going down there?

Three ways:
1. **Dashboard** — refreshes every 10 seconds, shows live shifts
2. **TV Board** — public URL you can open on any TV in any office
3. **Shift Summary email** — the automatic digest will email you at
   6 AM with everything that happened yesterday (when Resend is wired)

### Can the operator cheat the numbers?

No. **All the math runs on the server.** The browser is just a dumb
display. When the operator taps "resume", the server calculates the
duration using its own clock. When they tap "end shift", the server
runs the OEE formula. There is no way for an operator (or a
malicious tablet) to fake a number.

### What languages does it support?

English, Spanish, and French (Canadian). The user picks their
language from a switcher in the top nav, and it persists.

### What if a customer wants their data exported?

CSV export is built into every shift summary page. PDF export uses
the browser's print dialog with a custom print stylesheet. For
bulk export, we can add a per-company "export all shifts" feature
in an afternoon.

### Is the data secure?

Yes. Multi-tenancy is enforced at the lowest level of the database
queries — every single query is scoped by `company_id`, so customers
literally cannot see each other's data even if a bug is introduced.
All passwords and PINs are bcrypt-hashed. All sessions are
cryptographically signed. All connections use HTTPS. Hosting is on
Vercel + Neon Postgres, both SOC2-compliant providers.

### How much does it cost us to run?

Almost nothing right now. Vercel is free up to a generous limit,
Neon Postgres is free for the dev branch. Once we have real
customers, we'll pay maybe $20-50/month total in infrastructure
costs to support several hundred customers. The margins are excellent.

### When can we start selling?

As soon as Stripe + Clerk are wired up. Roughly two more days of
focused work on those two integrations and we can take real money.
Everything else is in place.

---

## Quick links

- **Live app:** https://easy-oee.vercel.app
- **Sign in:** https://easy-oee.vercel.app/sign-in (password: `EasyOEE2026Admin`)
- **Operator login:** https://easy-oee.vercel.app/pin (Pierre Lavoie · PIN 1234)
- **GitHub repo:** https://github.com/cqdesignsny/easy-oee (private)
- **Domain:** easy-oee.com (still serving the old static site, will cut over soon)

---

If anything in this document is confusing or you want to dig deeper into
any feature, just ask and we'll walk through it together.

— CQ
