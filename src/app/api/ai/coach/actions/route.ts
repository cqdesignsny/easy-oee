/**
 * PATCH /api/ai/coach/actions
 *
 * Updates the status (approved / edited / rejected) of a single action plan
 * inside the manager's stored AI Coach report. Plan-agnostic: every plan
 * tier has the AI Coach.
 *
 * Body: { actionId, status, editedTitle?, editedDetail? }
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getAdminSession } from "@/lib/auth/admin-session";
import type { ActionPlan, CoachAnalysis } from "@/lib/ai/coach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  actionId: z.string().min(1),
  status: z.enum(["approved", "edited", "rejected"]),
  editedTitle: z.string().max(160).optional(),
  editedDetail: z.string().max(2000).optional(),
});

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { actionId, status, editedTitle, editedDetail } = parsed.data;

  const [companyRow] = await db
    .select({ aiCoachReport: s.company.aiCoachReport })
    .from(s.company)
    .where(eq(s.company.id, session.companyId))
    .limit(1);
  if (!companyRow?.aiCoachReport) {
    return NextResponse.json({ error: "no_report" }, { status: 404 });
  }

  let report: CoachAnalysis;
  try {
    report = JSON.parse(companyRow.aiCoachReport) as CoachAnalysis;
  } catch {
    return NextResponse.json({ error: "report_corrupt" }, { status: 500 });
  }

  let found = false;
  report.actions = report.actions.map((a: ActionPlan) => {
    if (a.id !== actionId) return a;
    found = true;
    return {
      ...a,
      status,
      ...(status === "edited" && editedTitle ? { editedTitle } : {}),
      ...(status === "edited" && editedDetail ? { editedDetail } : {}),
    };
  });
  if (!found) {
    return NextResponse.json({ error: "action_not_found" }, { status: 404 });
  }

  await db
    .update(s.company)
    .set({
      aiCoachReport: JSON.stringify(report),
      updatedAt: new Date(),
    })
    .where(eq(s.company.id, session.companyId));

  return NextResponse.json({ ok: true });
}
