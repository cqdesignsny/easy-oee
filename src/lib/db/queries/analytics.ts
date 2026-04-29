/**
 * Analytics queries — backs the /dashboard/analytics module.
 *
 * Every query is multi-tenant scoped via `companyId`. Returns plain
 * JSON-friendly shapes so the page components don't have to massage
 * Drizzle types.
 *
 * Time window defaults to the last 30 days.
 */

import { and, avg, count, desc, eq, gte, sum } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";

function dateRange(days: number): Date {
  return new Date(Date.now() - days * 24 * 3600 * 1000);
}

// ─── Overview KPIs ───────────────────────────────────────────────────────────

export async function getAnalyticsOverview(companyId: string, days = 30) {
  const since = dateRange(days);

  const [row] = await db
    .select({
      avgOee: avg(s.shift.oee),
      avgAvailability: avg(s.shift.availability),
      avgPerformance: avg(s.shift.performance),
      avgQuality: avg(s.shift.quality),
      totalShifts: count(s.shift.id),
      totalGoodParts: sum(s.shift.goodParts),
      totalBadParts: sum(s.shift.badParts),
    })
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, since),
      ),
    );

  const totalGood = Number(row?.totalGoodParts ?? 0);
  const totalBad = Number(row?.totalBadParts ?? 0);
  const totalParts = totalGood + totalBad;

  return {
    avgOee: row?.avgOee != null ? Number(row.avgOee) : null,
    avgAvailability: row?.avgAvailability != null ? Number(row.avgAvailability) : null,
    avgPerformance: row?.avgPerformance != null ? Number(row.avgPerformance) : null,
    avgQuality: row?.avgQuality != null ? Number(row.avgQuality) : null,
    totalShifts: Number(row?.totalShifts ?? 0),
    totalGoodParts: totalGood,
    totalBadParts: totalBad,
    totalParts,
    defectRate: totalParts > 0 ? totalBad / totalParts : null,
  };
}

// One row per day in the window: avg OEE / A / P / Q + shift count.
export async function getOeeTrend(companyId: string, days = 30) {
  const since = dateRange(days);
  const rows = await db
    .select({
      shiftDate: s.shift.shiftDate,
      avgOee: avg(s.shift.oee),
      avgAvailability: avg(s.shift.availability),
      avgPerformance: avg(s.shift.performance),
      avgQuality: avg(s.shift.quality),
      shifts: count(s.shift.id),
    })
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, since),
      ),
    )
    .groupBy(s.shift.shiftDate)
    .orderBy(s.shift.shiftDate);

  return rows.map((r) => ({
    date: r.shiftDate,
    oee: r.avgOee != null ? Number(r.avgOee) : null,
    availability: r.avgAvailability != null ? Number(r.avgAvailability) : null,
    performance: r.avgPerformance != null ? Number(r.avgPerformance) : null,
    quality: r.avgQuality != null ? Number(r.avgQuality) : null,
    shifts: Number(r.shifts),
  }));
}

// ─── By shift type (morning / afternoon / night) ─────────────────────────────

export async function getAnalyticsByShiftType(companyId: string, days = 30) {
  const since = dateRange(days);
  const rows = await db
    .select({
      shiftType: s.shift.shiftType,
      avgOee: avg(s.shift.oee),
      avgAvailability: avg(s.shift.availability),
      avgPerformance: avg(s.shift.performance),
      avgQuality: avg(s.shift.quality),
      totalShifts: count(s.shift.id),
      totalGoodParts: sum(s.shift.goodParts),
      totalBadParts: sum(s.shift.badParts),
      totalPlannedMinutes: sum(s.shift.plannedMinutes),
    })
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, since),
      ),
    )
    .groupBy(s.shift.shiftType)
    .orderBy(desc(avg(s.shift.oee)));

  return rows.map((r) => {
    const good = Number(r.totalGoodParts ?? 0);
    const bad = Number(r.totalBadParts ?? 0);
    const total = good + bad;
    return {
      shiftType: r.shiftType as "morning" | "afternoon" | "night",
      avgOee: r.avgOee != null ? Number(r.avgOee) : null,
      avgAvailability: r.avgAvailability != null ? Number(r.avgAvailability) : null,
      avgPerformance: r.avgPerformance != null ? Number(r.avgPerformance) : null,
      avgQuality: r.avgQuality != null ? Number(r.avgQuality) : null,
      totalShifts: Number(r.totalShifts ?? 0),
      totalGoodParts: good,
      totalBadParts: bad,
      defectRate: total > 0 ? bad / total : null,
      totalPlannedMinutes: Number(r.totalPlannedMinutes ?? 0),
    };
  });
}

