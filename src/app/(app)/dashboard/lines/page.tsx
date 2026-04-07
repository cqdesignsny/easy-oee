import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import {
  createLine,
  deleteLine,
  getManagerCompanyId,
  regenerateBoardToken,
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
        Add the lines or machines on your shop floor. Set ideal parts/min, an
        OEE target, and (optionally) generate a public Board link to display
        the score on a TV next to the machine.
      </p>

      {/* Create */}
      <form action={createLine} className="card" style={{ marginTop: 24 }}>
        <div className="kpi-label" style={{ marginBottom: 16 }}>Add a line</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12 }}>
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
          <input
            className="field"
            name="targetOee"
            type="number"
            step="0.01"
            min="0"
            max="1"
            defaultValue="0.85"
            placeholder="target OEE (0-1)"
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
          <div style={{ display: "grid", gap: 16 }}>
            {lines.map((l) => (
              <div className="card" key={l.id} style={{ background: "var(--mid)" }}>
                <form action={updateLine} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto auto", gap: 10, alignItems: "center" }}>
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
                    style={{ minHeight: 40, padding: "8px 12px" }}
                  />
                  <input
                    className="field"
                    name="targetOee"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    defaultValue={l.targetOee}
                    style={{ minHeight: 40, padding: "8px 12px" }}
                  />
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted2)" }}>
                    <input type="checkbox" name="active" defaultChecked={l.active} />
                    active
                  </label>
                  <button className="btn btn-ghost" type="submit" style={{ minHeight: 40, padding: "8px 16px", fontSize: 13 }}>
                    Save
                  </button>
                </form>
                <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center", flexWrap: "wrap", fontSize: 13 }}>
                  <span style={{ color: "var(--muted2)" }}>TV Board:</span>
                  {l.boardToken ? (
                    <>
                      <code style={{ background: "var(--black)", padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>
                        /board/{l.boardToken}
                      </code>
                      <a className="btn-ghost" target="_blank" rel="noreferrer" href={`/board/${l.boardToken}`}>
                        Open ↗
                      </a>
                    </>
                  ) : (
                    <span style={{ color: "var(--muted2)", fontStyle: "italic" }}>not generated</span>
                  )}
                  <form action={regenerateBoardToken}>
                    <input type="hidden" name="id" value={l.id} />
                    <button
                      className="btn btn-ghost"
                      type="submit"
                      style={{ minHeight: 32, padding: "6px 12px", fontSize: 12 }}
                    >
                      {l.boardToken ? "Rotate Token" : "Generate"}
                    </button>
                  </form>
                  <form action={deleteLine} style={{ marginLeft: "auto" }}>
                    <input type="hidden" name="id" value={l.id} />
                    <button
                      className="btn btn-ghost"
                      type="submit"
                      style={{ minHeight: 32, padding: "6px 12px", fontSize: 12 }}
                    >
                      Deactivate
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
