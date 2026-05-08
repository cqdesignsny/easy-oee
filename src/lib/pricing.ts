/**
 * Easy OEE pricing — single source of truth.
 *
 * Per-line model. Every plan charges a flat per-line price; lines scale
 * linearly. Both tiers ship with the same per-line operator allowance and
 * the AI Coach + Job Orders modules. Pro adds the analytics deep-dives,
 * Pareto charts, vs-target bars, and the longer history retention.
 *
 * Prices are USD primary with a CAD reference shown alongside.
 *
 * The slider on /pricing and /sign-up multiplies the per-line price by
 * the selected line count, so users see the real number for their actual
 * plant size instead of "from $83".
 */

export const USD_TO_CAD = 1.37;

/** Hard ceiling for the slider; past this it's Enterprise / custom quote. */
export const MAX_SELF_SERVE_LINES = 20;

export type PlanId = "starter" | "pro" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  /** Monthly price in USD per production line. */
  baseMonthlyUSD: number;
  /** Lines bundled into the base price. With a per-line model this is 1. */
  includedLines: number;
  /** Each line above the bundled allowance costs this much. Equal to base in
   *  the per-line model so price scales linearly. */
  extraLineUSD: number;
  /** Hard cap on lines for this tier. Above the cap the slider snaps to
   *  Enterprise. */
  maxLines: number;
  /** Per-line operator allowance. `lines * maxOperators` = total cap. */
  maxOperators: number | null;
  /** Stripe price ID. Filled in once the live products are created. */
  stripePriceId: string | null;
  /** Stripe metered price ID for extra lines, if any. */
  stripeExtraLinePriceId: string | null;
  /** Feature flag list (translation keys). */
  featureKeys: string[];
};

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    baseMonthlyUSD: 83,
    includedLines: 1,
    extraLineUSD: 83,
    maxLines: 4,
    maxOperators: 3,
    stripePriceId: null,
    stripeExtraLinePriceId: null,
    featureKeys: [
      "pricing.feature.dash",
      "pricing.feature.stops",
      "pricing.feature.reports",
      "pricing.feature.jobOrders",
      "pricing.feature.aiCoach",
      "pricing.feature.history30",
    ],
  },
  pro: {
    id: "pro",
    name: "Professional",
    baseMonthlyUSD: 129,
    includedLines: 1,
    extraLineUSD: 129,
    maxLines: MAX_SELF_SERVE_LINES,
    maxOperators: 5,
    stripePriceId: null,
    stripeExtraLinePriceId: null,
    featureKeys: [
      "pricing.feature.everythingStarter",
      "pricing.feature.compare",
      "pricing.feature.supervisor",
      "pricing.feature.csv",
      "pricing.feature.history90",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    baseMonthlyUSD: 0,
    includedLines: 0,
    extraLineUSD: 0,
    maxLines: Number.POSITIVE_INFINITY,
    maxOperators: null,
    stripePriceId: null,
    stripeExtraLinePriceId: null,
    featureKeys: [
      "pricing.feature.lines.ent",
      "pricing.feature.customStops",
      "pricing.feature.multiPlant",
      "pricing.feature.onboarding",
      "pricing.feature.sla",
      "pricing.feature.unlimitedHistory",
    ],
  },
};

export function usdToCad(usd: number): number {
  return Math.round(usd * USD_TO_CAD);
}

export function fmtUSD(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function fmtCAD(n: number): string {
  return `$${n.toLocaleString("en-CA", { maximumFractionDigits: 0 })}`;
}

/**
 * Monthly cost in USD for a given plan + line count.
 * Returns null when the line count exceeds the plan's hard cap (caller
 * should render a "Talk to us" / Enterprise CTA instead of a price).
 */
export function monthlyCostUSD(planId: PlanId, lines: number): number | null {
  const plan = PLANS[planId];
  if (planId === "enterprise") return null;
  if (lines > plan.maxLines) return null;
  const extra = Math.max(0, lines - plan.includedLines);
  return plan.baseMonthlyUSD + extra * plan.extraLineUSD;
}

/**
 * The tier that fits a given line count. Used to highlight a "Recommended"
 * badge on the pricing page and to auto-clamp the sign-up form.
 */
export function recommendedTier(lines: number): PlanId {
  if (lines <= PLANS.starter.maxLines) return "starter";
  if (lines <= PLANS.pro.maxLines) return "pro";
  return "enterprise";
}

export function fitsTier(planId: PlanId, lines: number): boolean {
  return lines <= PLANS[planId].maxLines;
}

/**
 * Operator allowance for a given line count on a tier.
 * Per-line model: each line gets the tier's per-line operator quota.
 * Returns null for Enterprise or when the line count exceeds the tier cap.
 */
export function operatorCap(planId: PlanId, lines: number): number | null {
  const plan = PLANS[planId];
  if (planId === "enterprise") return null;
  if (plan.maxOperators == null) return null;
  if (lines > plan.maxLines) return null;
  return plan.maxOperators * lines;
}

/**
 * Lines to *display* on a tier's feature card for a given slider value.
 * Floors at the tier's bundled minimum (so Pro stays at 5 below 5)
 * and caps at the tier's hard maximum.
 */
export function displayLinesForTier(planId: PlanId, lines: number): number {
  const plan = PLANS[planId];
  return Math.min(Math.max(lines, plan.includedLines), plan.maxLines);
}
