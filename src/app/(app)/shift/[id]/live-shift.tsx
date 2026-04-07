"use client";

import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { STOP_REASONS, type StopReasonValue } from "@/lib/stop-reasons";
import {
  logStop,
  closeStop,
  updateParts,
  endShift,
  addLastStopNote,
  handoffShift,
} from "@/server/actions/shifts";
import type {
  shift as shiftTable,
  stop as stopTable,
  line as lineTable,
} from "@/lib/db/schema";
import { Logo } from "@/components/Logo";
import { useT } from "@/components/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { computeOEE, formatPercent, oeeBucket } from "@/lib/oee";

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

/** Threshold (minutes) above which we ask the operator to leave a note. */
const LONG_STOP_THRESHOLD_MIN = 10;

type ShiftRow = typeof shiftTable.$inferSelect;
type StopRow = typeof stopTable.$inferSelect;
type LineRow = typeof lineTable.$inferSelect;
type OperatorOpt = { id: string; fullName: string };

type LocalState = {
  goodParts: number;
  badParts: number;
  /** Currently active stop reason — null when running. */
  activeStop: StopReasonValue | null;
  /** When the active stop started (ISO string) — drives the live timer. */
  activeStopStartedAt: string | null;
  /** Cumulative minutes of all *closed* stops on this shift. */
  closedStopMinutes: number;
};

function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

