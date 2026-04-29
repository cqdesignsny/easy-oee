import Link from "next/link";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { getServerT } from "@/components/i18n/server";
import {
  getAnalyticsByMachine,
  getStopsByMachine,
} from "@/lib/db/queries/analytics";
import { getAnalyticsCompanyId, STOP_LABEL_KEYS } from "../helpers";

export const metadata = { title: "Analytics by Machine | Easy OEE" };
export const revalidate = 60;
export const dynamic = "force-dynamic";

function bucketClass(v: number | null) {
  return `oee-${oeeBucket(v)}`;
}

export default async function AnalyticsMachinesPage() {
  const t = await getServerT();
  const companyId = await getAnalyticsCompanyId();
  if (!companyId) {
    return (
      <main className="app-shell">
        <div className="app-wrap"><p>{t("analytics.empty.noCompany")}</p></div>
      </main>
    );
  }

  const [machineData, stopData] = await Promise.all([
    getAnalyticsByMachine(companyId, 30),
    getStopsByMachine(companyId, 30),
  ]);

  const stopsByLine: Record<string, typeof stopData> = {};
  for (const row of stopData) {
    if (!stopsByLine[row.lineId]) stopsByLine[row.lineId] = [];
    stopsByLine[row.lineId].push(row);
  }

  return (
    <main className="app-shell">
      <div className="app-wrap">
        <div className="dash-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="app-tag">{t("analytics.byMachine.tag")}</div>
            <h1 className="app-h1">{t("analytics.byMachine.title")}</h1>
            <p style={{ color: "var(--muted2)", marginTop: 4, fontSize: 14 }}>
              {t("analytics.byMachine.window")}
            </p>
          </div>
          <Link href="/dashboard/analytics" className="btn btn-ghost">
            ← {t("analytics.backToOverview")}
          </Link>
        </div>

        {machineData.length === 0 ? (
          <div className="card">
            <p style={{ color: "var(--muted2)" }}>{t("analytics.byMachine.empty")}</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 24, overflowX: "auto" }}>
              <div className="kpi-label" style={{ marginBottom: 16 }}>
                {t("analytics.byMachine.summaryTitle")}
              </div>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>{t("analytics.col.line")}</th>
                    <th>{t("analytics.col.shiftCount")}</th>
                    <th>{t("analytics.col.oee")}</th>
                    <th>{t("analytics.col.vsTarget")}</th>
                    <th>{t("analytics.col.availability")}</th>
                    <th>{t("analytics.col.performance")}</th>
                    <th>{t("analytics.col.quality")}</th>
                    <th>{t("analytics.col.goodParts")}</th>
                    <th>{t("analytics.col.badParts")}</th>
                    <th>{t("analytics.col.defectRate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {machineData.map((m) => {
                    const vs = m.vsTarget;
                    const vsClass =
                      vs == null
                        ? undefined
                        : vs >= 0
                          ? "oee-world-class"
                          : "oee-low";
                    return (
                      <tr key={m.lineId}>
                        <td style={{ fontWeight: 500 }}>{m.lineName}</td>
                        <td>{m.totalShifts}</td>
                        <td className={bucketClass(m.avgOee)} style={{ fontWeight: 500 }}>
                          {formatPercent(m.avgOee)}
                        </td>
                        <td
                          className={vsClass}
                          style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13 }}
                        >
                          {vs != null
                            ? `${vs >= 0 ? "+" : ""}${(vs * 100).toFixed(1)}%`
                            : "—"}
                        </td>
                        <td>{formatPercent(m.avgAvailability)}</td>
                        <td>{formatPercent(m.avgPerformance)}</td>
                        <td>{formatPercent(m.avgQuality)}</td>
                        <td>{m.totalGoodParts.toLocaleString()}</td>
                        <td className={m.totalBadParts > 0 ? "oee-low" : undefined}>
                          {m.totalBadParts.toLocaleString()}
                        </td>
                        <td>{formatPercent(m.defectRate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="kpi-label" style={{ marginBottom: 16 }}>
                {t("analytics.byMachine.vsTargetTitle")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {machineData.map((m) => (
                  <div key={m.lineId}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{m.lineName}</span>
                      <span style={{ color: "var(--muted2)" }}>
                        {formatPercent(m.avgOee)} / {t("analytics.target")}{" "}
                        {formatPercent(m.targetOee)}
                      </span>
                    </div>
                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-target"
                        style={{ left: `${m.targetOee * 100}%` }}
                      />
                      <div
                        className={`analytics-bar-fill ${
                          m.vsTarget != null && m.vsTarget >= 0
                            ? "is-above"
                            : "is-below"
                        }`}
                        style={{
                          width: `${Math.min((m.avgOee ?? 0) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="analytics-bar-legend">
                <span className="analytics-bar-legend-fill" />{" "}
                {t("analytics.byMachine.legendActual")}
                <span style={{ marginLeft: 16 }}>
                  <span className="analytics-bar-legend-target" />{" "}
                  {t("analytics.byMachine.legendTarget")}
                </span>
              </div>
            </div>

            <div className="kpi-label" style={{ marginBottom: 12 }}>
              {t("analytics.byMachine.topStopsTitle")}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {machineData.map((m) => {
                const stops = (stopsByLine[m.lineId] ?? []).slice(0, 5);
                const maxMin = stops[0]?.totalMinutes ?? 1;
                return (
                  <div key={m.lineId} className="card">
                    <div className="kpi-label" style={{ marginBottom: 10 }}>
                      {m.lineName}
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
