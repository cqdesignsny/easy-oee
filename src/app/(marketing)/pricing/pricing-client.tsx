"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/i18n/LanguageProvider";
import {
  PLANS,
  fmtCAD,
  fmtUSD,
  monthlyCostUSD,
  usdToCad,
  type PlanId,
} from "@/lib/pricing";

const TIER_ORDER: PlanId[] = ["starter", "pro", "enterprise"];

export function PricingClient() {
  const t = useT();
  const [lines, setLines] = useState(2);

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
          How many production lines?
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
          {lines}
        </div>
        <input
          type="range"
          min={1}
          max={20}
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
          <span>1 line</span>
          <span>20 lines</span>
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
          const featured = id === "pro";
          const isEnterprise = id === "enterprise";
          const usdMonthly = monthlyCostUSD(id, lines);
          const cadMonthly = usdToCad(usdMonthly);

          return (
            <div
              key={id}
              style={{
                border: featured ? "1px solid var(--accent)" : "1px solid var(--border2)",
                padding: 40,
                borderRadius: 16,
                background: featured ? "rgba(3,191,181,0.04)" : "transparent",
              }}
            >
              <div className="tag" style={{ marginBottom: 14 }}>
                {t(`pricing.${id}.name`)}
              </div>

              {/* Price */}
              {isEnterprise ? (
                <div style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-bebas)",
                      fontSize: 64,
                      color: "var(--accent)",
                      lineHeight: 1,
                    }}
                  >
                    {t("pricing.ent.price")}
                  </div>
                  <p style={{ color: "var(--muted2)", fontSize: 14, marginTop: 6 }}>
                    Talk to us for multi-plant pricing.
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
                    {fmtUSD(usdMonthly)}
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
                    {t("pricing.cadLabel").replace("{price}", `${fmtCAD(cadMonthly)}`)}
                    {t("pricing.perMo")}
                  </div>
                  {plan.extraLineUSD > 0 && lines > plan.includedLines && (
                    <p style={{ color: "var(--muted2)", fontSize: 13, marginTop: 8 }}>
                      Includes {plan.includedLines} lines + {lines - plan.includedLines} extra at{" "}
                      {fmtUSD(plan.extraLineUSD)} USD each
                    </p>
                  )}
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
                href={isEnterprise ? "/contact" : `/sign-up?plan=${id}&lines=${lines}`}
                className="btn-y"
                style={{ display: "block", textAlign: "center", marginBottom: 28 }}
              >
                {isEnterprise ? t("nav.bookDemo") : t("pricing.startTrial")}
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
