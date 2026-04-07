"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/shifts", label: "Shifts" },
  { href: "/dashboard/lines", label: "Lines" },
  { href: "/dashboard/operators", label: "Operators" },
  { href: "/operator", label: "Start Shift →" },
];

export function ManagerNav() {
  const pathname = usePathname();
  return (
    <nav>
      {LINKS.map((l) => {
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
