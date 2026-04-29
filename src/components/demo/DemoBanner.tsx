"use client";

import Link from "next/link";
import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n/LanguageProvider";
import { exitDemo } from "@/server/actions/demo";

/**
 * Sticky banner shown across all (app) routes when the user is in demo mode.
 * Renders nothing in regular logged-in sessions. Includes a per-route tip
 * card that explains what the prospect is looking at.
 */
export function DemoBanner() {
  const t = useT();
  const pathname = usePathname() ?? "";
  const [pending, start] = useTransition();

  const handleExit = () => start(() => exitDemo());

  const tipKey = pickTipKey(pathname);

  return (
    <>
      <div className="demo-banner">
        <div>
          <strong>{t("demo.banner.title")}</strong>{" "}
          <span className="demo-banner-tip">· {t("demo.banner.tip")}</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/sign-up" className="demo-banner-cta">
            {t("demo.banner.signup")}
          </Link>
          <button
            type="button"
            onClick={handleExit}
            disabled={pending}
            style={{
              background: "transparent",
              border: 0,
              color: "#001b1f",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: 13,
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? t("demo.banner.exiting") : t("demo.banner.exit")}
          </button>
        </div>
      </div>
      {tipKey && (
        <div className="app-wrap" style={{ paddingTop: 16, paddingBottom: 0 }}>
          <div className="demo-tip">
            <div className="demo-tip-title">{t("demo.tip.label")}</div>
            <div>{t(tipKey)}</div>
          </div>
        </div>
      )}
    </>
  );
}

function pickTipKey(pathname: string): string | null {
  if (pathname === "/dashboard") return "demo.tip.dashboard";
  if (pathname.startsWith("/dashboard/lines")) return "demo.tip.lines";
  if (pathname.startsWith("/dashboard/operators")) return "demo.tip.operators";
  if (pathname.startsWith("/dashboard/shifts")) return "demo.tip.shifts";
  if (pathname === "/operator") return "demo.tip.operator";
  if (pathname.startsWith("/shift/") && pathname.endsWith("/summary")) return "demo.tip.summary";
  if (pathname.startsWith("/shift/")) return "demo.tip.shift";
  if (pathname === "/pin") return "demo.tip.pin";
  return null;
}
