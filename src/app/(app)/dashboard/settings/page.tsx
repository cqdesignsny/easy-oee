import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getServerT } from "@/components/i18n/server";
import { getManagerCompanyId } from "@/server/actions/manager";
import { safeTimezone, formatPlantDateTime } from "@/lib/time";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings | Easy OEE" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const companyId = await getManagerCompanyId();
  const [company] = await db
    .select({
      name: s.company.name,
      timezone: s.company.timezone,
      slug: s.company.slug,
      plan: s.company.plan,
    })
    .from(s.company)
    .where(eq(s.company.id, companyId))
    .limit(1);

  const t = await getServerT();
  const tz = safeTimezone(company?.timezone);
  const nowExample = formatPlantDateTime(new Date(), tz);

  return (
    <main className="app-wrap">
      <div className="app-tag">{t("settings.tag")}</div>
      <h1 className="app-h1">{t("settings.title")}</h1>
      <p style={{ color: "var(--muted2)", marginTop: 8 }}>{t("settings.lead")}</p>

      <SettingsForm
        initialName={company?.name ?? ""}
        initialTimezone={tz}
        plan={company?.plan ?? "trial"}
        slug={company?.slug ?? ""}
        nowExample={nowExample}
      />
    </main>
  );
}
