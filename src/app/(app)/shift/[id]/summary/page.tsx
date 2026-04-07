import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getOperatorSession } from "@/lib/auth/operator-session";
import { getShiftForOperator } from "@/server/actions/shifts";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { stopReasonLabel } from "@/lib/stop-reasons";

export const metadata = { title: "Shift Summary | Easy OEE" };
export const dynamic = "force-dynamic";

function bucketClass(v: number | null) {
  return `oee-${oeeBucket(v)}`;
}

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getOperatorSession();
  if (!session) redirect("/pin");
  const { id } = await params;
  const data = await getShiftForOperator(id);
  if (!data || !data.shift) notFound();

  const sh = data.shift;
  const oeeNum = sh.oee != null ? Number(sh.oee) : null;
  const av = sh.availability != null ? Number(sh.availability) : null;
  const pf = sh.performance != null ? Number(sh.performance) : null;
  const ql = sh.quality != null ? Number(sh.quality) : null;

  const totalStopMin = data.stops.reduce(
    (acc, s) => acc + (s.minutes ? Number(s.minutes) : 0),
    0,
  );

  return (
    <main className="op-shell">
      <div style={{ marginBottom: 24 }}>
        <div className="app-tag">Shift Complete</div>
        <h1 className="app-h1">SHIFT SUMMARY</h1>
        <p style={{ color: "var(--muted2)", marginTop: 8 }}>
          {data.line?.name} · {sh.shiftType} · {sh.product}
        </p>
      </div>

      {/* Big OEE */}
      <div className="card card-lg" style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="kpi-label">Overall OEE</div>
        <div className={`kpi-big ${bucketClass(oeeNum)}`}>{formatPercent(oeeNum)}</div>
      </div>

      {/* Three components */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Availability", value: av },
          { label: "Performance", value: pf },
          { label: "Quality", value: ql },
        ].map((m) => (
          <div className="card" key={m.label} style={{ textAlign: "center" }}>
            <div className="kpi-label">{m.label}</div>
            <div
              className={`kpi-big ${bucketClass(m.value)}`}
              style={{ fontSize: "clamp(48px, 8vw, 88px)" }}
            >
              {formatPercent(m.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Numbers */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="kpi-label" style={{ marginBottom: 12 }}>Production Detail</div>
        <table className="app-table">
          <tbody>
            <tr><td>Good parts</td><td>{sh.goodParts.toLocaleString()}</td></tr>
            <tr><td>Bad parts</td><td>{sh.badParts.toLocaleString()}</td></tr>
            <tr><td>Total parts</td><td>{(sh.goodParts + sh.badParts).toLocaleString()}</td></tr>
            <tr><td>Planned minutes</td><td>{sh.plannedMinutes}</td></tr>
            <tr><td>Stop minutes</td><td>{totalStopMin.toFixed(1)}</td></tr>
            <tr><td>Run minutes</td><td>{(sh.plannedMinutes - totalStopMin).toFixed(1)}</td></tr>
            <tr><td>Ideal rate</td><td>{Number(sh.idealRate).toFixed(0)} parts/min</td></tr>
          </tbody>
        </table>
      </div>

      {/* Stops list */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="kpi-label" style={{ marginBottom: 12 }}>Downtime Events ({data.stops.length})</div>
        {data.stops.length === 0 ? (
          <p style={{ color: "var(--muted2)" }}>No stops recorded.</p>
        ) : (
          <table className="app-table">
            <thead>
              <tr><th>Reason</th><th>Started</th><th>Minutes</th></tr>
            </thead>
            <tbody>
              {data.stops.map((s) => (
                <tr key={s.id}>
                  <td>{stopReasonLabel(s.reason)}</td>
                  <td>{new Date(s.startedAt).toLocaleTimeString()}</td>
                  <td>{s.minutes ? Number(s.minutes).toFixed(1) : "..."}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/operator" className="btn" style={{ flex: 1 }}>
          START NEW SHIFT
        </Link>
        <Link href="/dashboard" className="btn btn-ghost" style={{ flex: 1 }}>
          DASHBOARD
        </Link>
      </div>
    </main>
  );
}
