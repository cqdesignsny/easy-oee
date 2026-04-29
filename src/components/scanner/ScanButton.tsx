"use client";

import { useCallback, useState } from "react";
import { ScanModal } from "./ScanModal";
import { useT } from "@/components/i18n/LanguageProvider";

/**
 * Scan trigger. Pass either `onScan` (callback) OR `targetInputId` to fill
 * the sibling input automatically. If neither is passed, the scanned value
 * is copied to clipboard.
 */
export function ScanButton({
  onScan,
  targetInputId,
  label,
  variant = "icon",
}: {
  onScan?: (value: string) => void;
  targetInputId?: string;
  label?: string;
  variant?: "icon" | "button";
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const handleDetect = useCallback(
    async (value: string) => {
      if (onScan) onScan(value);
      else if (targetInputId) {
        const el = document.getElementById(targetInputId) as HTMLInputElement | null;
        if (el) {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
      } else {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          // ignore — older browsers without clipboard permission
        }
      }
      setOpen(false);
    },
    [onScan, targetInputId],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={variant === "icon" ? "scan-icon-btn" : "btn btn-ghost"}
        aria-label={t("scan.open")}
        style={variant === "button" ? { gap: 8, display: "inline-flex", alignItems: "center" } : undefined}
      >
        <ScanIcon />
        {variant === "button" && <span>{label ?? t("scan.open")}</span>}
      </button>
      <ScanModal open={open} onClose={() => setOpen(false)} onDetect={handleDetect} />
    </>
  );
}

function ScanIcon() {
  return (
    <svg
      width="20"
      height="20"
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
  );
}
