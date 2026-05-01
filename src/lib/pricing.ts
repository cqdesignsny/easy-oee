/**
 * Easy OEE pricing — single source of truth.
 *
 * Prices are in USD (the canonical currency for the SaaS). CAD is shown as
 * a converted reference for Canadian customers. The rate is updated monthly
 * by hand; if you wire a live FX feed later, swap USD_TO_CAD with that.
 *
 * Each tier has a Stripe price ID slot. Fill these in after you create the
 * products + prices in your Stripe dashboard. Until then the sign-up flow
 * shows the price card and a "Coming soon" checkout placeholder.
 */

export const USD_TO_CAD = 1.37;

export type PlanId = "starter" | "pro" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  /** Monthly price in USD (per-account, includes the bundled line allowance). */
  baseMonthlyUSD: number;
  /** Lines included in the base price. */
  includedLines: number;
  /** Per-line surcharge above the included allowance, USD/month. */
  extraLineUSD: number;
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
    extraLineUSD: 0,
    maxOperators: 3,
    stripePriceId: null,
    stripeExtraLinePriceId: null,
    featureKeys: [
      "pricing.feature.lines.starter",
      "pricing.feature.ops.starter",
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
    extraLineUSD: 0,
    maxOperators: 15,
    stripePriceId: null,
    stripeExtraLinePriceId: null,
    featureKeys: [
      "pricing.feature.lines.pro",
      "pricing.feature.ops.pro",
      "pricing.feature.compare",
      "pricing.feature.supervisor",
      "pricing.feature.csv",
      "pricing.feature.history90",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    baseMonthlyUSD: 0, // custom
    includedLines: 0,
    extraLineUSD: 0,
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
 * Compute monthly cost for a plan + line count.
 * Returns USD; CAD is derived via usdToCad().
 *
 * Starter and Pro are flat-priced — anyone needing more than the included
 * lines goes to Enterprise. There is no per-line surcharge. The lines
 * argument is kept in the signature so callers (the sign-up slider, the
 * pricing card) can keep their existing call sites; it has no effect today.
 */
export function monthlyCostUSD(planId: PlanId, lines: number): number {
  const plan = PLANS[planId];
  if (planId === "enterprise") return 0;
  void lines;
  return plan.baseMonthlyUSD;
}
