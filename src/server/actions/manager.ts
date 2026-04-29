"use server";

/**
 * Manager admin actions — lines + operators CRUD.
 *
 * NOTE (Phase 1): These resolve the demo Maple Manufacturing tenant by slug.
 * Once Clerk is wired, replace getManagerCompanyId() with a session lookup.
 */

import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getAdminSession } from "@/lib/auth/admin-session";

export async function getManagerCompanyId(): Promise<string> {
  const session = await getAdminSession();
  if (session) return session.companyId;
  // Fallback: seeded demo tenant for the legacy ADMIN_PASSWORD path during demos.
  const [c] = await db
    .select({ id: s.company.id })
    .from(s.company)
    .where(eq(s.company.slug, "maple-manufacturing"))
    .limit(1);
  if (!c) throw new Error("No demo company. Run pnpm db:seed.");
  return c.id;
}

// ─── Lines ──────────────────────────────────────────────────────────────────

const LineSchema = z.object({
  name: z.string().min(1).max(80),
  idealRate: z.coerce.number().positive().max(100000),
  targetOee: z.coerce.number().min(0).max(1).optional(),
});

export async function createLine(formData: FormData) {
  const companyId = await getManagerCompanyId();
  const parsed = LineSchema.parse({
    name: formData.get("name"),
    idealRate: formData.get("idealRate"),
    targetOee: formData.get("targetOee") || undefined,
  });
  await db.insert(s.line).values({
    companyId,
    name: parsed.name,
    idealRate: parsed.idealRate.toFixed(2),
    targetOee: (parsed.targetOee ?? 0.85).toFixed(4),
  });
  revalidatePath("/dashboard/lines");
}

const LineUpdateSchema = LineSchema.extend({
  id: z.string().uuid(),
  active: z.coerce.boolean().optional(),
});

export async function updateLine(formData: FormData) {
  const companyId = await getManagerCompanyId();
  const parsed = LineUpdateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    idealRate: formData.get("idealRate"),
    targetOee: formData.get("targetOee") || undefined,
    active: formData.get("active") === "on",
  });
  await db
    .update(s.line)
    .set({
      name: parsed.name,
      idealRate: parsed.idealRate.toFixed(2),
      targetOee: (parsed.targetOee ?? 0.85).toFixed(4),
      active: parsed.active ?? true,
    })
    .where(and(eq(s.line.id, parsed.id), eq(s.line.companyId, companyId)));
  revalidatePath("/dashboard/lines");
}

/**
 * Generate (or rotate) a public board token for a line. The token lets the
 * shop floor TV view at /board/[token] render without a login.
 */
export async function regenerateBoardToken(formData: FormData) {
  const companyId = await getManagerCompanyId();
  const id = z.string().uuid().parse(formData.get("id"));
  const token = randomBytes(18).toString("base64url");
  await db
    .update(s.line)
    .set({ boardToken: token })
    .where(and(eq(s.line.id, id), eq(s.line.companyId, companyId)));
  revalidatePath("/dashboard/lines");
}

export async function deleteLine(formData: FormData) {
  const companyId = await getManagerCompanyId();
  const id = z.string().uuid().parse(formData.get("id"));
  await db
    .update(s.line)
    .set({ active: false })
    .where(and(eq(s.line.id, id), eq(s.line.companyId, companyId)));
  revalidatePath("/dashboard/lines");
}

// ─── Operators ──────────────────────────────────────────────────────────────

const OperatorSchema = z.object({
  fullName: z.string().min(1).max(120),
  pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
});

export async function createOperator(formData: FormData) {
  const companyId = await getManagerCompanyId();
  const parsed = OperatorSchema.parse({
    fullName: formData.get("fullName"),
    pin: formData.get("pin"),
  });
  const pinHash = await bcrypt.hash(parsed.pin, 10);
  await db.insert(s.user).values({
    companyId,
    fullName: parsed.fullName,
    role: "operator",
    pinHash,
  });
  revalidatePath("/dashboard/operators");
}

const OperatorUpdateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1).max(120),
  pin: z.string().regex(/^\d{4}$/).optional().or(z.literal("")),
  active: z.coerce.boolean().optional(),
});

export async function updateOperator(formData: FormData) {
  const companyId = await getManagerCompanyId();
  const parsed = OperatorUpdateSchema.parse({
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    pin: formData.get("pin") || undefined,
    active: formData.get("active") === "on",
  });
  const update: Partial<typeof s.user.$inferInsert> = {
    fullName: parsed.fullName,
    active: parsed.active ?? true,
  };
  if (parsed.pin) {
    update.pinHash = await bcrypt.hash(parsed.pin, 10);
  }
  await db
    .update(s.user)
    .set(update)
    .where(
      and(
        eq(s.user.id, parsed.id),
        eq(s.user.companyId, companyId),
        eq(s.user.role, "operator"),
      ),
    );
  revalidatePath("/dashboard/operators");
}

// ─── Shift edits ────────────────────────────────────────────────────────────

const ShiftEditSchema = z.object({
  id: z.string().uuid(),
  product: z.string().min(1).max(120),
  goodParts: z.coerce.number().int().min(0),
  badParts: z.coerce.number().int().min(0),
  plannedMinutes: z.coerce.number().int().min(1).max(1440),
  reason: z.string().min(1).max(200),
});

/**
 * Manager edit of a shift after the fact (typo fix, recount, etc).
 *
 * Recomputes OEE if the shift is already complete so the dashboard
 * stays consistent. Records the reason in shift.product as a fallback —
 * a proper audit log table comes in Phase 5.
 */
export async function editShift(formData: FormData) {
  const companyId = await getManagerCompanyId();
  const parsed = ShiftEditSchema.parse({
    id: formData.get("id"),
    product: formData.get("product"),
    goodParts: formData.get("goodParts"),
    badParts: formData.get("badParts"),
    plannedMinutes: formData.get("plannedMinutes"),
    reason: formData.get("reason"),
  });

  const [shiftRow] = await db
    .select()
    .from(s.shift)
    .where(and(eq(s.shift.id, parsed.id), eq(s.shift.companyId, companyId)))
    .limit(1);
  if (!shiftRow) throw new Error("Shift not found");

  const update: Partial<typeof s.shift.$inferInsert> = {
    product: parsed.product,
    goodParts: parsed.goodParts,
    badParts: parsed.badParts,
    plannedMinutes: parsed.plannedMinutes,
  };

  // If complete, recompute OEE from the new numbers + the existing stops
  if (shiftRow.status === "complete") {
    const stops = await db
      .select({ minutes: s.stop.minutes })
      .from(s.stop)
      .where(eq(s.stop.shiftId, parsed.id));
    const stopMinutes = stops.reduce((a, x) => a + (x.minutes ? Number(x.minutes) : 0), 0);
    const { computeOEE } = await import("@/lib/oee");
    const r = computeOEE({
      plannedMinutes: parsed.plannedMinutes,
      stopMinutes,
      goodParts: parsed.goodParts,
      badParts: parsed.badParts,
      idealRate: Number(shiftRow.idealRate),
    });
    update.availability = r.availability?.toFixed(4) ?? null;
    update.performance = r.performance?.toFixed(4) ?? null;
    update.quality = r.quality?.toFixed(4) ?? null;
    update.oee = r.oee?.toFixed(4) ?? null;
  }

  await db.update(s.shift).set(update).where(eq(s.shift.id, parsed.id));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/shifts");
  revalidatePath(`/shift/${parsed.id}/summary`);
}

export async function deactivateOperator(formData: FormData) {
  const companyId = await getManagerCompanyId();
  const id = z.string().uuid().parse(formData.get("id"));
  await db
    .update(s.user)
    .set({ active: false })
    .where(
      and(eq(s.user.id, id), eq(s.user.companyId, companyId), eq(s.user.role, "operator")),
    );
  revalidatePath("/dashboard/operators");
}
