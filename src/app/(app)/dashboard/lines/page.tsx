import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import {
  createLine,
  deleteLine,
  getManagerCompanyId,
  updateLine,
} from "@/server/actions/manager";

export const metadata = { title: "Lines | Easy OEE" };
export const dynamic = "force-dynamic";

export default async function LinesPage() {
  const companyId = await getManagerCompanyId();
  const lines = await db.select().from(s.line).where(eq(s.line.companyId, companyId));

  return (
    <main className="app-wrap">
      <div className="app-tag">Manage</div>
      <h1 className="app-h1">PRODUCTION LINES</h1>
      <p style={{ color: "var(--muted2)", marginTop: 8 }}>
        Add the lines or machines on your shop floor and their ideal parts-per-minute rate.
      </p>

      {/* Create */}
      <form action={createLine} className="card" style={{ marginTop: 24 }}>
        <div className="kpi-label" style={{ marginBottom: 16 }}>Add a line</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 12 }}>
          <input className="field" name="name" placeholder="Machine 3" required />
          <input
            className="field"
            name="idealRate"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="ideal rate (parts/min)"
            required
          />
          <button className="btn" type="submit">ADD</button>
        </div>
      </form>

      {/* List */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="kpi-label" style={{ marginBottom: 16 }}>
          {lines.length} line{lines.length === 1 ? "" : "s"}
        </div>
        {lines.length === 0 ? (
          <p style={{ color: "var(--muted2)" }}>No lines yet.</p>
        ) : (
          <table className="app-table">
            <thead>
              <tr><th>Name</th><th>Ideal Rate</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id}>
                  <td>
                    <form action={updateLine} style={{ display: "flex", gap: 8 }}>
                      <input type="hidden" name="id" value={l.id} />
                      <input
                        className="field"
                        name="name"
                        defaultValue={l.name}
                        style={{ minHeight: 40, padding: "8px 12px" }}
                      />
                      <input
                        className="field"
                        name="idealRate"
                        type="number"
                        step="0.01"
                        defaultValue={l.idealRate}
                        style={{ minHeight: 40, padding: "8px 12px", width: 100 }}
                      />
                      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted2)" }}>
                        <input type="checkbox" name="active" defaultChecked={l.active} />
                        active
                      </label>
                      <button className="btn btn-ghost" type="submit" style={{ minHeight: 40, padding: "8px 16px", fontSize: 13 }}>
                        Save
                      </button>
                    </form>
                  </td>
                  <td colSpan={2}></td>
                  <td>
                    <form action={deleteLine}>
                      <input type="hidden" name="id" value={l.id} />
                      <button
                        className="btn btn-ghost"
                        type="submit"
                        style={{ minHeight: 40, padding: "8px 16px", fontSize: 13 }}
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
