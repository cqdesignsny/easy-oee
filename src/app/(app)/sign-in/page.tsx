import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign In | Easy OEE" };
export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <main
      className="op-shell"
      style={{ justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div className="app-tag">Manager Sign In</div>
        <h1 className="app-h1">SIGN IN</h1>
        <p style={{ color: "var(--muted2)", marginTop: 12, marginBottom: 32, fontSize: 17 }}>
          Sign in to view the manager dashboard, line setup, and shift history.
        </p>

        <SignInForm />

        <div style={{ marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--border2)", textAlign: "center" }}>
          <p style={{ color: "var(--muted2)", fontSize: 15, marginBottom: 12 }}>
            Are you an operator on the floor?
          </p>
          <Link href="/pin" style={{ color: "var(--accent)", fontSize: 16, fontWeight: 500 }}>
            Sign in with PIN →
          </Link>
        </div>

        <p style={{ marginTop: 32, textAlign: "center" }}>
          <Link href="/" style={{ color: "var(--muted2)", fontSize: 14 }}>
            ← Back to easy-oee.com
          </Link>
        </p>
      </div>
    </main>
  );
}
