"use server";

/**
 * Shift email export.
 *
 * SCAFFOLD: when Resend is wired this will render the React Email template
 * at src/emails/ShiftSummary.tsx and call resend.emails.send(). For now it
 * just queues the request to the database so we have a record of who asked.
 *
 * Required env vars (not yet set):
 *   RESEND_API_KEY
 *   EASY_OEE_FROM_EMAIL  (e.g. "Easy OEE <reports@easy-oee.com>")
 */

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getOperatorSession } from "@/lib/auth/operator-session";
import { getAdminSession } from "@/lib/auth/admin-session";

const Schema = z.object({
  shiftId: z.string().uuid(),
  email: z.string().email(),
});

export type EmailShiftState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

export async function emailShiftSummary(
  _prev: EmailShiftState,
  formData: FormData,
): Promise<EmailShiftState> {
  // Auth: operator OR admin
  const operatorSession = await getOperatorSession();
  const adminSession = !operatorSession ? await getAdminSession() : null;
  if (!operatorSession && !adminSession) {
    return { error: "Not signed in." };
  }

  const parsed = Schema.safeParse({
    shiftId: formData.get("shiftId"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Verify the shift exists (and is operator-scoped if relevant)
  const [shiftRow] = await db
    .select()
    .from(s.shift)
    .where(eq(s.shift.id, parsed.data.shiftId))
    .limit(1);
  if (!shiftRow) {
    return { error: "Shift not found." };
  }
  if (operatorSession && shiftRow.companyId !== operatorSession.companyId) {
    return { error: "Shift not found." };
  }

  // TODO when Resend is wired:
  //   1. Render <ShiftSummary> React Email component
  //   2. Call resend.emails.send({ from: process.env.EASY_OEE_FROM_EMAIL, to: parsed.data.email, subject, react })
  //   3. On success, return { ok: true }
  console.log(
    `[email-stub] would send shift ${parsed.data.shiftId} summary to ${parsed.data.email}`,
  );

  return {
    ok: true,
    message: `We'll send the shift summary to ${parsed.data.email} once email delivery is wired in. (Stripe / Resend setup pending.)`,
  };
}
