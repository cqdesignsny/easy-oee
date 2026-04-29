import Link from "next/link";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { getServerT } from "@/components/i18n/server";
import {
  getAnalyticsByOperator,
  getStopsByOperator,
} from "@/lib/db/queries/analytics";
import { getAnalyticsCompanyId, STOP_LABEL_KEYS } from "../helpers";

export const metadata = { title: "Analytics by Operator | Easy OEE" };
export const revalidate = 60;
export const dynamic = "force-dynamic";

function bucketClass(v: number | null) {
  return `oee-${oeeBucket(v)}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AnalyticsOperatorsPage() {
  const t = await getServerT();
  const companyId = await getAnalyticsCompanyId();
  if (!companyId) {
    return (
      <main className="app-shell">
        <div className="app-wrap"><p>{t("analytics.empty.noCompany")}</p></div>
      </main>
    );
  }

  const [operatorData, stopData] = await Promise.all([
    getAnalyticsByOperator(companyId, 30),
    getStopsByOperator(companyId, 30),
  ]);

  const stopsByOp: Record<string, typeof stopData> = {};
  for (const row of stopData) {
    if (!stopsByOp[row.operatorId]) stopsByOp[row.operatorId] = [];
    stopsByOp[row.operatorId].push(row);
  }

  const maxOee = Math.max(...operatorData.map((o) => o.avgOee ?? 0), 0.01);
  const operatorWord =
    operatorData.length === 1
      ? t("analytics.byOperator.operator")
      : t("analytics.byOperator.operators");

  return (
    <main className="app-shell">
      <div className="app-wrap">
        <div className="dash-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="app-tag">{t("analytics.byOperator.tag")}</div>
            <h1 className="app-h1">{t("analytics.byOperator.title")}</h1>
            <p style={{ color: "var(--muted2)", marginTop: 4, fontSize: 14 }}>
              {t("analytics.byOperator.window")} · {operatorData.length} {operatorWord}
            </p>
          </div>
          <Link href="/dashboard/analytics" className="btn btn-ghost">
            ← {t("analytics.backToOverview")}
          </Link>
        </div>

        {operatorData.length === 0 ? (
          <div className="card">
            <p style={{ color: "var(--muted2)" }}>{t("analytics.byOperator.empty")}</p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {operatorData.map((op, idx) => (
                <div
                  key={op.operatorId}
                  className="card analytics-operator-card"
                >
                  <div
                    className={`analytics-operator-rank${
                      idx === 0 ? " is-top" : ""
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div className="analytics-operator-avatar">
                    {initials(op.operatorName)}
                  </div>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>
                    {op.operatorName}
                  </div>
                  <div
                    style={{ color: "var(--muted2)", fontSize: 12, marginBottom: 10 }}
                  >
                    {op.totalShifts}{" "}
                    {op.totalShifts === 1
                      ? t("analytics.kpi.shift")
                      : t("analytics.kpi.shifts")}
                  </div>
                  <div
                    className={`kpi-big ${bucketClass(op.avgOee)}`}
                    style={{ fontSize: 32, marginBottom: 8 }}
                  >
                    {formatPercent(op.avgOee)}
                  </div>
                  <div className="analytics-apq-row" style={{ marginBottom: 10 }}>
                    <span>A: <strong>{formatPercent(op.avgAvailability)}</strong></span>
                    <span>P: <strong>{formatPercent(op.avgPerformance)}</strong></span>
                    <span>Q: <strong>{formatPercent(op.avgQuality)}</strong></span>
                  </div>
                  <div className="analytics-bar-track" style={{ height: 6 }}>
                    <div
                      className="analytics-bar-fill is-above"
                      style={{
                        width: `${((op.avgOee ?? 0) / maxOee) * 100}%`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: "var(--muted2)",
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <span>
                      {t("analytics.kpi.goodPartsShort")}:{" "}
                      {op.totalGoodParts.toLocaleString()}
                    </span>
                    <span className={op.totalBadParts > 0 ? "oee-low" : undefined}>
                      {t("analytics.kpi.badPartsShort")}:{" "}
                      {op.totalBadParts.toLocaleString()} (
                      {formatPercent(op.defectRate)})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 24, overflowX: "auto" }}>
              <div className="kpi-label" style={{ marginBottom: 16 }}>
                {t("analytics.byOperator.tableTitle")}
              </div>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t("analytics.col.operator")}</th>
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
                  {operatorData.map((op, idx) => (
                    <tr key={op.operatorId}>
                      <td
                        style={{
                          color: "var(--muted2)",
                          fontFamily: "var(--font-dm-mono)",
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 500 }}>{op.operatorName}</td>
                      <td>{op.totalShifts}</td>
                      <td
                        className={bucketClass(op.avgOee)}
                        style={{ fontWeight: 500 }}
                      >
                        {formatPercent(op.avgOee)}
                      </td>
                      <td>{formatPercent(op.avgAvailability)}</td>
                      <td>{formatPercent(op.avgPerformance)}</td>
                      <td>{formatPercent(op.avgQuality)}</td>
                      <td>{op.totalGoodParts.toLocaleString()}</td>
                      <td className={op.totalBadParts > 0 ? "oee-low" : undefined}>
                        {op.totalBadParts.toLocaleString()}
                      </td>
                      <td>{formatPercent(op.defectRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="kpi-label" style={{ marginBottom: 12 }}>
              {t("analytics.byOperator.topStopsTitle")}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {operatorData.map((op) => {
                const stops = (stopsByOp[op.operatorId] ?? []).slice(0, 5);
                const maxMin = stops[0]?.totalMinutes ?? 1;
                return (
                  <div key={op.operatorId} className="card">
                    <div className="kpi-label" style={{ marginBottom: 10 }}>
                      {op.operatorName}
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
