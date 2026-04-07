/**
 * Idempotent seed: creates Maple Manufacturing demo tenant.
 *
 * Run with:  pnpm db:seed
 *
 * Re-running is safe — uses unique slugs/clerk ids/PIN names to upsert.
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./client";
import * as s from "./schema";
import { computeOEE } from "../oee";

async function main() {
  console.log("→ Seeding Maple Manufacturing…");

  // 1. Company
  let [maple] = await db
    .select()
    .from(s.company)
    .where(eq(s.company.slug, "maple-manufacturing"))
    .limit(1);

  if (!maple) {
    [maple] = await db
      .insert(s.company)
      .values({
        name: "Maple Manufacturing",
        slug: "maple-manufacturing",
        plan: "trial",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      })
      .returning();
    console.log("  ✓ company:", maple.name);
  } else {
    console.log("  • company exists:", maple.name);
  }

  // 2. Lines
  const desiredLines = [
    { name: "Machine 1", idealRate: "120.00" },
    { name: "Machine 2", idealRate: "60.00" },
  ];
  const lines: (typeof s.line.$inferSelect)[] = [];
  for (const l of desiredLines) {
    const existing = await db
      .select()
      .from(s.line)
      .where(eq(s.line.companyId, maple.id));
    let row = existing.find((x) => x.name === l.name);
    if (!row) {
      [row] = await db
        .insert(s.line)
        .values({ companyId: maple.id, name: l.name, idealRate: l.idealRate })
        .returning();
      console.log("  ✓ line:", row.name);
    } else {
      console.log("  • line exists:", row.name);
    }
    lines.push(row);
  }

  // 3. Manager (placeholder Clerk user — webhook will create real ones in prod)
  const managerEmail = "manager@maple.test";
  let [manager] = await db
    .select()
    .from(s.user)
    .where(eq(s.user.email, managerEmail))
    .limit(1);
  if (!manager) {
    [manager] = await db
      .insert(s.user)
      .values({
        companyId: maple.id,
        email: managerEmail,
        fullName: "Marie Tremblay",
        role: "manager",
        clerkUserId: null,
      })
      .returning();
    console.log("  ✓ manager:", manager.fullName);
  } else {
    console.log("  • manager exists:", manager.fullName);
  }

  // 4. Operator with PIN 1234
  const opName = "Pierre Lavoie";
  const allOps = await db
    .select()
    .from(s.user)
    .where(eq(s.user.companyId, maple.id));
  let operator = allOps.find((u) => u.fullName === opName && u.role === "operator");
  if (!operator) {
    const pinHash = await bcrypt.hash("1234", 10);
    [operator] = await db
      .insert(s.user)
      .values({
        companyId: maple.id,
        fullName: opName,
        role: "operator",
        pinHash,
      })
      .returning();
    console.log("  ✓ operator:", operator.fullName, "(PIN 1234)");
  } else {
    console.log("  • operator exists:", operator.fullName);
  }

  // 5. Three historical complete shifts with realistic OEE
  const existingShifts = await db
    .select()
    .from(s.shift)
    .where(eq(s.shift.companyId, maple.id));

  if (existingShifts.length === 0) {
    const today = new Date();
    const samples = [
      {
        line: lines[0],
        daysAgo: 2,
        plannedMinutes: 480,
        stopMinutes: 55,
        goodParts: 38400,
        badParts: 600,
      },
      {
        line: lines[0],
        daysAgo: 1,
        plannedMinutes: 480,
        stopMinutes: 110,
        goodParts: 32000,
        badParts: 400,
      },
      {
        line: lines[1],
        daysAgo: 1,
        plannedMinutes: 480,
        stopMinutes: 30,
        goodParts: 22000,
        badParts: 200,
      },
    ];

    for (const x of samples) {
      const startedAt = new Date(today.getTime() - x.daysAgo * 24 * 3600 * 1000);
      const endedAt = new Date(startedAt.getTime() + x.plannedMinutes * 60 * 1000);
      const oee = computeOEE({
        plannedMinutes: x.plannedMinutes,
        stopMinutes: x.stopMinutes,
        goodParts: x.goodParts,
        badParts: x.badParts,
        idealRate: Number(x.line.idealRate),
      });
      const [shiftRow] = await db
        .insert(s.shift)
        .values({
          companyId: maple.id,
          lineId: x.line.id,
          operatorId: operator.id,
          shiftType: "morning",
          product: "Widget A",
          plannedMinutes: x.plannedMinutes,
          idealRate: x.line.idealRate,
          goodParts: x.goodParts,
          badParts: x.badParts,
          startedAt,
          endedAt,
          status: "complete",
          availability: oee.availability?.toFixed(4) ?? null,
          performance: oee.performance?.toFixed(4) ?? null,
          quality: oee.quality?.toFixed(4) ?? null,
          oee: oee.oee?.toFixed(4) ?? null,
          shiftDate: startedAt.toISOString().slice(0, 10),
        })
        .returning();
      // One example downtime event per shift, just so the Pareto chart has data
      await db.insert(s.stop).values({
        companyId: maple.id,
        shiftId: shiftRow.id,
        reason: "changeover",
        startedAt: new Date(startedAt.getTime() + 60 * 60 * 1000),
        endedAt: new Date(startedAt.getTime() + 60 * 60 * 1000 + x.stopMinutes * 60 * 1000),
        minutes: x.stopMinutes.toFixed(2),
      });
      console.log(
        `  ✓ shift ${x.line.name} OEE=${(oee.oee ?? 0).toFixed(3)}`,
      );
    }
  } else {
    console.log(`  • ${existingShifts.length} shifts already exist, skipping history`);
  }

  console.log("✓ Seed complete.");
  console.log("");
  console.log("Demo credentials:");
  console.log("  Operator name: Pierre Lavoie");
  console.log("  Operator PIN:  1234");
  console.log("  Company:       Maple Manufacturing");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
