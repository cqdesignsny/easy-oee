import Link from "next/link";
import { getServerT } from "@/components/i18n/server";

/**
 * Trial countdown banner shown on the dashboard while a company is in trial.
 * Hides itself when there's no trial end date or the trial has expired
 * (expiry handling lands with Stripe). Self-renders with no client JS.
 */
export async function TrialBanner({
  trialEndsAt,
  companyName,
}: {
  trialEndsAt: string | null;
  companyName: string | null;
}) {
  if (!trialEndsAt) return null;
  const t = await getServerT();
  const ends = new Date(trialEndsAt);
  // Server-only time check: each request renders once, deterministic for that request.
  // eslint-disable-next-line react-hooks/purity
  const msLeft = ends.getTime() - Date.now();
  if (msLeft <= 0) {
    return (
      <div className="trial-banner trial-banner-expired">
        <div>
          <strong>{t("trial.expired")}</strong>{" "}
          <span style={{ color: "var(--muted2)" }}>
            {companyName ? `· ${companyName}` : ""}
          </span>
        </div>
        <Link href="/pricing" className="btn">
          {t("trial.upgrade")} →
        </Link>
      </div>
    );
  }
  const daysLeft = Math.max(1, Math.ceil(msLeft / (24 * 3600 * 1000)));
  return (
    <div className="trial-banner">
      <div>
        <strong>
          {t("trial.daysLeft").replace("{n}", String(daysLeft))}
        </strong>{" "}
        <span style={{ color: "var(--muted2)" }}>{t("trial.tagline")}</span>
      </div>
      <Link href="/pricing" className="btn btn-ghost">
        {t("trial.upgrade")}
      </Link>
    </div>
  );
}
