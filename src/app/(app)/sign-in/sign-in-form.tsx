"use client";

import { useActionState } from "react";
import { signInAdmin, type AdminSignInState } from "@/server/actions/admin-auth";

export function SignInForm() {
  const [state, formAction, pending] = useActionState<AdminSignInState, FormData>(
    signInAdmin,
    {},
  );

  return (
    <form action={formAction}>
      <label className="field-label">Password</label>
      <input
        className="field"
        type="password"
        name="password"
        autoComplete="current-password"
        autoFocus
        required
        style={{ marginBottom: 20 }}
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
    </form>
  );
}
