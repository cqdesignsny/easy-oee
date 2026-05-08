"use client";

import { useActionState, useEffect, useState } from "react";
import { useT } from "@/components/i18n/LanguageProvider";
import { detectBrowserTimezone } from "@/lib/time";
import { completeOnboarding, type OnboardingState } from "./actions";

export function OnboardingClient({
  clerkUserId,
  prefillName,
  prefillEmail,
}: {
  clerkUserId: string;
  prefillName: string;
  prefillEmail: string;
}) {
  const t = useT();
  const [tz, setTz] = useState<string>("America/Toronto");
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    {},
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTz(detectBrowserTimezone());
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div className="app-tag" style={{ textAlign: "center", marginBottom: 8 }}>
        {t("onboarding.tag")}
      </div>
      <h1 className="app-h1" style={{ textAlign: "center" }}>
        {t("onboarding.title")}
      </h1>
      <p
        style={{
          color: "var(--muted2)",
          marginTop: 4,
          marginBottom: 24,
          textAlign: "center",
          fontSize: 14,
        }}
      >
        {t("onboarding.subtitle")}
      </p>

      <form action={formAction} className="card" style={{ display: "grid", gap: 16 }}>
        <input type="hidden" name="clerkUserId" value={clerkUserId} />
        <input type="hidden" name="email" value={prefillEmail} />
        <input type="hidden" name="fullName" value={prefillName} />
        <input type="hidden" name="timezone" value={tz} />

        <div>
          <label htmlFor="companyName" style={{ fontSize: 13, fontWeight: 500 }}>
            {t("onboarding.companyName")}
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            maxLength={120}
            placeholder={t("onboarding.companyNamePlaceholder")}
            className="app-input"
            style={{ width: "100%", marginTop: 6 }}
          />
        </div>

        <div>
          <label htmlFor="lines" style={{ fontSize: 13, fontWeight: 500 }}>
            {t("onboarding.lines")}
          </label>
          <input
            id="lines"
            name="lines"
            type="number"
            min={1}
            max={20}
            defaultValue={2}
            required
            className="app-input"
            style={{ width: "100%", marginTop: 6 }}
          />
          <p style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4 }}>
            {t("onboarding.linesHint")}
          </p>
        </div>

        <div style={{ fontSize: 12, color: "var(--muted2)" }}>
          {t("onboarding.timezoneDetected")}: <strong style={{ color: "var(--text)" }}>{tz}</strong>
        </div>

        {state.error && (
          <div
            style={{
              fontSize: 13,
              color: "var(--red, #f87171)",
              background: "rgba(248,113,113,0.06)",
              border: "1px solid rgba(248,113,113,0.2)",
              padding: "10px 12px",
              borderRadius: 8,
            }}
          >
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          {pending ? t("onboarding.creating") : t("onboarding.create")}
        </button>
      </form>
    </div>
  );
}
