import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getAdminSession } from "@/lib/auth/admin-session";

/** Resolve the company shown in the analytics views. Reads admin session
 *  first, falls back to the seed tenant for the legacy demo gate. */
export async function getAnalyticsCompanyId(): Promise<string | null> {
  const session = await getAdminSession();
  if (session) return session.companyId;
  const [c] = await db
    .select({ id: s.company.id })
    .from(s.company)
    .where(eq(s.company.slug, "maple-manufacturing"))
    .limit(1);
  return c?.id ?? null;
}

/** Maps stop reason enum values to the `stop.NN.label` i18n keys used
 *  everywhere else in the app. Keep in sync with src/lib/stop-reasons.ts. */
export const STOP_LABEL_KEYS: Record<string, string> = {
  mechanical_failure: "stop.01.label",
  changeover: "stop.02.label",
  no_material: "stop.03.label",
  quality_check: "stop.04.label",
  scheduled_break: "stop.05.label",
  no_operator: "stop.06.label",
  maintenance: "stop.07.label",
  training: "stop.08.label",
  no_production_scheduled: "stop.09.label",
  other: "stop.10.label",
};
