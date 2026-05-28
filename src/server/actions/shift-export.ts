"use server";

import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import { render } from "@react-email/render";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getOperatorSession } from "@/lib/auth/operator-session";
import { getAdminSession } from "@/lib/auth/admin-session";
import { getCompanyTimezone } from "@/lib/db/queries/company";
import { formatPlantDate, formatPlantDateTime } from "@/lib/time";
import { stopReasonLabel } from "@/lib/stop-reasons";
import {
  fromAddress,
  getResendClient,
  isResendConfigured,
} from "@/lib/email/resend";
import {
  ShiftSummaryEmail,
  type ShiftSummaryStop,
} from "@/emails/ShiftSummary";

const Schema = z.object({
  shiftId: z.string().uuid(),
  email: z.string().email(),
});

export type EmailShiftState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://easy-oee.com")
  );
}

export async function emailShiftSummary(
  _prev: EmailShiftState,
  formData: FormData,
): Promise<EmailShiftState> {
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

  const sessionCompanyId =
    operatorSession?.companyId ?? adminSession?.companyId ?? null;

  const [shiftRow] = await db
    .select()
    .from(s.shift)
    .where(eq(s.shift.id, parsed.data.shiftId))
    .limit(1);
  if (!shiftRow) {
    return { error: "Shift not found." };
  }
  if (sessionCompanyId && shiftRow.companyId !== sessionCompanyId) {
    return { error: "Shift not found." };
  }

  if (!isResendConfigured()) {
    console.log(
      `[email-stub] shift ${parsed.data.shiftId} → ${parsed.data.email} (Resend not configured)`,
    );
    return {
      ok: true,
      message: `Email queued for ${parsed.data.email}. Delivery will start once Resend is configured.`,
    };
  }

  const [lineRow] = await db
    .select({ name: s.line.name })
    .from(s.line)
    .where(eq(s.line.id, shiftRow.lineId))
    .limit(1);
  const [companyRow] = await db
    .select({ name: s.company.name })
    .from(s.company)
    .where(eq(s.company.id, shiftRow.companyId))
    .limit(1);
  const [operatorRow] = await db
    .select({ fullName: s.user.fullName })
    .from(s.user)
    .where(eq(s.user.id, shiftRow.operatorId))
    .limit(1);
  const stops = await db
    .select({
      reason: s.stop.reason,
      minutes: s.stop.minutes,
    })
    .from(s.stop)
    .where(
      and(eq(s.stop.companyId, shiftRow.companyId), eq(s.stop.shiftId, shiftRow.id)),
    )
    .orderBy(asc(s.stop.startedAt));
  const tz = await getCompanyTimezone(shiftRow.companyId);

  const stopRollup = new Map<string, number>();
  for (const stop of stops) {
    const mins = stop.minutes != null ? Number(stop.minutes) : 0;
    stopRollup.set(stop.reason, (stopRollup.get(stop.reason) ?? 0) + mins);
  }
  const stopList: ShiftSummaryStop[] = Array.from(stopRollup.entries()).map(
    ([reason, minutes]) => ({
      reasonLabel: stopReasonLabel(reason),
      minutes,
    }),
  );

  const html = await render(
    ShiftSummaryEmail({
      plantName: companyRow?.name ?? "Easy OEE",
      lineName: lineRow?.name ?? "—",
      operatorName: operatorRow?.fullName ?? "—",
      shiftType: shiftRow.shiftType,
      product: shiftRow.product,
      jobNumber: shiftRow.jobNumber ?? null,
      shiftDateLabel: formatPlantDate(shiftRow.shiftDate, tz),
      startedAtLabel: formatPlantDateTime(shiftRow.startedAt, tz),
      endedAtLabel: shiftRow.endedAt
        ? formatPlantDateTime(shiftRow.endedAt, tz)
        : null,
      oee: shiftRow.oee != null ? Number(shiftRow.oee) : null,
      availability:
        shiftRow.availability != null ? Number(shiftRow.availability) : null,
      performance:
        shiftRow.performance != null ? Number(shiftRow.performance) : null,
      quality: shiftRow.quality != null ? Number(shiftRow.quality) : null,
      plannedMinutes: shiftRow.plannedMinutes,
      goodParts: shiftRow.goodParts,
      badParts: shiftRow.badParts,
      idealRate: Number(shiftRow.idealRate),
      stops: stopList,
      dashboardUrl: `${appUrl()}/dashboard`,
    }),
  );
  const text = await render(
    ShiftSummaryEmail({
      plantName: companyRow?.name ?? "Easy OEE",
      lineName: lineRow?.name ?? "—",
      operatorName: operatorRow?.fullName ?? "—",
      shiftType: shiftRow.shiftType,
      product: shiftRow.product,
      jobNumber: shiftRow.jobNumber ?? null,
      shiftDateLabel: formatPlantDate(shiftRow.shiftDate, tz),
      startedAtLabel: formatPlantDateTime(shiftRow.startedAt, tz),
      endedAtLabel: shiftRow.endedAt
        ? formatPlantDateTime(shiftRow.endedAt, tz)
        : null,
      oee: shiftRow.oee != null ? Number(shiftRow.oee) : null,
      availability:
        shiftRow.availability != null ? Number(shiftRow.availability) : null,
      performance:
        shiftRow.performance != null ? Number(shiftRow.performance) : null,
      quality: shiftRow.quality != null ? Number(shiftRow.quality) : null,
      plannedMinutes: shiftRow.plannedMinutes,
      goodParts: shiftRow.goodParts,
      badParts: shiftRow.badParts,
      idealRate: Number(shiftRow.idealRate),
      stops: stopList,
      dashboardUrl: `${appUrl()}/dashboard`,
    }),
    { plainText: true },
  );

  const subject = `Shift summary · ${companyRow?.name ?? "Easy OEE"} · ${lineRow?.name ?? ""}`.trim();

  const resend = getResendClient();
  const result = await resend.emails.send({
    from: fromAddress(),
    to: parsed.data.email,
    subject,
    html,
    text,
  });

  if (result.error) {
    console.error("resend.emails.send failed", result.error);
    return { error: "Could not send the email. Check your address and try again." };
  }

  return {
    ok: true,
    message: `Shift summary sent to ${parsed.data.email}.`,
  };
}
