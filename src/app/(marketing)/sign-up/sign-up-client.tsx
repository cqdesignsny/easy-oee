"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
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

export function SignUpClient({
  initialPlan,
  initialLines,
}: {
  initialPlan: PlanId;
  initialLines: number;
}) {
  const t = useT();
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [lines, setLines] = useState(initialLines);
  const [timezone, setTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [tzEdit, setTzEdit] = useState(false);
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(
    signUpManager,
    {},
  );

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
