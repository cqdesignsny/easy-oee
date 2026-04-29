-- Add job_number column to shift for tracking the work order / job ticket
-- assigned to a production run. Set on shift start (or later by a manager).

ALTER TABLE "shift" ADD COLUMN IF NOT EXISTS job_number text;
