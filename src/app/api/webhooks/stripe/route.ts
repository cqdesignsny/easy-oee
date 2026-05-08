/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe webhook events and updates the company table accordingly.
 *
 * Events handled:
 *   - checkout.session.completed     → first paid signup; persist customer +
 *                                       subscription + clear trial
 *   - customer.subscription.updated  → plan / quantity / status changes
 *   - customer.subscription.deleted  → mark canceled
 *   - invoice.payment_failed         → mark past_due
 *
 * Always returns 200 once the signature is valid. Stripe retries any non-2xx
 * response with exponential backoff up to 3 days, so a stale 500 response
 * would mean the same event hits us repeatedly.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   STRIPE_PRICE_STARTER
 *   STRIPE_PRICE_PRO
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getStripeClient } from "@/lib/stripe";
import type { PlanId } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function planFromPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return null;
}

/** Extract `companyId` from Stripe metadata, with subscription metadata as
 *  a fallback (Checkout Session metadata does not propagate to the
 *  Subscription object automatically — we set both for safety). */
function getCompanyIdFromMetadata(
  ...candidates: Array<{ companyId?: string } | null | undefined>
): string | null {
  for (const meta of candidates) {
    if (meta?.companyId) return meta.companyId;
  }
  return null;
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const companyId = getCompanyIdFromMetadata(
    session.metadata as { companyId?: string } | null,
  );
  if (!companyId) {
    console.warn("stripe webhook: checkout.session.completed without companyId metadata", session.id);
    return;
  }
  if (!session.subscription) {
    console.warn("stripe webhook: checkout.session.completed with no subscription", session.id);
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription.id;
  const customerId =
    typeof session.customer === "string" ? session.customer ?? null : session.customer?.id ?? null;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  const priceId = item?.price?.id ?? null;
  const quantity = item?.quantity ?? 1;
  const plan = planFromPriceId(priceId);

  await db
    .update(s.company)
    .set({
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      licensedLines: quantity,
      subscriptionStatus: subscription.status,
      plan: plan ?? "trial",
      trialEndsAt: null,
      updatedAt: new Date(),
    })
    .where(eq(s.company.id, companyId));
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const companyId = getCompanyIdFromMetadata(
    subscription.metadata as { companyId?: string } | null,
  );
  if (!companyId) {
    // Fallback: try matching by subscription ID we recorded earlier.
    const [row] = await db
      .select({ id: s.company.id })
      .from(s.company)
      .where(eq(s.company.stripeSubscriptionId, subscription.id))
      .limit(1);
    if (!row) {
      console.warn("stripe webhook: subscription.updated without companyId", subscription.id);
      return;
    }
    return updateSubscriptionRow(row.id, subscription);
  }
  return updateSubscriptionRow(companyId, subscription);
}

async function updateSubscriptionRow(
  companyId: string,
  subscription: Stripe.Subscription,
) {
  const item = subscription.items.data[0];
  const priceId = item?.price?.id ?? null;
  const quantity = item?.quantity ?? 1;
  const plan = planFromPriceId(priceId);

  await db
    .update(s.company)
    .set({
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      licensedLines: quantity,
      subscriptionStatus: subscription.status,
      ...(plan ? { plan } : {}),
      updatedAt: new Date(),
    })
    .where(eq(s.company.id, companyId));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const companyId =
    getCompanyIdFromMetadata(subscription.metadata as { companyId?: string } | null) ??
    (await db
      .select({ id: s.company.id })
      .from(s.company)
      .where(eq(s.company.stripeSubscriptionId, subscription.id))
      .limit(1)
      .then((rows) => rows[0]?.id ?? null));
  if (!companyId) return;

  await db
    .update(s.company)
    .set({
      subscriptionStatus: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(s.company.id, companyId));
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionField = (invoice as unknown as { subscription?: string | Stripe.Subscription }).subscription;
  const subscriptionId =
    typeof subscriptionField === "string"
      ? subscriptionField
      : subscriptionField?.id ?? null;
  if (!subscriptionId) return;

  const [row] = await db
    .select({ id: s.company.id })
    .from(s.company)
    .where(eq(s.company.stripeSubscriptionId, subscriptionId))
    .limit(1);
  if (!row) return;

  await db
    .update(s.company)
    .set({
      subscriptionStatus: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(s.company.id, row.id));
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "missing_signature_or_secret" },
      { status: 400 },
    );
  }

  // Need raw body for signature verification — read once, never parse first.
  const rawBody = await req.text();

  const stripe = getStripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("stripe webhook: signature verification failed", msg);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        // Other events are silently acknowledged. Stripe sends a lot — we
        // only care about the subscription lifecycle.
        break;
    }
  } catch (err) {
    console.error("stripe webhook: handler failed for", event.type, err);
    // Return 500 so Stripe retries with backoff. Idempotent updates
    // (we always overwrite the same fields) make retries safe.
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
