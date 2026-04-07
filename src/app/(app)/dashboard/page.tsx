import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { stopReasonLabel } from "@/lib/stop-reasons";

export const metadata = { title: "Dashboard — Easy OEE" };
// Live-ish: refresh every 10s for in-progress shifts
export const revalidate = 10;
export const dynamic = "force-dynamic";

/**
 * Phase 1 dashboard — defaults to the seeded Maple Manufacturing tenant.
 * Once Clerk is wired, the company will come from the manager session.
 */
async function getDemoCompanyId(): Promise<string | null> {
  const [c] = await db
    .select({ id: s.company.id })
    .from(s.company)
    .where(eq(s.company.slug, "maple-manufacturing"))
    .limit(1);
  return c?.id ?? null;
}

function bucketClass(v: number | null) {
  return `oee-${oeeBucket(v)}`;
}

export default async function DashboardPage() {
  const companyId = await getDemoCompanyId();

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

  return (
    <main className="app-shell">
      <div className="app-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <div className="app-tag">Manager Dashboard</div>
            <h1 className="app-h1">TODAY</h1>
          </div>
          <Link href="/operator" className="btn">START SHIFT →</Link>
        </div>

        {/* Big today OEE */}
        <div className="card card-lg" style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="kpi-label">Today&apos;s OEE (avg of {todayCompleted.length} completed shifts)</div>
          <div className={`kpi-big ${bucketClass(todayOee)}`}>{formatPercent(todayOee)}</div>
        </div>

        {/* Live shifts */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="kpi-label" style={{ marginBottom: 16 }}>Live Shifts ({liveShifts.length})</div>
          {liveShifts.length === 0 ? (
            <p style={{ color: "var(--muted2)" }}>No shifts in progress.</p>
          ) : (
            <table className="app-table">
              <thead>
                <tr><th>Line</th><th>Operator</th><th>Shift</th><th>Parts</th><th>Started</th><th></th></tr>
              </thead>
              <tbody>
                {liveShifts.map((sh) => (
                  <tr key={sh.id}>
                    <td>{sh.lineName}</td>
                    <td>{sh.operatorName}</td>
                    <td>{sh.shiftType}</td>
                    <td>{(sh.goodParts + sh.badParts).toLocaleString()}</td>
                    <td>{new Date(sh.startedAt).toLocaleTimeString()}</td>
                    <td><span className="pill pill-live">LIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent shifts */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="kpi-label" style={{ marginBottom: 16 }}>Recent Shifts</div>
          {recent.length === 0 ? (
            <p style={{ color: "var(--muted2)" }}>No completed shifts yet.</p>
          ) : (
            <table className="app-table">
              <thead>
                <tr><th>Date</th><th>Line</th><th>Operator</th><th>Shift</th><th>A</th><th>P</th><th>Q</th><th>OEE</th></tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const oeeNum = r.oee != null ? Number(r.oee) : null;
                  return (
                    <tr key={r.id}>
                      <td>{r.shiftDate}</td>
                      <td>{r.lineName}</td>
                      <td>{r.operatorName}</td>
                      <td>{r.shiftType}</td>
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
          <div className="kpi-label" style={{ marginBottom: 16 }}>Top Stop Reasons (last 7 days)</div>
          {stopsSorted.length === 0 ? (
            <p style={{ color: "var(--muted2)" }}>No stops recorded.</p>
          ) : (
            <div>
              {stopsSorted.map((x) => (
                <div className="pareto-row" key={x.reason}>
                  <div style={{ fontSize: 13 }}>{stopReasonLabel(x.reason)}</div>
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
