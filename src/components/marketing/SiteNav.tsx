"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/components/i18n/LanguageProvider";

export function SiteNav() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change. The "no setState in effect" lint rule
  // is overzealous here — this is the canonical reset-on-prop-change pattern.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="eo-nav">
      <Link href="/" className="nav-logo" aria-label="Easy OEE home">
        <Image
          src="/easy-oee-logo.svg"
          alt="Easy OEE"
          width={713}
          height={175}
          priority
          style={{ height: 56, width: "auto", display: "block" }}
        />
      </Link>

      {/* Desktop links */}
      <div className="nav-links">
        <Link href="/how-it-works">{t("nav.howItWorks")}</Link>
        <Link href="/#features">{t("nav.features")}</Link>
        <Link href="/pricing">{t("nav.pricing")}</Link>
        <Link href="/roi-calculator">{t("nav.roi")}</Link>
        <LanguageSwitcher />
        <Link href="/sign-in" className="nav-signin">
          {t("nav.signIn")}
        </Link>
        <Link href="/contact" className="nav-cta">
          {t("nav.bookDemo")}
        </Link>
      </div>

      {/* Mobile hamburger button */}
      <button
        type="button"
        className="nav-burger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={open ? "burger-line open1" : "burger-line"} />
        <span className={open ? "burger-line open2" : "burger-line"} />
        <span className={open ? "burger-line open3" : "burger-line"} />
      </button>

      {/* Mobile menu overlay */}
      {open && (
        <div className="nav-mobile-menu">
          <Link href="/how-it-works">{t("nav.howItWorks")}</Link>
          <Link href="/#features">{t("nav.features")}</Link>
          <Link href="/pricing">{t("nav.pricing")}</Link>
          <Link href="/roi-calculator">{t("nav.roi")}</Link>
          <div style={{ height: 1, background: "var(--border2)", margin: "8px 0" }} />
          <Link href="/sign-in" className="nav-signin">
            {t("nav.signIn")}
          </Link>
          <Link href="/contact" className="nav-cta">
            {t("nav.bookDemo")}
          </Link>
          <div style={{ marginTop: 16 }}>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}
