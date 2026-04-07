import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, desc } from "drizzle-orm";
import { getOperatorSession } from "@/lib/auth/operator-session";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { startShift } from "@/server/actions/shifts";
import { logoutOperator } from "@/server/actions/operator-auth";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { getServerT } from "@/components/i18n/server";

export const metadata = { title: "Start Shift | Easy OEE" };
export const dynamic = "force-dynamic";

export default async function OperatorPage() {
  const session = await getOperatorSession();
  if (!session) redirect("/pin");

  const t = await getServerT();

  const lines = await db
    .select()
    .from(s.line)
    .where(and(eq(s.line.companyId, session.companyId), eq(s.line.active, true)));

  const [operator] = await db
    .select()
    .from(s.user)
    .where(eq(s.user.id, session.operatorId))
    .limit(1);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <Link href="/"><Logo height={48} /></Link>
        <LanguageSwitcher />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div className="app-tag">{t("operator.tag")}</div>
          <h1 className="app-h1">{t("operator.title")}</h1>
          <p style={{ color: "var(--muted2)", marginTop: 8, fontSize: 17 }}>
            {t("operator.signedInAs")} {operator?.fullName}
          </p>
        </div>
        <form action={logoutOperator}>
          <button className="btn btn-ghost" type="submit">{t("operator.signOut")}</button>
        </form>
      </div>

      <form action={startShift} className="card card-lg" style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 20 }}>
          <label className="field-label">{t("operator.line")}</label>
          <select name="lineId" className="field" required>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({Number(l.idealRate).toFixed(0)} parts/min)
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="field-label">{t("operator.shift")}</label>
          <select name="shiftType" className="field" defaultValue="morning" required>
            <option value="morning">{t("operator.shift.morning")}</option>
            <option value="afternoon">{t("operator.shift.afternoon")}</option>
            <option value="night">{t("operator.shift.night")}</option>
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="field-label">{t("operator.product")}</label>
          <input name="product" className="field" placeholder={t("operator.productPlaceholder")} required />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label className="field-label">{t("operator.plannedMinutes")}</label>
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
          {t("operator.start")} →
        </button>
      </form>

      <p style={{ marginTop: 32 }}>
        <Link href="/dashboard" style={{ color: "var(--muted2)", fontSize: 14 }}>
          ← {t("operator.managerLink")}
        </Link>
      </p>
    </main>
  );
}
