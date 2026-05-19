/**
 * Bridge route between Clerk-managed sign-in and the rest of the app.
 *
 * Lookup order:
 *   1. Match `user.clerk_user_id` to the Clerk session userId.
 *   2. Fallback: match `user.email` (lowercased) to the Clerk session's
 *      primary verified email. If found, link the row by writing
 *      `clerk_user_id` so step 1 catches it next time. This lets existing
 *      trial users sign in with Google/Microsoft without creating a
 *      duplicate company.
 *   3. Still nothing → redirect to /onboarding so the user creates a
 *      company.
 *
 * The HMAC cookie keeps every existing server component and action
 * (`getAdminSession()` everywhere) working without modification.
 */

import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { setAdminCookie } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Signing you in..." };

export default async function PostClerkSignIn() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [byClerk] = await db
    .select({ id: s.user.id, companyId: s.user.companyId })
    .from(s.user)
    .where(eq(s.user.clerkUserId, userId))
    .limit(1);

  if (byClerk) {
    await setAdminCookie(byClerk.id, byClerk.companyId);
    redirect("/dashboard");
  }

  const clerkUser = await currentUser();
  const primaryEmail = clerkUser?.emailAddresses
    .find((e) => e.id === clerkUser.primaryEmailAddressId)
    ?.emailAddress?.toLowerCase();

  if (primaryEmail) {
    const [byEmail] = await db
      .select({ id: s.user.id, companyId: s.user.companyId })
      .from(s.user)
      .where(
        and(
          eq(sql`lower(${s.user.email})`, primaryEmail),
          eq(s.user.role, "manager"),
          isNull(s.user.clerkUserId),
        ),
      )
      .limit(1);

    if (byEmail) {
      await db
        .update(s.user)
        .set({ clerkUserId: userId })
        .where(eq(s.user.id, byEmail.id));
      await setAdminCookie(byEmail.id, byEmail.companyId);
      redirect("/dashboard");
    }
  }

  redirect("/onboarding");
}
