import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildDailyDigest } from "@/server/actions/digest";
import { renderDigestText } from "@/lib/digest-render";

/**
 * Vercel Cron entrypoint — runs once a day at ~6 AM (configure in vercel.json).
 *
 *   { "crons": [{ "path": "/api/cron/daily-digest", "schedule": "0 11 * * *" }] }
 *
 * Vercel posts with a special header `x-vercel-cron`; we also accept a manual
 * trigger when CRON_SECRET matches.
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

  const companies = await db
    .select({ id: s.company.id, name: s.company.name })
    .from(s.company)
    .where(eq(s.company.subscriptionStatus, "active"));

  // Also include trial companies (no subscription_status set yet)
  const all = companies.length
    ? companies
    : await db.select({ id: s.company.id, name: s.company.name }).from(s.company);

  const results: { company: string; sent: boolean; reason?: string }[] = [];
  for (const c of all) {
    try {
      const payload = await buildDailyDigest(c.id);
      if (!payload) {
        results.push({ company: c.name, sent: false, reason: "no_data" });
        continue;
      }
      // TODO: when Resend is wired, send the email here. For now, log it.
      console.log("daily-digest", c.name, "\n" + renderDigestText(payload));
      results.push({ company: c.name, sent: true });
    } catch (e) {
      results.push({ company: c.name, sent: false, reason: String(e) });
    }
  }

  return NextResponse.json({ ok: true, processed: results });
}
