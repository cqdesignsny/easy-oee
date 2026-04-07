# Architecture

## Stack decisions

| Concern    | Choice                            | Why                                                                                              |
|------------|-----------------------------------|--------------------------------------------------------------------------------------------------|
| Framework  | Next.js 16 App Router             | Server Components, Server Actions, edge-ready, best-in-class on Vercel                          |
| Language   | TypeScript (strict)               | Catch bugs at compile time; OEE math has too many divisions to YOLO                              |
| Styling    | Tailwind + shadcn/ui              | Speed + accessible primitives + matches the industrial dark aesthetic                            |
| Database   | Neon Postgres (Vercel Marketplace)| Real Postgres, branching for previews, auto-provisioned env vars, generous free tier            |
| ORM        | Drizzle                           | TS-first, SQL-like, no codegen step, fast                                                        |
| Auth       | Clerk + custom operator PINs      | Managers get full Clerk; operators tap-to-login on shared tablets via a custom PIN flow         |
| Validation | Zod                               | Runtime safety at server-action boundaries                                                       |
| Payments   | Stripe (post-prototype)           | Standard, well-supported on Vercel                                                               |
| Hosting    | Vercel                            | Zero-config Next.js + Neon + previews + analytics                                                |
| Repo       | GitHub (private)                  | Source of truth, CI via Vercel                                                                   |
| PM tools   | pnpm                              | Faster, smaller node_modules                                                                     |

## Folder layout

```
easy-oee/
├── app/
│   ├── (marketing)/        # Public site — ported from /index.html etc.
│   │   ├── page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── contact/page.tsx
│   │   └── layout.tsx
│   ├── (app)/              # Authenticated app — manager + operator
│   │   ├── dashboard/
│   │   ├── shifts/
│   │   ├── shift/
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       └── summary/
│   │   ├── lines/
│   │   ├── team/
│   │   └── layout.tsx
│   ├── login/page.tsx
│   ├── operator-login/page.tsx
│   ├── api/
│   │   └── ingest/route.ts # Future device ingest
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn primitives
│   ├── marketing/
│   ├── operator/
│   └── manager/
├── lib/
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema — source of truth
│   │   ├── client.ts       # Neon connection
│   │   ├── scoped.ts       # company_id-scoped query helpers
│   │   └── queries/
│   ├── auth/
│   │   ├── clerk.ts
│   │   └── operator-session.ts
│   ├── oee.ts              # The OEE math, single source of truth
│   └── utils.ts
├── docs/                   # All project documentation
├── public/
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Data model

Drizzle schema (excerpt — full version in `lib/db/schema.ts`):

```ts
export const company = pgTable("company", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  plan: text("plan").default("trial").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => company.id).notNull(),
  clerkId: text("clerk_id").unique(),                  // null for operators
  email: text("email"),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["manager", "operator"] }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const operatorPin = pgTable("operator_pin", {
  userId: uuid("user_id").primaryKey().references(() => user.id),
  pinHash: text("pin_hash").notNull(),                 // bcrypt or argon2
});

export const line = pgTable("line", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => company.id).notNull(),
  name: text("name").notNull(),
  idealRate: numeric("ideal_rate").notNull(),          // parts per minute
  active: boolean("active").default(true).notNull(),
});

export const shift = pgTable("shift", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => company.id).notNull(),
  lineId: uuid("line_id").references(() => line.id).notNull(),
  operatorId: uuid("operator_id").references(() => user.id).notNull(),
  shiftType: text("shift_type", { enum: ["Morning", "Afternoon", "Night"] }).notNull(),
  product: text("product").notNull(),
  plannedMinutes: integer("planned_minutes").notNull(),
  idealRate: numeric("ideal_rate").notNull(),
  goodParts: integer("good_parts").default(0).notNull(),
  badParts: integer("bad_parts").default(0).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  status: text("status", { enum: ["in_progress", "complete"] }).default("in_progress").notNull(),
  // Computed at end:
  availability: numeric("availability"),
  performance: numeric("performance"),
  quality: numeric("quality"),
  oee: numeric("oee"),
  dataSource: text("data_source", { enum: ["manual", "device"] }).default("manual").notNull(),
});

export const stop = pgTable("stop", {
  id: uuid("id").primaryKey().defaultRandom(),
  shiftId: uuid("shift_id").references(() => shift.id, { onDelete: "cascade" }).notNull(),
  companyId: uuid("company_id").references(() => company.id).notNull(),
  reason: text("reason").notNull(),                    // enum value
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  minutes: numeric("minutes"),                         // computed on close
  notes: text("notes"),
});
```

## Multi-tenancy

Every request derives `currentCompanyId` from the session (Clerk for managers, operator session cookie for operators). All Drizzle queries that touch tenant data go through `lib/db/scoped.ts` helpers that auto-inject `where company_id = $1`. The client never sends `companyId`. Tested by trying to query another company's shift and asserting it returns null.

## Auth flows

**Managers** — Clerk handles signup, login, password reset, MFA. On first signup, we create a `company` row + `user` row in a webhook. The Clerk `userId` maps to `user.clerkId`.

**Operators** — A manager creates an operator account from `/team` and assigns a 4-digit PIN. On `/operator-login`, the operator picks their name from a list scoped to the current tablet's company (we set the company on tablet pairing) and enters the PIN. We hash with argon2, set an HTTP-only session cookie scoped to the operator's `userId` + `companyId`, valid for the shift duration.

## OEE calculation

Single source of truth: `lib/oee.ts`. Pure function, no side effects, fully unit-tested.

```ts
type OEEInput = {
  plannedMinutes: number;
  stopMinutes: number;
  goodParts: number;
  badParts: number;
  idealRate: number; // parts/min
};

type OEEResult = {
  availability: number | null;
  performance: number | null;
  quality: number | null;
  oee: number | null;
  runTimeMinutes: number;
  totalParts: number;
};

export function computeOEE(i: OEEInput): OEEResult { /* ... */ }
```

Edge cases (planned=0, parts=0, idealRate=0) return `null` for the affected component, never `NaN` or `Infinity`.

## Server actions over API routes

Mutations are Server Actions colocated with the page that triggers them. The only API route is `/api/ingest` for the future hardware path (REST + API key, not Server Action). Webhooks (Clerk, Stripe) are also API routes.

## Deployment

- **GitHub** — private repo, source of truth
- **Vercel** — connected to the repo, every push is a preview deploy, `main` is production
- **Neon** — provisioned via Vercel Marketplace, branched per preview deploy automatically
- **Clerk** — keys in Vercel env vars, separate dev/prod instances
- **Domain** — `easy-oee.com` apex on Vercel for everything (no separate marketing host)

## Decisions to revisit

- Webhook handling library (svix vs raw)
- Email provider (Resend vs Loops vs Postmark) — needed for shift summaries + demo requests
- Background jobs (Vercel Cron + Inngest? Trigger.dev?) — needed when we add daily reports
- Charts library (Recharts vs Tremor vs custom SVG) — manager dashboard
