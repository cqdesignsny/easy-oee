"use server";

/**
 * Shift + stop server actions.
 *
 * Bug-prevention rules (NOT to be repeated from Bubble):
 *   1. shift.companyId is set from the operator session, never the form.
 *   2. stop.shiftId is set from the URL/path param, never the form.
 *   3. stop.minutes is computed server-side in closeStop().
 *   4. OEE is computed in src/lib/oee.ts called from endShift().
 */

import { z } from "zod";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { requireOperator, setOperatorCookie } from "@/lib/auth/operator-session";
import { computeOEE } from "@/lib/oee";
import { STOP_REASON_VALUES, type StopReasonValue } from "@/lib/stop-reasons";

const StartShiftSchema = z.object({
  lineId: z.string().uuid(),
  shiftType: z.enum(["morning", "afternoon", "night"]),
  product: z.string().min(1).max(120),
  jobNumber: z.string().trim().max(80).optional().or(z.literal("")),
  plannedMinutes: z.coerce.number().int().min(1).max(1440),
});

export async function startShift(formData: FormData) {
  const session = await requireOperator();
  const parsed = StartShiftSchema.parse({
    lineId: formData.get("lineId"),
    shiftType: formData.get("shiftType"),
    product: formData.get("product"),
    jobNumber: formData.get("jobNumber"),
    plannedMinutes: formData.get("plannedMinutes"),
  });

  // Snapshot ideal rate from line so it can't change mid-shift
  const [line] = await db
    .select()
    .from(s.line)
    .where(and(eq(s.line.id, parsed.lineId), eq(s.line.companyId, session.companyId)))
    .limit(1);
  if (!line) throw new Error("Line not found");

  const now = new Date();
  const jobNumber = parsed.jobNumber && parsed.jobNumber.length > 0 ? parsed.jobNumber : null;
  const [created] = await db
    .insert(s.shift)
    .values({
      companyId: session.companyId,
      lineId: line.id,
      operatorId: session.operatorId,
      shiftType: parsed.shiftType,
      product: parsed.product,
      jobNumber,
      plannedMinutes: parsed.plannedMinutes,
      idealRate: line.idealRate,
      goodParts: 0,
      badParts: 0,
      startedAt: now,
      status: "in_progress",
      shiftDate: now.toISOString().slice(0, 10),
    })
    .returning();

  redirect(`/shift/${created.id}`);
}

const StopReasonSchema = z.enum(STOP_REASON_VALUES);

export async function logStop(shiftId: string, reason: StopReasonValue) {
  const session = await requireOperator();
  StopReasonSchema.parse(reason);

  // Verify shift belongs to this operator's company and is in progress
  const [shiftRow] = await db
    .select()
    .from(s.shift)
    .where(and(eq(s.shift.id, shiftId), eq(s.shift.companyId, session.companyId)))
    .limit(1);
  if (!shiftRow) throw new Error("Shift not found");
  if (shiftRow.status !== "in_progress") throw new Error("Shift already complete");

  // Close any currently-open stop on this shift first (only one open at a time)
  await closeOpenStops(session.companyId, shiftId);

  await db.insert(s.stop).values({
    companyId: session.companyId,
    shiftId,
    reason,
    startedAt: new Date(),
  });
  revalidatePath(`/shift/${shiftId}`);
}

async function closeOpenStops(companyId: string, shiftId: string) {
  const open = await db
    .select()
    .from(s.stop)
    .where(
      and(
        eq(s.stop.companyId, companyId),
        eq(s.stop.shiftId, shiftId),
        isNull(s.stop.endedAt),
      ),
    );
  const now = new Date();
  for (const o of open) {
    const minutes = (now.getTime() - o.startedAt.getTime()) / 60000;
    await db
      .update(s.stop)
      .set({ endedAt: now, minutes: minutes.toFixed(2) })
      .where(eq(s.stop.id, o.id));
  }
}

export async function closeStop(shiftId: string) {
  const session = await requireOperator();
  await closeOpenStops(session.companyId, shiftId);
  revalidatePath(`/shift/${shiftId}`);
}

const NoteSchema = z.object({
  note: z.string().min(1).max(500),
});

/**
 * Attach a note to the most recently *closed* stop on this shift.
 * Used by the long-stop note prompt that fires after a stop > 10 minutes.
 */
export async function addLastStopNote(shiftId: string, note: string) {
  const session = await requireOperator();
  const parsed = NoteSchema.parse({ note });

  // Find the most recently closed stop
  const [last] = await db
    .select()
    .from(s.stop)
    .where(and(eq(s.stop.companyId, session.companyId), eq(s.stop.shiftId, shiftId)))
    .orderBy(desc(s.stop.startedAt))
    .limit(1);
  if (!last || !last.endedAt) return;

  await db
    .update(s.stop)
    .set({ notes: parsed.note.trim() })
    .where(eq(s.stop.id, last.id));

  revalidatePath(`/shift/${shiftId}`);
}

const HandoffSchema = z.object({
  shiftId: z.string().uuid(),
  operatorId: z.string().uuid(),
  pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
});

/**
 * Hand the active shift off to a different operator on the same tablet.
 * Verifies the incoming operator's PIN, records them as the ending operator,
 * and rotates the operator session cookie so subsequent taps log under them.
 */
