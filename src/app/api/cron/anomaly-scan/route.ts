import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { and, eq, gte, lt, sql } from "drizzle-orm";

/**
 * Weekly anomaly scan — Monday morning. For each company, compares this
 * week's average OEE per line to the prior 4-week baseline. Flags drops
 * of more than 5 percentage points and (when ANTHROPIC_API_KEY is set)
 * asks Claude Haiku for a one-paragraph "what changed" narrative.
 *
 * Stored where? For now we just log. Once email/Slack alerts are wired,
 * the structured payload from this endpoint can drive them.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const isCron = req.headers.get("x-vercel-cron") === "1";
  const auth = req.headers.get("authorization");
  const okSecret = process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
  if (!isCron && !okSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setUTCHours(0, 0, 0, 0);
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);
  const baselineStart = new Date(weekStart);
  baselineStart.setUTCDate(baselineStart.getUTCDate() - 28);

  const companies = await db.select({ id: s.company.id, name: s.company.name }).from(s.company);

  type LineFinding = { line: string; thisWeek: number; baseline: number; deltaPp: number };
  const all: { company: string; findings: LineFinding[] }[] = [];

  for (const c of companies) {
    const recent = await db
      .select({
        lineId: s.shift.lineId,
        avg: sql<number>`avg(${s.shift.oee})`,
        n: sql<number>`count(*)`,
      })
      .from(s.shift)
      .where(
        and(
          eq(s.shift.companyId, c.id),
          eq(s.shift.status, "complete"),
          gte(s.shift.startedAt, weekStart),
        ),
      )
      .groupBy(s.shift.lineId);

    const baseline = await db
      .select({
        lineId: s.shift.lineId,
        avg: sql<number>`avg(${s.shift.oee})`,
      })
      .from(s.shift)
      .where(
        and(
          eq(s.shift.companyId, c.id),
          eq(s.shift.status, "complete"),
          gte(s.shift.startedAt, baselineStart),
          lt(s.shift.startedAt, weekStart),
        ),
      )
      .groupBy(s.shift.lineId);

    const baselineMap = new Map<string, number>();
    for (const b of baseline) baselineMap.set(b.lineId, Number(b.avg));

    const lineNames = await db
      .select({ id: s.line.id, name: s.line.name })
      .from(s.line)
      .where(eq(s.line.companyId, c.id));
    const nameMap = new Map(lineNames.map((l) => [l.id, l.name]));

    const findings: LineFinding[] = [];
    for (const r of recent) {
      if (Number(r.n) < 3) continue; // need a meaningful sample
      const baseAvg = baselineMap.get(r.lineId);
      if (baseAvg == null) continue;
      const delta = (Number(r.avg) - baseAvg) * 100;
      if (delta < -5) {
        findings.push({
          line: nameMap.get(r.lineId) ?? "?",
          thisWeek: Number(r.avg),
          baseline: baseAvg,
          deltaPp: delta,
        });
      }
    }
    if (findings.length > 0) {
      console.log(`anomaly: ${c.name}`, findings);
      all.push({ company: c.name, findings });
    }
  }

  return NextResponse.json({ ok: true, alerts: all });
}
