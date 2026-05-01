/**
 * Per-line live state — used by the dashboard live grid and the TV board.
 *
 * Returns one snapshot per active line for the company, including: most-recent
 * in-progress shift (or null for idle), live OEE estimate, current operator,
 * current open stop, today's average OEE, and top stop reason today.
 */

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../client";
import * as s from "../schema";
import { computeOEE } from "@/lib/oee";
import { plantDateString, safeTimezone } from "@/lib/time";

export type LineLiveState = {
  lineId: string;
  lineName: string;
  target: number;
  status: "running" | "stopped" | "idle";
  liveOee: number | null;
  todayAvgOee: number | null;
  activeShift: {
    id: string;
    operatorName: string;
    shiftType: "morning" | "afternoon" | "night";
    product: string;
    jobNumber: string | null;
    startedAtIso: string;
    plannedMinutes: number;
    goodParts: number;
    badParts: number;
    activeStopReason: string | null;
    activeStopStartedAtIso: string | null;
  } | null;
  topStopToday: { reason: string; minutes: number } | null;
};

export async function getCompanyLiveLines(
  companyId: string,
  timezone?: string,
): Promise<LineLiveState[]> {
  const lines = await db
    .select()
    .from(s.line)
    .where(and(eq(s.line.companyId, companyId), eq(s.line.active, true)))
    .orderBy(asc(s.line.name));

  if (lines.length === 0) return [];

  // If the caller didn't pass a timezone, look it up. Caller should pass
  // it though, to avoid a redundant company query on every dashboard tick.
  let tz = timezone;
  if (!tz) {
    const [c] = await db
      .select({ timezone: s.company.timezone })
      .from(s.company)
      .where(eq(s.company.id, companyId))
      .limit(1);
    tz = safeTimezone(c?.timezone);
  }
  const todayStr = plantDateString(new Date(), tz);

  const results: LineLiveState[] = [];

  for (const line of lines) {
    // Most recent in-progress shift for this line
    const [active] = await db
      .select()
      .from(s.shift)
      .where(
        and(
          eq(s.shift.companyId, companyId),
          eq(s.shift.lineId, line.id),
          eq(s.shift.status, "in_progress"),
        ),
      )
      .orderBy(desc(s.shift.startedAt))
      .limit(1);

    // Today's completed shifts on this line for today's avg OEE
    const todayRows = await db
      .select({ oee: s.shift.oee })
      .from(s.shift)
      .where(
        and(
          eq(s.shift.companyId, companyId),
          eq(s.shift.lineId, line.id),
          eq(s.shift.status, "complete"),
          eq(s.shift.shiftDate, todayStr),
        ),
      );
    const todayVals = todayRows
      .map((x) => (x.oee != null ? Number(x.oee) : null))
      .filter((v): v is number => v != null);
    const todayAvgOee = todayVals.length > 0
      ? todayVals.reduce((a, b) => a + b, 0) / todayVals.length
      : null;

    let liveOee: number | null = null;
    let activeShiftOut: LineLiveState["activeShift"] = null;
    let status: LineLiveState["status"] = "idle";

    if (active) {
      const [op] = await db
        .select({ fullName: s.user.fullName })
        .from(s.user)
        .where(eq(s.user.id, active.operatorId))
        .limit(1);

      const stops = await db
        .select()
        .from(s.stop)
        .where(eq(s.stop.shiftId, active.id))
        .orderBy(asc(s.stop.startedAt));
      const closedMinutes = stops
        .filter((x) => x.endedAt != null && x.minutes != null)
        .reduce((a, x) => a + Number(x.minutes ?? 0), 0);
      const open = stops.find((x) => x.endedAt == null);

      const elapsedMin = Math.max(1, (Date.now() - active.startedAt.getTime()) / 60000);
      const liveStopMin =
        closedMinutes +
        (open ? Math.max(0, (Date.now() - open.startedAt.getTime()) / 60000) : 0);

      const r = computeOEE({
        plannedMinutes: Math.round(elapsedMin),
        stopMinutes: liveStopMin,
        goodParts: active.goodParts,
        badParts: active.badParts,
        idealRate: Number(active.idealRate),
      });
      liveOee = r.oee;
      status = open ? "stopped" : "running";

      activeShiftOut = {
        id: active.id,
        operatorName: op?.fullName ?? "",
        shiftType: active.shiftType as "morning" | "afternoon" | "night",
        product: active.product,
        jobNumber: active.jobNumber ?? null,
        startedAtIso: active.startedAt.toISOString(),
        plannedMinutes: active.plannedMinutes,
        goodParts: active.goodParts,
        badParts: active.badParts,
        activeStopReason: open?.reason ?? null,
        activeStopStartedAtIso: open?.startedAt.toISOString() ?? null,
      };
    }

    // Top stop reason today on this line. Filter by parent shift.shiftDate
    // (plant-tz), not by stop.startedAt (UTC), so a 10pm-EDT shift on Apr 29
    // doesn't have its first hour of stops counted as "Apr 30" data.
    const stopAgg = await db
      .select({
        reason: s.stop.reason,
        total: sql<number>`coalesce(sum(${s.stop.minutes}), 0)`,
      })
      .from(s.stop)
      .innerJoin(s.shift, eq(s.shift.id, s.stop.shiftId))
      .where(
        and(
          eq(s.stop.companyId, companyId),
          eq(s.shift.lineId, line.id),
          eq(s.shift.shiftDate, todayStr),
        ),
      )
      .groupBy(s.stop.reason)
      .orderBy(desc(sql`coalesce(sum(${s.stop.minutes}), 0)`))
      .limit(1);
    const topStopToday = stopAgg[0] && Number(stopAgg[0].total) > 0
      ? { reason: stopAgg[0].reason, minutes: Number(stopAgg[0].total) }
      : null;

    results.push({
      lineId: line.id,
      lineName: line.name,
      target: Number(line.targetOee),
      status,
      liveOee,
      todayAvgOee,
      activeShift: activeShiftOut,
      topStopToday,
    });
  }

  return results;
}
