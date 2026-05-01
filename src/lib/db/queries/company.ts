import { eq } from "drizzle-orm";
import { db } from "../client";
import * as s from "../schema";
import { DEFAULT_TIMEZONE, safeTimezone } from "@/lib/time";

/**
 * Read the IANA plant timezone for a company. Returns the default
 * (America/Toronto) if the company is missing or has an invalid value.
 * Use this everywhere a server component / action needs to format a
 * timestamp for display.
 */
export async function getCompanyTimezone(companyId: string | null): Promise<string> {
  if (!companyId) return DEFAULT_TIMEZONE;
  const [row] = await db
    .select({ timezone: s.company.timezone })
    .from(s.company)
    .where(eq(s.company.id, companyId))
    .limit(1);
  return safeTimezone(row?.timezone);
}
