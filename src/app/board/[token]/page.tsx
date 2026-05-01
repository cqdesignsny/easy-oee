/**
 * Public read-only "TV Board" view for the shop floor.
 *
 * Designed for a 55" display bolted above a production line. No login —
 * the line.boardToken in the URL is the credential. Manager generates +
 * rotates this token from /dashboard/lines.
 *
 * Auto-refreshes every 10 seconds via revalidate. Big numbers, no chrome.
 */
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { computeOEE, formatPercent, oeeBucket } from "@/lib/oee";
import { BoardClient } from "./board-client";
import { plantDateString, safeTimezone } from "@/lib/time";

export const revalidate = 10;
export const dynamic = "force-dynamic";
export const metadata = { title: "Board | Easy OEE" };

export default async function BoardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token || token.length < 8) notFound();

  const [line] = await db.select().from(s.line).where(eq(s.line.boardToken, token)).limit(1);
  if (!line) notFound();

  // Look up the plant timezone via the line's company so the board's "today"
  // and clock match what the manager sees on the dashboard.
  const [companyRow] = await db
    .select({ timezone: s.company.timezone })
    .from(s.company)
    .where(eq(s.company.id, line.companyId))
    .limit(1);
  const tz = safeTimezone(companyRow?.timezone);

  // Most recent in-progress shift on this line, or fall back to today's last
  const todayStr = plantDateString(new Date(), tz);
  const [active] = await db
    .select()
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, line.companyId),
        eq(s.shift.lineId, line.id),
        eq(s.shift.status, "in_progress"),
      ),
    )
    .orderBy(desc(s.shift.startedAt))
    .limit(1);

  // Today's completed shift average for this line
  const todayRows = await db
    .select({ oee: s.shift.oee })
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, line.companyId),
        eq(s.shift.lineId, line.id),
        eq(s.shift.status, "complete"),
        eq(s.shift.shiftDate, todayStr),
      ),
    );
  const todayAvgOee = (() => {
    const vals = todayRows.map((x) => (x.oee != null ? Number(x.oee) : null)).filter((v): v is number => v != null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  // Current/operator name + stops for the active shift
  let liveOee: number | null = null;
  let goodParts = 0;
  let badParts = 0;
  let operatorName = "";
  let activeStopReason: string | null = null;
  let activeStopStartedAt: string | null = null;
  let plannedMinutes = 0;
  let startedAtIso: string | null = null;
  let stopMinutesSoFar = 0;

  if (active) {
    goodParts = active.goodParts;
    badParts = active.badParts;
    plannedMinutes = active.plannedMinutes;
    startedAtIso = active.startedAt.toISOString();
    const [op] = await db
      .select({ fullName: s.user.fullName })
      .from(s.user)
      .where(eq(s.user.id, active.operatorId))
      .limit(1);
    operatorName = op?.fullName ?? "";
    const stops = await db
      .select()
      .from(s.stop)
      .where(and(eq(s.stop.shiftId, active.id)))
      .orderBy(asc(s.stop.startedAt));
    stopMinutesSoFar = stops
      .filter((x) => x.endedAt != null && x.minutes != null)
      .reduce((a, x) => a + Number(x.minutes ?? 0), 0);
    const open = stops.find((x) => x.endedAt == null);
    if (open) {
      activeStopReason = open.reason;
      activeStopStartedAt = open.startedAt.toISOString();
    }
    // Server snapshot of liveOEE at this fetch
    const elapsed = Math.max(1, (Date.now() - active.startedAt.getTime()) / 60000);
    const liveStop =
      stopMinutesSoFar +
      (open ? Math.max(0, (Date.now() - open.startedAt.getTime()) / 60000) : 0);
    const r = computeOEE({
      plannedMinutes: Math.round(elapsed),
      stopMinutes: liveStop,
      goodParts: active.goodParts,
      badParts: active.badParts,
      idealRate: Number(active.idealRate),
    });
    liveOee = r.oee;
  }

  // Top 3 stops in last 7 days for this line (Pareto-style)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const stopAgg = await db
    .select({
      reason: s.stop.reason,
      total: sql<number>`coalesce(sum(${s.stop.minutes}), 0)`,
    })
    .from(s.stop)
    .innerJoin(s.shift, eq(s.shift.id, s.stop.shiftId))
    .where(
      and(
        eq(s.stop.companyId, line.companyId),
        eq(s.shift.lineId, line.id),
        gte(s.stop.startedAt, sevenDaysAgo),
      ),
    )
    .groupBy(s.stop.reason)
    .orderBy(desc(sql`coalesce(sum(${s.stop.minutes}), 0)`))
    .limit(3);

  return (
    <BoardClient
      lineName={line.name}
      target={Number(line.targetOee)}
      liveOee={liveOee}
      todayAvgOee={todayAvgOee}
      activeShift={
        active
          ? {
              operatorName,
              shiftType: active.shiftType,
              product: active.product,
              startedAtIso: startedAtIso!,
              plannedMinutes,
              goodParts,
              badParts,
              stopMinutesSoFar,
              activeStopReason,
              activeStopStartedAt,
            }
          : null
      }
      topStops={stopAgg.map((x) => ({ reason: x.reason, minutes: Number(x.total) }))}
      bucket={oeeBucket(liveOee ?? todayAvgOee)}
      todayLabel={formatPercent(todayAvgOee)}
      timezone={tz}
    />
  );
}
