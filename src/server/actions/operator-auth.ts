"use server";

/**
 * Operator PIN auth — name picker + 4-digit PIN.
 *
 * NOTE: For Phase 1 we don't yet have a way for an operator to know which
 * company they belong to before signing in (no Clerk session for them). For
 * the seed/demo, we resolve to the single seeded company. When companies
 * onboard for real, the operator will pick a company first OR we'll route
 * via a tablet pairing token. This is documented in `docs/ROADMAP.md`.
 */

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { setOperatorCookie, clearOperatorCookie } from "@/lib/auth/operator-session";

const PinSchema = z.object({
  operatorId: z.string().uuid(),
  pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
});

export type PinState = { error?: string };

export async function listOperators() {
  // Phase 1: single seeded company. Future: scope by tablet pairing.
  return db
    .select({ id: s.user.id, fullName: s.user.fullName, companyId: s.user.companyId })
    .from(s.user)
    .where(and(eq(s.user.role, "operator"), eq(s.user.active, true)));
}

export async function verifyPin(_prev: PinState, formData: FormData): Promise<PinState> {
  const parsed = PinSchema.safeParse({
    operatorId: formData.get("operatorId"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid PIN" };
  }

  const [user] = await db
    .select()
    .from(s.user)
    .where(and(eq(s.user.id, parsed.data.operatorId), eq(s.user.role, "operator")))
    .limit(1);

  if (!user || !user.pinHash || !user.active) {
    return { error: "Operator not found" };
  }

  const ok = await bcrypt.compare(parsed.data.pin, user.pinHash);
  if (!ok) return { error: "Wrong PIN" };

  await setOperatorCookie(user.id, user.companyId);
  redirect("/operator");
}

export async function logoutOperator() {
  await clearOperatorCookie();
  redirect("/pin");
}
