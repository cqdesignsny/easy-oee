import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getServerT } from "@/components/i18n/server";
import { enterDemo } from "@/server/actions/demo";

export const metadata = { title: "Live Demo | Easy OEE" };
export const dynamic = "force-dynamic";

async function enterAsManager() {
  "use server";
  await enterDemo("dashboard");
}

async function enterAsOperator() {
  "use server";
  await enterDemo("operator");
}

export default async function DemoLandingPage() {
  const t = await getServerT();
  return (
    <main
      className="op-shell"
      style={{ justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
    >
      <div style={{ width: "100%", maxWidth: 720 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 36,
          }}
        >
          <Link href="/" style={{ display: "inline-block" }}>
            <Logo height={56} priority />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="app-tag">{t("demo.tag")}</div>
        <h1 className="app-h1" style={{ marginBottom: 12 }}>
          {t("demo.title")}
        </h1>
        <p style={{ color: "var(--muted2)", fontSize: 17, marginBottom: 28, maxWidth: 560 }}>
          {t("demo.lead")}
        </p>

        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <div className="app-tag" style={{ marginBottom: 8 }}>
            {t("demo.manager.tag")}
          </div>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: 32, marginBottom: 8 }}>
            {t("demo.manager.title")}
          </h2>
          <p style={{ color: "var(--muted2)", marginBottom: 18, fontSize: 15 }}>
            {t("demo.manager.body")}
          </p>
          <form action={enterAsManager}>
            <button className="btn" style={{ width: "100%" }}>
              {t("demo.manager.cta")} →
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <div className="app-tag" style={{ marginBottom: 8 }}>
            {t("demo.operator.tag")}
          </div>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: 32, marginBottom: 8 }}>
            {t("demo.operator.title")}
          </h2>
          <p style={{ color: "var(--muted2)", marginBottom: 18, fontSize: 15 }}>
            {t("demo.operator.body")}
          </p>
          <form action={enterAsOperator}>
            <button className="btn btn-ghost" style={{ width: "100%" }}>
              {t("demo.operator.cta")} →
            </button>
          </form>
        </div>

        <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
          {t("demo.note")}
        </p>

        <p style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/" style={{ color: "var(--muted2)", fontSize: 14 }}>
            ← {t("demo.back")}
          </Link>
        </p>
      </div>
    </main>
  );
}
