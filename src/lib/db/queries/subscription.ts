import { count, eq } from "drizzle-orm";
import { db } from "../client";
import * as s from "../schema";
import { isDemoMode } from "@/lib/auth/demo-mode";
import { PLANS } from "@/lib/pricing";

const SEED_SLUG = "maple-manufacturing";

export type AccessState =
  | { allowed: true; reason: "active" | "trialing" | "seed" | "demo" }
  | {
      allowed: false;
      reason: "expired_trial" | "canceled" | "past_due";
      trialEndsAt?: Date | null;
    };

export type CompanyAccessRow = {
  plan: string;
  subscriptionStatus: string | null;
  trialEndsAt: Date | null;
  slug: string;
};

export async function loadCompanyAccessRow(
  companyId: string,
): Promise<CompanyAccessRow | null> {
  const [row] = await db
    .select({
      plan: s.company.plan,
      subscriptionStatus: s.company.subscriptionStatus,
      trialEndsAt: s.company.trialEndsAt,
      slug: s.company.slug,
    })
    .from(s.company)
    .where(eq(s.company.id, companyId))
    .limit(1);
  return row ?? null;
}

export async function getAccessState(
  companyId: string,
): Promise<AccessState> {
  if (await isDemoMode()) return { allowed: true, reason: "demo" };
  const row = await loadCompanyAccessRow(companyId);
  if (!row) return { allowed: false, reason: "canceled" };
  if (row.slug === SEED_SLUG) return { allowed: true, reason: "seed" };

  if (row.subscriptionStatus === "active") return { allowed: true, reason: "active" };
  if (row.subscriptionStatus === "canceled") {
    return { allowed: false, reason: "canceled" };
  }
  if (row.subscriptionStatus === "past_due") {
    return { allowed: false, reason: "past_due" };
  }

  if (row.trialEndsAt && row.trialEndsAt.getTime() < Date.now()) {
    return { allowed: false, reason: "expired_trial", trialEndsAt: row.trialEndsAt };
  }
  return { allowed: true, reason: "trialing" };
}

export class SubscriptionRequiredError extends Error {
  readonly code: "expired_trial" | "canceled" | "past_due";
  constructor(code: "expired_trial" | "canceled" | "past_due", message: string) {
    super(message);
    this.name = "SubscriptionRequiredError";
    this.code = code;
  }
}

const MESSAGES: Record<"expired_trial" | "canceled" | "past_due", string> = {
  expired_trial:
    "Your trial has ended. Upgrade to continue creating shifts, lines, and operators.",
  canceled:
    "Your subscription is canceled. Renew on the billing page to keep using Easy OEE.",
  past_due:
    "Your last payment failed. Update your card on the billing page to continue.",
};

export async function requireWriteAccess(companyId: string): Promise<void> {
  const state = await getAccessState(companyId);
  if (state.allowed) return;
  throw new SubscriptionRequiredError(state.reason, MESSAGES[state.reason]);
}

// ─── Plan-limit enforcement ──────────────────────────────────────────────────

export class PlanLimitError extends Error {
  readonly kind: "line" | "operator";
  readonly cap: number;
  readonly current: number;
  constructor(kind: "line" | "operator", cap: number, current: number, message: string) {
    super(message);
    this.name = "PlanLimitError";
    this.kind = kind;
    this.cap = cap;
    this.current = current;
  }
}

type CompanyPlanRow = {
  plan: string;
  subscriptionStatus: string | null;
  licensedLines: number;
  slug: string;
};

async function loadCompanyPlanRow(
  companyId: string,
): Promise<CompanyPlanRow | null> {
  const [row] = await db
    .select({
      plan: s.company.plan,
      subscriptionStatus: s.company.subscriptionStatus,
      licensedLines: s.company.licensedLines,
      slug: s.company.slug,
    })
    .from(s.company)
    .where(eq(s.company.id, companyId))
    .limit(1);
  return row ?? null;
}

export type PlanCaps = {
  lineCap: number;
  operatorCap: number;
};

/**
 * Effective caps for a company. Generous during trial (Pro caps) so users can
 * build out their plant during the 7 days. Once active, tied to licensedLines
 * and the chosen plan's per-line operator allowance.
 */
export function effectiveCaps(row: CompanyPlanRow): PlanCaps {
  // Seed and demo paths bypass — both go through getAccessState first.
  if (row.subscriptionStatus === "active") {
    const plan = PLANS[row.plan as keyof typeof PLANS] ?? PLANS.pro;
    const operatorPerLine = plan.maxOperators ?? Infinity;
    return {
      lineCap: row.licensedLines,
      operatorCap: row.licensedLines * operatorPerLine,
    };
  }
  // Trial or unset — give them Pro caps to experiment.
  const pro = PLANS.pro;
  return {
    lineCap: pro.maxLines,
    operatorCap: pro.maxLines * (pro.maxOperators ?? 5),
  };
}

async function getActiveLineCount(companyId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(s.line)
    .where(eq(s.line.companyId, companyId));
  return Number(row?.n ?? 0);
}

async function getActiveOperatorCount(companyId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(s.user)
    .where(eq(s.user.companyId, companyId));
  return Number(row?.n ?? 0);
}

export async function requireLineCapacity(
  companyId: string,
  adding: number = 1,
): Promise<void> {
  if (await isDemoMode()) return;
  const row = await loadCompanyPlanRow(companyId);
  if (!row) return;
  if (row.slug === SEED_SLUG) return;
  const { lineCap } = effectiveCaps(row);
  if (lineCap === Infinity) return;
  const current = await getActiveLineCount(companyId);
  if (current + adding > lineCap) {
    const isTrial = row.subscriptionStatus !== "active";
    const message = isTrial
      ? `Trial accounts cap at ${lineCap} lines. Subscribe to add more.`
      : `Your plan covers ${lineCap} line${lineCap === 1 ? "" : "s"}. Increase your line count on the billing page to add more.`;
    throw new PlanLimitError("line", lineCap, current, message);
  }
}

export async function requireOperatorCapacity(
  companyId: string,
  adding: number = 1,
): Promise<void> {
  if (await isDemoMode()) return;
  const row = await loadCompanyPlanRow(companyId);
  if (!row) return;
  if (row.slug === SEED_SLUG) return;
  const { operatorCap } = effectiveCaps(row);
  if (operatorCap === Infinity) return;
  const current = await getActiveOperatorCount(companyId);
  if (current + adding > operatorCap) {
    const isTrial = row.subscriptionStatus !== "active";
    const message = isTrial
      ? `Trial accounts cap at ${operatorCap} operators. Subscribe to add more.`
      : `Your plan covers ${operatorCap} operator${operatorCap === 1 ? "" : "s"} for ${row.licensedLines} line${row.licensedLines === 1 ? "" : "s"}. Add more lines on the billing page to grow the operator pool.`;
    throw new PlanLimitError("operator", operatorCap, current, message);
  }
}
