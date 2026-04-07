/**
 * OEE (Overall Equipment Effectiveness) calculations.
 *
 * Single source of truth — DO NOT reimplement this anywhere else.
 * All edge cases return `null` for the affected component, never NaN/Infinity.
 *
 * See docs/OEE_MATH.md for the math reference and edge case rules.
 */

export type OEEInput = {
  /** Total scheduled production minutes for the shift (e.g. 480 for 8h). */
  plannedMinutes: number;
  /** Sum of all stop durations during the shift (minutes). */
  stopMinutes: number;
  /** Good (sellable) parts produced during the shift. */
  goodParts: number;
  /** Rejected/scrap parts produced during the shift. */
  badParts: number;
  /** Theoretical maximum production rate, parts per minute. */
  idealRate: number;
};

export type OEEResult = {
  availability: number | null;
  performance: number | null;
  quality: number | null;
  oee: number | null;
  runTimeMinutes: number;
  totalParts: number;
};

export function computeOEE(input: OEEInput): OEEResult {
  const runTimeMinutes = Math.max(0, input.plannedMinutes - input.stopMinutes);
  const totalParts = input.goodParts + input.badParts;

  const availability =
    input.plannedMinutes > 0 ? runTimeMinutes / input.plannedMinutes : null;

  const performance =
    input.idealRate > 0 && runTimeMinutes > 0
      ? Math.min(1, totalParts / (input.idealRate * runTimeMinutes))
      : null;

  const quality = totalParts > 0 ? input.goodParts / totalParts : null;

  const oee =
    availability != null && performance != null && quality != null
      ? availability * performance * quality
      : null;

  return {
    availability,
    performance,
    quality,
    oee,
    runTimeMinutes,
    totalParts,
  };
}

/** Format a 0–1 decimal as a percentage string ("81.2%"). Returns "N/A" for null. */
export function formatPercent(
  value: number | null,
  opts: { decimals?: number } = {},
): string {
  if (value == null || Number.isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(opts.decimals ?? 1)}%`;
}

/** Color-bucket a 0–1 OEE score for UI display. */
export function oeeBucket(value: number | null): "world-class" | "typical" | "low" | "na" {
  if (value == null) return "na";
  if (value >= 0.85) return "world-class";
  if (value >= 0.6) return "typical";
  return "low";
}
