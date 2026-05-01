"use server";

/**
 * Daily digest — assembles yesterday's OEE numbers per company and (optionally)
 * sends them to managers via Resend. Hit by /api/cron/daily-digest from Vercel
 * Cron at ~6 AM local plant time.
 *
 * The digest is structured so the email body is composed in src/emails/
 * (when wired). For now this returns the structured payload + a
 * plaintext fallback so the cron route can log/dry-run.
 */

import { and, eq, gte, lt, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { formatPercent } from "@/lib/oee";
import { STOP_REASONS } from "@/lib/stop-reasons";
import { plantDateString, plantDayStartUTC, safeTimezone } from "@/lib/time";

export type DigestStop = { reason: string; minutes: number };
export type DigestLine = {
  lineId: string;
  lineName: string;
  oee: number | null;
  shifts: number;
  delta7d: number | null; // change vs the prior 7-day average
  targetOee: number;
};
export type DigestPayload = {
  companyId: string;
  companyName: string;
  date: string; // YYYY-MM-DD (yesterday)
  totalShifts: number;
  avgOee: number | null;
  bestLine: DigestLine | null;
  worstLine: DigestLine | null;
  lines: DigestLine[];
  topStops: DigestStop[]; // top 3
  /** AI-generated one-paragraph summary, if ANTHROPIC_API_KEY is set. */
  summary: string | null;
};

/** Run the digest for a single company; returns null if no data yesterday. */
export async function buildDailyDigest(companyId: string): Promise<DigestPayload | null> {
  const [companyRow] = await db
    .select()
    .from(s.company)
    .where(eq(s.company.id, companyId))
    .limit(1);
  if (!companyRow) return null;

  // "Yesterday" in plant-tz, not server-UTC. The digest cron fires at ~6am
  // local plant time, so "yesterday" means the previous calendar day in the
  // plant's timezone. Filter by shift.shiftDate text so we don't have to
  // compute UTC bounds for stops queried separately.
  const tz = safeTimezone(companyRow.timezone);
  const todayStr = plantDateString(new Date(), tz);
  // dateStr = yesterday's plant-tz YYYY-MM-DD
  const dateStr = plantDateString(
    new Date(Date.now() - 24 * 3600 * 1000),
    tz,
  );
  // UTC bounds for the day, used by stop and baseline queries
  const start = plantDayStartUTC(dateStr, tz);
  const end = plantDayStartUTC(todayStr, tz);

  // Pull yesterday's completed shifts (filter by plant-tz shiftDate)
  const shifts = await db
    .select({
      lineId: s.shift.lineId,
      lineName: s.line.name,
      targetOee: s.line.targetOee,
      oee: s.shift.oee,
    })
    .from(s.shift)
    .innerJoin(s.line, eq(s.line.id, s.shift.lineId))
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.status, "complete"),
        eq(s.shift.shiftDate, dateStr),
      ),
    );
  if (shifts.length === 0) return null;

  // Group by line
  const byLine = new Map<string, DigestLine>();
  for (const sh of shifts) {
    const existing = byLine.get(sh.lineId);
    const oee = sh.oee != null ? Number(sh.oee) : null;
    if (!existing) {
      byLine.set(sh.lineId, {
        lineId: sh.lineId,
        lineName: sh.lineName,
        oee,
        shifts: 1,
        delta7d: null,
        targetOee: Number(sh.targetOee),
      });
    } else {
      existing.shifts += 1;
      if (oee != null) {
        existing.oee =
          existing.oee == null
            ? oee
            : (existing.oee * (existing.shifts - 1) + oee) / existing.shifts;
      }
    }
  }

  // 7-day baseline per line for delta
  const baselineStart = new Date(start);
  baselineStart.setUTCDate(baselineStart.getUTCDate() - 7);
  const baseline = await db
    .select({
      lineId: s.shift.lineId,
      avg: sql<number>`avg(${s.shift.oee})`,
    })
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, companyId),
        eq(s.shift.status, "complete"),
        gte(s.shift.startedAt, baselineStart),
        lt(s.shift.startedAt, start),
      ),
    )
    .groupBy(s.shift.lineId);
  for (const b of baseline) {
    const line = byLine.get(b.lineId);
    if (line && line.oee != null) {
      line.delta7d = line.oee - Number(b.avg);
    }
  }

  const lines = [...byLine.values()];
  const sorted = lines.filter((l) => l.oee != null).sort((a, b) => (b.oee ?? 0) - (a.oee ?? 0));
  const bestLine = sorted[0] ?? null;
  const worstLine = sorted[sorted.length - 1] ?? null;
  const validShiftOees = shifts
    .map((x) => (x.oee != null ? Number(x.oee) : null))
    .filter((v): v is number => v != null);
  const avgOee =
    validShiftOees.length > 0
      ? validShiftOees.reduce((a, b) => a + b, 0) / validShiftOees.length
      : null;

  // Top 3 stops yesterday
  const stopAgg = await db
    .select({
      reason: s.stop.reason,
      total: sql<number>`coalesce(sum(${s.stop.minutes}), 0)`,
    })
    .from(s.stop)
    .where(
      and(
        eq(s.stop.companyId, companyId),
        gte(s.stop.startedAt, start),
        lt(s.stop.startedAt, end),
      ),
    )
    .groupBy(s.stop.reason)
    .orderBy(desc(sql`coalesce(sum(${s.stop.minutes}), 0)`))
    .limit(3);

  const reasonLabel: Record<string, string> = Object.fromEntries(
    STOP_REASONS.map((r) => [r.value, r.label]),
  );
  const topStops: DigestStop[] = stopAgg.map((x) => ({
    reason: reasonLabel[x.reason] ?? x.reason,
    minutes: Number(x.total),
  }));

  const payload: DigestPayload = {
    companyId,
    companyName: companyRow.name,
    date: dateStr,
    totalShifts: shifts.length,
    avgOee,
    bestLine,
    worstLine,
    lines,
    topStops,
    summary: null,
  };

  // Optional AI summary via Anthropic — gracefully no-op if no key.
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      payload.summary = await generateSummary(payload);
    } catch (e) {
      console.warn("digest: AI summary failed", e);
    }
  }

  return payload;
}