export async function getStopsByShiftType(companyId: string, days = 30) {
  const since = dateRange(days);
  const rows = await db
    .select({
      shiftType: s.shift.shiftType,
      reason: s.stop.reason,
      totalMinutes: sum(s.stop.minutes),
      occurrences: count(s.stop.id),
    })
    .from(s.stop)
    .innerJoin(s.shift, eq(s.shift.id, s.stop.shiftId))
    .where(
      and(
        eq(s.stop.companyId, companyId),
        gte(s.stop.startedAt, since),
      ),
    )
    .groupBy(s.shift.shiftType, s.stop.reason)
    .orderBy(desc(sum(s.stop.minutes)));

  return rows.map((r) => ({
    shiftType: r.shiftType as "morning" | "afternoon" | "night",
    reason: r.reason,
    totalMinutes: Number(r.totalMinutes ?? 0),
    occurrences: Number(r.occurrences ?? 0),
  }));
}

// ─── By machine / line ───────────────────────────────────────────────────────

export async function getAnalyticsByMachine(companyId: string, days = 30) {
  const since = dateRange(days);
  const rows = await db
    .select({
      lineId: s.line.id,
      lineName: s.line.name,
      targetOee: s.line.targetOee,
      avgOee: avg(s.shift.oee),
      avgAvailability: avg(s.shift.availability),
      avgPerformance: avg(s.shift.performance),
      avgQuality: avg(s.shift.quality),
      totalShifts: count(s.shift.id),
      totalGoodParts: sum(s.shift.goodParts),
      totalBadParts: sum(s.shift.badParts),
      totalPlannedMinutes: sum(s.shift.plannedMinutes),
    })
    .from(s.line)
    .leftJoin(
      s.shift,
      and(
        eq(s.shift.lineId, s.line.id),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, since),
      ),
    )
    .where(and(eq(s.line.companyId, companyId), eq(s.line.active, true)))
    .groupBy(s.line.id, s.line.name, s.line.targetOee)
    .orderBy(desc(avg(s.shift.oee)));

  return rows.map((r) => {
    const good = Number(r.totalGoodParts ?? 0);
    const bad = Number(r.totalBadParts ?? 0);
    const total = good + bad;
    const oee = r.avgOee != null ? Number(r.avgOee) : null;
    const target = Number(r.targetOee ?? 0.85);
    return {
      lineId: r.lineId,
      lineName: r.lineName,
      targetOee: target,
      avgOee: oee,
      avgAvailability: r.avgAvailability != null ? Number(r.avgAvailability) : null,
      avgPerformance: r.avgPerformance != null ? Number(r.avgPerformance) : null,
      avgQuality: r.avgQuality != null ? Number(r.avgQuality) : null,
      totalShifts: Number(r.totalShifts ?? 0),
      totalGoodParts: good,
      totalBadParts: bad,
      defectRate: total > 0 ? bad / total : null,
      totalPlannedMinutes: Number(r.totalPlannedMinutes ?? 0),
      vsTarget: oee != null ? oee - target : null,
    };
  });
}

