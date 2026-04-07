"use client";

import { useState, useRef, useEffect } from "react";
import { LOCALES, LOCALE_LABELS, LOCALE_NAMES, type Locale } from "./dictionaries";
import { useLocale, useSetLocale } from "./LanguageProvider";

export function LanguageSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const select = (l: Locale) => {
    setLocale(l);
    setOpen(false);
  };

  return (
    <div className="lang-switch" ref={ref}>
      <button
        type="button"
        className="lang-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        title={LOCALE_NAMES[locale]}
      >
        <GlobeIcon />
        <span>{LOCALE_LABELS[locale]}</span>
        <Caret open={open} />
      </button>
      {open && (
        <div className="lang-menu" role="listbox">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="option"
              aria-selected={l === locale}
              className={l === locale ? "lang-opt active" : "lang-opt"}
              onClick={() => select(l)}
            >
              <span className="lang-opt-code">{LOCALE_LABELS[l]}</span>
              <span className="lang-opt-name">{LOCALE_NAMES[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 12 12"
      fill="none" stroke="currentColor" strokeWidth="2"
      style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}
    >
      <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
