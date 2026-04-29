import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { getServerT } from "@/components/i18n/server";
import { getCompanyLiveLines } from "@/lib/db/queries/line-state";
import { LiveLinesGrid } from "./live-lines-grid";
import { TrialBanner } from "./trial-banner";
import { getAdminSession } from "@/lib/auth/admin-session";
import { DashboardScanButton } from "@/components/scanner/DashboardScanButton";

type ShiftType = "morning" | "afternoon" | "night";

const STOP_LABEL_KEYS: Record<string, string> = {
  mechanical_failure: "stop.01.label",
  changeover: "stop.02.label",
  no_material: "stop.03.label",
  quality_check: "stop.04.label",
  scheduled_break: "stop.05.label",
  no_operator: "stop.06.label",
  maintenance: "stop.07.label",
  training: "stop.08.label",
  no_production_scheduled: "stop.09.label",
  other: "stop.10.label",
};

export const metadata = { title: "Dashboard | Easy OEE" };
// Live-ish: refresh every 10s for in-progress shifts
export const revalidate = 10;
export const dynamic = "force-dynamic";

/**
 * Resolve the company for the dashboard. Reads the admin session (set by
 * /sign-up or /sign-in); falls back to the seeded demo tenant for the
 * legacy ADMIN_PASSWORD demo gate while we migrate everyone onto real signup.
 */
async function getDashboardCompanyId(): Promise<{ id: string | null; trialEndsAt: Date | null; companyName: string | null }> {
  const session = await getAdminSession();
  if (session) {
    const [row] = await db
      .select({ id: s.company.id, name: s.company.name, trialEndsAt: s.company.trialEndsAt })
      .from(s.company)
      .where(eq(s.company.id, session.companyId))
      .limit(1);
    if (row) return { id: row.id, trialEndsAt: row.trialEndsAt, companyName: row.name };
  }
  const [c] = await db
    .select({ id: s.company.id, name: s.company.name, trialEndsAt: s.company.trialEndsAt })
    .from(s.company)
    .where(eq(s.company.slug, "maple-manufacturing"))
    .limit(1);
  return { id: c?.id ?? null, trialEndsAt: c?.trialEndsAt ?? null, companyName: c?.name ?? null };
}

function bucketClass(v: number | null) {
  return `oee-${oeeBucket(v)}`;
}

