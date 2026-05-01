"use client";

import { useActionState, useState } from "react";
import { useT } from "@/components/i18n/LanguageProvider";
import { COMMON_TIMEZONES, formatPlantDateTime } from "@/lib/time";
import {
  updateCompanySettings,
  type SettingsState,
} from "@/server/actions/manager";

export function SettingsForm({
  initialName,
  initialTimezone,
  plan,
  slug,
  nowExample,
}: {
  initialName: string;
  initialTimezone: string;
  plan: string;
  slug: string;
  nowExample: string;
}) {
  const t = useT();
  const [tz, setTz] = useState(initialTimezone);
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateCompanySettings,
    {},
  );

  // Live preview of "now" in the selected zone, so the manager can sanity-check
  // before saving. Computed client-side; no server round trip.
  const livePreview = formatPlantDateTime(new Date(), tz);

  const inList = COMMON_TIMEZONES.some((opt) => opt.value === tz);

  return (
    <form action={formAction} className="card" style={{ marginTop: 24, display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <label className="kpi-label" htmlFor="settings-name">
          {t("settings.companyName")}
        </label>
        <input
          id="settings-name"
          className="app-input"
          name="name"
          defaultValue={initialName}
          required
          maxLength={120}
        />
        <span style={{ color: "var(--muted2)", fontSize: 12, fontFamily: "var(--font-dm-mono)" }}>
          {t("settings.slugLabel")} {slug} · {t("settings.planLabel")} {plan}
        </span>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label className="kpi-label" htmlFor="settings-tz">
          {t("settings.timezone")}
        </label>
        <select
          id="settings-tz"
          name="timezone"
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          className="field"
          style={{ padding: "10px 12px" }}
        >
          {COMMON_TIMEZONES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {!inList && <option value={tz}>{tz}</option>}
        </select>
        <span style={{ color: "var(--muted2)", fontSize: 13 }}>
          {t("settings.timezone.help")}
        </span>
        <div
          style={{
            marginTop: 6,
            padding: "10px 14px",
            background: "rgba(3,191,181,0.06)",
            border: "1px solid rgba(3,191,181,0.25)",
            borderRadius: 8,
            fontFamily: "var(--font-dm-mono)",
            fontSize: 13,
          }}
        >
          {t("settings.timezone.preview")}{" "}
          <strong style={{ color: "var(--accent)" }}>{livePreview}</strong>
          <span style={{ color: "var(--muted2)" }}>
            {" "}
            ({t("settings.timezone.previewSavedAs")} {nowExample})
          </span>
        </div>
      </div>

      {state.error && (
        <p style={{ color: "#ff7a7a", fontSize: 14 }}>{state.error}</p>
      )}
      {state.ok && (
        <p style={{ color: "var(--accent)", fontSize: 14 }}>{t("settings.saved")}</p>
      )}

      <div>
        <button
          type="submit"
          className="btn"
          disabled={pending}
          style={{ opacity: pending ? 0.7 : 1 }}
        >
          {pending ? t("settings.saving") : t("settings.save")}
        </button>
      </div>
    </form>
  );
}
