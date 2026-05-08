/**
 * GET /api/analytics/jobs/[jobNumber]/export
 *
 * Streams a per-job-order CSV: summary, per-shift breakdown, Pareto stops.
 * Manager-scoped via the admin session; falls back to the seed tenant for
 * the legacy demo gate (matches the rest of /dashboard/analytics).
 */

import { NextResponse } from "next/server";
import { getJobOrderDetail } from "@/lib/db/queries/job-orders";
import { getCompanyTimezone } from "@/lib/db/queries/company";
import { stopReasonLabel } from "@/lib/stop-reasons";
import { formatPlantDate, formatPlantDateTimeMachine } from "@/lib/time";
import { formatPercent } from "@/lib/oee";
import { getAnalyticsCompanyId } from "@/app/(app)/dashboard/analytics/helpers";

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
  { params }: { params: Promise<{ jobNumber: string }> },
) {
  const { jobNumber: rawJobNumber } = await params;
  const jobNumber = decodeURIComponent(rawJobNumber);

  const companyId = await getAnalyticsCompanyId();
  if (!companyId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [tz, detail] = await Promise.all([
    getCompanyTimezone(companyId),
    getJobOrderDetail(companyId, jobNumber),
  ]);
  if (!detail) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const lines: string[] = [];
  lines.push("Easy OEE Job Order Summary");
  lines.push("");
  lines.push(row("Job Number", jobNumber));
  lines.push(row("Product", detail.product ?? ""));
  lines.push(row("Timezone", tz));
  lines.push(
    row(
      "Period",
      detail.totals.firstStartedAt
        ? formatPlantDate(detail.totals.firstStartedAt, tz)
        : "",
      detail.totals.lastEndedAt
        ? formatPlantDate(detail.totals.lastEndedAt, tz)
        : "",
    ),
  );
  lines.push(row("Total Shifts", detail.totals.totalShifts));
  lines.push(row("Unique Operators", detail.totals.uniqueOperators));
  lines.push(row("Unique Lines", detail.totals.uniqueLines));
  lines.push(row("Planned Minutes", detail.totals.totalPlannedMinutes));
  lines.push(row("Stop Minutes", detail.totals.totalStopMinutes.toFixed(2)));
  lines.push(
    row(
      "Run Minutes",
      (detail.totals.totalPlannedMinutes - detail.totals.totalStopMinutes).toFixed(2),
    ),
  );
  lines.push(row("Total Good Parts", detail.totals.totalGoodParts));
  lines.push(row("Total Bad Parts", detail.totals.totalBadParts));
  lines.push(row("Avg OEE", formatPercent(detail.totals.avgOee)));
  lines.push(row("Avg Availability", formatPercent(detail.totals.avgAvailability)));
  lines.push(row("Avg Performance", formatPercent(detail.totals.avgPerformance)));
  lines.push(row("Avg Quality", formatPercent(detail.totals.avgQuality)));
  lines.push("");

  lines.push("Shift Breakdown");
  lines.push(
    row(
      "Started At",
      "Ended At",
      "Line",
      "Operator",
      "Shift Type",
      "Status",
      "Planned Min",
      "Stop Min",
      "Run Min",
      "Good Parts",
      "Bad Parts",
      "Availability",
      "Performance",
      "Quality",
      "OEE",
    ),
  );
  for (const sh of detail.shifts) {
    const runMin = Math.max(0, sh.plannedMinutes - sh.totalStopMinutes);
    lines.push(
      row(
        formatPlantDateTimeMachine(sh.startedAt, tz),
        formatPlantDateTimeMachine(sh.endedAt, tz),
        sh.lineName,
        sh.operatorName,
        sh.shiftType,
        sh.status,
        sh.plannedMinutes,
        sh.totalStopMinutes.toFixed(2),
        runMin.toFixed(2),
        sh.goodParts,
        sh.badParts,
        sh.availability ?? "",
        sh.performance ?? "",
        sh.quality ?? "",
        sh.oee ?? "",
      ),
    );
  }
  lines.push("");

  lines.push("Stop Pareto");
  lines.push(row("Reason", "Total Minutes", "Occurrences"));
  for (const st of detail.stops) {
    lines.push(
      row(stopReasonLabel(st.reason), st.totalMinutes.toFixed(2), st.occurrences),
    );
  }

  const csv = lines.join("\n") + "\n";
  const filename = `easy-oee-job-${jobNumber.replace(/[^A-Za-z0-9._-]/g, "_")}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
