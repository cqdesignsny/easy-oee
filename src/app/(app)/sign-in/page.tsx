"use client";

import Link from "next/link";
import { SignInForm } from "./sign-in-form";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useT } from "@/components/i18n/LanguageProvider";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const t = useT();
  return (
    <main
      className="op-shell"
      style={{ justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <Link href="/" style={{ display: "inline-block" }}>
            <Logo height={56} priority />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="app-tag">{t("signin.tag")}</div>
        <h1 className="app-h1">{t("signin.title")}</h1>
        <p style={{ color: "var(--muted2)", marginTop: 12, marginBottom: 32, fontSize: 17 }}>
          {t("signin.subtitle")}
        </p>

        <SignInForm />

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border2)", textAlign: "center" }}>
          <p style={{ color: "var(--muted2)", fontSize: 15, marginBottom: 12 }}>
            {t("signin.demoPrompt")}
          </p>
          <Link
            href="/demo"
            className="btn btn-ghost"
            style={{ width: "100%", textAlign: "center", display: "inline-block" }}
          >
            {t("signin.demoCta")} →
          </Link>
          <p style={{ marginTop: 18, color: "var(--muted2)", fontSize: 14 }}>
            {t("signin.signupPrompt")}{" "}
            <Link href="/sign-up" style={{ color: "var(--accent)", fontWeight: 500 }}>
              {t("signin.signupLink")} →
            </Link>
          </p>
        </div>

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border2)", textAlign: "center" }}>
          <p style={{ color: "var(--muted2)", fontSize: 14, marginBottom: 8 }}>
            {t("signin.operatorPrompt")}
          </p>
          <Link href="/pin" style={{ color: "var(--accent)", fontSize: 15 }}>
            {t("signin.operatorLink")} →
          </Link>
        </div>

        <p style={{ marginTop: 32, textAlign: "center" }}>
          <Link href="/" style={{ color: "var(--muted2)", fontSize: 14 }}>
            ← {t("signin.back")}
          </Link>
        </p>
      </div>
    </main>
  );
}
