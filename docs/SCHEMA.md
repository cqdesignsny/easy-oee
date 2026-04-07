# Database Schema

> **Source of truth:** `src/lib/db/schema.ts` (Drizzle). This doc is the
> human-readable mirror — when in doubt, the TypeScript file wins.
>
> **2026-04-07:** Real schema collapsed `users` + `operators` into a single
> `user` table with `role` enum (`manager` | `operator`) — older sections
> below describe a 2-table model that no longer exists. Rewrite scheduled.
> All new columns added in 2026-04-07 are listed in the "Recent additions"
> section at the bottom.

## Tables

### `companies`
The tenant. One row per customer organization.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `name` | `text` not null | Display name |
| `slug` | `text` unique | URL-safe identifier |
| `plan` | `text` not null default `'trial'` | `trial` \| `starter` \| `pro` \| `enterprise` |
| `trial_ends_at` | `timestamp` | Nullable |
| `stripe_customer_id` | `text` | Phase 2 |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

### `users`
Plant managers and supervisors. Mirrors Clerk users.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `clerk_user_id` | `text` unique not null | |
| `company_id` | `uuid` FK → `companies.id` | |
| `email` | `text` not null | |
| `full_name` | `text` | |
| `role` | `text` not null | `manager` \| `supervisor` \| `admin` |
| `created_at` | `timestamp` | |

### `operators`
Shop-floor users. Auth via PIN, not Clerk.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `company_id` | `uuid` FK → `companies.id` | |
| `full_name` | `text` not null | |
| `pin_hash` | `text` not null | bcrypt of 4-digit PIN + salt |
| `active` | `boolean` not null default `true` | |
| `created_at` | `timestamp` | |

### `lines`
Production lines / machines.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `company_id` | `uuid` FK → `companies.id` | |
| `name` | `text` not null | "Machine 1", "Line A" |
| `ideal_rate` | `numeric(10,2)` not null | Parts per minute (theoretical max) |
| `active` | `boolean` not null default `true` | |
| `created_at` | `timestamp` | |

### `shifts`
A single production shift. Created on Start Shift, updated through End Shift.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `company_id` | `uuid` FK → `companies.id` | |
| `line_id` | `uuid` FK → `lines.id` | |
| `operator_id` | `uuid` FK → `operators.id` | |
| `shift_type` | `text` not null | `morning` \| `afternoon` \| `night` |
| `product` | `text` | Free-form product name |
| `planned_minutes` | `integer` not null | Scheduled production time |
| `ideal_rate` | `numeric(10,2)` not null | Snapshotted from line at shift start |
| `good_parts` | `integer` not null default `0` | |
| `bad_parts` | `integer` not null default `0` | |
| `started_at` | `timestamp` not null | |
| `ended_at` | `timestamp` | Null while in progress |
| `status` | `text` not null default `'in_progress'` | `in_progress` \| `complete` |
| `availability` | `numeric(5,4)` | 0.0000 – 1.0000, populated on End Shift |
| `performance` | `numeric(5,4)` | |
| `quality` | `numeric(5,4)` | |
| `oee` | `numeric(5,4)` | |
| `data_source` | `text` not null default `'manual'` | `manual` \| `device` (Phase 4) |
| `shift_date` | `date` not null | For reporting; derived from `started_at` |

### `stops`
A machine downtime event during a shift.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `company_id` | `uuid` FK → `companies.id` | |
| `shift_id` | `uuid` FK → `shifts.id` not null | |
| `reason` | `text` not null | Enum value, see below |
| `started_at` | `timestamp` not null | |
| `ended_at` | `timestamp` | Null while stop is active |
| `minutes` | `numeric(8,2)` | Calculated when stop closes |
| `notes` | `text` | Optional operator notes |
| `data_source` | `text` not null default `'manual'` | `manual` \| `device` (Phase 4) |

### `devices` (Phase 4 stub)
Hardware that POSTs machine data to `/api/ingest`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `company_id` | `uuid` FK → `companies.id` | |
| `line_id` | `uuid` FK → `lines.id` | |
| `name` | `text` not null | "Pi Gateway #1" |
| `api_key_hash` | `text` not null | |
| `last_seen_at` | `timestamp` | |
| `created_at` | `timestamp` | |

## Enums

### `stop_reason`
1. `mechanical_failure` — Mechanical Failure
2. `no_material` — No Material
3. `changeover` — Changeover
4. `quality_check` — Quality Check
5. `scheduled_break` — Scheduled Break
6. `no_operator` — No Operator
7. `maintenance` — Maintenance
8. `training` — Training
9. `no_production_scheduled` — No Production Scheduled
10. `other` — Other

The enum is defined as a `pgEnum` in `src/db/schema.ts` and the human labels live in `src/lib/stop-reasons.ts`.

## Indexes

- `companies(slug)` unique
- `users(clerk_user_id)` unique
- `users(company_id)`
- `operators(company_id)`
- `lines(company_id)`
- `shifts(company_id, status)` — dashboard query: active shifts for a tenant
- `shifts(company_id, shift_date)` — dashboard query: today's shifts
- `stops(shift_id)` — sum-of-minutes-by-shift query
- `stops(company_id, started_at)` — Pareto chart query

## Relationships

```
companies (1) ─┬─ (∞) users
               ├─ (∞) operators
               ├─ (∞) lines ──── (∞) devices
               ├─ (∞) shifts ─── (∞) stops
               └─ ...
```

Every non-`companies` table has `company_id` and is queried via `withTenant()`.

## Migration history

Migrations are timestamped and live in `src/db/migrations/`. Generate with:

```bash
pnpm db:generate     # creates a new migration file from schema diff
pnpm db:migrate      # applies pending migrations
```

**Never edit a migration after it's been applied.** Always generate a new one.

---

## Recent additions (2026-04-07 — Tier 1-4 batch)

| Table | Column | Type | Purpose |
|---|---|---|---|
| `company` | `timezone` | `text NOT NULL DEFAULT 'America/Toronto'` | IANA TZ for "today" boundary math |
| `line` | `target_oee` | `numeric(5,4) NOT NULL DEFAULT 0.85` | Per-line OEE goal, drives goal lines on dashboard + live shift |
| `line` | `board_token` | `text UNIQUE` | Public token for `/board/[token]` shop-floor TV view; manager rotates from `/dashboard/lines` |
| `shift` | `ending_operator_id` | `uuid REFERENCES user(id)` | Set when shift is handed off mid-run to a different operator |

To apply on Neon:

```bash
pnpm db:push   # dev shortcut, no migration file
# or properly:
pnpm db:generate && pnpm db:migrate
```

The 4 columns are all backwards-compatible (defaults / nullable), so the
deploy can ship before the migration runs without breaking reads.