export default async function DashboardPage() {
  const company = await getDashboardCompanyId();
  const companyId = company.id;
  const t = await getServerT();

  if (!companyId) {
    return (
      <main className="app-shell">
        <div className="app-wrap">
          <div className="app-tag">Manager Dashboard</div>
          <h1 className="app-h1">NO COMPANY</h1>
          <p style={{ color: "var(--muted2)", marginTop: 12 }}>
            Run <code>pnpm db:seed</code> to create the demo tenant.
          </p>
        </div>
      </main>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  // Live per-line snapshot for the new grid
  const liveLines = await getCompanyLiveLines(companyId);

  // Today's shifts → today's OEE (avg of completed shifts today)
  const todayShifts = await db
    .select()
    .from(s.shift)
    .where(and(eq(s.shift.companyId, companyId), eq(s.shift.shiftDate, todayStr)));

  const todayCompleted = todayShifts.filter((x) => x.status === "complete" && x.oee != null);
  const todayOee =
    todayCompleted.length > 0
      ? todayCompleted.reduce((a, x) => a + Number(x.oee), 0) / todayCompleted.length
      : null;

  // Live shifts (any in-progress)
  const liveShifts = await db
    .select({
      id: s.shift.id,
      lineName: s.line.name,
      operatorName: s.user.fullName,
      shiftType: s.shift.shiftType,
      startedAt: s.shift.startedAt,
      goodParts: s.shift.goodParts,
      badParts: s.shift.badParts,
      plannedMinutes: s.shift.plannedMinutes,
    })
    .from(s.shift)
    .innerJoin(s.line, eq(s.line.id, s.shift.lineId))
    .innerJoin(s.user, eq(s.user.id, s.shift.operatorId))
    .where(and(eq(s.shift.companyId, companyId), eq(s.shift.status, "in_progress")))
    .orderBy(desc(s.shift.startedAt));

  // Recent 10 completed shifts
  const recent = await db
    .select({
      id: s.shift.id,
      lineName: s.line.name,
      operatorName: s.user.fullName,
      shiftType: s.shift.shiftType,
      shiftDate: s.shift.shiftDate,
      jobNumber: s.shift.jobNumber,
      oee: s.shift.oee,
      availability: s.shift.availability,
      performance: s.shift.performance,
      quality: s.shift.quality,
    })
    .from(s.shift)
    .innerJoin(s.line, eq(s.line.id, s.shift.lineId))
    .innerJoin(s.user, eq(s.user.id, s.shift.operatorId))
    .where(and(eq(s.shift.companyId, companyId), eq(s.shift.status, "complete")))
    .orderBy(desc(s.shift.startedAt))
    .limit(10);

  // Top stop reasons (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const stopAgg = await db
    .select({
      reason: s.stop.reason,
      total: sql<number>`coalesce(sum(${s.stop.minutes}), 0)`,
    })
    .from(s.stop)
    .where(and(eq(s.stop.companyId, companyId), gte(s.stop.startedAt, sevenDaysAgo)))
    .groupBy(s.stop.reason);
  const stopsSorted = stopAgg
    .map((x) => ({ reason: x.reason, total: Number(x.total) }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);
  const maxStop = stopsSorted[0]?.total ?? 0;

  // Shift-type comparison (last 7 days, average OEE per shift type)
  const shiftCompareRows = await db
    .select({
      shiftType: s.shift.shiftType,
      avgOee: sql<number>`coalesce(avg(${s.shift.oee}), 0)`,
      n: sql<number>`count(*)`,
    })
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, sevenDaysAgo),
      ),
    )
    .groupBy(s.shift.shiftType);
  const compareMap: Record<ShiftType, { avg: number | null; n: number }> = {
    morning: { avg: null, n: 0 },
    afternoon: { avg: null, n: 0 },
    night: { avg: null, n: 0 },
  };
  for (const row of shiftCompareRows) {
    compareMap[row.shiftType as ShiftType] = {
      avg: row.n > 0 ? Number(row.avgOee) : null,
      n: Number(row.n),
    };
  }

  return (
    <main className="app-shell">
      <div className="app-wrap">
        <TrialBanner trialEndsAt={company.trialEndsAt?.toISOString() ?? null} companyName={company.companyName} />
        <div className="dash-header">
          <div>
            <div className="app-tag">{t("dashboard.tag")}</div>
            <h1 className="app-h1">{t("dashboard.title")}</h1>
          </div>
          <div className="dash-header-actions">
            <DashboardScanButton />
            <Link href="/operator" className="btn">{t("dashboard.startShift")} →</Link>
          </div>
        </div>

        {/* Live machines grid (all lines, polls every 10s) */}
        <LiveLinesGrid lines={liveLines} />

        {/* Big today OEE */}
        <div className="card card-lg" style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="kpi-label">
            {t("dashboard.todaysOee")} {t("dashboard.todaysOee.sub").replace("{n}", String(todayCompleted.length))}
          </div>
          <div className={`kpi-big ${bucketClass(todayOee)}`}>{formatPercent(todayOee)}</div>
        </div>

        {/* Shift-type comparison (7-day) */}
        <div style={{ marginBottom: 24 }}>
          <div className="kpi-label" style={{ marginBottom: 12 }}>{t("dashboard.shiftCompare")}</div>
          <div className="shift-compare">
            {(["morning", "afternoon", "night"] as ShiftType[]).map((type) => {
              const c = compareMap[type];
              return (
                <div className="card" key={type}>
                  <div className="kpi-label">{t(`operator.shift.${type}`)}</div>
                  <div className={`kpi-big ${bucketClass(c.avg)}`}>{formatPercent(c.avg)}</div>
                  <div className="compare-count">
                    {c.n} {c.n === 1 ? t("dashboard.shiftCompare.shift") : t("dashboard.shiftCompare.shifts")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live shifts */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="kpi-label" style={{ marginBottom: 16 }}>{t("dashboard.liveShifts")} ({liveShifts.length})</div>
          {liveShifts.length === 0 ? (
            <p style={{ color: "var(--muted2)" }}>{t("dashboard.noLive")}</p>
          ) : (
            <table className="app-table">
              <thead>
                <tr>
                  <th>{t("dashboard.col.line")}</th>
                  <th>{t("dashboard.col.operator")}</th>
                  <th>{t("dashboard.col.shift")}</th>
                  <th>{t("dashboard.col.parts")}</th>
                  <th>{t("dashboard.col.started")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {liveShifts.map((sh) => (
                  <tr key={sh.id}>
                    <td>{sh.lineName}</td>
                    <td>{sh.operatorName}</td>
                    <td>{t(`operator.shift.${sh.shiftType}`)}</td>
                    <td>{(sh.goodParts + sh.badParts).toLocaleString()}</td>
                    <td>{new Date(sh.startedAt).toLocaleTimeString()}</td>
                    <td><span className="pill pill-live">{t("dashboard.live")}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent shifts */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="kpi-label" style={{ marginBottom: 16 }}>{t("dashboard.recentShifts")}</div>
          {recent.length === 0 ? (
            <p style={{ color: "var(--muted2)" }}>{t("dashboard.noRecent")}</p>
          ) : (
            <table className="app-table">
              <thead>
                <tr>
                  <th>{t("dashboard.col.date")}</th>
                  <th>{t("dashboard.col.line")}</th>
                  <th>{t("dashboard.col.operator")}</th>
                  <th>{t("dashboard.col.shift")}</th>
                  <th>{t("dashboard.col.job")}</th>
                  <th>A</th>
                  <th>P</th>
                  <th>Q</th>
                  <th>OEE</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const oeeNum = r.oee != null ? Number(r.oee) : null;
                  return (
                    <tr key={r.id}>
                      <td>{r.shiftDate}</td>
                      <td>{r.lineName}</td>
                      <td>{r.operatorName}</td>
                      <td>{t(`operator.shift.${r.shiftType}`)}</td>
                      <td style={{ fontFamily: "var(--font-dm-mono)", color: r.jobNumber ? "var(--white)" : "var(--muted2)" }}>
                        {r.jobNumber ?? "—"}
                      </td>
                      <td>{formatPercent(r.availability != null ? Number(r.availability) : null)}</td>
                      <td>{formatPercent(r.performance != null ? Number(r.performance) : null)}</td>
                      <td>{formatPercent(r.quality != null ? Number(r.quality) : null)}</td>
                      <td className={bucketClass(oeeNum)} style={{ fontWeight: 500 }}>
                        {formatPercent(oeeNum)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Top stops (Pareto) */}
        <div className="card">
          <div className="kpi-label" style={{ marginBottom: 16 }}>{t("dashboard.topStops")}</div>
          {stopsSorted.length === 0 ? (
            <p style={{ color: "var(--muted2)" }}>{t("dashboard.noStops")}</p>
          ) : (
            <div>
              {stopsSorted.map((x) => (
                <div className="pareto-row" key={x.reason}>
                  <div style={{ fontSize: 14 }}>{t(STOP_LABEL_KEYS[x.reason] ?? x.reason)}</div>
                  <div className="pareto-bar">
                    <div className="pareto-fill" style={{ width: `${(x.total / maxStop) * 100}%` }} />
                  </div>
                  <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, textAlign: "right" }}>
                    {x.total.toFixed(0)}m
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
