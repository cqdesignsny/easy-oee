/**
 * Easy OEE pricing — single source of truth.
 *
 * Prices are in USD. CAD is shown as a converted reference.
 *
 * The slider on /pricing and /sign-up drives a real per-line scale:
 * - Starter scales 1→4 lines: $49 base + $34 per extra line.
 *   By 4 lines you're at $151 — making Pro at $129 the obvious upsell.
 * - Pro is flat $129 for 5 lines, then $30 per extra line up to 20.
 *   Past 20, it's a custom Enterprise quote.
 *
 * The per-line surcharge isn't shown as a "+$X/line" line on the cards —
 * the slider just makes the price react. Users see the real number for
 * their actual line count instead of "from $49".
 */

export const USD_TO_CAD = 1.37;

/** Hard ceiling for the slider; past this it's Enterprise / custom quote. */
export const MAX_SELF_SERVE_LINES = 20;

export type PlanId = "starter" | "pro" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  /** Monthly price in USD at `includedLines`. */
  baseMonthlyUSD: number;
  /** Lines included in the base price. */
  includedLines: number;
  /** Per-line surcharge above the included allowance, USD/month. */
  extraLineUSD: number;
  /** Hard cap on lines for this tier. Sliding past forces the next tier up. */
  maxLines: number;
  /** Up to N operators included. null = unlimited. */
  maxOperators: number | null;
  /** Stripe price ID — fill in after creating the product in Stripe. */
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
    baseMonthlyUSD: 49,
    includedLines: 1,
    extraLineUSD: 34,
    maxLines: 4,
    maxOperators: 3,
    stripePriceId: null,
    stripeExtraLinePriceId: null,
    featureKeys: [
      "pricing.feature.stops",
      "pricing.feature.dash",
      "pricing.feature.reports",
      "pricing.feature.history30",
    ],
  },
  pro: {
    id: "pro",
    name: "Professional",
    baseMonthlyUSD: 129,
    includedLines: 5,
    extraLineUSD: 30,
    maxLines: MAX_SELF_SERVE_LINES,
    maxOperators: 15,
    stripePriceId: null,
    stripeExtraLinePriceId: null,
    featureKeys: [
      "pricing.feature.compare",
      "pricing.feature.supervisor",
      "pricing.feature.csv",
      "pricing.feature.history90",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    baseMonthlyUSD: 0, // custom quote
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
 * Each extra line above the tier's bundled minimum adds 2 operators on
 * top of the base cap (so Pro at 5 lines = 15 ops, 6 = 17, ..., 20 = 45).
 * Returns null for Enterprise or when the line count exceeds the tier cap.
 */
export function operatorCap(planId: PlanId, lines: number): number | null {
  const plan = PLANS[planId];
  if (planId === "enterprise") return null;
  if (plan.maxOperators == null) return null;
  if (lines > plan.maxLines) return null;
  const extra = Math.max(0, lines - plan.includedLines);
  return plan.maxOperators + extra * 2;
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
