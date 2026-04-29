"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPercent, oeeBucket } from "@/lib/oee";
import { STOP_REASONS } from "@/lib/stop-reasons";
import { useT } from "@/components/i18n/LanguageProvider";
import type { LineLiveState } from "@/lib/db/queries/line-state";

const reasonLabel: Record<string, string> = Object.fromEntries(
  STOP_REASONS.map((r) => [r.value, r.label]),
);

function fmtClock(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export function LiveLinesGrid({ lines }: { lines: LineLiveState[] }) {
  const t = useT();
  const router = useRouter();
  // Lazy initializer so the impure Date.now() runs only once at mount, not during re-renders.
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const refresh = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(refresh);
  }, [router]);

  if (lines.length === 0) {
    return (
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="kpi-label">{t("dashboard.lines.title")}</div>
        <p style={{ color: "var(--muted2)", marginTop: 8 }}>{t("dashboard.lines.empty")}</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="kpi-label" style={{ marginBottom: 12 }}>
        {t("dashboard.lines.title")}{" "}
        <span style={{ color: "var(--muted2)", fontSize: 11 }}>
          · {t("dashboard.lines.autoRefresh")}
        </span>
      </div>
      <div className="live-lines">
        {lines.map((line) => {
          const oeeForDisplay = line.liveOee ?? line.todayAvgOee;
          const bucket = oeeBucket(oeeForDisplay);
          const elapsedSec =
            line.activeShift != null
              ? Math.max(0, (now - new Date(line.activeShift.startedAtIso).getTime()) / 1000)
              : 0;
          const stopSec =
            line.activeShift?.activeStopStartedAtIso
              ? Math.max(
                  0,
                  (now - new Date(line.activeShift.activeStopStartedAtIso).getTime()) / 1000,
                )
              : 0;
          const parts =
            line.activeShift != null
              ? line.activeShift.goodParts + line.activeShift.badParts
              : 0;
          return (
            <Link
              key={line.lineId}
              href={line.activeShift ? `/shift/${line.activeShift.id}` : "/dashboard/lines"}
              className={`live-card live-card-${line.status}`}
            >
              <div className="live-card-head">
                <div className="live-card-name">{line.lineName}</div>
                <span className={`pill live-pill live-pill-${line.status}`}>
                  {line.status === "running"
                    ? t("dashboard.lines.running")
                    : line.status === "stopped"
                      ? t("dashboard.lines.stopped")
                      : t("dashboard.lines.idle")}
                </span>
              </div>

              <div className={`live-oee oee-${bucket}`}>{formatPercent(oeeForDisplay)}</div>
              <div className="live-oee-label">
                {line.liveOee != null
                  ? `${t("dashboard.lines.liveOee")} · ${t("dashboard.lines.target")} ${formatPercent(line.target, { decimals: 0 })}`
                  : `${t("dashboard.lines.todayAvg")} · ${t("dashboard.lines.target")} ${formatPercent(line.target, { decimals: 0 })}`}
              </div>

              {line.activeShift ? (
                <div className="live-meta">
                  <div className="live-meta-row">
                    <span className="live-meta-k">{t("dashboard.lines.operator")}</span>
                    <span className="live-meta-v">{line.activeShift.operatorName}</span>
                  </div>
                  <div className="live-meta-row">
                    <span className="live-meta-k">{t("dashboard.lines.product")}</span>
                    <span className="live-meta-v">{line.activeShift.product}</span>
                  </div>
                  {line.activeShift.jobNumber && (
                    <div className="live-meta-row">
                      <span className="live-meta-k">{t("dashboard.lines.job")}</span>
                      <span className="live-meta-v" style={{ fontFamily: "var(--font-dm-mono)" }}>
                        {line.activeShift.jobNumber}
                      </span>
                    </div>
                  )}
                  <div className="live-meta-row">
                    <span className="live-meta-k">{t("dashboard.lines.parts")}</span>
                    <span className="live-meta-v">{parts.toLocaleString()}</span>
                  </div>
                  <div className="live-meta-row">
                    <span className="live-meta-k">{t("dashboard.lines.elapsed")}</span>
                    <span className="live-meta-v" style={{ fontFamily: "var(--font-dm-mono)" }}>
                      {fmtClock(elapsedSec)}
                    </span>
                  </div>
                  {line.activeShift.activeStopReason && (
                    <div className="live-stop">
                      <span className="live-stop-label">
                        {reasonLabel[line.activeShift.activeStopReason] ??
                          line.activeShift.activeStopReason}
                      </span>
                      <span
                        className="live-stop-time"
                        style={{ fontFamily: "var(--font-dm-mono)" }}
                      >
                        {fmtClock(stopSec)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="live-meta">
                  <div style={{ color: "var(--muted2)", fontSize: 13 }}>
                    {t("dashboard.lines.noShift")}
                  </div>
                  {line.topStopToday && (
                    <div className="live-meta-row" style={{ marginTop: 8 }}>
                      <span className="live-meta-k">{t("dashboard.lines.topStopToday")}</span>
                      <span className="live-meta-v">
                        {reasonLabel[line.topStopToday.reason] ?? line.topStopToday.reason}{" "}
                        ({line.topStopToday.minutes.toFixed(0)}m)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
