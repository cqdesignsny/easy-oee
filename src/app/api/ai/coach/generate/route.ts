/**
 * POST /api/ai/coach/generate
 *
 * Generates a fresh weekly AI Coach analysis for the current admin's company.
 * Reads the manager's locale cookie so the report comes back in their
 * preferred language. Persists the JSON on `company.ai_coach_report`.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getAdminSession } from "@/lib/auth/admin-session";
import { getWeeklyContextForAI } from "@/lib/db/queries/ai-context";
import { generateWeeklyAnalysis, type CoachLocale } from "@/lib/ai/coach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function readLocale(value: string | undefined): CoachLocale {
  if (value === "es" || value === "fr" || value === "en") return value;
  return "en";
}

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI Coach is not configured. ANTHROPIC_API_KEY is missing." },
      { status: 503 },
    );
  }

  try {
    const ctx = await getWeeklyContextForAI(session.companyId);
    if (!ctx) {
      return NextResponse.json({ error: "company_not_found" }, { status: 404 });
    }

    const jar = await cookies();
    const locale = readLocale(jar.get("eo-locale")?.value);
    const analysis = await generateWeeklyAnalysis(ctx, locale);

    await db
      .update(s.company)
      .set({
        aiCoachReport: JSON.stringify(analysis),
        aiCoachGeneratedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(s.company.id, session.companyId));

    return NextResponse.json({ ok: true, analysis });
  } catch (e) {
    console.error("ai-coach generate failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "generation_failed" },
      { status: 500 },
    );
  }
}
