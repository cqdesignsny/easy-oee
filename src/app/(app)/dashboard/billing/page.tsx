import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as s from "@/lib/db/schema";
import { getAdminSession } from "@/lib/auth/admin-session";
import { getServerT } from "@/components/i18n/server";
import { isStripeConfigured } from "@/lib/stripe";
import { BillingClient } from "./client";

export const metadata = { title: "Billing | Easy OEE" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const t = await getServerT();
  const session = await getAdminSession();
  if (!session) {
    return (
      <main className="app-shell">
        <div className="app-wrap">
          <p>{t("billing.signInRequired")}</p>
          <Link href="/sign-in" className="btn btn-primary">
            {t("nav.signIn")}
          </Link>
        </div>
      </main>
    );
  }

  const [companyRow] = await db
    .select({
      id: s.company.id,
      name: s.company.name,
      plan: s.company.plan,
      licensedLines: s.company.licensedLines,
      subscriptionStatus: s.company.subscriptionStatus,
      trialEndsAt: s.company.trialEndsAt,
      stripeCustomerId: s.company.stripeCustomerId,
    })
    .from(s.company)
    .where(eq(s.company.id, session.companyId))
    .limit(1);

  if (!companyRow) {
    return (
      <main className="app-shell">
        <div className="app-wrap">
          <p>{t("billing.companyMissing")}</p>
        </div>
      </main>
    );
  }

  const stripeReady = isStripeConfigured();

  return (
    <main className="app-shell">
      <div className="app-wrap">
        <div className="dash-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="app-tag">{t("billing.tag")}</div>
            <h1 className="app-h1">{t("billing.title")}</h1>
            <p style={{ color: "var(--muted2)", marginTop: 4, fontSize: 14 }}>
              {t("billing.subtitle").replace("{name}", companyRow.name)}
            </p>
          </div>
          <Link href="/dashboard" className="btn btn-ghost">
            ← {t("billing.backToDashboard")}
          </Link>
        </div>

        <BillingClient
          plan={companyRow.plan}
          licensedLines={companyRow.licensedLines}
          subscriptionStatus={companyRow.subscriptionStatus}
          trialEndsAt={companyRow.trialEndsAt?.toISOString() ?? null}
          hasStripeCustomer={Boolean(companyRow.stripeCustomerId)}
          stripeReady={stripeReady}
        />
      </div>
    </main>
  );
}
