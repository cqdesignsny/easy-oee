import Link from "next/link";
import { listOperators } from "@/server/actions/operator-auth";
import { PinForm } from "./pin-form";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { getServerT } from "@/components/i18n/server";

export const metadata = { title: "Sign In | Easy OEE" };
export const dynamic = "force-dynamic";

export default async function PinPage() {
  const operators = await listOperators();
  const t = await getServerT();

  return (
    <main className="op-shell" style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <Link href="/" style={{ display: "inline-block" }}>
            <Logo height={56} priority />
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="app-tag">{t("pin.tag")}</div>
        <h1 className="app-h1">{t("pin.title")}</h1>
        <p style={{ color: "var(--muted2)", margin: "12px 0 28px", fontSize: 17 }}>
          {t("pin.subtitle")}
        </p>
        <PinForm operators={operators} />
      </div>
    </main>
  );
}
