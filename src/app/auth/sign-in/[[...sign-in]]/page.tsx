/**
 * Clerk-hosted sign-in page (catch-all so Clerk can mount its multi-step
 * flows like /auth/sign-in/factor-one). Lives alongside the legacy custom
 * /sign-in route, which still serves the HMAC password flow for existing
 * trial accounts and the demo backdoor. Once everyone is migrated to
 * Clerk, the legacy route gets retired.
 *
 * Branding: we keep the marketing-style hero wrapper around Clerk's
 * default component and rely on `appearance` to nudge the colors to our
 * teal accent. Full theming can come later — focus right now is making
 * the flow work.
 */

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = { title: "Sign in | Easy OEE" };

export default function ClerkSignInPage() {
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
          <SignIn
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
