"use client";

import { useActionState, useState } from "react";
import { fmtCAD, fmtUSD, monthlyCostUSD, usdToCad, type PlanId } from "@/lib/pricing";
import { useT } from "@/components/i18n/LanguageProvider";
import { signUpManager, type SignUpState } from "@/server/actions/admin-auth";

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
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(
    signUpManager,
    {},
  );

  const usd = monthlyCostUSD(plan, lines);
  const cad = usdToCad(usd);

  return (
    <form action={formAction} className="card" style={{ padding: 36 }}>
      {/* Plan toggle */}
      <label className="field-label">{t("signup.plan")}</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {(["starter", "pro"] as PlanId[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlan(p)}
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
          {lines}
        </span>
        <span style={{ fontFamily: "var(--font-bebas)", fontSize: 32, color: "var(--white)" }}>
          {fmtUSD(usd)}{" "}
          <span style={{ fontSize: 14, color: "var(--muted2)" }}>USD/mo</span>
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={20}
        step={1}
        value={lines}
        onChange={(e) => setLines(Number(e.target.value))}
        name="lines"
        style={{ width: "100%", accentColor: "var(--accent)" }}
      />
      <p style={{ color: "var(--muted2)", fontSize: 13, marginTop: 6, marginBottom: 24, fontFamily: "var(--font-dm-mono)", letterSpacing: 0.5 }}>
        ≈ {fmtCAD(cad)} CAD/mo · {t("signup.afterTrial")}
      </p>

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
