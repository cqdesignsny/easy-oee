"use client";

import { useActionState, useState } from "react";
import { signInAdmin, type AdminSignInState } from "@/server/actions/admin-auth";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState<AdminSignInState, FormData>(
    signInAdmin,
    {},
  );

  return (
    <div>
      {/* Social sign-in (visual placeholders until wired) */}
      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="sso-btn"
        >
          <GoogleIcon /> Continue with Google
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="sso-btn"
        >
          <MicrosoftIcon /> Continue with Microsoft
        </button>
      </div>

      {/* Divider */}
      <div className="sso-divider">
        <span>or sign in with email</span>
      </div>

      <form action={formAction} style={{ marginTop: 24 }}>
        <label className="field-label">Email</label>
        <input
          className="field"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 18 }}
        />

        <label className="field-label">Password</label>
        <input
          className="field"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          style={{ marginBottom: 18 }}
        />

        {state.error && (
          <p style={{ color: "#ff7a7a", marginBottom: 16, fontSize: 15 }}>{state.error}</p>
        )}

        <button
          type="submit"
          className="btn"
          disabled={pending}
          style={{ width: "100%", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Signing in..." : "SIGN IN"}
        </button>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ color: "var(--muted2)", fontSize: 14, textDecoration: "none" }}
            title="Coming soon"
          >
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
