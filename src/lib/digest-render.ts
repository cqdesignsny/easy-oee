/**
 * Plaintext rendering of a daily-digest payload. Lives outside the
 * "use server" boundary so it can be imported anywhere (cron route,
 * future Resend email template, tests).
 */
import { formatPercent } from "@/lib/oee";
import type { DigestPayload } from "@/server/actions/digest";

export function renderDigestText(p: DigestPayload): string {
  const lines: string[] = [];
  lines.push(`Easy OEE — ${p.companyName} — ${p.date}`);
  lines.push("");
  lines.push(`Average OEE: ${formatPercent(p.avgOee)}  (${p.totalShifts} shifts)`);
  if (p.bestLine) lines.push(`Best line:  ${p.bestLine.lineName}  ${formatPercent(p.bestLine.oee)}`);
  if (p.worstLine) lines.push(`Worst line: ${p.worstLine.lineName}  ${formatPercent(p.worstLine.oee)}`);
  lines.push("");
  if (p.topStops.length > 0) {
    lines.push("Top stops yesterday:");
    for (const s of p.topStops) lines.push(`  - ${s.reason}: ${s.minutes.toFixed(0)} min`);
    lines.push("");
  }
  if (p.summary) {
    lines.push(p.summary);
    lines.push("");
  }
  lines.push("Per line:");
  for (const l of p.lines) {
    const delta = l.delta7d != null ? ` (${l.delta7d > 0 ? "+" : ""}${(l.delta7d * 100).toFixed(1)}pp vs 7d)` : "";
    lines.push(`  ${l.lineName}: ${formatPercent(l.oee)} target ${formatPercent(l.targetOee)}${delta}`);
  }
  return lines.join("\n");
}
