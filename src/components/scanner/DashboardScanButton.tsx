"use client";

import { useCallback, useState } from "react";
import { ScanModal } from "./ScanModal";
import { useT } from "@/components/i18n/LanguageProvider";

/**
 * Header-level scan button for the manager dashboard. Scan → copy to
 * clipboard → flash a confirmation. Designed for quick "scan a part / order
 * number, paste into your ERP" flows.
 */
export function DashboardScanButton() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handle = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
    setCopied(value);
    setTimeout(() => setCopied(null), 2200);
    setOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-ghost"
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <path d="M7 8v8" />
          <path d="M11 8v8" />
          <path d="M15 8v8" />
          <path d="M19 8v8" />
        </svg>
        <span>{t("scan.dash.cta")}</span>
      </button>
      {copied && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--accent)",
            color: "#001b1f",
            padding: "10px 18px",
            borderRadius: 999,
            fontWeight: 500,
            zIndex: 200,
            boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
            maxWidth: "90vw",
            fontSize: 14,
          }}
        >
          {t("scan.dash.copied")}: <code style={{ marginLeft: 6 }}>{copied}</code>
        </div>
      )}
      <ScanModal open={open} onClose={() => setOpen(false)} onDetect={handle} />
    </>
  );
}
