"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useT } from "@/components/i18n/LanguageProvider";

const EASY_OEE_COST_USD = 1188; // USD/year, Professional plan reference (5 lines)

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtNum = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

type Inputs = {
  lines: number;
  shifts: number;
  days: number;
  mins: number;
  rate: number;
  oee: number;
};

type SliderConfig = {
  key: keyof Inputs;
  labelKey: string;
  hintKey?: string;
  min: number;
  max: number;
  step: number;
  unit: string;
};

const SLIDERS: SliderConfig[] = [
  { key: "lines", labelKey: "roi.input.lines", min: 1, max: 20, step: 1, unit: "" },
  { key: "shifts", labelKey: "roi.input.shifts", min: 1, max: 3, step: 1, unit: "" },
  { key: "days", labelKey: "roi.input.days", min: 1, max: 7, step: 1, unit: "" },
  { key: "mins", labelKey: "roi.input.mins", min: 60, max: 720, step: 10, unit: "min" },
  { key: "rate", labelKey: "roi.input.rate", hintKey: "roi.input.rate.hint", min: 5, max: 1000, step: 5, unit: "$/min" },
  { key: "oee", labelKey: "roi.input.oee", hintKey: "roi.input.oee.hint", min: 30, max: 90, step: 1, unit: "%" },
];

export function ROICalculator() {
  const t = useT();
  const [inputs, setInputs] = useState<Inputs>({
    lines: 2,
    shifts: 2,
    days: 5,
    mins: 480,
    rate: 85,
    oee: 65,
  });
  const [improve, setImprove] = useState<5 | 10 | 15>(10);

  const out = useMemo(() => {
    const lossPct = 100 - inputs.oee;
    const lostMinPerShift = inputs.mins * (lossPct / 100);
    const costPerShift = lostMinPerShift * inputs.rate * inputs.lines;
    const costPerWeek = costPerShift * inputs.shifts * inputs.days;
    const costPerYear = costPerWeek * 52;

    const gainMinPerShift = inputs.mins * (improve / 100);
    const gainPerWeek = gainMinPerShift * inputs.rate * inputs.lines * inputs.shifts * inputs.days;
    const gainPerYear = gainPerWeek * 52;

    const paybackDaysRaw = gainPerYear > 0 ? (EASY_OEE_COST_USD / gainPerYear) * 365 : Infinity;
    const roi = gainPerYear > 0 ? gainPerYear / EASY_OEE_COST_USD : 0;
    const paybackDisplay =
      paybackDaysRaw === Infinity || paybackDaysRaw > 365
        ? t("roi.payback.over1y")
        : `${Math.max(1, Math.ceil(paybackDaysRaw))} days`;
    const barWidth = Math.min(100, Math.max(3, (1 - paybackDaysRaw / 365) * 100));

    return {
      lostMinPerShift,
      costPerWeek,
      costPerYear,
      gainMinPerShift,
      gainPerYear,
      paybackDisplay,
      roi,
      barWidth,
    };
  }, [inputs, improve, t]);

  const update = (key: keyof Inputs, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <section className="how-sec">
      <div className="center-block">
        <div className="tag">{t("roi.calc.tag")}</div>
        <h2>{t("roi.calc.title")}</h2>
        <p className="how-intro" style={{ marginInline: "auto" }}>{t("roi.calc.intro")}</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          marginTop: 56,
          maxWidth: 1180,
          marginInline: "auto",
        }}
        className="roi-grid"
      >
        {/* INPUTS */}
        <div
          style={{
            background: "var(--mid)",
            border: "1px solid var(--border2)",
            borderRadius: 14,
            padding: 32,
          }}
        >
          {SLIDERS.map((s) => {
            const value = inputs[s.key];
            return (
              <div key={s.key} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: 11,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      color: "var(--muted2)",
                    }}
                  >
                    {t(s.labelKey)}
                  </label>
                  <span style={{ fontFamily: "var(--font-bebas)", color: "var(--accent)", fontSize: 28 }}>
                    {s.key === "rate" ? `$${value}` : value}
                    {s.unit && s.key !== "rate" ? ` ${s.unit}` : ""}
                    {s.key === "rate" ? "/min" : ""}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={value}
                  onChange={(e) => update(s.key, Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)", marginTop: 6 }}
                />
                {s.hintKey && (
                  <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{t(s.hintKey)}</p>
                )}
              </div>
            );
          })}

          <div style={{ marginTop: 16 }}>
            <label
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: 11,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: "var(--muted2)",
                display: "block",
                marginBottom: 10,
              }}
            >
              {t("roi.target")}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[5, 10, 15].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setImprove(v as 5 | 10 | 15)}
                  className={improve === v ? "btn" : "btn btn-ghost"}
                  style={{ minHeight: 52, fontSize: 15 }}
                >
                  +{v}% OEE
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* OUTPUTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "rgba(200,65,65,0.08)",
              border: "1px solid rgba(200,65,65,0.4)",
              borderRadius: 14,
              padding: 28,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: 11,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: "#ff7a7a",
              }}
            >
              {t("roi.losing")}
            </div>
            <div className="kpi-big" style={{ color: "#ff7a7a", fontSize: "clamp(56px, 9vw, 96px)" }}>
              {fmtUSD(out.costPerYear)}
            </div>
            <div style={{ color: "var(--muted2)", fontSize: 14 }}>
              per year at {inputs.oee}% OEE · {fmtNum(out.lostMinPerShift)} min lost / shift / line
              · {fmtUSD(out.costPerWeek)} per week
            </div>
          </div>

          <div
            style={{
              background: "rgba(3,191,181,0.08)",
              border: "1px solid var(--accent)",
              borderRadius: 14,
              padding: 28,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: 11,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              {t("roi.recover").replace("{pct}", String(improve))}
            </div>
            <div className="kpi-big" style={{ fontSize: "clamp(56px, 9vw, 96px)" }}>
              {fmtUSD(out.gainPerYear)}
            </div>
            <div style={{ color: "var(--muted2)", fontSize: 14 }}>
              gained per year · +{fmtNum(out.gainMinPerShift)} min / shift / line
            </div>
          </div>

          <div className="card">
            <div className="kpi-label" style={{ marginBottom: 8 }}>{t("roi.payback.label")}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="kpi-big" style={{ fontSize: 56 }}>{out.paybackDisplay}</span>
              <span style={{ fontFamily: "var(--font-bebas)", fontSize: 32, color: "var(--accent)" }}>
                {out.roi >= 1 ? `${Math.round(out.roi)}x ROI` : "n/a"}
              </span>
            </div>
            <div
              style={{
                marginTop: 14,
                height: 10,
                background: "var(--black)",
                borderRadius: 99,
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: `${out.barWidth}%`,
                  height: "100%",
                  background: "var(--accent)",
                  transition: "width .3s",
                }}
              />
            </div>
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 8 }}>{t("roi.payback.refLine")}</p>
          </div>

          <Link href="/contact" className="btn" style={{ marginTop: 4 }}>
            {t("roi.cta")} →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .roi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
