import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { getManagerCompanyId } from "@/server/actions/manager";

export const metadata = { title: "Shifts | Easy OEE" };
export const dynamic = "force-dynamic";

function bucketClass(v: number | null) {
  return `oee-${oeeBucket(v)}`;
}

export default async function ShiftsPage() {
  const companyId = await getManagerCompanyId();
  const rows = await db
    .select({
      id: s.shift.id,
      lineName: s.line.name,
      operatorName: s.user.fullName,
      shiftType: s.shift.shiftType,
      product: s.shift.product,
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

  return (
    <main className="app-wrap">
      <div className="app-tag">History</div>
      <h1 className="app-h1">ALL SHIFTS</h1>
      <p style={{ color: "var(--muted2)", marginTop: 8 }}>Most recent 100 shifts.</p>

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
                <th>Good</th>
                <th>Bad</th>
                <th>A</th>
                <th>P</th>
                <th>Q</th>
                <th>OEE</th>
                <th>Status</th>
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
