import { eq } from "drizzle-orm";
import { db } from "../client";
import * as s from "../schema";
import { isDemoMode } from "@/lib/auth/demo-mode";

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
