-- Add password_hash column for self-serve manager signup.
-- Operators stay null; managers get a bcrypt hash.

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password_hash text;
