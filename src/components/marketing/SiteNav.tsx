"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useT } from "@/components/i18n/LanguageProvider";

export function SiteNav() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
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
    <>
      <nav className="eo-nav">
        <Link href="/" className="nav-logo" aria-label="Easy OEE home">
          <Logo height={56} priority />
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          <Link href="/how-it-works">{t("nav.howItWorks")}</Link>
          <Link href="/#features">{t("nav.features")}</Link>
          <Link href="/pricing">{t("nav.pricing")}</Link>
          <Link href="/roi-calculator">{t("nav.roi")}</Link>
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/demo" className="nav-signin">
            {t("nav.tryDemo")}
          </Link>
          <Link href="/sign-in" className="nav-signin">
            {t("nav.signIn")}
          </Link>
          <Link href="/sign-up" className="nav-cta">
            {t("nav.startTrial")}
          </Link>
        </div>

        {/* Mobile right cluster: language switcher + hamburger (always visible) */}
        <div className="nav-mobile-cluster">
          <LanguageSwitcher />
          <ThemeToggle compact />
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
        </div>
      </nav>

      {/* Mobile menu — rendered as a sibling of <nav> so its position:fixed
          isn't trapped by the nav's backdrop-filter containing block. */}
      {open && (
        <div className="nav-mobile-menu">
          <Link href="/how-it-works">{t("nav.howItWorks")}</Link>
          <Link href="/#features">{t("nav.features")}</Link>
          <Link href="/pricing">{t("nav.pricing")}</Link>
          <Link href="/roi-calculator">{t("nav.roi")}</Link>
          <div style={{ height: 1, background: "var(--border2)", margin: "12px 0" }} />
          <Link href="/demo">{t("nav.tryDemo")}</Link>
          <Link href="/sign-in" className="nav-signin">
            {t("nav.signIn")}
          </Link>
          <Link href="/sign-up" className="nav-cta">
            {t("nav.startTrial")}
          </Link>
        </div>
      )}
    </>
  );
}
