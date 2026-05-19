"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
import {
  PLANS,
  fmtCAD,
  fmtUSD,
  monthlyCostUSD,
  recommendedTier,
  usdToCad,
  type PlanId,
} from "@/lib/pricing";
import { useT } from "@/components/i18n/LanguageProvider";
import { signUpManager, type SignUpState } from "@/server/actions/admin-auth";
import { COMMON_TIMEZONES, DEFAULT_TIMEZONE, detectBrowserTimezone } from "@/lib/time";

type OAuthStrategy = "oauth_google" | "oauth_microsoft";

export function SignUpClient({
  initialPlan,
  initialLines,
}: {
  initialPlan: PlanId;
  initialLines: number;
}) {
  const t = useT();
  const { isLoaded: clerkLoaded, signUp } = useSignUp();
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [lines, setLines] = useState(initialLines);
  const [timezone, setTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [tzEdit, setTzEdit] = useState(false);
  const [oauthPending, setOauthPending] = useState<OAuthStrategy | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(
    signUpManager,
    {},
  );

  async function startOAuth(strategy: OAuthStrategy) {
    if (!clerkLoaded || !signUp) return;
    setOauthError(null);
    setOauthPending(strategy);
    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/post-clerk-signin",
        redirectUrlComplete: "/post-clerk-signin",
      });
    } catch (e) {
      setOauthPending(null);
      const errors = (e as { errors?: Array<{ longMessage?: string; message?: string }> }).errors;
      setOauthError(errors?.[0]?.longMessage ?? errors?.[0]?.message ?? "Could not start sign-up.");
    }
  }

  const oauthDisabled = !clerkLoaded || oauthPending !== null || pending;

  // Auto-detect plant timezone on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimezone(detectBrowserTimezone());
  }, []);

  const planMaxLines = PLANS[plan].maxLines;
  // Clamp the slider to the current plan's hard cap so a user on Starter
  // can't accidentally try to provision 12 lines.
  const sliderMax = Math.min(planMaxLines, 20);
  const effectiveLines = Math.min(lines, sliderMax);

  const usd = monthlyCostUSD(plan, effectiveLines);
  const cad = usd != null ? usdToCad(usd) : null;

  // Used to show "switch to Pro" hint when user is on Starter at the cap.
  const trueRecommendation = useMemo(() => recommendedTier(lines), [lines]);
  void trueRecommendation;

  // Choosing a different plan? Pull the slider into the new range.
  function pickPlan(next: PlanId) {
    setPlan(next);
    const max = Math.min(PLANS[next].maxLines, 20);
    setLines((current) => Math.min(current, max));
  }

  return (
    <form action={formAction} className="card" style={{ padding: 36 }}>
      <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          className="sso-btn"
          onClick={() => startOAuth("oauth_google")}
          disabled={oauthDisabled}
          style={{ opacity: oauthDisabled ? 0.6 : 1 }}
        >
          <GoogleIcon /> {t("signup.continueGoogle")}
        </button>
        <button
          type="button"
          className="sso-btn"
          onClick={() => startOAuth("oauth_microsoft")}
          disabled={oauthDisabled}
          style={{ opacity: oauthDisabled ? 0.6 : 1 }}
        >
          <MicrosoftIcon /> {t("signup.continueMicrosoft")}
        </button>
      </div>
      {oauthError && (
        <p style={{ color: "#ff7a7a", marginBottom: 16, fontSize: 14 }}>{oauthError}</p>
      )}
      <div className="sso-divider" style={{ marginBottom: 24 }}>
        <span>{t("signup.orEmail")}</span>
      </div>

      {/* Plan toggle */}
      <label className="field-label">{t("signup.plan")}</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {(["starter", "pro"] as PlanId[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => pickPlan(p)}
            className={plan === p ? "btn" : "btn btn-ghost"}
            style={{ minHeight: 56 }}
          >
            {t(`pricing.${p}.name`)}
          </button>
        ))}
      </div>
      <input type="hidden" name="plan" value={plan} />

      {/* Lines selector */}
      <label className="field-label">{t("signup.howManyLines")}</label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontFamily: "var(--font-bebas)", fontSize: 56, color: "var(--accent)", lineHeight: 1 }}>
          {effectiveLines}
        </span>
        <span style={{ fontFamily: "var(--font-bebas)", fontSize: 32, color: "var(--white)" }}>
          {usd != null ? fmtUSD(usd) : t("pricing.talkToUs")}{" "}
          {usd != null && (
            <span style={{ fontSize: 14, color: "var(--muted2)" }}>USD/mo</span>
          )}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={sliderMax}
        step={1}
        value={effectiveLines}
        onChange={(e) => setLines(Number(e.target.value))}
        name="lines"
        style={{ width: "100%", accentColor: "var(--accent)" }}
      />
      <p style={{ color: "var(--muted2)", fontSize: 13, marginTop: 6, marginBottom: 12, fontFamily: "var(--font-dm-mono)", letterSpacing: 0.5 }}>
        {cad != null && <>≈ {fmtCAD(cad)} CAD/mo · </>}{t("signup.afterTrial")}
      </p>

      {/* Plan-fit hint: surface when the chosen plan is the wrong tier
          for the line count the user actually needs. */}
      {plan === "starter" && effectiveLines === planMaxLines && (
        <p style={{ color: "var(--muted2)", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
          {t("signup.proTease.starter").replace("{n}", String(PLANS.starter.maxLines))}
          {" "}
          <button
            type="button"
            onClick={() => pickPlan("pro")}
            style={{ background: "none", border: 0, color: "var(--accent)", cursor: "pointer", padding: 0, font: "inherit" }}
          >
            {t("signup.proTease.switch")}
          </button>
        </p>
      )}
      {plan === "pro" && effectiveLines === sliderMax && (
        <p style={{ color: "var(--muted2)", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
          {t("signup.entTease")}
          {" "}
          <Link href="/contact" style={{ color: "var(--accent)" }}>
            {t("signup.entTease.cta")}
          </Link>
        </p>
      )}
      {!(plan === "starter" && effectiveLines === planMaxLines) &&
        !(plan === "pro" && effectiveLines === sliderMax) && (
          <div style={{ marginBottom: 24 }} />
        )}

      {/* Company + email + name + password */}
      <label className="field-label">{t("signup.companyName")}</label>
      <input
        className="field"
        type="text"
        name="companyName"
        placeholder={t("signup.companyPlaceholder")}
        required
        style={{ marginBottom: 18 }}
      />

      <label className="field-label">{t("signup.fullName")}</label>
      <input
        className="field"
        type="text"
        name="fullName"
        placeholder={t("signup.fullNamePlaceholder")}
        required
        style={{ marginBottom: 18 }}
      />

      <label className="field-label">{t("signup.email")}</label>
      <input
        className="field"
        type="email"
        name="email"
        placeholder="you@company.com"
        required
        style={{ marginBottom: 18 }}
      />

      <label className="field-label">{t("signup.password")}</label>
      <input
        className="field"
        type="password"
        name="password"
        placeholder={t("signup.passwordPlaceholder")}
        minLength={8}
        required
        style={{ marginBottom: 18 }}
      />

      {/* Timezone — auto-detected, with a discrete change link */}
      <input type="hidden" name="timezone" value={timezone} />
      <div
        style={{
          marginBottom: 18,
          padding: "12px 14px",
          border: "1px solid var(--border2)",
          borderRadius: 10,
          fontSize: 13,
          color: "var(--muted2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span>
          {t("signup.timezone.label")}{" "}
          <strong style={{ color: "var(--white)", fontFamily: "var(--font-dm-mono)" }}>
            {timezone}
          </strong>
        </span>
        {!tzEdit ? (
          <button
            type="button"
            onClick={() => setTzEdit(true)}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "4px 10px" }}
          >
            {t("signup.timezone.change")}
          </button>
        ) : (
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="field"
            style={{ minWidth: 220, fontSize: 13, padding: "6px 10px" }}
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
            {!COMMON_TIMEZONES.some((tz) => tz.value === timezone) && (
              <option value={timezone}>{timezone}</option>
            )}
          </select>
        )}
      </div>

      {state.error && (
        <p style={{ color: "#ff7a7a", marginBottom: 16, fontSize: 15 }}>{state.error}</p>
      )}

      <button
        type="submit"
        className="btn"
        disabled={pending}
        style={{ width: "100%", opacity: pending ? 0.7 : 1 }}
      >
        {pending ? t("signup.starting") : t("signup.start")}
      </button>

      <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 14, textAlign: "center" }}>
        {t("signup.disclaimer")}
      </p>
    </form>
  );
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
