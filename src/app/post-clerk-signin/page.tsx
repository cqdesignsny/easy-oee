/**
 * Bridge route between Clerk-managed sign-in and the rest of the app.
 *
 * Flow:
 *   1. Clerk signs the user in → redirects here (configured via
 *      NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL).
 *   2. We look up the local `user` row by `clerk_user_id`.
 *      - Found → set HMAC `eo_admin` cookie + redirect to /dashboard
 *      - Not found → redirect to /onboarding to create the company
 *
 * The HMAC cookie keeps every existing server component and action
 * (`getAdminSession()` everywhere) working without modification.
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { setAdminCookie } from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Signing you in..." };

export default async function PostClerkSignIn() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/auth/sign-in");
  }

  const [row] = await db
    .select({ id: s.user.id, companyId: s.user.companyId })
    .from(s.user)
    .where(eq(s.user.clerkUserId, userId))
    .limit(1);

  if (!row) {
    redirect("/onboarding");
  }

  await setAdminCookie(row.id, row.companyId);
  redirect("/dashboard");
}
