/**
 * Multi-tenant query helper.
 *
 * Every query that touches a tenant-scoped table MUST go through this helper
 * (or otherwise filter by `companyId`). NEVER trust a `companyId` from the
 * client — derive it from the manager Clerk session or operator cookie.
 */

import { and, eq, type SQL } from "drizzle-orm";
import { db } from "./client";
import * as schema from "./schema";

export type Tenanted<T> = T & { companyId: string };

/**
 * Returns a tiny scoped query API. All write helpers automatically inject
 * `companyId`. Reads expose a `where(extra)` builder that AND's the tenant
 * filter onto whatever you pass in.
 *
 * Example:
 *   const t = withTenant(companyId);
 *   const lines = await t.lines.list();
 *   const shift = await t.shifts.insert({ lineId, operatorId, ... });
 */
export function withTenant(companyId: string) {
  if (!companyId) throw new Error("withTenant: companyId is required");

  return {
    companyId,
    db,

    lines: {
      list: () =>
        db
          .select()
          .from(schema.line)
          .where(and(eq(schema.line.companyId, companyId), eq(schema.line.active, true))),
      byId: (id: string) =>
        db
          .select()
          .from(schema.line)
          .where(and(eq(schema.line.companyId, companyId), eq(schema.line.id, id)))
          .limit(1),
      insert: (data: Omit<typeof schema.line.$inferInsert, "companyId">) =>
        db
          .insert(schema.line)
          .values({ ...data, companyId })
          .returning(),
    },

    users: {
      operators: () =>
        db
          .select()
          .from(schema.user)
          .where(
            and(
              eq(schema.user.companyId, companyId),
              eq(schema.user.role, "operator"),
              eq(schema.user.active, true),
            ),
          ),
      byId: (id: string) =>
        db
          .select()
          .from(schema.user)
          .where(and(eq(schema.user.companyId, companyId), eq(schema.user.id, id)))
          .limit(1),
    },

    shifts: {
      byId: (id: string) =>
        db
          .select()
          .from(schema.shift)
          .where(and(eq(schema.shift.companyId, companyId), eq(schema.shift.id, id)))
          .limit(1),
      insert: (data: Omit<typeof schema.shift.$inferInsert, "companyId">) =>
        db
          .insert(schema.shift)
          .values({ ...data, companyId })
          .returning(),
      where: (extra: SQL | undefined) =>
        db
          .select()
          .from(schema.shift)
          .where(extra ? and(eq(schema.shift.companyId, companyId), extra) : eq(schema.shift.companyId, companyId)),
    },

    stops: {
      insert: (data: Omit<typeof schema.stop.$inferInsert, "companyId">) =>
        db
          .insert(schema.stop)
          .values({ ...data, companyId })
          .returning(),
      forShift: (shiftId: string) =>
        db
          .select()
          .from(schema.stop)
          .where(and(eq(schema.stop.companyId, companyId), eq(schema.stop.shiftId, shiftId))),
    },
  };
}
