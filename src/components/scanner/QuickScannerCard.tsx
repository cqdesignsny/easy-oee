"use client";

/**
 * Dashboard utility: scan a barcode → value goes to clipboard so the
 * manager can paste it into a PLC dashboard, ERP, MES, etc.
 *
 * Keeps a short rolling history of the last 5 scans (in-memory only —
 * tab close clears it).
 */

import { useCallback, useState } from "react";
import { ScanModal } from "./ScanModal";
import { useT } from "@/components/i18n/LanguageProvider";

export function QuickScannerCard() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const handleDetect = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied((c) => (c === value ? null : c)), 1800);
    } catch {
      // older browsers — still record it in recent so the user can copy manually
    }
    setRecent((r) => [value, ...r.filter((x) => x !== value)].slice(0, 5));
    setOpen(false);
  }, []);

  const copyAgain = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied((c) => (c === value ? null : c)), 1500);
    } catch {}
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <div className="kpi-label" style={{ marginBottom: 4 }}>
            {t("scan.tile.title")}
          </div>
          <p style={{ color: "var(--muted2)", fontSize: 13, margin: 0 }}>
            {t("scan.tile.body")}
          </p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn">
          {t("scan.tile.cta")} →
        </button>
      </div>

      {recent.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border2)" }}>
          <div className="kpi-label" style={{ fontSize: 10, marginBottom: 8 }}>
            {t("scan.tile.recent")}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {recent.map((v) => (
              <div
                key={v}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "var(--mid)",
                  borderRadius: 10,
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: 13,
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {v}
                </span>
                <button
                  type="button"
                  onClick={() => copyAgain(v)}
                  style={{
                    marginLeft: 12,
                    background: "transparent",
                    border: "1px solid var(--border2)",
                    color: copied === v ? "var(--accent)" : "var(--white)",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {copied === v ? t("scan.tile.copied") : t("scan.tile.copy")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ScanModal open={open} onClose={() => setOpen(false)} onDetect={handleDetect} />
    </div>
  );
}
