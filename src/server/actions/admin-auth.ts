"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import {
  setAdminCookie,
  clearAdminCookie,
  verifyAdminPassword,
} from "@/lib/auth/admin-session";
import { DEFAULT_TIMEZONE, isValidTimezone } from "@/lib/time";

export type AdminSignInState =
  | { error: string }
  | { ok: true; redirect: string }
  | Record<string, never>;
export type SignUpState = { error?: string; ok?: boolean };

const SignInSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

/**
 * Manager sign-in via legacy HMAC bcrypt. Called by the branded /sign-in
 * page when Clerk reports the email doesn't exist there yet (existing
 * trial users). On a successful bcrypt match we ALSO migrate the user
 * to Clerk in the background (eager invisible migration) so the next
 * sign-in goes through Clerk natively.
 *
 * Returns either `{ ok, redirect }` or `{ error }` — the client decides
 * what to do. No `redirect()` thrown here so the action can be called
 * from a regular client handler, not just `useActionState`.
 */
export async function signInAdmin(
  _prev: AdminSignInState,
  formData: FormData,
): Promise<AdminSignInState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  // 1. Real per-company login: lookup user by email
  const [u] = await db
    .select()
    .from(s.user)
    .where(and(eq(s.user.email, parsed.data.email), eq(s.user.role, "manager"), eq(s.user.active, true)))
    .limit(1);

  if (u && u.passwordHash && (await bcrypt.compare(parsed.data.password, u.passwordHash))) {
    // Eager migration to Clerk if this user hasn't been linked yet.
    // Best-effort: failure to migrate must not block sign-in.
    if (!u.clerkUserId) {
      await migrateUserToClerk(u.id, parsed.data.email, parsed.data.password, u.fullName);
    }
    await setAdminCookie(u.id, u.companyId);
    return { ok: true, redirect: "/dashboard" };
  }

  // 2. Legacy fallback: shared ADMIN_PASSWORD env var → seed tenant manager
  if (verifyAdminPassword(parsed.data.password)) {
    const [seedManager] = await db
      .select({ id: s.user.id, companyId: s.user.companyId })
      .from(s.user)
      .innerJoin(s.company, eq(s.company.id, s.user.companyId))
      .where(
        and(
          eq(s.company.slug, "maple-manufacturing"),
          eq(s.user.role, "manager"),
          eq(s.user.active, true),
        ),
      )
      .limit(1);
    if (seedManager) {
      await setAdminCookie(seedManager.id, seedManager.companyId);
      return { ok: true, redirect: "/dashboard" };
    }
  }

  return { error: "Wrong email or password." };
}

async function migrateUserToClerk(
  localUserId: string,
  email: string,
  password: string,
  fullName: string,
): Promise<void> {
  try {
    const cc = await clerkClient();
    const [firstName, ...rest] = fullName.split(" ");
    const clerkUser = await cc.users.createUser({
      emailAddress: [email],
      password,
      firstName: firstName || undefined,
      lastName: rest.join(" ") || undefined,
      publicMetadata: { migratedFromHmac: true },
    });
    await db
      .update(s.user)
      .set({ clerkUserId: clerkUser.id })
      .where(eq(s.user.id, localUserId));
  } catch (err) {
    console.warn("[admin-auth] Clerk eager migration skipped", {
      localUserId,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function signOutAdmin() {
  await clearAdminCookie();
  redirect("/sign-in");
}

const SignUpSchema = z.object({
  companyName: z.string().min(1).max(120),
  fullName: z.string().min(1).max(120),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  plan: z.enum(["starter", "pro"]).default("pro"),
  lines: z.coerce.number().int().min(1).max(50).default(2),
  timezone: z.string().max(80).optional(),
});

const TRIAL_DAYS = 7;

/**
 * Self-serve signup: creates a new company + manager user, sets the admin
 * cookie, and lands on the dashboard with a 7-day trial. No credit card.
 */
export async function signUpManager(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsed = SignUpSchema.safeParse({
    companyName: formData.get("companyName"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    plan: formData.get("plan"),
    lines: formData.get("lines"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Reject duplicate emails
  const [existing] = await db
    .select({ id: s.user.id })
    .from(s.user)
    .where(eq(s.user.email, parsed.data.email))
    .limit(1);
  if (existing) {
    return { error: "An account with that email already exists. Try signing in instead." };
  }

  // Slug: lowercase, dashed, suffix with a 4-char id if collision
  const baseSlug = parsed.data.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "company";
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const [hit] = await db.select({ id: s.company.id }).from(s.company).where(eq(s.company.slug, slug)).limit(1);
    if (!hit) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 3600 * 1000);
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
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
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      role: "manager",
      passwordHash,
    })
    .returning();

  await setAdminCookie(userRow.id, companyRow.id);
  redirect("/dashboard");
}
