# Database Schema

> Source of truth: `src/db/schema.ts`. This doc is the human-readable mirror — keep it in sync.

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