async function generateSummary(p: DigestPayload): Promise<string> {
  // Tiny structured prompt → 1 paragraph plain text. Uses Haiku for speed/cost.
  const prompt = `You are an expert OEE analyst writing one-paragraph daily summaries for plant managers. Be specific, concrete, and direct. Never use emojis or em dashes. Focus on what the manager should pay attention to first.

Plant: ${p.companyName}
Date: ${p.date}
Total shifts: ${p.totalShifts}
Average OEE: ${formatPercent(p.avgOee)}
Best line: ${p.bestLine ? `${p.bestLine.lineName} ${formatPercent(p.bestLine.oee)}` : "n/a"}
Worst line: ${p.worstLine ? `${p.worstLine.lineName} ${formatPercent(p.worstLine.oee)}` : "n/a"}
Top stops: ${p.topStops.map((s) => `${s.reason} (${s.minutes.toFixed(0)} min)`).join(", ")}
Per line: ${p.lines
    .map(
      (l) =>
        `${l.lineName}: ${formatPercent(l.oee)} (target ${formatPercent(l.targetOee)}, ${l.shifts} shifts${l.delta7d != null ? `, ${l.delta7d > 0 ? "+" : ""}${(l.delta7d * 100).toFixed(1)}pp vs 7-day avg` : ""})`,
    )
    .join("; ")}

Write 2-3 sentences. No greeting, no signoff, no markdown, no lists.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 220,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const json = (await res.json()) as { content: { type: string; text: string }[] };
  const txt = json.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return txt;
}

