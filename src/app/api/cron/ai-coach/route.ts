/**
 * GET /api/cron/ai-coach
 *
 * Vercel Cron entrypoint for the weekly AI Coach analysis.
 * Configured in vercel.json to fire every Monday at 11:00 UTC (= ~6am EDT
 * during DST, ~7am EST in winter, which is the morning the action plans
 * are intended to be on the manager's desk).
 *
 * Iterates every company that's not in a terminal state (active, trialing,
 * or unset) and regenerates their report. The cron always uses English
 * because we don't know each manager's preferred locale at this layer;
 * the manager can hit "Regenerate" in their own language any time.
 *
 * Auth: Vercel posts with `x-vercel-cron: 1`; we also accept a manual
 * trigger via `Authorization: Bearer ${CRON_SECRET}`.
 */

import { NextResponse } from "next/server";
import { eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getWeeklyContextForAI } from "@/lib/db/queries/ai-context";
import { generateWeeklyAnalysis } from "@/lib/ai/coach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  const isCron = req.headers.get("x-vercel-cron") === "1";
  const auth = req.headers.get("authorization");
  const okSecret =
    process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
  if (!isCron && !okSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY missing" },
      { status: 503 },
    );
  }

  // Skip canceled companies; everything else gets a fresh report.
  const companies = await db
    .select({ id: s.company.id, name: s.company.name })
    .from(s.company)
    .where(ne(s.company.subscriptionStatus, "canceled"));

  const results: { company: string; ok: boolean; reason?: string }[] = [];

  for (const c of companies) {
    try {
      const ctx = await getWeeklyContextForAI(c.id);
      if (!ctx) {
        results.push({ company: c.name, ok: false, reason: "no_context" });
        continue;
      }
      // Skip companies with zero shifts in the window — nothing to analyze.
      if (ctx.thisWeek.totalShifts === 0) {
        results.push({ company: c.name, ok: false, reason: "no_shifts" });
        continue;
      }
      const analysis = await generateWeeklyAnalysis(ctx, "en");
      await db
        .update(s.company)
        .set({
          aiCoachReport: JSON.stringify(analysis),
          aiCoachGeneratedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(s.company.id, c.id));
      results.push({ company: c.name, ok: true });
    } catch (e) {
      console.error("ai-coach cron error", c.name, e);
      results.push({
        company: c.name,
        ok: false,
        reason: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ ok: true, processed: results });
}
