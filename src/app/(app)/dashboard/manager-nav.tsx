"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n/LanguageProvider";

export function ManagerNav() {
  const t = useT();
  const pathname = usePathname();
  const links = [
    { href: "/dashboard", label: t("mgr.nav.dashboard"), exact: true },
    { href: "/dashboard/analytics", label: t("mgr.nav.analytics") },
    { href: "/dashboard/shifts", label: t("mgr.nav.shifts") },
    { href: "/dashboard/lines", label: t("mgr.nav.lines") },
    { href: "/dashboard/operators", label: t("mgr.nav.operators") },
    { href: "/dashboard/settings", label: t("mgr.nav.settings") },
    { href: "/operator", label: `${t("mgr.nav.startShift")} →` },
  ];
  return (
    <nav>
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname?.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={active ? "active" : ""}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
