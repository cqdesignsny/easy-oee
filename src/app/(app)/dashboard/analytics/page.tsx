import Link from "next/link";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { getServerT } from "@/components/i18n/server";
import {
  getAnalyticsOverview,
  getOeeTrend,
} from "@/lib/db/queries/analytics";
import { getAnalyticsCompanyId } from "./helpers";

export const metadata = { title: "Analytics | Easy OEE" };
export const revalidate = 60;
export const dynamic = "force-dynamic";

function bucketClass(v: number | null) {
  return `oee-${oeeBucket(v)}`;
}

export default async function AnalyticsPage() {
  const t = await getServerT();
  const companyId = await getAnalyticsCompanyId();
  if (!companyId) {
    return (
      <main className="app-shell">
        <div className="app-wrap"><p>{t("analytics.empty.noCompany")}</p></div>
      </main>
    );
  }

  const [overview, trend] = await Promise.all([
    getAnalyticsOverview(companyId, 30),
    getOeeTrend(companyId, 30),
  ]);

  const trendLast14 = trend.slice(-14);
  const maxOee = Math.max(...trendLast14.map((d) => d.oee ?? 0), 0.01);

  return (
    <main className="app-shell">
      <div className="app-wrap">
        <div className="dash-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="app-tag">{t("analytics.tag")}</div>
            <h1 className="app-h1">{t("analytics.title")}</h1>
            <p style={{ color: "var(--muted2)", marginTop: 4, fontSize: 14 }}>
              {t("analytics.window30").replace("{n}", String(overview.totalShifts))}
            </p>
          </div>
          <Link href="/dashboard" className="btn btn-ghost">
            ← {t("analytics.back")}
          </Link>
        </div>

        {/* OEE / A / P / Q row */}
        <div className="analytics-kpi-grid" style={{ marginBottom: 24 }}>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("analytics.kpi.oee")}</div>
            <div className={`kpi-big ${bucketClass(overview.avgOee)}`}>
              {formatPercent(overview.avgOee)}
            </div>
            <div className="kpi-sub">{t("analytics.kpi.oeeSub")}</div>
          </div>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("analytics.kpi.availability")}</div>
            <div className={`kpi-big ${bucketClass(overview.avgAvailability)}`}>
              {formatPercent(overview.avgAvailability)}
            </div>
            <div className="kpi-sub">{t("analytics.kpi.availabilitySub")}</div>
          </div>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("analytics.kpi.performance")}</div>
            <div className={`kpi-big ${bucketClass(overview.avgPerformance)}`}>
              {formatPercent(overview.avgPerformance)}
            </div>
            <div className="kpi-sub">{t("analytics.kpi.performanceSub")}</div>
          </div>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("analytics.kpi.quality")}</div>
            <div className={`kpi-big ${bucketClass(overview.avgQuality)}`}>
              {formatPercent(overview.avgQuality)}
            </div>
            <div className="kpi-sub">{t("analytics.kpi.qualitySub")}</div>
          </div>
        </div>

        {/* Production volumes */}
        <div className="analytics-kpi-grid analytics-kpi-grid--3" style={{ marginBottom: 24 }}>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("analytics.kpi.goodParts")}</div>
            <div className="kpi-big oee-world-class">
              {overview.totalGoodParts.toLocaleString()}
            </div>
            <div className="kpi-sub">{t("analytics.kpi.last30")}</div>
          </div>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("analytics.kpi.badParts")}</div>
            <div className="kpi-big oee-low">
              {overview.totalBadParts.toLocaleString()}
            </div>
            <div className="kpi-sub">
              {formatPercent(overview.defectRate)} {t("analytics.kpi.defectRate")}
            </div>
          </div>
          <div className="card analytics-kpi-card">
            <div className="kpi-label">{t("analytics.kpi.totalProduced")}</div>
            <div className="kpi-big">
              {overview.totalParts.toLocaleString()}
            </div>
            <div className="kpi-sub">
              {overview.totalShifts}{" "}
              {overview.totalShifts === 1
                ? t("analytics.kpi.shift")
                : t("analytics.kpi.shifts")}
            </div>
          </div>
        </div>

        {/* OEE trend sparkline */}
        {trendLast14.length > 1 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="kpi-label" style={{ marginBottom: 16 }}>
              {t("analytics.trend14")}
            </div>
            <div style={{ overflowX: "auto" }}>
              <svg
                viewBox={`0 0 ${trendLast14.length * 48} 120`}
                style={{ width: "100%", minWidth: 320, height: 120 }}
              >
                <line
                  x1="0"
                  y1={100 - (0.85 / maxOee) * 90}
                  x2={trendLast14.length * 48}
                  y2={100 - (0.85 / maxOee) * 90}
                  stroke="var(--accent)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  opacity="0.4"
                />
                <text
                  x="4"
                  y={100 - (0.85 / maxOee) * 90 - 4}
                  fill="var(--accent)"
                  fontSize="8"
                  opacity="0.6"
                >
                  85%
                </text>
                <polyline
                  points={trendLast14
                    .map((d, i) => {
                      const x = i * 48 + 24;
                      const y = d.oee != null ? 100 - (d.oee / maxOee) * 90 : 100;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {trendLast14.map((d, i) => {
                  const x = i * 48 + 24;
                  const y = d.oee != null ? 100 - (d.oee / maxOee) * 90 : 100;
                  return (
                    <g key={i}>
                      {d.oee != null && (
                        <circle cx={x} cy={y} r="3" fill="var(--accent)" />
                      )}
                      <text
                        x={x}
                        y="115"
                        textAnchor="middle"
                        fill="var(--muted2)"
                        fontSize="7"
                      >
                        {d.date ? String(d.date).slice(5) : ""}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Drill-in cards */}
        <div className="analytics-nav-grid">
          <Link
            href="/dashboard/analytics/shifts"
            className="card analytics-nav-card"
          >
            <div className="analytics-nav-tag">{t("analytics.nav.byShift.tag")}</div>
            <div className="analytics-nav-title">{t("analytics.nav.byShift.title")}</div>
            <div className="analytics-nav-desc">{t("analytics.nav.byShift.desc")}</div>
            <div className="analytics-nav-cta">{t("analytics.nav.viewAnalysis")} →</div>
          </Link>
          <Link
            href="/dashboard/analytics/machines"
            className="card analytics-nav-card"
          >
            <div className="analytics-nav-tag">{t("analytics.nav.byMachine.tag")}</div>
            <div className="analytics-nav-title">{t("analytics.nav.byMachine.title")}</div>
            <div className="analytics-nav-desc">{t("analytics.nav.byMachine.desc")}</div>
            <div className="analytics-nav-cta">{t("analytics.nav.viewAnalysis")} →</div>
          </Link>
          <Link
            href="/dashboard/analytics/operators"
            className="card analytics-nav-card"
          >
            <div className="analytics-nav-tag">{t("analytics.nav.byOperator.tag")}</div>
            <div className="analytics-nav-title">{t("analytics.nav.byOperator.title")}</div>
            <div className="analytics-nav-desc">{t("analytics.nav.byOperator.desc")}</div>
            <div className="analytics-nav-cta">{t("analytics.nav.viewAnalysis")} →</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
