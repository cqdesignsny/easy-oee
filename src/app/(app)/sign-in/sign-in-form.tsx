"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";
import { signInAdmin } from "@/server/actions/admin-auth";
import { useT } from "@/components/i18n/LanguageProvider";

type OAuthStrategy = "oauth_google" | "oauth_microsoft";

export function SignInForm() {
  const t = useT();
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState<OAuthStrategy | null>(null);

  async function startOAuth(strategy: OAuthStrategy) {
    if (!isLoaded || !signIn) return;
    setError(null);
    setOauthPending(strategy);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/post-clerk-signin",
        redirectUrlComplete: "/post-clerk-signin",
      });
    } catch (e) {
      setOauthPending(null);
      setError(extractClerkError(e) ?? t("signin.errWrong"));
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setError(null);
    setPending(true);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const emailVal = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!emailVal || !password) {
      setError(t("signin.errEmpty"));
      setPending(false);
      return;
    }

    try {
      const result = await signIn.create({ identifier: emailVal, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/post-clerk-signin");
        return;
      }
      setError(t("signin.errWrong"));
      setPending(false);
      return;
    } catch (clerkErr) {
      const code = firstClerkErrorCode(clerkErr);
      const knownUserSoStop =
        code === "form_password_incorrect" ||
        code === "form_password_pwned" ||
        code === "session_exists" ||
        code === "strategy_for_user_invalid";
      if (knownUserSoStop) {
        setError(extractClerkError(clerkErr) ?? t("signin.errWrong"));
        setPending(false);
        return;
      }
    }

    const hmacResult = await signInAdmin({}, formData);
    if ("ok" in hmacResult && hmacResult.ok) {
      router.push(hmacResult.redirect);
      return;
    }
    if ("error" in hmacResult) {
      setError(hmacResult.error);
    } else {
      setError(t("signin.errWrong"));
    }
    setPending(false);
  }

  const disableOAuth = !isLoaded || oauthPending !== null || pending;

  return (
    <div>
      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          className="sso-btn"
          onClick={() => startOAuth("oauth_google")}
          disabled={disableOAuth}
          style={{ opacity: disableOAuth ? 0.6 : 1 }}
        >
          <GoogleIcon /> {t("signin.continueGoogle")}
        </button>
        <button
          type="button"
          className="sso-btn"
          onClick={() => startOAuth("oauth_microsoft")}
          disabled={disableOAuth}
          style={{ opacity: disableOAuth ? 0.6 : 1 }}
        >
          <MicrosoftIcon /> {t("signin.continueMicrosoft")}
        </button>
      </div>

      <div className="sso-divider">
        <span>{t("signin.orEmail")}</span>
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 24 }}>
        <label className="field-label">{t("signin.email")}</label>
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

        <label className="field-label">{t("signin.password")}</label>
        <input
          className="field"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          style={{ marginBottom: 18 }}
        />

        {error && (
          <p style={{ color: "#ff7a7a", marginBottom: 16, fontSize: 15 }}>{error}</p>
        )}

        <button
          type="submit"
          className="btn"
          disabled={pending || !isLoaded || oauthPending !== null}
          style={{ width: "100%", opacity: pending || !isLoaded ? 0.6 : 1 }}
        >
          {pending ? t("signin.submitting") : t("signin.submit")}
        </button>

      </form>
    </div>
  );
}

function firstClerkErrorCode(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const errors = (err as { errors?: Array<{ code?: string }> }).errors;
  return errors?.[0]?.code;
}

function extractClerkError(err: unknown): string | null {
  if (typeof err !== "object" || err === null) return null;
  const errors = (err as { errors?: Array<{ message?: string; longMessage?: string }> })
    .errors;
  return errors?.[0]?.longMessage ?? errors?.[0]?.message ?? null;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
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
