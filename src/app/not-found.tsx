import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getServerT } from "@/components/i18n/server";

export const metadata = { title: "Not Found | Easy OEE" };

export default async function NotFound() {
  const t = await getServerT();
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
          color: "var(--accent)",
          fontFamily: "var(--font-dm-mono)",
          fontSize: 13,
          letterSpacing: 2,
        }}
      >
        404
      </div>
      <h1
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(56px, 10vw, 120px)",
          margin: "12px 0 0 0",
          lineHeight: 1,
        }}
      >
        {t("notFound.title")}
      </h1>
      <p
        style={{
          color: "var(--muted2)",
          fontSize: 18,
          maxWidth: 480,
          marginTop: 16,
          lineHeight: 1.5,
        }}
      >
        {t("notFound.body")}
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn">
          {t("notFound.home")}
        </Link>
        <Link href="/dashboard" className="btn btn-ghost">
          {t("notFound.dashboard")}
        </Link>
      </div>
    </main>
  );
}
