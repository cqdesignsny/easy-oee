"use client";

/**
 * Client component for /board/[token]. The server component computes the
 * OEE snapshot every 10s (revalidate); the client just keeps the timers
 * ticking smoothly between server pulls and triggers a refresh after each
 * cycle so the numbers stay current without any user interaction.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { formatPercent } from "@/lib/oee";
import { STOP_REASONS } from "@/lib/stop-reasons";

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

type ActiveShift = {
  operatorName: string;
  shiftType: string;
  product: string;
  startedAtIso: string;
  plannedMinutes: number;
  goodParts: number;
  badParts: number;
  stopMinutesSoFar: number;
  activeStopReason: string | null;
  activeStopStartedAt: string | null;
};

export function BoardClient({
  lineName,
  target,
  liveOee,
  todayAvgOee,
  activeShift,
  topStops,
  bucket,
  todayLabel,
}: {
  lineName: string;
  target: number;
  liveOee: number | null;
  todayAvgOee: number | null;
  activeShift: ActiveShift | null;
  topStops: { reason: string; minutes: number }[];
  bucket: "world-class" | "typical" | "low" | "na";
  todayLabel: string;
}) {
  const router = useRouter();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Soft refresh every 10s to pull a new snapshot from the server
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(id);
  }, [router]);

  const elapsedSec = activeShift
    ? Math.max(0, (now - new Date(activeShift.startedAtIso).getTime()) / 1000)
    : 0;
  const stopSec =
    activeShift && activeShift.activeStopStartedAt
      ? Math.max(0, (now - new Date(activeShift.activeStopStartedAt).getTime()) / 1000)
      : 0;

  const oeeForDisplay = liveOee ?? todayAvgOee;
  const status = activeShift
    ? activeShift.activeStopReason
      ? "stopped"
      : "running"
    : "idle";

  return (
    <main className="board-shell">
      <div className="board-header">
        <div>
          <div className="board-line-name">{lineName}</div>
          {activeShift && (
            <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "clamp(14px,1.2vw,20px)", color: "var(--muted2)", letterSpacing: 2, textTransform: "uppercase", marginTop: 6 }}>
              {activeShift.operatorName} · {activeShift.shiftType} · {activeShift.product}
            </div>
          )}
        </div>
        <div className={`board-status ${status === "stopped" ? "stopped" : ""}`}>
          {status === "running" ? "RUNNING" : status === "stopped" ? "STOPPED" : "IDLE"}
        </div>
      </div>

      <div className="board-grid">
        <div className="board-oee">
          <div className={`board-oee-num oee-${bucket}`}>{formatPercent(oeeForDisplay)}</div>
          <div className="board-oee-label">
            {liveOee != null ? `LIVE OEE · TARGET ${formatPercent(target, { decimals: 0 })}` : `TODAY AVG · TARGET ${formatPercent(target, { decimals: 0 })}`}
          </div>
          {activeShift && activeShift.activeStopReason && (
            <div style={{ marginTop: "3vh", textAlign: "center" }}>
              <div className="board-stat-label" style={{ color: "#ff7a7a" }}>{reasonLabel[activeShift.activeStopReason] ?? activeShift.activeStopReason}</div>
              <div className="board-stat-num" style={{ color: "#ff7a7a" }}>{fmtClock(stopSec)}</div>
            </div>
          )}
        </div>

        <div className="board-side">
          {activeShift ? (
            <>
              <div className="board-stat">
                <div className="board-stat-label">Good · Bad</div>
                <div className="board-stat-num">
                  {activeShift.goodParts.toLocaleString()}
                  <span style={{ color: "#ff7a7a", fontSize: "0.6em", marginLeft: 16 }}>
                    {activeShift.badParts.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="board-stat">
                <div className="board-stat-label">Elapsed</div>
                <div className="board-stat-num">{fmtClock(elapsedSec)}</div>
              </div>
              <div className="board-stat">
                <div className="board-stat-label">Top Stops · 7d</div>
                <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                  {topStops.length === 0 ? (
                    <div style={{ color: "var(--muted2)", fontSize: "clamp(14px,1.4vw,22px)" }}>none</div>
                  ) : (
                    topStops.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-dm-mono)", fontSize: "clamp(14px,1.4vw,22px)" }}>
                        <span>{reasonLabel[s.reason] ?? s.reason}</span>
                        <span style={{ color: "var(--muted2)" }}>{s.minutes.toFixed(0)}m</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="board-stat">
                <div className="board-stat-label">No active shift</div>
                <div style={{ marginTop: 12, color: "var(--muted2)", fontSize: "clamp(16px,1.4vw,22px)" }}>
                  Today&apos;s average: {todayLabel}
                </div>
              </div>
              <div className="board-stat" style={{ gridRow: "span 2" }}>
                <div className="board-stat-label">Top Stops · 7d</div>
                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  {topStops.length === 0 ? (
                    <div style={{ color: "var(--muted2)" }}>none</div>
                  ) : (
                    topStops.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-dm-mono)", fontSize: "clamp(16px,1.6vw,26px)" }}>
                        <span>{reasonLabel[s.reason] ?? s.reason}</span>
                        <span style={{ color: "var(--muted2)" }}>{s.minutes.toFixed(0)}m</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="board-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo height={28} />
          <span>EASY OEE · LIVE BOARD</span>
        </div>
        <div>{new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </div>
    </main>
  );
}
