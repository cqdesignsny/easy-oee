"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { setAdminCookie } from "@/lib/auth/admin-session";
import { DEFAULT_TIMEZONE, isValidTimezone } from "@/lib/time";

export type OnboardingState = { error?: string };

const Schema = z.object({
  companyName: z.string().min(1).max(120),
  lines: z.coerce.number().int().min(1).max(50).default(2),
  timezone: z.string().max(80).optional(),
  fullName: z.string().max(120).optional(),
  email: z.string().email().optional(),
});

const TRIAL_DAYS = 7;

/**
 * Finalizes the post-Clerk-signup onboarding: creates the company + local
 * user row keyed to the Clerk user ID, sets the HMAC `eo_admin` cookie so
 * the rest of the app finds the manager, and redirects to the dashboard.
 *
 * Idempotent: if a user record already exists for this Clerk user, we just
 * set the cookie and bounce.
 */
export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "You're not signed in. Please sign in again." };
  }

  const parsed = Schema.safeParse({
    companyName: formData.get("companyName"),
    lines: formData.get("lines"),
    timezone: formData.get("timezone"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  // Check for an existing local row already mapped to this Clerk user.
  const [existing] = await db
    .select({ id: s.user.id, companyId: s.user.companyId })
    .from(s.user)
    .where(eq(s.user.clerkUserId, userId))
    .limit(1);
  if (existing) {
    await setAdminCookie(existing.id, existing.companyId);
    redirect("/dashboard");
  }

  // Generate a slug, with a small collision-retry loop.
  const baseSlug =
    parsed.data.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "company";
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const [hit] = await db
      .select({ id: s.company.id })
      .from(s.company)
      .where(eq(s.company.slug, slug))
      .limit(1);
    if (!hit) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 3600 * 1000);
  const timezone = isValidTimezone(parsed.data.timezone)
    ? parsed.data.timezone
    : DEFAULT_TIMEZONE;

  const [companyRow] = await db
    .insert(s.company)
    .values({
      name: parsed.data.companyName,
      slug,
      plan: "trial",
      trialEndsAt,
      licensedLines: parsed.data.lines,
      subscriptionStatus: "trialing",
      timezone,
    })
    .returning();

  const [userRow] = await db
    .insert(s.user)
    .values({
      companyId: companyRow.id,
      clerkUserId: userId,
      email: parsed.data.email ?? null,
      fullName: parsed.data.fullName || parsed.data.email || "Manager",
      role: "manager",
    })
    .returning();

  await setAdminCookie(userRow.id, companyRow.id);
  redirect("/dashboard");
}
