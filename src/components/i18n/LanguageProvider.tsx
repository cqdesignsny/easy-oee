"use client";

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, LOCALES, type Locale } from "./dictionaries";

const STORAGE_KEY = "eo-locale";
const COOKIE_KEY = "eo-locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const LanguageContext = createContext<Ctx>({
  locale: "en",
  setLocale: () => {},
});

// External store for the locale — lets us use useSyncExternalStore so the
// initial value comes from localStorage on the very first client render
// without the cascading-renders pattern of useState + useEffect.
const localeStore = (() => {
  const listeners = new Set<() => void>();
  return {
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    notify() {
      for (const fn of listeners) fn();
    },
  };
})();

function readLocaleFromBrowser(): Locale {
  if (typeof window === "undefined") return "en";

  // 1. Cookie is the source of truth (matches what the server rendered)
  const match = document.cookie.match(/(?:^|;\s*)eo-locale=([^;]+)/);
  if (match && LOCALES.includes(match[1] as Locale)) {
    return match[1] as Locale;
  }

  // 2. localStorage as backup (older sessions before cookies)
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && LOCALES.includes(saved)) return saved;
  } catch {}

  // 3. Browser language (first visit, no cookie yet)
  const lang = (navigator.language || "en").slice(0, 2).toLowerCase();
  if (lang === "es" || lang === "fr") return lang;

  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const getSnapshot = (): Locale => readLocaleFromBrowser();
  const getServerSnapshot = (): Locale => "en";
  const locale = useSyncExternalStore<Locale>(
    localeStore.subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Sync <html lang="..."> attribute when locale changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback(
    (l: Locale) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, l);
      } catch {}
      document.cookie = `${COOKIE_KEY}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      localeStore.notify();
      // Re-fetch the RSC payload so server components render with the new
      // cookie. Preserves client state, no full page reload.
      router.refresh();
    },
    [router],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LanguageContext).locale;
}

export function useSetLocale(): (l: Locale) => void {
  return useContext(LanguageContext).setLocale;
}

/**
 * Returns a translator function bound to the current locale.
 * Usage: const t = useT(); t("nav.signIn")
 */
export function useT(): (key: string) => string {
  const { locale } = useContext(LanguageContext);
  return useCallback(
    (key: string) => dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key,
    [locale],
  );
}
