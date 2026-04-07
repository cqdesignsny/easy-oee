import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, desc } from "drizzle-orm";
import { getOperatorSession } from "@/lib/auth/operator-session";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { startShift } from "@/server/actions/shifts";
import { logoutOperator } from "@/server/actions/operator-auth";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Start Shift | Easy OEE" };
export const dynamic = "force-dynamic";

export default async function OperatorPage() {
  const session = await getOperatorSession();
  if (!session) redirect("/pin");

  const lines = await db
    .select()
    .from(s.line)
    .where(and(eq(s.line.companyId, session.companyId), eq(s.line.active, true)));

  const [operator] = await db
    .select()
    .from(s.user)
    .where(eq(s.user.id, session.operatorId))
    .limit(1);

  // If there's an in-progress shift for this operator, jump to it
  const [openShift] = await db
    .select()
    .from(s.shift)
    .where(
      and(
        eq(s.shift.companyId, session.companyId),
        eq(s.shift.operatorId, session.operatorId),
        eq(s.shift.status, "in_progress"),
      ),
    )
    .orderBy(desc(s.shift.startedAt))
    .limit(1);
  if (openShift) redirect(`/shift/${openShift.id}`);

  return (
    <main className="op-shell">
      <div style={{ marginBottom: 28 }}>
        <Link href="/"><Logo height={48} /></Link>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div className="app-tag">Operator</div>
          <h1 className="app-h1">START A SHIFT</h1>
          <p style={{ color: "var(--muted2)", marginTop: 8 }}>Signed in as {operator?.fullName}</p>
        </div>
        <form action={logoutOperator}>
          <button className="btn btn-ghost" type="submit">Sign out</button>
        </form>
      </div>

      <form action={startShift} className="card card-lg" style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 20 }}>
          <label className="field-label">Production Line</label>
          <select name="lineId" className="field" required>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({Number(l.idealRate).toFixed(0)} parts/min)
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="field-label">Shift</label>
          <select name="shiftType" className="field" defaultValue="morning" required>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="night">Night</option>
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="field-label">Product</label>
          <input name="product" className="field" placeholder="e.g. Widget A" required />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label className="field-label">Planned Minutes</label>
          <input
            name="plannedMinutes"
            className="field"
            type="number"
            min={1}
            max={1440}
            defaultValue={480}
            required
          />
        </div>

        <button className="btn" type="submit" style={{ width: "100%" }}>
          START SHIFT →
        </button>
      </form>

      <p style={{ marginTop: 32 }}>
        <Link href="/dashboard" style={{ color: "var(--muted2)", fontSize: 13 }}>
          ← Manager dashboard
        </Link>
      </p>
    </main>
  );
}
