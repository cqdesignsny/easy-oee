"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useT } from "@/components/i18n/LanguageProvider";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[app error]", error);
    }
  }, [error]);

  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 32px",
        textAlign: "center",
      }}
    >
      <Logo height={56} />
      <div
        className="tag"
        style={{
          marginTop: 48,
          color: "var(--red)",
          fontFamily: "var(--font-dm-mono)",
          fontSize: 13,
          letterSpacing: 2,
        }}
      >
        {t("error.tag")}
      </div>
      <h1
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(48px, 8vw, 96px)",
          margin: "12px 0 0 0",
          lineHeight: 1,
        }}
      >
        {t("error.title")}
      </h1>
      <p
        style={{
          color: "var(--muted2)",
          fontSize: 18,
          maxWidth: 520,
          marginTop: 16,
          lineHeight: 1.5,
        }}
      >
        {t("error.body")}
      </p>
      {error.digest ? (
        <p
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-dm-mono)",
            fontSize: 12,
            marginTop: 16,
            letterSpacing: 1,
          }}
        >
          {t("error.ref")}: {error.digest}
        </p>
      ) : null}
      <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap", justifyContent: "center" }}>
        <button className="btn" onClick={reset}>
          {t("error.retry")}
        </button>
        <Link href="/" className="btn btn-ghost">
          {t("error.home")}
        </Link>
      </div>
    </main>
  );
}
