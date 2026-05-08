/**
 * POST /api/checkout/session
 *
 * Creates a Stripe Checkout Session for a logged-in manager to upgrade their
 * trial to a paid plan. Quantity = line count, so Stripe multiplies the
 * per-line price (Starter $114 CAD or Pro $177 CAD) by the lines they pick.
 *
 * Auth: requires the admin (manager) cookie. Anonymous requests are 401.
 *
 * Body: { plan: "starter" | "pro", lines: number }
 *
 * Response: { url: string } — the Stripe-hosted Checkout URL the client
 * should redirect the browser to.
 *
 * Webhook at /api/webhooks/stripe receives `checkout.session.completed`
 * and updates `company.stripe_*` + flips `subscription_status` to active.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getAdminSession } from "@/lib/auth/admin-session";
import {
  getAppUrl,
  getStripeClient,
  isStripeConfigured,
  priceIdForPlan,
} from "@/lib/stripe";
import { fitsTier, MAX_SELF_SERVE_LINES } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  plan: z.enum(["starter", "pro"]),
  lines: z.coerce.number().int().min(1).max(MAX_SELF_SERVE_LINES),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { plan, lines } = parsed.data;

  if (!fitsTier(plan, lines)) {
    return NextResponse.json(
      {
        error: "plan_capacity_exceeded",
        message: `${plan} caps at fewer lines. Pick Pro or talk to us about Enterprise.`,
      },
      { status: 400 },
    );
  }

  const priceId = priceIdForPlan(plan);
  if (!priceId) {
    return NextResponse.json(
      { error: "price_missing", message: `No price ID configured for plan ${plan}.` },
      { status: 503 },
    );
  }

  // Look up the company + manager email to prefill checkout.
  const [companyRow] = await db
    .select({
      id: s.company.id,
      name: s.company.name,
      stripeCustomerId: s.company.stripeCustomerId,
    })
    .from(s.company)
    .where(eq(s.company.id, session.companyId))
    .limit(1);
  if (!companyRow) {
    return NextResponse.json({ error: "company_not_found" }, { status: 404 });
  }

  const [managerRow] = await db
    .select({ email: s.user.email })
    .from(s.user)
    .where(eq(s.user.id, session.userId))
    .limit(1);

  const stripe = getStripeClient();

  // Reuse the existing Stripe customer if we've billed this tenant before;
  // otherwise let Checkout create one and the webhook will persist its ID.
  const customerArgs: { customer?: string; customer_email?: string } = {};
  if (companyRow.stripeCustomerId) {
    customerArgs.customer = companyRow.stripeCustomerId;
  } else if (managerRow?.email) {
    customerArgs.customer_email = managerRow.email;
  }

  const appUrl = getAppUrl();
  const successUrl = `${appUrl}/dashboard?upgraded=1`;
  const cancelUrl = `${appUrl}/dashboard/billing?canceled=1`;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...customerArgs,
    line_items: [{ price: priceId, quantity: lines }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    automatic_tax: { enabled: false },
    metadata: {
      companyId: companyRow.id,
      plan,
      lines: String(lines),
    },
    subscription_data: {
      metadata: {
        companyId: companyRow.id,
        plan,
      },
    },
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "checkout_session_no_url" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: checkoutSession.url });
}
