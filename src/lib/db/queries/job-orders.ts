/**
 * Job Orders queries — backs /dashboard/analytics/jobs.
 *
 * A "job order" is a manufacturing work order tracked via the operator's
 * scan / type of `shift.job_number` at shift start. Multiple shifts can share
 * the same job number when a long run spans operators or shift types. These
 * queries roll those shifts up so a manager can see what's happening per
 * work order without bouncing between shift rows.
 *
 * Multi-tenant scoped via `companyId` on every query.
 */

import { and, asc, count, desc, eq, gte, isNotNull, ne, sum } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";

function dateRange(days: number): Date {
  return new Date(Date.now() - days * 24 * 3600 * 1000);
}

export type JobOrderRow = {
  jobNumber: string;
  totalShifts: number;
  totalGoodParts: number;
  totalBadParts: number;
  totalPlannedMinutes: number;
  /** Average OEE across the rolled-up shifts; null when no shift is complete yet. */
  avgOee: number | null;
  uniqueOperators: number;
  uniqueLines: number;
  firstStartedAt: Date | null;
  lastEndedAt: Date | null;
};

export async function getJobOrdersList(
  companyId: string,
  days = 90,
): Promise<JobOrderRow[]> {
  const since = dateRange(days);

  // Aggregate shift rows by job number.
  const rows = await db
    .select({
      jobNumber: s.shift.jobNumber,
      totalShifts: count(s.shift.id),
      totalGoodParts: sum(s.shift.goodParts),
      totalBadParts: sum(s.shift.badParts),
      totalPlannedMinutes: sum(s.shift.plannedMinutes),
    })
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, companyId),
        isNotNull(s.shift.jobNumber),
        ne(s.shift.jobNumber, ""),
        gte(s.shift.startedAt, since),
      ),
    )
    .groupBy(s.shift.jobNumber)
    .orderBy(desc(count(s.shift.id)));

  // For each job number, get richer per-row data in a single follow-up pass.
  const enriched = await Promise.all(
    rows.map(async (r) => {
      if (!r.jobNumber) return null;
      const shifts = await db
        .select({
          id: s.shift.id,
          operatorId: s.shift.operatorId,
          lineId: s.shift.lineId,
          oee: s.shift.oee,
          status: s.shift.status,
          startedAt: s.shift.startedAt,
          endedAt: s.shift.endedAt,
        })
        .from(s.shift)
        .where(
          and(
            eq(s.shift.companyId, companyId),
            eq(s.shift.jobNumber, r.jobNumber),
            gte(s.shift.startedAt, since),
          ),
        );

      const ops = new Set<string>();
      const lines = new Set<string>();
      let oeeSum = 0;
      let oeeCount = 0;
      let firstStartedAt: Date | null = null;
      let lastEndedAt: Date | null = null;
      for (const sh of shifts) {
        ops.add(sh.operatorId);
        lines.add(sh.lineId);
        if (sh.status === "complete" && sh.oee != null) {
          oeeSum += Number(sh.oee);
          oeeCount += 1;
        }
        if (sh.startedAt && (!firstStartedAt || sh.startedAt < firstStartedAt)) {
          firstStartedAt = sh.startedAt;
        }
        if (sh.endedAt && (!lastEndedAt || sh.endedAt > lastEndedAt)) {
          lastEndedAt = sh.endedAt;
        }
      }

      return {
        jobNumber: r.jobNumber,
        totalShifts: Number(r.totalShifts ?? 0),
        totalGoodParts: Number(r.totalGoodParts ?? 0),
        totalBadParts: Number(r.totalBadParts ?? 0),
        totalPlannedMinutes: Number(r.totalPlannedMinutes ?? 0),
        avgOee: oeeCount > 0 ? oeeSum / oeeCount : null,
        uniqueOperators: ops.size,
        uniqueLines: lines.size,
        firstStartedAt,
        lastEndedAt,
      } satisfies JobOrderRow;
    }),
  );

  return enriched.filter((r): r is JobOrderRow => r != null);
}

export type JobOrderShift = {
  shiftId: string;
  shiftDate: string;
  shiftType: "morning" | "afternoon" | "night";
  status: "in_progress" | "complete";
  product: string;
  operatorId: string;
  operatorName: string;
  lineId: string;
  lineName: string;
  startedAt: Date;
  endedAt: Date | null;
  plannedMinutes: number;
  goodParts: number;
  badParts: number;
  availability: number | null;
  performance: number | null;
  quality: number | null;
  oee: number | null;
  totalStopMinutes: number;
};

export type JobOrderStopRow = {
  reason: string;
  totalMinutes: number;
  occurrences: number;
};

export type JobOrderDetail = {
  jobNumber: string;
  product: string | null;
  shifts: JobOrderShift[];
  stops: JobOrderStopRow[];
  totals: {
    totalShifts: number;
    totalGoodParts: number;
    totalBadParts: number;
    totalPlannedMinutes: number;
    totalStopMinutes: number;
    avgOee: number | null;
    avgAvailability: number | null;
    avgPerformance: number | null;
    avgQuality: number | null;
    uniqueOperators: number;
    uniqueLines: number;
    firstStartedAt: Date | null;
    lastEndedAt: Date | null;
  };
};

