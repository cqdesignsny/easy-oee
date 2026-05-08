/**
 * AI Coach context query.
 *
 * Rolls up the trailing week of plant data into a JSON-safe payload that we
 * hand to Claude as context. Plant timezone is honored for the "this week"
 * window so a 10pm EDT shift on Sunday doesn't leak into the next week's
 * analysis.
 *
 * Multi-tenant scoped. Returns null when the company doesn't exist.
 */

import { and, avg, count, desc, eq, gte, lte, sum } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import {
  plantDateString,
  plantDayStartUTC,
  safeTimezone,
} from "@/lib/time";

export type WeeklyContext = NonNullable<
  Awaited<ReturnType<typeof getWeeklyContextForAI>>
>;

export async function getWeeklyContextForAI(companyId: string) {
  const [companyRow] = await db
    .select({
      name: s.company.name,
      timezone: s.company.timezone,
    })
    .from(s.company)
    .where(eq(s.company.id, companyId))
    .limit(1);
  if (!companyRow) return null;

  const tz = safeTimezone(companyRow.timezone);
  const now = new Date();

  // Plant-tz boundaries. "This week" = the 7 most recent plant-tz days
  // ending today; "previous week" = the 7 days before that.
  const todayStr = plantDateString(now, tz);
  const sevenAgoStr = plantDateString(
    new Date(now.getTime() - 7 * 24 * 3600 * 1000),
    tz,
  );
  const fourteenAgoStr = plantDateString(
    new Date(now.getTime() - 14 * 24 * 3600 * 1000),
    tz,
  );

  const weekStart = plantDayStartUTC(sevenAgoStr, tz);
  const prevWeekStart = plantDayStartUTC(fourteenAgoStr, tz);

  const [thisWeek] = await db
    .select({
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
        gte(s.shift.startedAt, weekStart),
      ),
    );

  const [prevWeek] = await db
    .select({ avgOee: avg(s.shift.oee) })
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, prevWeekStart),
        lte(s.shift.startedAt, weekStart),
      ),
    );

  const stops = await db
    .select({
      reason: s.stop.reason,
      totalMinutes: sum(s.stop.minutes),
      occurrences: count(s.stop.id),
    })
    .from(s.stop)
    .where(
      and(
        eq(s.stop.companyId, companyId),
        gte(s.stop.startedAt, weekStart),
      ),
    )
    .groupBy(s.stop.reason)
    .orderBy(desc(sum(s.stop.minutes)))
    .limit(5);

  const byLine = await db
    .select({
      lineName: s.line.name,
      targetOee: s.line.targetOee,
      avgOee: avg(s.shift.oee),
      avgAvailability: avg(s.shift.availability),
      avgPerformance: avg(s.shift.performance),
      avgQuality: avg(s.shift.quality),
      totalShifts: count(s.shift.id),
    })
    .from(s.shift)
    .innerJoin(s.line, eq(s.line.id, s.shift.lineId))
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, weekStart),
      ),
    )
    .groupBy(s.line.name, s.line.targetOee)
    .orderBy(desc(avg(s.shift.oee)));

  const byShift = await db
    .select({
      shiftType: s.shift.shiftType,
      avgOee: avg(s.shift.oee),
      totalShifts: count(s.shift.id),
    })
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, weekStart),
      ),
    )
    .groupBy(s.shift.shiftType);

  const byOperator = await db
    .select({
      operatorName: s.user.fullName,
      avgOee: avg(s.shift.oee),
      totalShifts: count(s.shift.id),
    })
    .from(s.shift)
    .innerJoin(s.user, eq(s.user.id, s.shift.operatorId))
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, weekStart),
      ),
    )
    .groupBy(s.user.fullName)
    .orderBy(avg(s.shift.oee));

  return {
    companyName: companyRow.name,
    timezone: tz,
    weekStartPlantDate: sevenAgoStr,
    weekEndPlantDate: todayStr,
    thisWeek: {
      avgOee: thisWeek?.avgOee != null ? Number(thisWeek.avgOee) : null,
      avgAvailability:
        thisWeek?.avgAvailability != null ? Number(thisWeek.avgAvailability) : null,
      avgPerformance:
        thisWeek?.avgPerformance != null ? Number(thisWeek.avgPerformance) : null,
      avgQuality: thisWeek?.avgQuality != null ? Number(thisWeek.avgQuality) : null,
      totalShifts: Number(thisWeek?.totalShifts ?? 0),
      totalGoodParts: Number(thisWeek?.totalGoodParts ?? 0),
      totalBadParts: Number(thisWeek?.totalBadParts ?? 0),
      totalPlannedMinutes: Number(thisWeek?.totalPlannedMinutes ?? 0),
    },
    prevWeekOee: prevWeek?.avgOee != null ? Number(prevWeek.avgOee) : null,
    stops: stops.map((st) => ({
      reason: st.reason,
      totalMinutes: Number(st.totalMinutes ?? 0),
      occurrences: Number(st.occurrences ?? 0),
    })),
    byLine: byLine.map((l) => ({
      lineName: l.lineName,
      targetOee: Number(l.targetOee ?? 0.85),
      avgOee: l.avgOee != null ? Number(l.avgOee) : null,
      avgAvailability: l.avgAvailability != null ? Number(l.avgAvailability) : null,
      avgPerformance: l.avgPerformance != null ? Number(l.avgPerformance) : null,
      avgQuality: l.avgQuality != null ? Number(l.avgQuality) : null,
      totalShifts: Number(l.totalShifts ?? 0),
    })),
    byShift: byShift.map((sh) => ({
      shiftType: sh.shiftType,
      avgOee: sh.avgOee != null ? Number(sh.avgOee) : null,
      totalShifts: Number(sh.totalShifts ?? 0),
    })),
    byOperator: byOperator.map((op) => ({
      operatorName: op.operatorName,
      avgOee: op.avgOee != null ? Number(op.avgOee) : null,
      totalShifts: Number(op.totalShifts ?? 0),
    })),
  };
}
