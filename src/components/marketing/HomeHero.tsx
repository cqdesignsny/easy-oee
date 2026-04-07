"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/LanguageProvider";
import { HeroGauge } from "./HeroGauge";

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export function HomeHero() {
  const t = useT();
  return (
    <section className="hero hero-with-gauge">
      <div className="hero-glow" />
      <div className="hero-grid" />
      <div className="hero-content fi">
        <div className="hero-eyebrow">{t("home.eyebrow")}</div>
        <h1>
          {t("home.h1.line1")}
          <br />
          <em>{t("home.h1.line2")}</em>
          <br />
          <span className="out">{t("home.h1.line3")}</span>
        </h1>
        <p className="hero-sub">{t("home.sub")}</p>
        <div className="hero-actions">
          <Link href="/contact" className="btn-y">
            {t("home.cta.demo")} <ArrowRight />
          </Link>
          <Link href="/how-it-works" className="btn-ghost">
            {t("home.cta.how")} <ArrowRight />
          </Link>
        </div>
      </div>
      <HeroGauge />
    </section>
  );
}
