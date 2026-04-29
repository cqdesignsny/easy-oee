import Link from "next/link";
import { desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { getManagerCompanyId } from "@/server/actions/manager";

export const metadata = { title: "Shifts | Easy OEE" };
export const dynamic = "force-dynamic";

function bucketClass(v: number | null) {
  return `oee-${oeeBucket(v)}`;
}

const SHIFT_ORDER = ["morning", "afternoon", "night"] as const;

export default async function ShiftsPage() {
  const companyId = await getManagerCompanyId();
  const rows = await db
    .select({
      id: s.shift.id,
      lineName: s.line.name,
      operatorName: s.user.fullName,
      shiftType: s.shift.shiftType,
      product: s.shift.product,
      jobNumber: s.shift.jobNumber,
      shiftDate: s.shift.shiftDate,
      startedAt: s.shift.startedAt,
      endedAt: s.shift.endedAt,
      goodParts: s.shift.goodParts,
      badParts: s.shift.badParts,
      status: s.shift.status,
      availability: s.shift.availability,
      performance: s.shift.performance,
      quality: s.shift.quality,
      oee: s.shift.oee,
    })
    .from(s.shift)
    .innerJoin(s.line, eq(s.line.id, s.shift.lineId))
    .innerJoin(s.user, eq(s.user.id, s.shift.operatorId))
    .where(eq(s.shift.companyId, companyId))
    .orderBy(desc(s.shift.startedAt))
    .limit(100);

  // Calendar grid: last 14 days × 3 shift types, color-coded by OEE bucket
  const cutoff = new Date();
  cutoff.setUTCHours(0, 0, 0, 0);
  cutoff.setUTCDate(cutoff.getUTCDate() - 13);

  const calendarRows = await db
    .select({
      shiftDate: s.shift.shiftDate,
      shiftType: s.shift.shiftType,
      oee: s.shift.oee,
    })
    .from(s.shift)
    .where(
      eq(s.shift.companyId, companyId),
    );
  const recent = calendarRows.filter((r) => new Date(r.shiftDate + "T00:00:00Z").getTime() >= cutoff.getTime());

  // Build a Map<date, Map<shiftType, avgOee>>
  type Cell = { sum: number; n: number };
  const map = new Map<string, Record<string, Cell>>();
  for (const r of recent) {
    if (r.oee == null) continue;
    const day = map.get(r.shiftDate) ?? {};
    const cell = day[r.shiftType] ?? { sum: 0, n: 0 };
    cell.sum += Number(r.oee);
    cell.n += 1;
    day[r.shiftType] = cell;
    map.set(r.shiftDate, day);
  }
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(cutoff);
    d.setUTCDate(d.getUTCDate() + (13 - i));
    days.push(d.toISOString().slice(0, 10));
  }

  // suppress the unused `gte` import warning if calendar pivots to a server filter later
  void gte;

  return (
    <main className="app-wrap">
      <div className="app-tag">History</div>
      <h1 className="app-h1">ALL SHIFTS</h1>
      <p style={{ color: "var(--muted2)", marginTop: 8 }}>Most recent 100 shifts.</p>

      {/* Calendar grid */}
      <div className="card" style={{ marginTop: 24, overflowX: "auto" }}>
        <div className="kpi-label" style={{ marginBottom: 16 }}>Last 14 Days · Calendar</div>
        <table className="calendar-grid">
          <thead>
            <tr>
              <th></th>
              {days.map((d) => (
                <th key={d}>{d.slice(5)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFT_ORDER.map((stype) => (
              <tr key={stype}>
                <th style={{ textAlign: "right", paddingRight: 12, textTransform: "uppercase", fontFamily: "var(--font-dm-mono)", fontSize: 11, color: "var(--muted2)" }}>
                  {stype}
                </th>
                {days.map((d) => {
                  const cell = map.get(d)?.[stype];
                  const avg = cell ? cell.sum / cell.n : null;
                  return (
                    <td
                      key={d + stype}
                      className={`cal-cell ${avg != null ? bucketClass(avg) : "cal-empty"}`}
                      title={avg != null ? `${formatPercent(avg)} (${cell!.n})` : "no data"}
                    >
                      {avg != null ? Math.round(avg * 100) : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 24, overflowX: "auto" }}>
        {rows.length === 0 ? (
          <p style={{ color: "var(--muted2)" }}>No shifts yet.</p>
        ) : (
          <table className="app-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Line</th>
                <th>Operator</th>
                <th>Shift</th>
                <th>Product</th>
                <th>Job #</th>
                <th>Good</th>
                <th>Bad</th>
                <th>A</th>
                <th>P</th>
                <th>Q</th>
                <th>OEE</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const oeeNum = r.oee != null ? Number(r.oee) : null;
                const href =
                  r.status === "complete" ? `/shift/${r.id}/summary` : `/shift/${r.id}`;
                return (
                  <tr key={r.id}>
                    <td>{r.shiftDate}</td>
                    <td>{r.lineName}</td>
                    <td>{r.operatorName}</td>
                    <td>{r.shiftType}</td>
                    <td>{r.product}</td>
                    <td style={{ fontFamily: "var(--font-dm-mono)", color: r.jobNumber ? "var(--white)" : "var(--muted2)" }}>
                      {r.jobNumber ?? "—"}
                    </td>
                    <td>{r.goodParts.toLocaleString()}</td>
                    <td>{r.badParts.toLocaleString()}</td>
                    <td>{formatPercent(r.availability != null ? Number(r.availability) : null)}</td>
                    <td>{formatPercent(r.performance != null ? Number(r.performance) : null)}</td>
                    <td>{formatPercent(r.quality != null ? Number(r.quality) : null)}</td>
                    <td className={bucketClass(oeeNum)} style={{ fontWeight: 500 }}>
                      <Link href={href} style={{ color: "inherit" }}>
                        {formatPercent(oeeNum)}
                      </Link>
                    </td>
                    <td>
                      <span className={`pill ${r.status === "in_progress" ? "pill-live" : "pill-done"}`}>
                        {r.status === "in_progress" ? "LIVE" : "DONE"}
                      </span>
                    </td>
                    <td>
                      <Link href={`/dashboard/shifts/${r.id}/edit`} className="btn-ghost" style={{ fontSize: 12 }}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
