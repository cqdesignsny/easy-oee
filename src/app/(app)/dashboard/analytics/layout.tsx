/**
 * Analytics module subnav. Shown on every /dashboard/analytics/* route
 * underneath the manager sidebar. Uses i18n keys so labels translate.
 */

import type { ReactNode } from "react";
import { AnalyticsSubnav } from "./subnav";

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnalyticsSubnav />
      {children}
    </>
  );
}