export async function getJobOrderDetail(
  companyId: string,
  jobNumber: string,
): Promise<JobOrderDetail | null> {
  const shiftRows = await db
    .select({
      shiftId: s.shift.id,
      shiftDate: s.shift.shiftDate,
      shiftType: s.shift.shiftType,
      status: s.shift.status,
      product: s.shift.product,
      operatorId: s.shift.operatorId,
      operatorName: s.user.fullName,
      lineId: s.shift.lineId,
      lineName: s.line.name,
      startedAt: s.shift.startedAt,
      endedAt: s.shift.endedAt,
      plannedMinutes: s.shift.plannedMinutes,
      goodParts: s.shift.goodParts,
      badParts: s.shift.badParts,
      availability: s.shift.availability,
      performance: s.shift.performance,
      quality: s.shift.quality,
      oee: s.shift.oee,
    })
    .from(s.shift)
    .innerJoin(s.user, eq(s.user.id, s.shift.operatorId))
    .innerJoin(s.line, eq(s.line.id, s.shift.lineId))
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.jobNumber, jobNumber),
      ),
    )
    .orderBy(asc(s.shift.startedAt));

  if (shiftRows.length === 0) return null;

  // Stop minutes per shift.
  const stopRows = await db
    .select({
      shiftId: s.stop.shiftId,
      reason: s.stop.reason,
      totalMinutes: sum(s.stop.minutes),
      occurrences: count(s.stop.id),
    })
    .from(s.stop)
    .innerJoin(s.shift, eq(s.shift.id, s.stop.shiftId))
    .where(
      and(
        eq(s.stop.companyId, companyId),
        eq(s.shift.jobNumber, jobNumber),
      ),
    )
    .groupBy(s.stop.shiftId, s.stop.reason);

  const stopMinutesByShift = new Map<string, number>();
  for (const r of stopRows) {
    const cur = stopMinutesByShift.get(r.shiftId) ?? 0;
    stopMinutesByShift.set(r.shiftId, cur + Number(r.totalMinutes ?? 0));
  }

  const stopAgg = new Map<string, { minutes: number; occurrences: number }>();
  for (const r of stopRows) {
    const cur = stopAgg.get(r.reason) ?? { minutes: 0, occurrences: 0 };
    cur.minutes += Number(r.totalMinutes ?? 0);
    cur.occurrences += Number(r.occurrences ?? 0);
    stopAgg.set(r.reason, cur);
  }
  const stops: JobOrderStopRow[] = Array.from(stopAgg.entries())
    .map(([reason, v]) => ({
      reason,
      totalMinutes: v.minutes,
      occurrences: v.occurrences,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  // Roll up totals.
  const ops = new Set<string>();
  const lines = new Set<string>();
  let oeeSum = 0,
    aSum = 0,
    pSum = 0,
    qSum = 0;
  let oeeCnt = 0,
    aCnt = 0,
    pCnt = 0,
    qCnt = 0;
  let totalGood = 0,
    totalBad = 0,
    totalPlanned = 0;
  let firstStartedAt: Date | null = null;
  let lastEndedAt: Date | null = null;

  const shifts: JobOrderShift[] = shiftRows.map((sh) => {
    const stopMin = stopMinutesByShift.get(sh.shiftId) ?? 0;
    ops.add(sh.operatorId);
    lines.add(sh.lineId);
    totalGood += sh.goodParts ?? 0;
    totalBad += sh.badParts ?? 0;
    totalPlanned += sh.plannedMinutes ?? 0;
    if (sh.status === "complete" && sh.oee != null) {
      oeeSum += Number(sh.oee);
      oeeCnt += 1;
    }
    if (sh.availability != null) {
      aSum += Number(sh.availability);
      aCnt += 1;
    }
    if (sh.performance != null) {
      pSum += Number(sh.performance);
      pCnt += 1;
    }
    if (sh.quality != null) {
      qSum += Number(sh.quality);
      qCnt += 1;
    }
    if (sh.startedAt && (!firstStartedAt || sh.startedAt < firstStartedAt)) {
      firstStartedAt = sh.startedAt;
    }
    if (sh.endedAt && (!lastEndedAt || sh.endedAt > lastEndedAt)) {
      lastEndedAt = sh.endedAt;
    }
    return {
      shiftId: sh.shiftId,
      shiftDate: String(sh.shiftDate),
      shiftType: sh.shiftType as "morning" | "afternoon" | "night",
      status: sh.status as "in_progress" | "complete",
      product: sh.product,
      operatorId: sh.operatorId,
      operatorName: sh.operatorName,
      lineId: sh.lineId,
      lineName: sh.lineName,
      startedAt: sh.startedAt,
      endedAt: sh.endedAt,
      plannedMinutes: sh.plannedMinutes ?? 0,
      goodParts: sh.goodParts ?? 0,
      badParts: sh.badParts ?? 0,
      availability: sh.availability != null ? Number(sh.availability) : null,
      performance: sh.performance != null ? Number(sh.performance) : null,
      quality: sh.quality != null ? Number(sh.quality) : null,
      oee: sh.oee != null ? Number(sh.oee) : null,
      totalStopMinutes: stopMin,
    };
  });

  const totalStopMinutes = stops.reduce((acc, x) => acc + x.totalMinutes, 0);

  return {
    jobNumber,
    product: shifts[0]?.product ?? null,
    shifts,
    stops,
    totals: {
      totalShifts: shifts.length,
      totalGoodParts: totalGood,
      totalBadParts: totalBad,
      totalPlannedMinutes: totalPlanned,
      totalStopMinutes,
      avgOee: oeeCnt > 0 ? oeeSum / oeeCnt : null,
      avgAvailability: aCnt > 0 ? aSum / aCnt : null,
      avgPerformance: pCnt > 0 ? pSum / pCnt : null,
      avgQuality: qCnt > 0 ? qSum / qCnt : null,
      uniqueOperators: ops.size,
      uniqueLines: lines.size,
      firstStartedAt,
      lastEndedAt,
    },
  };
}
