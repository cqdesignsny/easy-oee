import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { editShift, getManagerCompanyId } from "@/server/actions/manager";
import { ScanButton } from "@/components/scanner/ScanButton";

export const metadata = { title: "Edit Shift | Easy OEE" };
export const dynamic = "force-dynamic";

export default async function EditShiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = await getManagerCompanyId();

  const [row] = await db
    .select()
    .from(s.shift)
    .where(and(eq(s.shift.id, id), eq(s.shift.companyId, companyId)))
    .limit(1);
  if (!row) notFound();

  return (
    <main className="app-wrap">
      <div className="app-tag">Edit</div>
      <h1 className="app-h1">EDIT SHIFT</h1>
      <p style={{ color: "var(--muted2)", marginTop: 8 }}>
        Fix typos or correct part counts. If the shift is already complete the
        OEE numbers will be recomputed automatically.
      </p>

      <form action={editShift} className="card" style={{ marginTop: 24, display: "grid", gap: 16 }}>
        <input type="hidden" name="id" value={row.id} />

        <label style={{ display: "grid", gap: 6 }}>
          <span className="kpi-label">Product</span>
          <input className="app-input" name="product" defaultValue={row.product} required />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="kpi-label">Job Number</span>
          <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
            <input
              id="edit-shift-job-number"
              className="app-input"
              name="jobNumber"
              defaultValue={row.jobNumber ?? ""}
              placeholder="WO-12345 or scan a code"
              autoComplete="off"
              style={{ flex: 1 }}
            />
            <ScanButton targetInputId="edit-shift-job-number" />
          </div>
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="kpi-label">Good Parts</span>
            <input className="app-input" name="goodParts" type="number" min="0" defaultValue={row.goodParts} required />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="kpi-label">Bad Parts</span>
            <input className="app-input" name="badParts" type="number" min="0" defaultValue={row.badParts} required />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="kpi-label">Planned Minutes</span>
            <input className="app-input" name="plannedMinutes" type="number" min="1" max="1440" defaultValue={row.plannedMinutes} required />
          </label>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="kpi-label">Reason for the change (audit)</span>
          <input
            className="app-input"
            name="reason"
            placeholder="e.g. operator typo: 168oz → 16oz"
            required
          />
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn" type="submit" style={{ flex: 1 }}>
            Save Changes
          </button>
          <Link href="/dashboard/shifts" className="btn btn-ghost" style={{ flex: 1, textAlign: "center" }}>
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
