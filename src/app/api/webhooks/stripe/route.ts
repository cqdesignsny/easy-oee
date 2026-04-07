/**
 * POST /api/webhooks/stripe
 *
 * STUB. Returns 501 until Stripe is wired.
 *
 * When wired, this endpoint will:
 *   1. Verify the Stripe-Signature header against STRIPE_WEBHOOK_SECRET
 *   2. Handle these events:
 *      - checkout.session.completed → create Company + grant access
 *      - customer.subscription.updated → update plan / licensedLines
 *      - customer.subscription.deleted → mark canceled, schedule offboarding
 *      - invoice.payment_failed → flag past_due, send email
 *   3. Always return 200 to acknowledge receipt (Stripe retries on non-2xx)
 *
 * Required env vars (not yet set):
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "stripe_not_configured",
      message: "Stripe webhook receiver not yet wired.",
    },
    { status: 501 },
  );
}
