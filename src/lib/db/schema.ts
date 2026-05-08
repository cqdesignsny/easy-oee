/**
 * Drizzle schema — single source of truth for the database.
 *
 * Conventions:
 * - All tables have `company_id` (except `company` itself)
 * - All times are `timestamptz`
 * - All percentages stored as `numeric` decimals 0–1, never as percents
 * - All money in cents (when we add Stripe)
 *
 * After editing this file:
 *   pnpm db:generate   # creates a migration
 *   pnpm db:push       # (dev only) pushes directly without a migration
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { STOP_REASON_VALUES } from "@/lib/stop-reasons";

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["manager", "operator"]);
export const shiftTypeEnum = pgEnum("shift_type", ["morning", "afternoon", "night"]);
export const shiftStatusEnum = pgEnum("shift_status", ["in_progress", "complete"]);
export const dataSourceEnum = pgEnum("data_source", ["manual", "device"]);
export const stopReasonEnum = pgEnum("stop_reason", STOP_REASON_VALUES);
export const planEnum = pgEnum("plan", ["trial", "starter", "pro", "enterprise"]);

// ─────────────────────────────────────────────────────────────────────────────
// Companies
// ─────────────────────────────────────────────────────────────────────────────

export const company = pgTable("company", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: planEnum("plan").notNull().default("trial"),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  // Stripe billing — populated after the user completes Stripe Checkout.
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  // Number of licensed production lines (drives Stripe quantity / overage).
  licensedLines: integer("licensed_lines").notNull().default(1),
  subscriptionStatus: text("subscription_status"), // trialing | active | past_due | canceled
  /** IANA timezone string (e.g. "America/Toronto"). Drives "today" boundaries. */
  timezone: text("timezone").notNull().default("America/Toronto"),
  /** Latest AI Coach analysis as JSON. Refreshed weekly by the cron or
   *  on-demand by the manager. Includes the action plans + their statuses. */
  aiCoachReport: text("ai_coach_report"),
  aiCoachGeneratedAt: timestamp("ai_coach_generated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Users (managers via Clerk + operators via PIN)
// ─────────────────────────────────────────────────────────────────────────────

export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    clerkUserId: text("clerk_user_id").unique(),
    email: text("email"),
    fullName: text("full_name").notNull(),
    role: userRoleEnum("role").notNull(),
    /** bcrypt hash of the operator's 4-digit PIN. Null for managers. */
    pinHash: text("pin_hash"),
    /** bcrypt hash of the manager's password. Null for operators. */
    passwordHash: text("password_hash"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byCompany: index("user_by_company").on(t.companyId),
    byClerk: index("user_by_clerk").on(t.clerkUserId),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Lines (production lines / machines)
// ─────────────────────────────────────────────────────────────────────────────

export const line = pgTable(
  "line",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Theoretical max parts per minute */
    idealRate: numeric("ideal_rate", { precision: 10, scale: 2 }).notNull(),
    /** Manager-set OEE target (0–1 decimal). Drives goal line on dashboard + live shift. */
    targetOee: numeric("target_oee", { precision: 5, scale: 4 }).notNull().default("0.85"),
    /** Optional public board token for the shop floor TV view (no login). */
    boardToken: text("board_token").unique(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byCompany: index("line_by_company").on(t.companyId),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Shifts
// ─────────────────────────────────────────────────────────────────────────────

export const shift = pgTable(
  "shift",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    lineId: uuid("line_id")
      .notNull()
      .references(() => line.id),
    operatorId: uuid("operator_id")
      .notNull()
      .references(() => user.id),
    /** If a different operator finished the shift via hand-off, recorded here. */
    endingOperatorId: uuid("ending_operator_id").references(() => user.id),
    shiftType: shiftTypeEnum("shift_type").notNull(),
    product: text("product").notNull(),
    /** Optional job/work-order number. Operators scan from the work ticket
     *  on the shop floor; managers can enter or edit it from the dashboard. */
    jobNumber: text("job_number"),
    plannedMinutes: integer("planned_minutes").notNull(),
    /** Snapshotted from line.idealRate at shift start so it can't change mid-shift */
    idealRate: numeric("ideal_rate", { precision: 10, scale: 2 }).notNull(),
    goodParts: integer("good_parts").notNull().default(0),
    badParts: integer("bad_parts").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    status: shiftStatusEnum("status").notNull().default("in_progress"),
    // Computed at end-of-shift; nullable while in progress.
    availability: numeric("availability", { precision: 5, scale: 4 }),
    performance: numeric("performance", { precision: 5, scale: 4 }),
    quality: numeric("quality", { precision: 5, scale: 4 }),
    oee: numeric("oee", { precision: 5, scale: 4 }),
    dataSource: dataSourceEnum("data_source").notNull().default("manual"),
    shiftDate: date("shift_date").notNull(),
  },
  (t) => ({
    byCompanyStatus: index("shift_by_company_status").on(t.companyId, t.status),
    byCompanyDate: index("shift_by_company_date").on(t.companyId, t.shiftDate),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Stops (downtime events)
// ─────────────────────────────────────────────────────────────────────────────

export const stop = pgTable(
  "stop",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    shiftId: uuid("shift_id")
      .notNull()
      .references(() => shift.id, { onDelete: "cascade" }),
    reason: stopReasonEnum("reason").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    /** Duration in minutes; computed server-side when the stop is closed. */
    minutes: numeric("minutes", { precision: 8, scale: 2 }),
    notes: text("notes"),
    dataSource: dataSourceEnum("data_source").notNull().default("manual"),
  },
  (t) => ({
    byShift: index("stop_by_shift").on(t.shiftId),
    byCompanyStarted: index("stop_by_company_started").on(t.companyId, t.startedAt),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Devices (Phase 4 stub — hardware ingest)
// ─────────────────────────────────────────────────────────────────────────────

export const device = pgTable(
  "device",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    lineId: uuid("line_id")
      .notNull()
      .references(() => line.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    apiKeyHash: text("api_key_hash").notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byCompany: index("device_by_company").on(t.companyId),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Demo leads (from the marketing /contact form)
// ─────────────────────────────────────────────────────────────────────────────

export const demoLead = pgTable("demo_lead", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  companyName: text("company_name").notNull(),
  province: text("province"),
  numLines: text("num_lines"),
  currentMethod: text("current_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────────────────────────

export const companyRelations = relations(company, ({ many }) => ({
  users: many(user),
  lines: many(line),
  shifts: many(shift),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  company: one(company, { fields: [user.companyId], references: [company.id] }),
  shifts: many(shift),
}));

export const lineRelations = relations(line, ({ one, many }) => ({
  company: one(company, { fields: [line.companyId], references: [company.id] }),
  shifts: many(shift),
  devices: many(device),
}));

export const shiftRelations = relations(shift, ({ one, many }) => ({
  company: one(company, { fields: [shift.companyId], references: [company.id] }),
  line: one(line, { fields: [shift.lineId], references: [line.id] }),
  operator: one(user, { fields: [shift.operatorId], references: [user.id] }),
  stops: many(stop),
}));

export const stopRelations = relations(stop, ({ one }) => ({
  company: one(company, { fields: [stop.companyId], references: [company.id] }),
  shift: one(shift, { fields: [stop.shiftId], references: [shift.id] }),
}));
