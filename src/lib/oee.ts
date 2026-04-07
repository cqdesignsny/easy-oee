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

/**
 * Loss-tree breakdown of a planned shift, in *minutes equivalent*.
 *
 *   plannedMinutes = goodMinutes + qualityLossMinutes + speedLossMinutes + downtimeMinutes
 *
 * Useful for the summary "loss tree" stacked bar so operators see *where*
 * the time actually went, not just three abstract percentages.
 */
export type LossTree = {
  plannedMinutes: number;
  /** Minutes spent producing good parts at ideal speed. */
  goodMinutes: number;
  /** Minutes "lost" to bad parts (produced but rejected). */
  qualityLossMinutes: number;
  /** Minutes lost because the line ran slower than ideal rate. */
  speedLossMinutes: number;
  /** Minutes the machine was stopped. */
  downtimeMinutes: number;
};

export function computeLossTree(input: OEEInput): LossTree {
  const { plannedMinutes, stopMinutes, goodParts, badParts, idealRate } = input;
  const downtimeMinutes = Math.min(plannedMinutes, Math.max(0, stopMinutes));
  const runTime = Math.max(0, plannedMinutes - downtimeMinutes);

  if (idealRate <= 0 || runTime <= 0) {
    return {
      plannedMinutes,
      goodMinutes: 0,
      qualityLossMinutes: 0,
      speedLossMinutes: runTime,
      downtimeMinutes,
    };
  }

  // Theoretical max parts in available run time
  const theoretical = idealRate * runTime;
  const total = goodParts + badParts;
  // Time-equivalent of parts actually produced (capped at run time)
  const producedTime = Math.min(runTime, total / idealRate);
  const speedLossMinutes = Math.max(0, runTime - producedTime);

  // Within produced time, split good vs bad proportionally
  const goodFraction = total > 0 ? goodParts / total : 0;
  const goodMinutes = producedTime * goodFraction;
  const qualityLossMinutes = producedTime - goodMinutes;

  // Sanity: tiny floating-point drift can leave a few μs unaccounted; the
  // summary UI should treat these as a single rounded total.
  void theoretical;

  return {
    plannedMinutes,
    goodMinutes,
    qualityLossMinutes,
    speedLossMinutes,
    downtimeMinutes,
  };
}

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
