/**
 * Clerk-hosted sign-up page. Catch-all so Clerk can mount its multi-step
 * verification flows (email code, OAuth callback, etc.).
 *
 * After Clerk creates the user, NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
 * sends them to /onboarding where we collect the company info Easy OEE
 * needs (name, line count, plant timezone) and create the local DB rows.
 */

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = { title: "Sign up | Easy OEE" };

export default function ClerkSignUpPage() {
  return (
    <main className="auth-shell">
      <div className="auth-wrap">
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--muted2)",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            ← Back to easy-oee.com
          </Link>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-[var(--accent)] hover:opacity-90 text-[var(--bg)] font-medium",
                card: "bg-[var(--card)] border border-[var(--border)] shadow-none",
              },
              variables: {
                colorPrimary: "#03bfb5",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
