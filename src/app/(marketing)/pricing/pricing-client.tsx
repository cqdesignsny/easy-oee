"use client";

import Link from "next/link";
import { useState } from "react";
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

const TIER_ORDER: PlanId[] = ["starter", "pro", "enterprise"];
// Slider goes one beyond the self-serve cap; the last value snaps to
// "20+ lines" and pushes the user toward the Enterprise card.
const SLIDER_MAX = MAX_SELF_SERVE_LINES + 1;

export function PricingClient() {
  const t = useT();
  const [lines, setLines] = useState(2);

  const linesLabel = lines > MAX_SELF_SERVE_LINES ? `${MAX_SELF_SERVE_LINES}+` : String(lines);
  const pickedTier = recommendedTier(lines);

  return (
    <section className="how-sec">
      {/* Line count selector */}
      <div
        className="card"
        style={{
          maxWidth: 720,
          margin: "0 auto 56px",
          textAlign: "center",
          padding: 32,
        }}
      >
        <div className="kpi-label" style={{ marginBottom: 14 }}>
          {t("pricing.howManyLines")}
        </div>
        <div
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: 72,
            color: "var(--accent)",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          {linesLabel}
        </div>
        <input
          type="range"
          min={1}
          max={SLIDER_MAX}
          step={1}
          value={lines}
          onChange={(e) => setLines(Number(e.target.value))}
          style={{ width: "100%", maxWidth: 480, accentColor: "var(--accent)" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: 480,
            margin: "8px auto 0",
            fontFamily: "var(--font-dm-mono)",
            fontSize: 12,
            color: "var(--muted2)",
            letterSpacing: 1,
          }}
        >
          <span>1 {t("pricing.line")}</span>
          <span>{MAX_SELF_SERVE_LINES}+ {t("pricing.lines")}</span>
        </div>
      </div>

      {/* Tier cards */}
      <div
        className="pricing-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {TIER_ORDER.map((id) => {
          const plan = PLANS[id];
          const isEnterprise = id === "enterprise";
          const isRecommended = pickedTier === id;
          const usdMonthly = monthlyCostUSD(id, lines);
          const overCap = !isEnterprise && usdMonthly === null;
          const cadMonthly = usdMonthly != null ? usdToCad(usdMonthly) : null;
          const dimmed = overCap;

          return (
            <div
              key={id}
              style={{
                position: "relative",
                border: isRecommended ? "1px solid var(--accent)" : "1px solid var(--border2)",
                padding: 40,
                borderRadius: 16,
                background: isRecommended ? "rgba(3,191,181,0.04)" : "transparent",
                opacity: dimmed ? 0.55 : 1,
                transition: "opacity 0.15s, border-color 0.15s, background 0.15s",
              }}
            >
              {isRecommended && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: 24,
                    background: "var(--accent)",
                    color: "var(--bg)",
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: 11,
                    letterSpacing: 1.5,
                    padding: "4px 10px",
                    borderRadius: 999,
                    textTransform: "uppercase",
                  }}
                >
                  {t("pricing.recommended")}
                </div>
              )}
              <div className="tag" style={{ marginBottom: 14 }}>
                {t(`pricing.${id}.name`)}
              </div>

              {/* Price */}
              {isEnterprise || overCap ? (
                <div style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-bebas)",
                      fontSize: 64,
                      color: "var(--accent)",
                      lineHeight: 1,
                    }}
                  >
                    {isEnterprise ? t("pricing.ent.price") : t("pricing.talkToUs")}
                  </div>
                  <p style={{ color: "var(--muted2)", fontSize: 14, marginTop: 6 }}>
                    {isEnterprise
                      ? t("pricing.ent.tagline")
                      : t("pricing.overCap").replace("{n}", String(plan.maxLines))}
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-bebas)",
                      fontSize: 72,
                      color: "var(--accent)",
                      lineHeight: 1,
                    }}
                  >
                    {fmtUSD(usdMonthly!)}
                    <span style={{ fontSize: 18, color: "var(--white)", marginLeft: 8 }}>
                      {t("pricing.usdLabel")}
                    </span>
                    <span style={{ fontSize: 18, color: "var(--muted2)" }}>
                      {t("pricing.perMo")}
                    </span>
                  </div>
                  <div
                    style={{
                      color: "var(--muted2)",
                      fontSize: 15,
                      marginTop: 6,
                      fontFamily: "var(--font-dm-mono)",
                      letterSpacing: 0.5,
                    }}
                  >
                    {cadMonthly != null && t("pricing.cadLabel").replace("{price}", `${fmtCAD(cadMonthly)}`)}
                    {t("pricing.perMo")}
                  </div>
                  <p style={{ color: "var(--muted2)", fontSize: 13, marginTop: 8 }}>
                    {t("pricing.forNLines").replace(
                      "{n}",
                      String(Math.min(lines, plan.maxLines)),
                    )}
                  </p>
                </div>
              )}

              <p
                style={{
                  color: "var(--muted2)",
                  fontSize: 16,
                  lineHeight: 1.6,
                  marginBottom: 28,
                  minHeight: 76,
                }}
              >
                {t(`pricing.${id}.desc`)}
              </p>

              <Link
                href={
                  isEnterprise || overCap
                    ? "/contact"
                    : `/sign-up?plan=${id}&lines=${Math.min(lines, plan.maxLines)}`
                }
                className="btn-y"
                style={{ display: "block", textAlign: "center", marginBottom: 28 }}
              >
                {isEnterprise || overCap ? t("nav.bookDemo") : t("pricing.startTrial")}
              </Link>

              <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 14 }}>
                {plan.featureKeys.map((key) => (
                  <li
                    key={key}
                    style={{
                      color: "var(--muted2)",
                      fontSize: 16,
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      lineHeight: 1.5,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{ color: "var(--accent)", flexShrink: 0, marginTop: 4 }}
                    >
                      <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 880px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
