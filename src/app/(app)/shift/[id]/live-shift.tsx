"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { STOP_REASONS, type StopReasonValue } from "@/lib/stop-reasons";
import { logStop, closeStop, updateParts, endShift } from "@/server/actions/shifts";
import type { shift as shiftTable, stop as stopTable, line as lineTable } from "@/lib/db/schema";
import { Logo } from "@/components/Logo";
import { useT } from "@/components/i18n/LanguageProvider";

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

type ShiftRow = typeof shiftTable.$inferSelect;
type StopRow = typeof stopTable.$inferSelect;
type LineRow = typeof lineTable.$inferSelect;

type LocalState = {
  goodParts: number;
  badParts: number;
  activeStop: StopReasonValue | null;
};

export function LiveShift({
  shiftId,
  initialShift,
  line,
  stops,
}: {
  shiftId: string;
  initialShift: ShiftRow;
  line: LineRow | undefined;
  stops: StopRow[];
}) {
  const t = useT();
  const initialActive =
    stops.find((s) => s.endedAt == null)?.reason as StopReasonValue | undefined;

  const [base, setBase] = useState<LocalState>({
    goodParts: initialShift.goodParts,
    badParts: initialShift.badParts,
    activeStop: initialActive ?? null,
  });

  const [optimistic, applyOptimistic] = useOptimistic(
    base,
    (state, action: Partial<LocalState>) => ({ ...state, ...action }),
  );

  const [, startTx] = useTransition();
  const [endingShift, setEndingShift] = useState(false);

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
      // Toggle off — close it
      startTx(async () => {
        applyOptimistic({ activeStop: null });
        await closeStop(shiftId);
        setBase((b) => ({ ...b, activeStop: null }));
      });
      return;
    }
    startTx(async () => {
      applyOptimistic({ activeStop: reason });
      await logStop(shiftId, reason);
      setBase((b) => ({ ...b, activeStop: reason }));
    });
  };

  const finish = () => {
    if (!confirm(t("shift.confirmEnd"))) return;
    setEndingShift(true);
    startTx(async () => {
      await endShift(shiftId);
    });
  };

  const totalParts = optimistic.goodParts + optimistic.badParts;

  return (
    <main className="op-shell" style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/"><Logo height={42} /></Link>
      </div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div className="app-tag">
            {line?.name ?? "Line"} · {t(`operator.shift.${initialShift.shiftType}`)} · {initialShift.product}
          </div>
          <h1 className="app-h2">{t("shift.live")}</h1>
        </div>
        <span className={`pill ${optimistic.activeStop ? "" : "pill-live"}`}
              style={optimistic.activeStop ? { background: "#c84141", color: "white", borderColor: "#c84141" } : {}}>
          {optimistic.activeStop ? t("shift.stopped") : t("shift.running")}
        </span>
      </div>

      {/* Parts counters */}
      <div className="parts-row" style={{ marginBottom: 24 }}>
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

      <div className="op-grid-stops" style={{ marginBottom: 24 }}>
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

      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn btn-danger"
          style={{ flex: 1 }}
          onClick={finish}
          disabled={endingShift}
        >
          {endingShift ? t("shift.ending") : t("shift.endShift")}
        </button>
      </div>

      <div style={{ marginTop: 24, color: "var(--muted2)", fontSize: 14 }}>
        {t("shift.totalProduced")}: {totalParts.toLocaleString()} · {t("shift.planned")}: {initialShift.plannedMinutes} min · {t("shift.idealRate")}: {Number(initialShift.idealRate).toFixed(0)}/min
      </div>
    </main>
  );
}
