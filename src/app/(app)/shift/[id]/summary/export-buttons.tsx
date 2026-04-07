"use client";

import { useActionState, useState } from "react";
import {
  emailShiftSummary,
  type EmailShiftState,
} from "@/server/actions/shift-export";
import { useT } from "@/components/i18n/LanguageProvider";

export function ShiftExportButtons({ shiftId }: { shiftId: string }) {
  const t = useT();
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState<EmailShiftState, FormData>(
    emailShiftSummary,
    {},
  );

  return (
    <div className="card no-print" style={{ marginBottom: 24 }}>
      <div className="kpi-label" style={{ marginBottom: 16 }}>{t("export.title")}</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
        className="export-grid"
      >
        <a href={`/api/shifts/${shiftId}/csv`} className="btn btn-ghost" download>
          <DownloadIcon /> {t("export.csv")}
        </a>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => window.print()}
        >
          <PrintIcon /> {t("export.print")}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setShowEmail((v) => !v)}
        >
          <MailIcon /> {t("export.email")}
        </button>
      </div>

      {showEmail && (
        <form action={formAction} style={{ marginTop: 18 }}>
          <input type="hidden" name="shiftId" value={shiftId} />
          <label className="field-label">{t("export.emailLabel")}</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="field"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn"
              disabled={pending}
              style={{ minHeight: 56, opacity: pending ? 0.6 : 1 }}
            >
              {pending ? t("export.sending") : t("export.send")}
            </button>
          </div>

          {state.error && (
            <p style={{ color: "#ff7a7a", marginTop: 12, fontSize: 15 }}>{state.error}</p>
          )}
          {state.ok && state.message && (
            <p style={{ color: "var(--accent)", marginTop: 12, fontSize: 15 }}>
              {state.message}
            </p>
          )}
        </form>
      )}

      <style>{`
        @media (max-width: 720px) {
          .export-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
