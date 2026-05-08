import Link from "next/link";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { getServerT } from "@/components/i18n/server";
import { getJobOrdersList } from "@/lib/db/queries/job-orders";
import { getCompanyTimezone } from "@/lib/db/queries/company";
import { formatPlantDate } from "@/lib/time";
import { getAnalyticsCompanyId } from "../helpers";

export const metadata = { title: "Job Orders | Easy OEE" };
export const revalidate = 60;
export const dynamic = "force-dynamic";

function bucketClass(v: number | null) {
  return `oee-${oeeBucket(v)}`;
}

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes.toFixed(0)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes - h * 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default async function JobOrdersPage() {
  const t = await getServerT();
  const companyId = await getAnalyticsCompanyId();
  if (!companyId) {
    return (
      <main className="app-shell">
        <div className="app-wrap"><p>{t("analytics.empty.noCompany")}</p></div>
      </main>
    );
  }

  const [tz, jobs] = await Promise.all([
    getCompanyTimezone(companyId),
    getJobOrdersList(companyId, 90),
  ]);

  const totalJobs = jobs.length;
  const totalGood = jobs.reduce((acc, j) => acc + j.totalGoodParts, 0);
  const totalBad = jobs.reduce((acc, j) => acc + j.totalBadParts, 0);
  const totalPlannedMinutes = jobs.reduce((acc, j) => acc + j.totalPlannedMinutes, 0);
  const oeeValues = jobs.map((j) => j.avgOee).filter((v): v is number => v != null);
  const avgOee = oeeValues.length > 0
    ? oeeValues.reduce((a, b) => a + b, 0) / oeeValues.length
    : null;

  return (
    <main className="app-shell">
      <div className="app-wrap">
        <div className="dash-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="app-tag">{t("jobs.tag")}</div>
            <h1 className="app-h1">{t("jobs.title")}</h1>
            <p style={{ color: "var(--muted2)", marginTop: 4, fontSize: 14 }}>
              {t("jobs.window90")} · {totalJobs}{" "}
              {totalJobs === 1 ? t("jobs.order") : t("jobs.orders")}
            </p>
          </div>
          <Link href="/dashboard/analytics" className="btn btn-ghost">
            ← {t("analytics.backToOverview")}
          </Link>
        </div>

        {totalJobs === 0 ? (
          <div className="card">
            <p style={{ color: "var(--muted2)" }}>{t("jobs.empty")}</p>
          </div>
        ) : (
          <>
            <div className="analytics-kpi-grid analytics-kpi-grid--3" style={{ marginBottom: 24 }}>
              <div className="card analytics-kpi-card">
                <div className="kpi-label">{t("jobs.kpi.totalOrders")}</div>
                <div className="kpi-big">{totalJobs.toLocaleString()}</div>
                <div className="kpi-sub">{t("jobs.kpi.last90")}</div>
              </div>
              <div className="card analytics-kpi-card">
                <div className="kpi-label">{t("jobs.kpi.totalGoodParts")}</div>
                <div className="kpi-big oee-world-class">{totalGood.toLocaleString()}</div>
                <div className="kpi-sub">{totalBad.toLocaleString()} {t("jobs.kpi.defects")}</div>
              </div>
              <div className="card analytics-kpi-card">
                <div className="kpi-label">{t("jobs.kpi.avgOee")}</div>
                <div className={`kpi-big ${bucketClass(avgOee)}`}>
                  {formatPercent(avgOee)}
                </div>
                <div className="kpi-sub">
                  {formatHours(totalPlannedMinutes)} {t("jobs.kpi.plannedTime")}
                </div>
              </div>
            </div>

            <div className="card" style={{ overflowX: "auto" }}>
              <div className="kpi-label" style={{ marginBottom: 16 }}>
                {t("jobs.tableTitle")}
              </div>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>{t("jobs.col.jobNumber")}</th>
                    <th>{t("jobs.col.firstSeen")}</th>
                    <th>{t("jobs.col.shifts")}</th>
                    <th>{t("jobs.col.operators")}</th>
                    <th>{t("jobs.col.lines")}</th>
                    <th>{t("jobs.col.plannedTime")}</th>
                    <th>{t("jobs.col.goodParts")}</th>
                    <th>{t("jobs.col.badParts")}</th>
                    <th>{t("jobs.col.oee")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.jobNumber}>
                      <td style={{ fontWeight: 500, fontFamily: "var(--font-dm-mono)" }}>
                        {j.jobNumber}
                      </td>
                      <td style={{ color: "var(--muted2)", fontSize: 13 }}>
                        {j.firstStartedAt
                          ? formatPlantDate(j.firstStartedAt, tz)
                          : "—"}
                      </td>
                      <td>{j.totalShifts}</td>
                      <td>{j.uniqueOperators}</td>
                      <td>{j.uniqueLines}</td>
                      <td>{formatHours(j.totalPlannedMinutes)}</td>
                      <td>{j.totalGoodParts.toLocaleString()}</td>
                      <td className={j.totalBadParts > 0 ? "oee-low" : undefined}>
                        {j.totalBadParts.toLocaleString()}
                      </td>
                      <td
                        className={bucketClass(j.avgOee)}
                        style={{ fontWeight: 500 }}
                      >
                        {formatPercent(j.avgOee)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link
                          href={`/dashboard/analytics/jobs/${encodeURIComponent(j.jobNumber)}`}
                          className="btn btn-ghost"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                        >
                          {t("jobs.col.view")} →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