function fmtTimeOfDay(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function LiveShift({
  shiftId,
  initialShift,
  line,
  stops,
  operators,
  currentOperatorId,
}: {
  shiftId: string;
  initialShift: ShiftRow;
  line: LineRow | undefined;
  stops: StopRow[];
  operators: OperatorOpt[];
  currentOperatorId: string;
}) {
  const t = useT();

  const closedStopMinutesInitial = stops
    .filter((x) => x.endedAt != null && x.minutes != null)
    .reduce((a, x) => a + Number(x.minutes ?? 0), 0);
  const openStop = stops.find((s) => s.endedAt == null);

  const [base, setBase] = useState<LocalState>({
    goodParts: initialShift.goodParts,
    badParts: initialShift.badParts,
    activeStop: (openStop?.reason as StopReasonValue | undefined) ?? null,
    activeStopStartedAt: openStop?.startedAt ? new Date(openStop.startedAt).toISOString() : null,
    closedStopMinutes: closedStopMinutesInitial,
  });

  const [optimistic, applyOptimistic] = useOptimistic(
    base,
    (state, action: Partial<LocalState>) => ({ ...state, ...action }),
  );

  const [, startTx] = useTransition();
  const [endingShift, setEndingShift] = useState(false);

  // ────────── Live clock — single rAF/interval drives every timer ──────────
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const startedAtMs = useMemo(() => new Date(initialShift.startedAt).getTime(), [initialShift.startedAt]);
  const plannedMs = initialShift.plannedMinutes * 60_000;
  const elapsedSec = Math.max(0, (now - startedAtMs) / 1000);
  const elapsedMin = elapsedSec / 60;
  const projectedEndMs = startedAtMs + plannedMs;

  // Current stop duration (live)
  const currentStopSec = optimistic.activeStopStartedAt
    ? Math.max(0, (now - new Date(optimistic.activeStopStartedAt).getTime()) / 1000)
    : 0;
  const currentStopMin = currentStopSec / 60;

  // Total stop minutes so far (closed stops + the open one if any)
  const totalStopMinutes = optimistic.closedStopMinutes + currentStopMin;

  // Live OEE estimate from current numbers
  const liveOee = useMemo(() => {
    return computeOEE({
      plannedMinutes: Math.max(1, Math.round(elapsedMin)),
      stopMinutes: totalStopMinutes,
      goodParts: optimistic.goodParts,
      badParts: optimistic.badParts,
      idealRate: Number(initialShift.idealRate),
    });
    // Recompute every tick of `now`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, optimistic.goodParts, optimistic.badParts, optimistic.closedStopMinutes, optimistic.activeStopStartedAt]);

  const targetOee = line?.targetOee != null ? Number(line.targetOee) : 0.85;

  // ────────── Long stop note prompt ──────────
  // Tracks the most recent stop that just closed AND was > threshold; shows
  // a small inline note prompt until dismissed/sent.
  const lastWasLong = useRef<{ active: boolean; reasonKey: string | null }>({
    active: false,
    reasonKey: null,
  });
  const [notePrompt, setNotePrompt] = useState<{ reasonKey: string; minutes: number } | null>(null);
  const [noteText, setNoteText] = useState("");

  // Progress bar percentage (capped at 100, allow visible overrun via opacity)
  const progressPct = Math.min(100, (elapsedMin / initialShift.plannedMinutes) * 100);
  const overrun = elapsedMin > initialShift.plannedMinutes;

  // ────────── Actions ──────────
  const setParts = (type: "good" | "bad", delta: number) => {
    const next = Math.max(
      0,
      (type === "good" ? optimistic.goodParts : optimistic.badParts) + delta,
    );
    startTx(async () => {
      applyOptimistic(type === "good" ? { goodParts: next } : { badParts: next });
      await updateParts(shiftId, type, delta);
      setBase((b) => (type === "good" ? { ...b, goodParts: next } : { ...b, badParts: next }));
    });
  };

  const tapStop = (reason: StopReasonValue) => {
    if (optimistic.activeStop === reason) {
      // Toggle off — close it. Capture duration *before* clearing.
      const durMin = currentStopMin;
      const reasonKey = STOP_LABEL_KEYS[reason] ?? reason;
      startTx(async () => {
        applyOptimistic({
          activeStop: null,
          activeStopStartedAt: null,
          closedStopMinutes: optimistic.closedStopMinutes + durMin,
        });
        await closeStop(shiftId);
        setBase((b) => ({
          ...b,
          activeStop: null,
          activeStopStartedAt: null,
          closedStopMinutes: b.closedStopMinutes + durMin,
        }));
        if (durMin >= LONG_STOP_THRESHOLD_MIN) {
          setNotePrompt({ reasonKey, minutes: durMin });
          setNoteText("");
        }
      });
      lastWasLong.current = { active: false, reasonKey: null };
      return;
    }
    startTx(async () => {
      const startIso = new Date().toISOString();
      applyOptimistic({ activeStop: reason, activeStopStartedAt: startIso });
      await logStop(shiftId, reason);
      setBase((b) => ({ ...b, activeStop: reason, activeStopStartedAt: startIso }));
    });
  };

  const sendNote = () => {
    if (!noteText.trim()) {
      setNotePrompt(null);
      return;
    }
    const txt = noteText.trim();
    startTx(async () => {
      await addLastStopNote(shiftId, txt);
      setNotePrompt(null);
      setNoteText("");
    });
  };

  const finish = () => {
    if (!confirm(t("shift.confirmEnd"))) return;
    setEndingShift(true);
    startTx(async () => {
      await endShift(shiftId);
    });
  };

  // ────────── Hand-off ──────────
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffOpId, setHandoffOpId] = useState("");
  const [handoffPin, setHandoffPin] = useState("");
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const [handoffPending, setHandoffPending] = useState(false);

  const submitHandoff = async () => {
    setHandoffError(null);
    setHandoffPending(true);
    const fd = new FormData();
    fd.set("shiftId", shiftId);
    fd.set("operatorId", handoffOpId);
    fd.set("pin", handoffPin);
    const res = await handoffShift(fd);
    setHandoffPending(false);
    if (!res.ok) {
      setHandoffError(res.error ?? "Failed");
      return;
    }
    setHandoffOpen(false);
    setHandoffPin("");
    setHandoffOpId("");
    // Soft refresh: the cookie has rotated; the page will pick up the new
    // operator on next interaction. We just close the dialog.
  };

  const otherOperators = operators.filter((o) => o.id !== currentOperatorId);
  const totalParts = optimistic.goodParts + optimistic.badParts;

  const liveOeeBucketClass = `oee-${oeeBucket(liveOee.oee)}`;
  const targetMet = liveOee.oee != null && liveOee.oee >= targetOee;

  return (
    <main className="op-shell" style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Link href="/"><Logo height={42} /></Link>
        <LanguageSwitcher />
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="app-tag">
            {line?.name ?? "Line"} · {t(`operator.shift.${initialShift.shiftType}`)} · {initialShift.product}
          </div>
          <h1 className="app-h2">{t("shift.live")}</h1>
        </div>
        <span
          className={`pill ${optimistic.activeStop ? "" : "pill-live"}`}
          style={
            optimistic.activeStop
              ? { background: "#c84141", color: "white", borderColor: "#c84141" }
              : {}
          }
        >
          {optimistic.activeStop ? t("shift.stopped") : t("shift.running")}
        </span>
      </div>

      {/* ────────── Timer + projection bar ────────── */}
      <div className="card" style={{ marginBottom: 16, padding: 18 }}>
        <div className="timer-row">
          <div>
            <div className="kpi-label">{t("shift.elapsed")}</div>
            <div className="timer-num">{fmtClock(elapsedSec)}</div>
          </div>
          <div>
            <div className="kpi-label">{t("shift.startedAt")}</div>
            <div className="timer-sub">{fmtTimeOfDay(new Date(startedAtMs))}</div>
          </div>
          <div>
            <div className="kpi-label">{t("shift.projectedEnd")}</div>
            <div className="timer-sub">{fmtTimeOfDay(new Date(projectedEndMs))}</div>
          </div>
          <div>
            <div className="kpi-label">{t("shift.totalStops")}</div>
            <div className="timer-sub">{totalStopMinutes.toFixed(1)}m</div>
          </div>
        </div>
        <div className="progress-track" style={{ marginTop: 14 }}>
          <div
            className="progress-fill"
            style={{
              width: `${progressPct}%`,
              background: overrun ? "#ff7a7a" : "var(--accent)",
            }}
          />
        </div>
      </div>

      {/* ────────── Live OEE estimate + downtime timer ────────── */}
      <div className="liveoee-row" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: 18, textAlign: "center" }}>
          <div className="kpi-label">{t("shift.liveOee")}</div>
          <div className={`liveoee-num ${liveOeeBucketClass}`}>{formatPercent(liveOee.oee)}</div>
          <div className="liveoee-breakdown">
            A {formatPercent(liveOee.availability, { decimals: 0 })} · P {formatPercent(liveOee.performance, { decimals: 0 })} · Q {formatPercent(liveOee.quality, { decimals: 0 })}
          </div>
          <div className="liveoee-target">
            {t("shift.target")}: {formatPercent(targetOee, { decimals: 0 })}{" "}
            {liveOee.oee != null && (
              <span style={{ color: targetMet ? "var(--accent)" : "#ff7a7a" }}>
                ({targetMet ? "+" : ""}
                {formatPercent(liveOee.oee - targetOee, { decimals: 0 })})
              </span>
            )}
          </div>
        </div>

        {/* Live downtime timer — only visible while a stop is active */}
        {optimistic.activeStop && (
          <div className="card downtime-card" style={{ padding: 18, textAlign: "center" }}>
            <div className="kpi-label">{t("shift.currentStop")}</div>
            <div className="downtime-num">{fmtClock(currentStopSec)}</div>
            <div className="downtime-reason">
              {t(STOP_LABEL_KEYS[optimistic.activeStop] ?? optimistic.activeStop)}
            </div>
          </div>
        )}
      </div>

      {/* ────────── Long-stop note prompt ────────── */}
      {notePrompt && (
        <div className="card" style={{ marginBottom: 18, padding: 18, borderColor: "var(--accent)" }}>
          <div className="kpi-label">{t("shift.longStop.title")}</div>
          <p style={{ margin: "6px 0 12px", fontSize: 16 }}>
            {t("shift.longStop.body")
              .replace("{minutes}", notePrompt.minutes.toFixed(0))
              .replace("{reason}", t(notePrompt.reasonKey))}
          </p>
          <textarea
            className="app-input"
            rows={2}
            placeholder={t("shift.longStop.placeholder")}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" style={{ flex: 1 }} onClick={sendNote}>
              {t("shift.longStop.save")}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setNotePrompt(null)}
              style={{ flex: 1 }}
            >
              {t("shift.longStop.skip")}
            </button>
          </div>
        </div>
      )}

      {/* ────────── Parts counters ────────── */}
      <div className="parts-row" style={{ marginBottom: 18 }}>
        <div className="parts-counter">
          <div className="kpi-label">{t("shift.goodParts")}</div>
          <div className="parts-num">{optimistic.goodParts.toLocaleString()}</div>
          <div className="parts-controls">
            <button className="parts-btn" onClick={() => setParts("good", 1)}>+1</button>
            <button className="parts-btn" onClick={() => setParts("good", 10)}>+10</button>
          </div>
        </div>
        <div className="parts-counter">
          <div className="kpi-label">{t("shift.badParts")}</div>
          <div className="parts-num bad">{optimistic.badParts.toLocaleString()}</div>
          <div className="parts-controls">
            <button className="parts-btn" onClick={() => setParts("bad", 1)}>+1</button>
            <button className="parts-btn" onClick={() => setParts("bad", 10)}>+10</button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 12, color: "var(--muted2)", fontFamily: "var(--font-dm-mono)", fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase" }}>
        {t("shift.tapHint")}
      </div>

      <div className="op-grid-stops" style={{ marginBottom: 18 }}>
        {STOP_REASONS.map((r) => (
          <button
            key={r.value}
            className={`stop-btn ${optimistic.activeStop === r.value ? "active" : ""}`}
            onClick={() => tapStop(r.value)}
          >
            {t(STOP_LABEL_KEYS[r.value] ?? r.value)}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          className="btn"
          onClick={() => setHandoffOpen((v) => !v)}
          style={{ flex: 1, minWidth: 180 }}
        >
          {t("shift.handoff")}
        </button>
        <button
          className="btn btn-danger"
          style={{ flex: 1, minWidth: 180 }}
          onClick={finish}
          disabled={endingShift}
        >
          {endingShift ? t("shift.ending") : t("shift.endShift")}
        </button>
      </div>

      {/* ────────── Hand-off panel ────────── */}
      {handoffOpen && (
        <div className="card" style={{ marginTop: 16, padding: 18 }}>
          <div className="kpi-label" style={{ marginBottom: 10 }}>{t("shift.handoff.title")}</div>
          <p style={{ marginTop: 0, fontSize: 14, color: "var(--muted2)" }}>
            {t("shift.handoff.body")}
          </p>
          {otherOperators.length === 0 ? (
            <p style={{ color: "var(--muted2)" }}>{t("shift.handoff.none")}</p>
          ) : (
            <>
              <select
                className="app-input"
                value={handoffOpId}
                onChange={(e) => setHandoffOpId(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
              >
                <option value="">{t("shift.handoff.pick")}</option>
                {otherOperators.map((o) => (
                  <option key={o.id} value={o.id}>{o.fullName}</option>
                ))}
              </select>
              <input
                className="app-input"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                placeholder="••••"
                value={handoffPin}
                onChange={(e) => setHandoffPin(e.target.value.replace(/\D/g, ""))}
                style={{ width: "100%", marginBottom: 10, fontSize: 28, textAlign: "center", letterSpacing: 12 }}
              />
              {handoffError && (
                <p style={{ color: "#ff7a7a", marginTop: 0, marginBottom: 10 }}>{handoffError}</p>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn"
                  style={{ flex: 1 }}
                  disabled={handoffPending || !handoffOpId || handoffPin.length !== 4}
                  onClick={submitHandoff}
                >
                  {handoffPending ? "..." : t("shift.handoff.confirm")}
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setHandoffOpen(false)}
                >
                  {t("shift.handoff.cancel")}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: 24, color: "var(--muted2)", fontSize: 14 }}>
        {t("shift.totalProduced")}: {totalParts.toLocaleString()} · {t("shift.planned")}: {initialShift.plannedMinutes} min · {t("shift.idealRate")}: {Number(initialShift.idealRate).toFixed(0)}/min
      </div>
    </main>
  );
}