export async function handoffShift(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await requireOperator();
  const parsed = HandoffSchema.safeParse({
    shiftId: formData.get("shiftId"),
    operatorId: formData.get("operatorId"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const [shiftRow] = await db
    .select()
    .from(s.shift)
    .where(and(eq(s.shift.id, parsed.data.shiftId), eq(s.shift.companyId, session.companyId)))
    .limit(1);
  if (!shiftRow) return { ok: false, error: "Shift not found" };
  if (shiftRow.status === "complete") return { ok: false, error: "Shift already complete" };

  const [op] = await db
    .select()
    .from(s.user)
    .where(
      and(
        eq(s.user.id, parsed.data.operatorId),
        eq(s.user.companyId, session.companyId),
        eq(s.user.role, "operator"),
        eq(s.user.active, true),
      ),
    )
    .limit(1);
  if (!op || !op.pinHash) return { ok: false, error: "Operator not found" };

  const ok = await bcrypt.compare(parsed.data.pin, op.pinHash);
  if (!ok) return { ok: false, error: "Wrong PIN" };

  // Record on shift, rotate session
  await db
    .update(s.shift)
    .set({ endingOperatorId: op.id })
    .where(eq(s.shift.id, parsed.data.shiftId));

  await setOperatorCookie(op.id, session.companyId);
  revalidatePath(`/shift/${parsed.data.shiftId}`);
  return { ok: true };
}

const PartsSchema = z.object({
  type: z.enum(["good", "bad"]),
  delta: z.coerce.number().int(),
});

export async function updateParts(shiftId: string, type: "good" | "bad", delta: number) {
  const session = await requireOperator();
  PartsSchema.parse({ type, delta });

  const [shiftRow] = await db
    .select()
    .from(s.shift)
    .where(and(eq(s.shift.id, shiftId), eq(s.shift.companyId, session.companyId)))
    .limit(1);
  if (!shiftRow) throw new Error("Shift not found");

  const col = type === "good" ? s.shift.goodParts : s.shift.badParts;
  const next = Math.max(0, (type === "good" ? shiftRow.goodParts : shiftRow.badParts) + delta);
  await db
    .update(s.shift)
    .set(type === "good" ? { goodParts: next } : { badParts: next })
    .where(eq(s.shift.id, shiftId));
  // touch col so TS doesn't complain about unused
  void col;
  revalidatePath(`/shift/${shiftId}`);
}

export async function endShift(shiftId: string) {
  const session = await requireOperator();

  const [shiftRow] = await db
    .select()
    .from(s.shift)
    .where(and(eq(s.shift.id, shiftId), eq(s.shift.companyId, session.companyId)))
    .limit(1);
  if (!shiftRow) throw new Error("Shift not found");
  if (shiftRow.status === "complete") {
    redirect(`/shift/${shiftId}/summary`);
  }

  await closeOpenStops(session.companyId, shiftId);

  // Sum stop minutes
  const stopRows = await db
    .select({ minutes: s.stop.minutes })
    .from(s.stop)
    .where(and(eq(s.stop.companyId, session.companyId), eq(s.stop.shiftId, shiftId)));
  const stopMinutes = stopRows.reduce(
    (acc, r) => acc + (r.minutes ? Number(r.minutes) : 0),
    0,
  );

  const oee = computeOEE({
    plannedMinutes: shiftRow.plannedMinutes,
    stopMinutes,
    goodParts: shiftRow.goodParts,
    badParts: shiftRow.badParts,
    idealRate: Number(shiftRow.idealRate),
  });

  await db
    .update(s.shift)
    .set({
      status: "complete",
      endedAt: new Date(),
      availability: oee.availability?.toFixed(4) ?? null,
      performance: oee.performance?.toFixed(4) ?? null,
      quality: oee.quality?.toFixed(4) ?? null,
      oee: oee.oee?.toFixed(4) ?? null,
    })
    .where(eq(s.shift.id, shiftId));

  redirect(`/shift/${shiftId}/summary`);
}

/** Read helpers used by pages — read-only, scoped by session. */
export async function getShiftForOperator(shiftId: string) {
  const session = await requireOperator();
  const [row] = await db
    .select()
    .from(s.shift)
    .where(and(eq(s.shift.id, shiftId), eq(s.shift.companyId, session.companyId)))
    .limit(1);
  if (!row) return null;
  const [lineRow] = await db.select().from(s.line).where(eq(s.line.id, row.lineId)).limit(1);
  const stops = await db
    .select()
    .from(s.stop)
    .where(and(eq(s.stop.companyId, session.companyId), eq(s.stop.shiftId, shiftId)))
    .orderBy(asc(s.stop.startedAt));
  return { shift: row, line: lineRow, stops };
}

/** Roster of active operators for the hand-off picker. */
export async function listActiveOperators() {
  const session = await requireOperator();
  return db
    .select({ id: s.user.id, fullName: s.user.fullName })
    .from(s.user)
    .where(
      and(
        eq(s.user.companyId, session.companyId),
        eq(s.user.role, "operator"),
        eq(s.user.active, true),
      ),
    )
    .orderBy(asc(s.user.fullName));
}

// Suppress unused-import warning if `sql` not used elsewhere
void sql;
