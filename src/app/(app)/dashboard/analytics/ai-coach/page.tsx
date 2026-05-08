import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import type { CoachAnalysis } from "@/lib/ai/coach";
import { getServerT } from "@/components/i18n/server";
import { getCompanyTimezone } from "@/lib/db/queries/company";
import { getAnalyticsCompanyId } from "../helpers";
import { AICoachClient } from "./client";

export const metadata = { title: "AI Coach | Easy OEE" };
export const dynamic = "force-dynamic";

function parseReport(raw: string | null): CoachAnalysis | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CoachAnalysis;
  } catch {
    return null;
  }
}

export default async function AICoachPage() {
  const t = await getServerT();
  const companyId = await getAnalyticsCompanyId();
  if (!companyId) {
    return (
      <main className="app-shell">
        <div className="app-wrap"><p>{t("analytics.empty.noCompany")}</p></div>
      </main>
    );
  }

  const [tz, [companyRow]] = await Promise.all([
    getCompanyTimezone(companyId),
    db
      .select({
        name: s.company.name,
        aiCoachReport: s.company.aiCoachReport,
        aiCoachGeneratedAt: s.company.aiCoachGeneratedAt,
      })
      .from(s.company)
      .where(eq(s.company.id, companyId))
      .limit(1),
  ]);

  const report = parseReport(companyRow?.aiCoachReport ?? null);
  const generatedAt = companyRow?.aiCoachGeneratedAt
    ? companyRow.aiCoachGeneratedAt.toISOString()
    : null;

  return (
    <main className="app-shell">
      <div className="app-wrap">
        <div className="dash-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="app-tag">{t("coach.tag")}</div>
            <h1 className="app-h1">{t("coach.title")}</h1>
            <p style={{ color: "var(--muted2)", marginTop: 4, fontSize: 14 }}>
              {t("coach.subtitle")}
            </p>
          </div>
          <Link href="/dashboard/analytics" className="btn btn-ghost">
            ← {t("analytics.backToOverview")}
          </Link>
        </div>

        <AICoachClient
          report={report}
          generatedAt={generatedAt}
          timezone={tz}
        />
      </div>
    </main>
  );
}
