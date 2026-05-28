import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import {
  createOperator,
  deactivateOperator,
  getManagerCompanyId,
  updateOperator,
} from "@/server/actions/manager";
import { effectiveCaps } from "@/lib/db/queries/subscription";

export const metadata = { title: "Operators | Easy OEE" };
export const dynamic = "force-dynamic";

export default async function OperatorsPage() {
  const companyId = await getManagerCompanyId();
  const operators = await db
    .select()
    .from(s.user)
    .where(and(eq(s.user.companyId, companyId), eq(s.user.role, "operator")));
  const [planRow] = await db
    .select({
      plan: s.company.plan,
      subscriptionStatus: s.company.subscriptionStatus,
      licensedLines: s.company.licensedLines,
      slug: s.company.slug,
    })
    .from(s.company)
    .where(eq(s.company.id, companyId))
    .limit(1);
  const caps = planRow ? effectiveCaps(planRow) : null;
  const atOperatorCap = caps !== null && operators.length >= caps.operatorCap;

  return (
    <main className="app-wrap">
      <div className="app-tag">Manage</div>
      <h1 className="app-h1">OPERATORS</h1>
      <p style={{ color: "var(--muted2)", marginTop: 8 }}>
        Add operators to your company. Each gets a 4-digit PIN for shop-floor sign in at /pin.
      </p>

      {/* Create */}
      <form action={createOperator} className="card" style={{ marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div className="kpi-label">Add an operator</div>
          {caps && Number.isFinite(caps.operatorCap) ? (
            <div style={{ fontSize: 12, color: "var(--muted2)" }}>
              {operators.length} of {caps.operatorCap} operators used
            </div>
          ) : null}
        </div>
        {atOperatorCap ? (
          <div
            style={{
              padding: 14,
              borderRadius: 8,
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.3)",
              color: "var(--white)",
              fontSize: 14,
            }}
          >
            You&apos;re at your operator cap.{" "}
            <Link
              href="/dashboard/billing"
              style={{ color: "var(--accent)", fontWeight: 600 }}
            >
              Add lines on the billing page to grow it →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 12 }}>
            <input className="field" name="fullName" placeholder="Full name" required />
            <input
              className="field"
              name="pin"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              placeholder="4-digit PIN"
              required
            />
            <button className="btn" type="submit">ADD</button>
          </div>
        )}
      </form>

      {/* List */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="kpi-label" style={{ marginBottom: 16 }}>
          {operators.length} operator{operators.length === 1 ? "" : "s"}
        </div>
        {operators.length === 0 ? (
          <p style={{ color: "var(--muted2)" }}>No operators yet.</p>
        ) : (
          <table className="app-table">
            <thead>
              <tr><th>Name</th><th>New PIN (optional)</th><th>Active</th><th></th></tr>
            </thead>
            <tbody>
              {operators.map((o) => (
                <tr key={o.id}>
                  <td colSpan={4} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <form
                      action={updateOperator}
                      style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto auto", gap: 12, alignItems: "center", padding: "8px 16px" }}
                    >
                      <input type="hidden" name="id" value={o.id} />
                      <input
                        className="field"
                        name="fullName"
                        defaultValue={o.fullName}
                        style={{ minHeight: 40, padding: "8px 12px" }}
                      />
                      <input
                        className="field"
                        name="pin"
                        inputMode="numeric"
                        pattern="[0-9]{4}"
                        maxLength={4}
                        placeholder="leave blank"
                        style={{ minHeight: 40, padding: "8px 12px" }}
                      />
                      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted2)" }}>
                        <input type="checkbox" name="active" defaultChecked={o.active} />
                        active
                      </label>
                      <button className="btn btn-ghost" type="submit" style={{ minHeight: 40, padding: "8px 16px", fontSize: 13 }}>
                        Save
                      </button>
                    </form>
                    <form action={deactivateOperator} style={{ padding: "0 16px 12px" }}>
                      <input type="hidden" name="id" value={o.id} />
                      <button
                        className="btn btn-ghost"
                        type="submit"
                        style={{ minHeight: 32, padding: "6px 12px", fontSize: 12 }}
                      >
                        Deactivate
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
