"use client";

/**
 * Theme toggle button. Sets the `eo-theme` cookie + `data-theme` attribute
 * on <html>. Two layouts:
 *   - "icon":    single round button that flips between sun/moon
 *   - "labeled": same icon plus a text label; used in the manager sidebar
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

export function ThemeToggle({
  variant = "icon",
}: {
  variant?: "icon" | "labeled";
}) {
  const t = useT();
  // Lazy init reads the SSR-rendered data-theme on mount.
  const [theme, setTheme] = useState<Theme>(() => readCurrent());
  const [mounted, setMounted] = useState(false);

  // Required to avoid SSR/hydration mismatch: the server can't know the
  // user's chosen theme until the cookie is read, so we render a stable
  // placeholder for the first paint and upgrade to the real toggle after
  // hydration. The setState here is the canonical mounted-flag pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    document.cookie = `${COOKIE_NAME}=${next}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
    try {
      localStorage.setItem(COOKIE_NAME, next);
    } catch {
      // storage may be blocked; cookie is the source of truth
    }
  }, [theme]);

  // Render a placeholder before mount so SSR + hydration match without
  // a layout shift, then upgrade to the real button.
  if (!mounted) {
    return (
      <button
        type="button"
        className={variant === "labeled" ? "theme-toggle theme-toggle-labeled" : "theme-toggle"}
        aria-hidden
        tabIndex={-1}
        suppressHydrationWarning
      >
        <SunIcon />
      </button>
    );
  }

  const next: Theme = theme === "light" ? "dark" : "light";
  const label = next === "light" ? t("theme.toLight") : t("theme.toDark");

  return (
    <button
      type="button"
      onClick={toggle}
      className={variant === "labeled" ? "theme-toggle theme-toggle-labeled" : "theme-toggle"}
      aria-label={label}
      title={label}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
      {variant === "labeled" && (
        <span>{theme === "light" ? t("theme.dark") : t("theme.light")}</span>
      )}
    </button>
  );
}

function SunIcon() {
  return (
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
