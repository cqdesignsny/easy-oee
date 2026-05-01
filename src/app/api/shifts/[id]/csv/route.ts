/**
 * GET /api/shifts/[id]/csv
 *
 * Streams the shift summary as a CSV download. Scoped by either the operator
 * session or the admin session. Anonymous requests get 401.
 */

import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getOperatorSession } from "@/lib/auth/operator-session";
import { getAdminSession } from "@/lib/auth/admin-session";
import { stopReasonLabel } from "@/lib/stop-reasons";
import {
  formatPlantDate,
  formatPlantDateTimeMachine,
  safeTimezone,
} from "@/lib/time";

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

function row(...cells: unknown[]): string {
  return cells.map(csvEscape).join(",");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Auth: operator OR admin
  const operatorSession = await getOperatorSession();
  const adminSession = !operatorSession ? await getAdminSession() : null;
  if (!operatorSession && !adminSession) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Look up the shift. If operator-scoped, restrict to their company.
  const whereClause = operatorSession
    ? and(eq(s.shift.id, id), eq(s.shift.companyId, operatorSession.companyId))
    : eq(s.shift.id, id);

  const [shiftRow] = await db.select().from(s.shift).where(whereClause).limit(1);
  if (!shiftRow) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [companyRow] = await db
    .select({ timezone: s.company.timezone })
    .from(s.company)
    .where(eq(s.company.id, shiftRow.companyId))
    .limit(1);
  const tz = safeTimezone(companyRow?.timezone);

  const [lineRow] = await db
    .select()
    .from(s.line)
    .where(eq(s.line.id, shiftRow.lineId))
    .limit(1);

  const [operator] = await db
    .select()
    .from(s.user)
    .where(eq(s.user.id, shiftRow.operatorId))
    .limit(1);

  const stops = await db
    .select()
    .from(s.stop)
    .where(eq(s.stop.shiftId, id))
    .orderBy(asc(s.stop.startedAt));

  const totalStopMin = stops.reduce(
    (acc, x) => acc + (x.minutes ? Number(x.minutes) : 0),
    0,
  );
  const runMin = shiftRow.plannedMinutes - totalStopMin;
  const totalParts = shiftRow.goodParts + shiftRow.badParts;

  const lines: string[] = [];
  lines.push("Easy OEE Shift Summary");
  lines.push("");
  lines.push(row("Shift ID", shiftRow.id));
  lines.push(row("Date", formatPlantDate(`${shiftRow.shiftDate}T12:00:00Z`, tz)));
  lines.push(row("Line", lineRow?.name ?? ""));
  lines.push(row("Operator", operator?.fullName ?? ""));
  lines.push(row("Shift Type", shiftRow.shiftType));
  lines.push(row("Product", shiftRow.product));
  lines.push(row("Job Number", shiftRow.jobNumber ?? ""));
  lines.push(row("Timezone", tz));
  lines.push(row("Started At", formatPlantDateTimeMachine(shiftRow.startedAt, tz)));
  lines.push(row("Ended At", formatPlantDateTimeMachine(shiftRow.endedAt, tz)));
  lines.push(row("Status", shiftRow.status));
  lines.push("");
  lines.push("OEE Metrics");
  lines.push(row("Availability", shiftRow.availability ?? ""));
  lines.push(row("Performance", shiftRow.performance ?? ""));
  lines.push(row("Quality", shiftRow.quality ?? ""));
  lines.push(row("OEE", shiftRow.oee ?? ""));
  lines.push("");
  lines.push("Production");
  lines.push(row("Good Parts", shiftRow.goodParts));
  lines.push(row("Bad Parts", shiftRow.badParts));
  lines.push(row("Total Parts", totalParts));
  lines.push(row("Planned Minutes", shiftRow.plannedMinutes));
  lines.push(row("Stop Minutes", totalStopMin.toFixed(2)));
  lines.push(row("Run Minutes", runMin.toFixed(2)));
  lines.push(row("Ideal Rate (parts/min)", shiftRow.idealRate));
  lines.push("");
  lines.push("Downtime Events");
  lines.push(row("Reason", "Started At", "Ended At", "Minutes", "Notes"));
  for (const stop of stops) {
    lines.push(
      row(
        stopReasonLabel(stop.reason),
        formatPlantDateTimeMachine(stop.startedAt, tz),
        formatPlantDateTimeMachine(stop.endedAt, tz),
        stop.minutes ?? "",
        stop.notes ?? "",
      ),
    );
  }

  const csv = lines.join("\n") + "\n";
  const filename = `easy-oee-shift-${shiftRow.shiftDate}-${shiftRow.id.slice(0, 8)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
