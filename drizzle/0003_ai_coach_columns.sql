-- Add AI Coach storage columns to the company table.
-- The latest weekly analysis lives as JSON text in ai_coach_report; the
-- cron and the manual "Regenerate" button overwrite it. Action statuses
-- (pending / approved / edited / rejected) are stored inside that JSON
-- so we don't need a separate actions table.

ALTER TABLE "company" ADD COLUMN IF NOT EXISTS "ai_coach_report" text;
--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN IF NOT EXISTS "ai_coach_generated_at" timestamptz;