export async function getStopsByMachine(companyId: string, days = 30) {
  const since = dateRange(days);
  const rows = await db
    .select({
      lineId: s.line.id,
      lineName: s.line.name,
      reason: s.stop.reason,
      totalMinutes: sum(s.stop.minutes),
      occurrences: count(s.stop.id),
    })
    .from(s.stop)
    .innerJoin(s.shift, eq(s.shift.id, s.stop.shiftId))
    .innerJoin(s.line, eq(s.line.id, s.shift.lineId))
    .where(
      and(
        eq(s.stop.companyId, companyId),
        gte(s.stop.startedAt, since),
      ),
    )
    .groupBy(s.line.id, s.line.name, s.stop.reason)
    .orderBy(desc(sum(s.stop.minutes)));

  return rows.map((r) => ({
    lineId: r.lineId,
    lineName: r.lineName,
    reason: r.reason,
    totalMinutes: Number(r.totalMinutes ?? 0),
    occurrences: Number(r.occurrences ?? 0),
  }));
}

// ─── By operator ─────────────────────────────────────────────────────────────

export async function getAnalyticsByOperator(companyId: string, days = 30) {
  const since = dateRange(days);
  const rows = await db
    .select({
      operatorId: s.user.id,
      operatorName: s.user.fullName,
      avgOee: avg(s.shift.oee),
      avgAvailability: avg(s.shift.availability),
      avgPerformance: avg(s.shift.performance),
      avgQuality: avg(s.shift.quality),
      totalShifts: count(s.shift.id),
      totalGoodParts: sum(s.shift.goodParts),
      totalBadParts: sum(s.shift.badParts),
      totalPlannedMinutes: sum(s.shift.plannedMinutes),
    })
    .from(s.user)
    .innerJoin(
      s.shift,
      and(
        eq(s.shift.operatorId, s.user.id),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, since),
      ),
    )
    .where(
      and(
        eq(s.user.companyId, companyId),
        eq(s.user.role, "operator"),
        eq(s.user.active, true),
      ),
    )
    .groupBy(s.user.id, s.user.fullName)
    .orderBy(desc(avg(s.shift.oee)));

  return rows.map((r) => {
    const good = Number(r.totalGoodParts ?? 0);
    const bad = Number(r.totalBadParts ?? 0);
    const total = good + bad;
    return {
      operatorId: r.operatorId,
      operatorName: r.operatorName,
      avgOee: r.avgOee != null ? Number(r.avgOee) : null,
      avgAvailability: r.avgAvailability != null ? Number(r.avgAvailability) : null,
      avgPerformance: r.avgPerformance != null ? Number(r.avgPerformance) : null,
      avgQuality: r.avgQuality != null ? Number(r.avgQuality) : null,
      totalShifts: Number(r.totalShifts ?? 0),
      totalGoodParts: good,
      totalBadParts: bad,
      defectRate: total > 0 ? bad / total : null,
      totalPlannedMinutes: Number(r.totalPlannedMinutes ?? 0),
    };
  });
}

export async function getStopsByOperator(companyId: string, days = 30) {
  const since = dateRange(days);
  const rows = await db
    .select({
      operatorId: s.user.id,
      operatorName: s.user.fullName,
      reason: s.stop.reason,
      totalMinutes: sum(s.stop.minutes),
      occurrences: count(s.stop.id),
    })
    .from(s.stop)
    .innerJoin(s.shift, eq(s.shift.id, s.stop.shiftId))
    .innerJoin(s.user, eq(s.user.id, s.shift.operatorId))
    .where(
      and(
        eq(s.stop.companyId, companyId),
        gte(s.stop.startedAt, since),
      ),
    )
    .groupBy(s.user.id, s.user.fullName, s.stop.reason)
    .orderBy(desc(sum(s.stop.minutes)));

  return rows.map((r) => ({
    operatorId: r.operatorId,
    operatorName: r.operatorName,
    reason: r.reason,
    totalMinutes: Number(r.totalMinutes ?? 0),
    occurrences: Number(r.occurrences ?? 0),
  }));
}
