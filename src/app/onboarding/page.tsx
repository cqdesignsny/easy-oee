/**
 * Onboarding page (post-Clerk-signup).
 *
 * Clerk creates the user identity; this page collects the company-level
 * data Easy OEE needs (name, line count, plant timezone) and creates the
 * local DB rows. After insert we set the HMAC `eo_admin` cookie so all
 * the existing app code that reads it (dashboard, analytics, billing)
 * keeps working unchanged.
 *
 * If the Clerk user already has a local row, we just bounce them at the
 * dashboard — no double-creation.
 */

import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { setAdminCookie } from "@/lib/auth/admin-session";
import { OnboardingClient } from "./client";

export const metadata = { title: "Welcome to Easy OEE" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/auth/sign-in");
  }

  // If we've already onboarded this Clerk user, skip straight to the dash.
  const [existing] = await db
    .select({ id: s.user.id, companyId: s.user.companyId })
    .from(s.user)
    .where(eq(s.user.clerkUserId, userId))
    .limit(1);
  if (existing) {
    await setAdminCookie(existing.id, existing.companyId);
    redirect("/dashboard");
  }

  // Pull profile bits from Clerk to prefill the form.
  const clerkUser = await currentUser();
  const fullName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser?.username ||
    "";
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    "";

  return (
    <main className="auth-shell">
      <div className="auth-wrap">
        <OnboardingClient
          clerkUserId={userId}
          prefillName={fullName}
          prefillEmail={email}
        />
      </div>
    </main>
  );
}
