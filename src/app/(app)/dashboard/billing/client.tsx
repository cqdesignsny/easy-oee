"use client";

import { useState, useTransition } from "react";
import { useT } from "@/components/i18n/LanguageProvider";
import {
  PLANS,
  MAX_SELF_SERVE_LINES,
  fmtCAD,
  fmtUSD,
  monthlyCostUSD,
  recommendedTier,
  usdToCad,
  type PlanId,
} from "@/lib/pricing";

type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | string
  | null;

export function BillingClient({
  plan,
  licensedLines,
  subscriptionStatus,
  trialEndsAt,
  hasStripeCustomer,
  stripeReady,
}: {
  plan: string;
  licensedLines: number;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  hasStripeCustomer: boolean;
  stripeReady: boolean;
}) {
  const t = useT();
  const [pickedPlan, setPickedPlan] = useState<PlanId>(
    plan === "starter" || plan === "pro" ? plan : "pro",
  );
  const [lines, setLines] = useState<number>(licensedLines || 1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPaid = subscriptionStatus === "active" || subscriptionStatus === "past_due";
  const isCanceled = subscriptionStatus === "canceled";
  const isTrialing = subscriptionStatus === "trialing" || subscriptionStatus == null;

  const usdMonthly = monthlyCostUSD(pickedPlan, lines);
  const cadMonthly = usdMonthly != null ? usdToCad(usdMonthly) : null;
  const recommended = recommendedTier(lines);
  const overCap = !PLANS[pickedPlan] || lines > PLANS[pickedPlan].maxLines;

  function handleSubscribe() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: pickedPlan, lines }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setError(body?.message ?? body?.error ?? `Error ${res.status}`);
          return;
        }
        const { url } = (await res.json()) as { url: string };
        window.location.href = url;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  }

  return (
    <div>
      {!stripeReady && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            borderColor: "rgba(251,191,36,0.4)",
            background: "rgba(251,191,36,0.06)",
            color: "var(--text)",
            fontSize: 13,
          }}
        >
          {t("billing.stripeNotReady")}
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="kpi-label" style={{ marginBottom: 8 }}>
          {t("billing.currentPlan")}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <div className="kpi-big" style={{ textTransform: "capitalize" }}>
            {plan}
          </div>
          <div style={{ color: "var(--muted2)", fontSize: 13 }}>
            {licensedLines} {licensedLines === 1 ? t("pricing.line") : t("pricing.lines")} ·
            {" "}
            {subscriptionStatus
              ? t(`billing.status.${subscriptionStatus}`) || subscriptionStatus
              : "—"}
          </div>
        </div>
        {isTrialing && trialEndsAt && (
          <p style={{ color: "var(--muted2)", fontSize: 13, marginTop: 8 }}>
            {t("billing.trialEnds")}:{" "}
            {new Date(trialEndsAt).toLocaleDateString()}
          </p>
        )}
        {isCanceled && (
          <p style={{ color: "var(--muted2)", fontSize: 13, marginTop: 8 }}>
            {t("billing.canceledNote")}
          </p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="kpi-label" style={{ marginBottom: 16 }}>
          {isPaid ? t("billing.changeQuantity") : t("billing.subscribeNow")}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 8 }}>
            {t("billing.pickPlan")}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["starter", "pro"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPickedPlan(p)}
                className={`btn ${pickedPlan === p ? "btn-primary" : "btn-ghost"}`}
                style={{ minWidth: 140 }}
              >
                {t(`pricing.${p}.name`)}
                {recommended === p && (
                  <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                    · {t("pricing.recommended")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="lines"
            style={{ fontSize: 13, color: "var(--muted2)", display: "block", marginBottom: 8 }}
          >
            {t("pricing.howManyLines")}: <strong style={{ color: "var(--text)" }}>{lines}</strong>
          </label>
          <input
            id="lines"
            type="range"
            min={1}
            max={MAX_SELF_SERVE_LINES}
            step={1}
            value={lines}
            onChange={(e) => setLines(Number(e.target.value))}
            style={{ width: "100%", maxWidth: 360, accentColor: "var(--accent)" }}
          />
          <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4 }}>
            1 {t("pricing.line")} – {MAX_SELF_SERVE_LINES} {t("pricing.lines")}
          </div>
        </div>

        {overCap ? (
          <p style={{ color: "var(--muted2)", fontSize: 13 }}>
            {t("pricing.overCap").replace("{n}", String(PLANS[pickedPlan].maxLines))}
          </p>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {usdMonthly != null ? fmtUSD(usdMonthly) : "—"}{" "}
              <span style={{ fontSize: 13, color: "var(--muted2)" }}>
                {t("pricing.usdLabel")}
                {t("pricing.perMo")}
              </span>
            </div>
            {cadMonthly != null && (
              <div style={{ fontSize: 13, color: "var(--muted2)" }}>
                {t("pricing.cadLabel").replace("{price}", fmtCAD(cadMonthly))}
                {t("pricing.perMo")}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={handleSubscribe}
            disabled={isPending || overCap || !stripeReady}
            className="btn btn-primary"
            style={{ minWidth: 200 }}
          >
            {isPending
              ? t("billing.redirecting")
              : isPaid
                ? t("billing.updateSubscription")
                : t("billing.startSubscription")}
          </button>
          {hasStripeCustomer && (
            <p style={{ fontSize: 12, color: "var(--muted2)", alignSelf: "center" }}>
              {t("billing.existingCustomerNote")}
            </p>
          )}
        </div>

        {error && (
          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              color: "var(--red, #f87171)",
              background: "rgba(248,113,113,0.06)",
              border: "1px solid rgba(248,113,113,0.2)",
              padding: "10px 12px",
              borderRadius: 8,
            }}
          >
            {t("billing.error")}: {error}
          </div>
        )}
      </div>
    </div>
  );
}
