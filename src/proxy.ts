/**
 * Clerk middleware (Next.js 16 calls this `proxy.ts`).
 *
 * Runs on every request that matches the matcher below. We do NOT call
 * `auth.protect()` here because Easy OEE has multiple auth surfaces
 * (Clerk for new manager signups, the legacy HMAC `eo_admin` cookie for
 * trial users, the operator PIN cookie for shop-floor tablets, and a
 * public board view via `/board/[token]`). Route-level guards live in
 * the page handlers themselves so each surface stays explicit.
 *
 * The middleware just initializes the Clerk session context so
 * `auth()` works in server components / server actions / route handlers.
 */

import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files; run on everything else.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run on API and tRPC routes.
    "/(api|trpc)(.*)",
  ],
};
