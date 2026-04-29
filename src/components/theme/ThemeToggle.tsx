"use client";

/**
 * Theme toggle. Renders as a segmented two-option control with both
 * Light and Dark labels visible at all times so users always know
 * what they're picking.
 *
 *   compact=false (default): full pill with [☀ Light][🌙 Dark]
 *   compact=true:             icon-only segmented [☀][🌙] for tight spots
 */

import { useCallback, useEffect, useState } from "react";
import { useT } from "@/components/i18n/LanguageProvider";
import type { Theme } from "@/lib/theme";

const COOKIE_NAME = "eo-theme";
const ONE_YEAR = 60 * 60 * 24 * 365;

function readCurrent(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const [theme, setTheme] = useState<Theme>(() => readCurrent());

  // Mounted flag so we can render a stable placeholder for SSR/hydration
  // and only show the actual selection state after we read the DOM.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const set = useCallback((next: Theme) => {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    document.cookie = `${COOKIE_NAME}=${next}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
    try { localStorage.setItem(COOKIE_NAME, next); } catch { /* storage blocked */ }
  }, []);

  const isLight = mounted && theme === "light";
  const isDark = !mounted || theme === "dark";

  return (
    <div
      role="group"
      aria-label={t("theme.toggleLabel")}
      className={`theme-segment${compact ? " theme-segment-compact" : ""}`}
    >
      <button
        type="button"
        onClick={() => set("light")}
        aria-pressed={isLight}
        className={`theme-segment-btn${isLight ? " is-active" : ""}`}
        title={t("theme.toLight")}
      >
        <SunIcon />
        {!compact && <span>{t("theme.light")}</span>}
      </button>
      <button
        type="button"
        onClick={() => set("dark")}
        aria-pressed={isDark}
        className={`theme-segment-btn${isDark ? " is-active" : ""}`}
        title={t("theme.toDark")}
      >
        <MoonIcon />
        {!compact && <span>{t("theme.dark")}</span>}
      </button>
    </div>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
