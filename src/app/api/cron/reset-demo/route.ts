import { NextResponse } from "next/server";
import { and, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";

/**
 * Demo-tenant reset cron. Wipes shifts + stops the seed Maple Manufacturing
 * tenant accumulates from public /demo prospect clicks, so the next prospect
 * arriving on the demo sees a clean slate instead of someone else's data.
 *
 * Identifies the canonical seed data by start-time: shifts started before the
 * SEED_CUTOFF date are the 27 historical seed rows from src/lib/db/seed.ts
 * and are preserved. Anything later was created by a demo session.
 *
 * Schedule in vercel.json:
 *   { "path": "/api/cron/reset-demo", "schedule": "0 7 * * *" }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEED_CUTOFF = new Date("2026-04-08T00:00:00Z");
const SEED_SLUG = "maple-manufacturing";

export async function GET(req: Request) {
  const isCron = req.headers.get("x-vercel-cron") === "1";
  const auth = req.headers.get("authorization");
  const okSecret =
    process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
  if (!isCron && !okSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [seedCompany] = await db
    .select({ id: s.company.id })
    .from(s.company)
    .where(eq(s.company.slug, SEED_SLUG))
    .limit(1);
  if (!seedCompany) {
    return NextResponse.json({ ok: true, deleted: 0, reason: "no-seed" });
  }

  const postSeedShifts = await db
    .select({ id: s.shift.id })
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, seedCompany.id),
        gte(s.shift.startedAt, SEED_CUTOFF),
      ),
    );

  if (postSeedShifts.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0 });
  }

  const shiftIds = postSeedShifts.map((row) => row.id);

  await db
    .delete(s.stop)
    .where(
      and(
        eq(s.stop.companyId, seedCompany.id),
        inArray(s.stop.shiftId, shiftIds),
      ),
    );
  await db
    .delete(s.shift)
    .where(
      and(
        eq(s.shift.companyId, seedCompany.id),
        gte(s.shift.startedAt, SEED_CUTOFF),
      ),
    );

  return NextResponse.json({
    ok: true,
    deleted: shiftIds.length,
    cutoff: SEED_CUTOFF.toISOString(),
  });
}
