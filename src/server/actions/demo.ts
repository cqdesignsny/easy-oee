"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { setAdminCookie, clearAdminCookie } from "@/lib/auth/admin-session";
import { setOperatorCookie, clearOperatorCookie } from "@/lib/auth/operator-session";
import { setDemoCookie, clearDemoCookie } from "@/lib/auth/demo-mode";

const SEED_SLUG = "maple-manufacturing";
const SEED_OPERATOR_NAME = "Pierre Lavoie";

/**
 * Enter the live sales demo: seeds admin + operator sessions to the
 * Maple Manufacturing tenant and sets the demo marker cookie. Lands on
 * the manager dashboard with a banner and a "Sign Up" CTA.
 */
export async function enterDemo(target: "dashboard" | "operator" = "dashboard") {
  const [companyRow] = await db
    .select()
    .from(s.company)
    .where(eq(s.company.slug, SEED_SLUG))
    .limit(1);
  if (!companyRow) throw new Error("Demo tenant missing. Run pnpm db:seed.");

  const [manager] = await db
    .select()
    .from(s.user)
    .where(
      and(
        eq(s.user.companyId, companyRow.id),
        eq(s.user.role, "manager"),
        eq(s.user.active, true),
      ),
    )
    .limit(1);
  if (!manager) throw new Error("Demo manager missing.");

  const [operator] = await db
    .select()
    .from(s.user)
    .where(
      and(
        eq(s.user.companyId, companyRow.id),
        eq(s.user.role, "operator"),
        eq(s.user.fullName, SEED_OPERATOR_NAME),
        eq(s.user.active, true),
      ),
    )
    .limit(1);

  await setAdminCookie(manager.id, companyRow.id);
  if (operator) {
    await setOperatorCookie(operator.id, companyRow.id);
  }
  await setDemoCookie();

  redirect(target === "operator" ? "/operator" : "/dashboard");
}

export async function exitDemo() {
  await clearAdminCookie();
  await clearOperatorCookie();
  await clearDemoCookie();
  redirect("/");
}
