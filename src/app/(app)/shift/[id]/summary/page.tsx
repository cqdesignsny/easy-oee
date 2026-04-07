import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getOperatorSession } from "@/lib/auth/operator-session";
import { getShiftForOperator } from "@/server/actions/shifts";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { Logo } from "@/components/Logo";
import { getServerT } from "@/components/i18n/server";

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
  const t = await getServerT();

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
        <Link href="/"><Logo height={42} /></Link>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div className="app-tag">{t("summary.tag")}</div>
        <h1 className="app-h1">{t("summary.title")}</h1>
        <p style={{ color: "var(--muted2)", marginTop: 8, fontSize: 17 }}>
          {data.line?.name} · {t(`operator.shift.${sh.shiftType}`)} · {sh.product}
        </p>
      </div>

      {/* Big OEE */}
      <div className="card card-lg" style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="kpi-label">{t("summary.overallOee")}</div>
        <div className={`kpi-big ${bucketClass(oeeNum)}`}>{formatPercent(oeeNum)}</div>
      </div>

      {/* Three components */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: t("summary.availability"), value: av },
          { label: t("summary.performance"), value: pf },
          { label: t("summary.quality"), value: ql },
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
        <div className="kpi-label" style={{ marginBottom: 12 }}>{t("summary.production")}</div>
        <table className="app-table">
          <tbody>
            <tr><td>{t("summary.row.good")}</td><td>{sh.goodParts.toLocaleString()}</td></tr>
            <tr><td>{t("summary.row.bad")}</td><td>{sh.badParts.toLocaleString()}</td></tr>
            <tr><td>{t("summary.row.total")}</td><td>{(sh.goodParts + sh.badParts).toLocaleString()}</td></tr>
            <tr><td>{t("summary.row.planned")}</td><td>{sh.plannedMinutes}</td></tr>
            <tr><td>{t("summary.row.stop")}</td><td>{totalStopMin.toFixed(1)}</td></tr>
            <tr><td>{t("summary.row.run")}</td><td>{(sh.plannedMinutes - totalStopMin).toFixed(1)}</td></tr>
            <tr><td>{t("summary.row.ideal")}</td><td>{Number(sh.idealRate).toFixed(0)} parts/min</td></tr>
          </tbody>
        </table>
      </div>

      {/* Stops list */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="kpi-label" style={{ marginBottom: 12 }}>{t("summary.downtime")} ({data.stops.length})</div>
        {data.stops.length === 0 ? (
          <p style={{ color: "var(--muted2)" }}>{t("summary.noStops")}</p>
        ) : (
          <table className="app-table">
            <thead>
              <tr><th>{t("summary.col.reason")}</th><th>{t("summary.col.started")}</th><th>{t("summary.col.minutes")}</th></tr>
            </thead>
            <tbody>
              {data.stops.map((s) => (
                <tr key={s.id}>
                  <td>{t(STOP_LABEL_KEYS[s.reason] ?? s.reason)}</td>
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
          {t("summary.startNew")}
        </Link>
        <Link href="/dashboard" className="btn btn-ghost" style={{ flex: 1 }}>
          {t("summary.dashboard")}
        </Link>
      </div>
    </main>
  );
}
