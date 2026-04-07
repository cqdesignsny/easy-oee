/**
 * The 10 standardized stop reasons. The string values are persisted in the
 * `stop.reason` column. The labels are what operators see on buttons.
 *
 * Adding/renaming a reason is a schema-touching change — generate a migration.
 */

export const STOP_REASONS = [
  { value: "mechanical_failure", label: "Mechanical Failure" },
  { value: "no_material", label: "No Material" },
  { value: "changeover", label: "Changeover" },
  { value: "quality_check", label: "Quality Check" },
  { value: "scheduled_break", label: "Scheduled Break" },
  { value: "no_operator", label: "No Operator" },
  { value: "maintenance", label: "Maintenance" },
  { value: "training", label: "Training" },
  { value: "no_production_scheduled", label: "No Production Scheduled" },
  { value: "other", label: "Other" },
] as const;

export type StopReasonValue = (typeof STOP_REASONS)[number]["value"];

export const STOP_REASON_VALUES = STOP_REASONS.map((r) => r.value) as [
  StopReasonValue,
  ...StopReasonValue[],
];

export function stopReasonLabel(value: string): string {
  return STOP_REASONS.find((r) => r.value === value)?.label ?? value;
}
