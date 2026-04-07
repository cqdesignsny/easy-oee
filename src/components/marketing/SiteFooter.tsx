"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/components/i18n/LanguageProvider";

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="eo-footer">
      <div className="fg">
        <div>
          <Image
            src="/easy-oee-logo.svg"
            alt="Easy OEE"
            width={713}
            height={175}
            style={{ height: 72, width: "auto", display: "block", marginBottom: 22 }}
          />
          <p className="fd">{t("footer.tagline")}</p>
        </div>
        <div className="fc">
          <h4>{t("footer.product")}</h4>
          <Link href="/how-it-works">{t("footer.howItWorks")}</Link>
          <Link href="/#features">{t("footer.features")}</Link>
          <Link href="/pricing">{t("footer.pricing")}</Link>
          <Link href="/roi-calculator">{t("footer.roi")}</Link>
        </div>
        <div className="fc">
          <h4>{t("footer.company")}</h4>
          <Link href="/contact">{t("footer.bookDemo")}</Link>
          <Link href="/contact">{t("footer.contact")}</Link>
          <Link href="/privacy">{t("footer.privacy")}</Link>
          <Link href="/terms">{t("footer.terms")}</Link>
        </div>
      </div>
      <div className="fb">
        <span>© {new Date().getFullYear()} Easy OEE Inc. {t("footer.rights")}</span>
        <span>easy-oee.com</span>
      </div>
    </footer>
  );
}
