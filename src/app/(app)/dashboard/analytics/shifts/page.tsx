import Link from "next/link";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { getServerT } from "@/components/i18n/server";
import {
  getAnalyticsByShiftType,
  getStopsByShiftType,
} from "@/lib/db/queries/analytics";
import { getAnalyticsCompanyId, STOP_LABEL_KEYS } from "../helpers";

export const metadata = { title: "Analytics by Shift | Easy OEE" };
export const revalidate = 60;
export const dynamic = "force-dynamic";

const SHIFT_ORDER = ["morning", "afternoon", "night"] as const;

function bucketClass(v: number | null) {
  return `oee-${oeeBucket(v)}`;
}

export default async function AnalyticsShiftsPage() {
  const t = await getServerT();
  const companyId = await getAnalyticsCompanyId();
  if (!companyId) {
    return (
      <main className="app-shell">
        <div className="app-wrap"><p>{t("analytics.empty.noCompany")}</p></div>
      </main>
    );
  }

  const [shiftData, stopData] = await Promise.all([
    getAnalyticsByShiftType(companyId, 30),
    getStopsByShiftType(companyId, 30),
  ]);

  const stopsByType: Record<string, typeof stopData> = {};
  for (const row of stopData) {
    if (!stopsByType[row.shiftType]) stopsByType[row.shiftType] = [];
    stopsByType[row.shiftType].push(row);
  }

  return (
    <main className="app-shell">
      <div className="app-wrap">
        <div className="dash-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="app-tag">{t("analytics.byShift.tag")}</div>
            <h1 className="app-h1">{t("analytics.byShift.title")}</h1>
            <p style={{ color: "var(--muted2)", marginTop: 4, fontSize: 14 }}>
              {t("analytics.byShift.window")}
            </p>
          </div>
          <Link href="/dashboard/analytics" className="btn btn-ghost">
            ← {t("analytics.backToOverview")}
          </Link>
        </div>

        {shiftData.length === 0 ? (
          <div className="card">
            <p style={{ color: "var(--muted2)" }}>{t("analytics.byShift.empty")}</p>
          </div>
        ) : (
          <>
            <div className="analytics-kpi-grid" style={{ marginBottom: 24 }}>
              {SHIFT_ORDER.map((type) => {
                const d = shiftData.find((r) => r.shiftType === type);
                if (!d) {
                  return (
                    <div key={type} className="card analytics-kpi-card" style={{ opacity: 0.4 }}>
                      <div className="kpi-label">{t(`operator.shift.${type}`)}</div>
                      <div className="kpi-big">—</div>
                      <div className="kpi-sub">{t("analytics.byShift.noData")}</div>
                    </div>
                  );
                }
                return (
                  <div key={type} className="card analytics-kpi-card">
                    <div className="kpi-label">{t(`operator.shift.${type}`)}</div>
                    <div className={`kpi-big ${bucketClass(d.avgOee)}`}>
                      {formatPercent(d.avgOee)}
                    </div>
                    <div className="kpi-sub">
                      {d.totalShifts}{" "}
                      {d.totalShifts === 1
                        ? t("analytics.kpi.shift")
                        : t("analytics.kpi.shifts")}
                    </div>
                    <div className="analytics-apq-row">
                      <span>A: <strong>{formatPercent(d.avgAvailability)}</strong></span>
                      <span>P: <strong>{formatPercent(d.avgPerformance)}</strong></span>
                      <span>Q: <strong>{formatPercent(d.avgQuality)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ marginBottom: 24, overflowX: "auto" }}>
              <div className="kpi-label" style={{ marginBottom: 16 }}>
                {t("analytics.byShift.tableTitle")}
              </div>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>{t("analytics.col.shift")}</th>
                    <th>{t("analytics.col.shiftCount")}</th>
                    <th>{t("analytics.col.oee")}</th>
                    <th>{t("analytics.col.availability")}</th>
                    <th>{t("analytics.col.performance")}</th>
                    <th>{t("analytics.col.quality")}</th>
                    <th>{t("analytics.col.goodParts")}</th>
                    <th>{t("analytics.col.badParts")}</th>
                    <th>{t("analytics.col.defectRate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {SHIFT_ORDER.map((type) => {
                    const d = shiftData.find((r) => r.shiftType === type);
                    if (!d) {
                      return (
                        <tr key={type}>
                          <td>{t(`operator.shift.${type}`)}</td>
                          <td colSpan={8} style={{ color: "var(--muted2)" }}>
                            {t("analytics.byShift.noData")}
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={type}>
                        <td>{t(`operator.shift.${type}`)}</td>
                        <td>{d.totalShifts}</td>
                        <td className={bucketClass(d.avgOee)} style={{ fontWeight: 500 }}>
                          {formatPercent(d.avgOee)}
                        </td>
                        <td>{formatPercent(d.avgAvailability)}</td>
                        <td>{formatPercent(d.avgPerformance)}</td>
                        <td>{formatPercent(d.avgQuality)}</td>
                        <td>{d.totalGoodParts.toLocaleString()}</td>
                        <td className={d.totalBadParts > 0 ? "oee-low" : undefined}>
                          {d.totalBadParts.toLocaleString()}
                        </td>
                        <td>{formatPercent(d.defectRate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="analytics-kpi-grid" style={{ marginBottom: 24 }}>
              {SHIFT_ORDER.map((type) => {
                const stops = (stopsByType[type] ?? []).slice(0, 5);
                const maxMin = stops[0]?.totalMinutes ?? 1;
                return (
                  <div key={type} className="card">
                    <div className="kpi-label" style={{ marginBottom: 12 }}>
                      {t(`operator.shift.${type}`)} · {t("analytics.topStops")}
                    </div>
                    {stops.length === 0 ? (
                      <p style={{ color: "var(--muted2)", fontSize: 13 }}>
                        {t("analytics.noStops")}
                      </p>
                    ) : (
                      stops.map((st) => (
                        <div className="pareto-row" key={st.reason}>
                          <div style={{ fontSize: 12 }}>
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
                              fontSize: 11,
                              textAlign: "right",
                              minWidth: 36,
                            }}
                          >
                            {st.totalMinutes.toFixed(0)}m
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
