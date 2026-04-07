// One-off migration: adds the columns introduced by the Tier 1-4 batch.
// All ALTERs are IF NOT EXISTS so it's safe to re-run.
//
//   node --env-file=.env.local scripts/apply-tier-migrations.mjs

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set. Pass via --env-file=.env.local");
  process.exit(1);
}

const sql = neon(url);

const statements = [
  `ALTER TABLE company ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/Toronto'`,
  `ALTER TABLE line ADD COLUMN IF NOT EXISTS target_oee numeric(5,4) NOT NULL DEFAULT 0.85`,
  `ALTER TABLE line ADD COLUMN IF NOT EXISTS board_token text`,
  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'line_board_token_unique'
     ) THEN
       ALTER TABLE line ADD CONSTRAINT line_board_token_unique UNIQUE (board_token);
     END IF;
   END $$`,
  `ALTER TABLE shift ADD COLUMN IF NOT EXISTS ending_operator_id uuid REFERENCES "user"(id)`,
];

for (const stmt of statements) {
  const label = stmt.split("\n")[0].slice(0, 80);
  process.stdout.write(`→ ${label} ... `);
  try {
    await sql.query(stmt);
    process.stdout.write("ok\n");
  } catch (e) {
    process.stdout.write(`FAIL\n${e}\n`);
    process.exit(1);
  }
}

console.log("\n✓ All Tier 1-4 schema additions applied.");
