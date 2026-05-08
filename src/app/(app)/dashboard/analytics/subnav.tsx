"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n/LanguageProvider";

const LINKS: ReadonlyArray<{ href: string; key: string; exact?: boolean }> = [
  { href: "/dashboard/analytics", key: "analytics.subnav.overview", exact: true },
  { href: "/dashboard/analytics/shifts", key: "analytics.subnav.byShift" },
  { href: "/dashboard/analytics/machines", key: "analytics.subnav.byMachine" },
  { href: "/dashboard/analytics/operators", key: "analytics.subnav.byOperator" },
  { href: "/dashboard/analytics/jobs", key: "analytics.subnav.byJob" },
  { href: "/dashboard/analytics/ai-coach", key: "analytics.subnav.aiCoach" },
];

export function AnalyticsSubnav() {
  const t = useT();
  const pathname = usePathname() ?? "";
  return (
    <nav className="analytics-subnav app-wrap" style={{ paddingTop: 24, paddingBottom: 0 }}>
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`analytics-subnav-link${active ? " is-active" : ""}`}
          >
            {t(l.key)}
          </Link>
        );
      })}
    </nav>
  );
}
