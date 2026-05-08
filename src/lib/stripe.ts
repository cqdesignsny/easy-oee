/**
 * Stripe client and helpers.
 *
 * Live products live on Louis's "Easy OEE Pro" account in CAD:
 *   - Starter: prod_USTXDevruGiPuZ → STRIPE_PRICE_STARTER (recurring CAD/mo)
 *   - Pro:     prod_USTY4LDOz36r6W → STRIPE_PRICE_PRO     (recurring CAD/mo)
 *
 * Both prices are licensed-quantity, so we pass `quantity: lineCount` on the
 * checkout session and Stripe multiplies the per-line rate by the number of
 * lines automatically.
 *
 * The pricing.ts module remains the single source of truth for marketing-side
 * USD/CAD display math; this file only deals with the Stripe-side IDs.
 */

import Stripe from "stripe";
import type { PlanId } from "./pricing";

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cachedClient) return cachedClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it in Vercel env or your .env.local before calling Stripe.",
    );
  }
  cachedClient = new Stripe(key, {
    typescript: true,
  });
  return cachedClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_STARTER &&
      process.env.STRIPE_PRICE_PRO,
  );
}

/** Resolve the recurring Stripe price ID for a given plan. */
export function priceIdForPlan(plan: PlanId): string | null {
  if (plan === "starter") return process.env.STRIPE_PRICE_STARTER ?? null;
  if (plan === "pro") return process.env.STRIPE_PRICE_PRO ?? null;
  return null; // enterprise — handled separately, not self-serve
}

/** App URL for building absolute success / cancel URLs in Checkout Sessions. */
export function getAppUrl(): string {
  // Prefer explicit override; fall back to Vercel's URL or localhost.
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000")
  );
}
