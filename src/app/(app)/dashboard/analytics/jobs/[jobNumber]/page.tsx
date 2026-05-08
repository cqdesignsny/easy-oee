import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { getServerT } from "@/components/i18n/server";
import { getJobOrderDetail } from "@/lib/db/queries/job-orders";
import { getCompanyTimezone } from "@/lib/db/queries/company";
import { formatPlantDate, formatPlantDateTime } from "@/lib/time";
import { getAnalyticsCompanyId, STOP_LABEL_KEYS } from "../../helpers";

export const metadata = { title: "Job Order | Easy OEE" };
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

const SHIFT_TYPE_KEY: Record<string, string> = {
  morning: "operator.shift.morning",
  afternoon: "operator.shift.afternoon",
  night: "operator.shift.night",
};

export default async function JobOrderDetailPage({
  params,
}: {
  params: Promise<{ jobNumber: string }>;
}) {
  const { jobNumber: rawJobNumber } = await params;
  const jobNumber = decodeURIComponent(rawJobNumber);
  const t = await getServerT();
  const companyId = await getAnalyticsCompanyId();
  if (!companyId) {
    return (
      <main className="app-shell">
        <div className="app-wrap"><p>{t("analytics.empty.noCompany")}</p></div>
      </main>
    );
  }

  const [tz, detail] = await Promise.all([
    getCompanyTimezone(companyId),
    getJobOrderDetail(companyId, jobNumber),
  ]);
  if (!detail) notFound();

  const { shifts, stops, totals } = detail;
  const totalRunMinutes = totals.totalPlannedMinutes - totals.totalStopMinutes;
  const totalParts = totals.totalGoodParts + totals.totalBadParts;
  const defectRate = totalParts > 0 ? totals.totalBadParts / totalParts : null;
  const maxOpMinutes = Math.max(
    1,
    ...shifts.map((sh) => sh.plannedMinutes - sh.totalStopMinutes),
  );

  const operatorTimeline = (() => {
    const byOp = new Map<string, { name: string; minutes: number }>();
    for (const sh of shifts) {
      const cur = byOp.get(sh.operatorId) ?? { name: sh.operatorName, minutes: 0 };
      cur.minutes += Math.max(0, sh.plannedMinutes - sh.totalStopMinutes);
      byOp.set(sh.operatorId, cur);
    }
    return Array.from(byOp.entries())
      .map(([id, v]) => ({ operatorId: id, ...v }))
      .sort((a, b) => b.minutes - a.minutes);
  })();

  return (
    <main className="app-shell">
      <div className="app-wrap">
        <div className="dash-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="app-tag">
              {t("jobs.tag")} ·{" "}
              <span style={{ fontFamily: "var(--font-dm-mono)" }}>{jobNumber}</span>
            </div>
            <h1 className="app-h1">
              {detail.product ?? t("jobs.detail.unknownProduct")}
            </h1>
            <p style={{ color: "var(--muted2)", marginTop: 4, fontSize: 14 }}>
              {totals.firstStartedAt
                ? formatPlantDate(totals.firstStartedAt, tz)
                : "—"}{" "}
              →{" "}
              {totals.lastEndedAt
                ? formatPlantDate(totals.lastEndedAt, tz)
                : t("jobs.detail.inProgress")}
              {" · "}
              {totals.totalShifts}{" "}
              {totals.totalShifts === 1
                ? t("analytics.kpi.shift")
                : t("analytics.kpi.shifts")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href={`/api/analytics/jobs/${encodeURIComponent(jobNumber)}/export`}
              className="btn btn-ghost"
            >
              {t("jobs.detail.exportCsv")}
            </a>
            <Link href="/dashboard/analytics/jobs" className="btn btn-ghost">
              ← {t("jobs.detail.back")}
            </Link>
          </div>
        </div>

        <div className="analytics-kpi-grid" style={{ marginBottom: 24 }}>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("jobs.detail.kpi.runTime")}</div>
            <div className="kpi-big">{formatHours(totalRunMinutes)}</div>
            <div className="kpi-sub">
              {formatHours(totals.totalStopMinutes)} {t("jobs.detail.kpi.stopTime")}
            </div>
          </div>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("analytics.kpi.oee")}</div>
            <div className={`kpi-big ${bucketClass(totals.avgOee)}`}>
              {formatPercent(totals.avgOee)}
            </div>
            <div className="kpi-sub">
              A {formatPercent(totals.avgAvailability)} · P{" "}
              {formatPercent(totals.avgPerformance)} · Q{" "}
              {formatPercent(totals.avgQuality)}
            </div>
          </div>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("analytics.kpi.goodParts")}</div>
            <div className="kpi-big oee-world-class">
              {totals.totalGoodParts.toLocaleString()}
            </div>
            <div className="kpi-sub">
              {totals.totalBadParts.toLocaleString()}{" "}
              {t("jobs.kpi.defects")} ({formatPercent(defectRate)})
            </div>
          </div>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("jobs.detail.kpi.team")}</div>
            <div className="kpi-big">{totals.uniqueOperators}</div>
            <div className="kpi-sub">
              {totals.uniqueLines}{" "}
              {totals.uniqueLines === 1
                ? t("jobs.detail.kpi.line")
                : t("jobs.detail.kpi.lines")}
            </div>
          </div>
        </div>

        {operatorTimeline.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="kpi-label" style={{ marginBottom: 12 }}>
              {t("jobs.detail.timelineTitle")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {operatorTimeline.map((op) => (
                <div key={op.operatorId} style={{ display: "grid", gridTemplateColumns: "180px 1fr 70px", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{op.name}</div>
                  <div className="analytics-bar-track" style={{ height: 10 }}>
                    <div
                      className="analytics-bar-fill is-above"
                      style={{ width: `${(op.minutes / maxOpMinutes) * 100}%` }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: 12,
                      textAlign: "right",
                      color: "var(--muted2)",
                    }}
                  >
                    {formatHours(op.minutes)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: 24, overflowX: "auto" }}>
          <div className="kpi-label" style={{ marginBottom: 16 }}>
            {t("jobs.detail.shiftBreakdownTitle")}
          </div>
          <table className="app-table">
            <thead>
              <tr>
                <th>{t("jobs.detail.col.startedAt")}</th>
                <th>{t("jobs.detail.col.line")}</th>
                <th>{t("jobs.detail.col.operator")}</th>
                <th>{t("jobs.detail.col.shiftType")}</th>
                <th>{t("jobs.detail.col.runTime")}</th>
                <th>{t("analytics.col.goodParts")}</th>
                <th>{t("analytics.col.badParts")}</th>
                <th>{t("analytics.col.oee")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((sh) => {
                const runMin = Math.max(0, sh.plannedMinutes - sh.totalStopMinutes);
                return (
                  <tr key={sh.shiftId}>
                    <td style={{ color: "var(--muted2)", fontSize: 13 }}>
                      {formatPlantDateTime(sh.startedAt, tz)}
                    </td>
                    <td style={{ fontWeight: 500 }}>{sh.lineName}</td>
                    <td>{sh.operatorName}</td>
                    <td>{t(SHIFT_TYPE_KEY[sh.shiftType] ?? sh.shiftType)}</td>
                    <td>{formatHours(runMin)}</td>
                    <td>{sh.goodParts.toLocaleString()}</td>
                    <td className={sh.badParts > 0 ? "oee-low" : undefined}>
                      {sh.badParts.toLocaleString()}
                    </td>
                    <td className={bucketClass(sh.oee)} style={{ fontWeight: 500 }}>
                      {sh.status === "complete" ? formatPercent(sh.oee) : t("jobs.detail.inProgress")}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/shift/${sh.shiftId}/summary`}
                        className="btn btn-ghost"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                      >
                        {t("jobs.detail.col.viewShift")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: 600, borderTop: "2px solid var(--border2)" }}>
                <td colSpan={4}>{t("jobs.detail.totalRow")}</td>
                <td>{formatHours(totalRunMinutes)}</td>
                <td>{totals.totalGoodParts.toLocaleString()}</td>
                <td className={totals.totalBadParts > 0 ? "oee-low" : undefined}>
                  {totals.totalBadParts.toLocaleString()}
                </td>
                <td className={bucketClass(totals.avgOee)}>
                  {formatPercent(totals.avgOee)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {stops.length > 0 && (
          <div className="card">
            <div className="kpi-label" style={{ marginBottom: 12 }}>
              {t("jobs.detail.stopsTitle")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {stops.slice(0, 10).map((st) => {
                const maxMin = stops[0]?.totalMinutes ?? 1;
                return (
                  <div className="pareto-row" key={st.reason}>
                    <div style={{ fontSize: 13 }}>
                      {t(STOP_LABEL_KEYS[st.reason] ?? st.reason)}
                    </div>
                    <div className="pareto-bar">
                      <div
                        className="pareto-fill"
                        style={{ width: `${(st.totalMinutes / maxMin) * 100}%` }}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-dm-mono)",
                        fontSize: 12,
                        textAlign: "right",
                        minWidth: 70,
                        color: "var(--muted2)",
                      }}
                    >
                      {formatHours(st.totalMinutes)} · {st.occurrences}×
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
