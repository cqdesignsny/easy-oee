#!/usr/bin/env node
/**
 * Easy OEE migration runner.
 *
 * Walks `drizzle/*.sql` in alphabetical (= creation) order, applies any that
 * haven't been recorded in the `_eo_migrations` tracking table, and records
 * each successful one. Designed to run unattended on every Vercel build via
 * the package.json `prebuild` script.
 *
 * Workflow:
 *   1. Edit src/lib/db/schema.ts
 *   2. pnpm db:generate           → drizzle-kit writes drizzle/0001_*.sql
 *   3. git add drizzle/ && commit && push
 *   4. Vercel runs `prebuild` → this script → next build
 *
 * Safe to run locally too:
 *   node --env-file=.env.local scripts/migrate.mjs
 *
 * Skips silently with a warning if DATABASE_URL is unset (so `pnpm build`
 * still works on a machine without env vars for things like CI typecheck).
 */

import { neon } from "@neondatabase/serverless";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..");
const DRIZZLE_DIR = join(REPO, "drizzle");

const url = process.env.DATABASE_URL;
if (!url) {
  console.warn("⚠ migrate: DATABASE_URL not set — skipping (build only).");
  process.exit(0);
}

const sql = neon(url);

async function ensureTrackingTable() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS _eo_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function appliedSet() {
  const rows = await sql.query(`SELECT name FROM _eo_migrations`);
  return new Set(rows.map((r) => r.name));
}

function listMigrations() {
  let entries;
  try {
    entries = readdirSync(DRIZZLE_DIR);
  } catch {
    return [];
  }
  return entries.filter((f) => f.endsWith(".sql")).sort();
}

/**
 * Drizzle migrations use `--> statement-breakpoint` between statements,
 * because Postgres doesn't allow some DDL inside a single transaction.
 * Split on it and run each chunk as its own query.
 *
 * A chunk is dropped only if it has no executable SQL after stripping
 * single-line `--` comments. This avoids a class of silent "applied but
 * empty" migrations where a leading comment header caused the previous
 * `^--` regex to throw out the whole file.
 */
function splitStatements(text) {
  return text
    .split(/-->\s*statement-breakpoint/gi)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter((s) => {
      // Strip `-- comment` lines and whitespace; keep if any SQL remains.
      const stripped = s.replace(/--[^\n]*/g, "").replace(/\s+/g, "");
      return stripped.length > 0;
    });
}

async function applyMigration(name) {
  const text = readFileSync(join(DRIZZLE_DIR, name), "utf-8");
  const statements = splitStatements(text);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  await sql.query(`INSERT INTO _eo_migrations (name) VALUES ($1)`, [name]);
}

async function main() {
  await ensureTrackingTable();
  const applied = await appliedSet();
  const all = listMigrations();
  if (all.length === 0) {
    console.log("migrate: no migration files found in drizzle/");
    return;
  }

  const pending = all.filter((m) => !applied.has(m));
  if (pending.length === 0) {
    console.log(`✓ migrate: up to date (${all.length} applied)`);
    return;
  }

  console.log(`migrate: applying ${pending.length} new migration(s)...`);
  for (const name of pending) {
    process.stdout.write(`  → ${name} ... `);
    try {
      await applyMigration(name);
      process.stdout.write("ok\n");
    } catch (e) {
      process.stdout.write(`FAIL\n`);
      console.error(e);
      process.exit(1);
    }
  }
  console.log(`✓ migrate: ${pending.length} migration(s) applied`);
}

main().catch((e) => {
  console.error("migrate: fatal", e);
  process.exit(1);
});
