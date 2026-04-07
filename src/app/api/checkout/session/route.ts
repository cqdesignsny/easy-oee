/**
 * POST /api/checkout/session
 *
 * STUB. Returns 501 until Stripe is wired.
 *
 * When wired, this endpoint will:
 *   1. Read { plan, lines, companyName, email } from the request body
 *   2. Look up the matching Stripe price ID from src/lib/pricing.ts
 *   3. Create a Stripe Customer (or look up existing one)
 *   4. Create a Stripe Checkout Session in subscription mode with quantity = lines
 *   5. Return { url } pointing to the Stripe-hosted checkout page
 *
 * The Stripe webhook at /api/webhooks/stripe will then create the Company
 * row and grant access on `checkout.session.completed`.
 *
 * Required env vars (not yet set):
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "stripe_not_configured",
      message:
        "Stripe checkout is not yet wired. Add STRIPE_SECRET_KEY + product price IDs to enable.",
    },
    { status: 501 },
  );
}
