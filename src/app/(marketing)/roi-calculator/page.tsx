import { ROICalculator } from "./calculator";
import { getServerT } from "@/components/i18n/server";

export const metadata = {
  title: "OEE ROI Calculator | How Much Is Your Downtime Costing You?",
  description:
    "Enter your plant's numbers. See exactly what your current OEE losses cost, and what improving them would return.",
};

export default async function ROIPage() {
  const t = await getServerT();
  return (
    <>
      <section className="sub-hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="sub-hero-inner fi">
          <div className="tag" style={{ justifyContent: "center", display: "inline-flex" }}>
            {t("roi.eyebrow")}
          </div>
          <h1>
            {t("roi.h1.line1")}
            <br />
            <em>{t("roi.h1.line2")}</em>
          </h1>
          <p className="sub-lead">{t("roi.sub")}</p>
        </div>
      </section>

      <ROICalculator />

      <section className="feat-sec">
        <div className="center-block">
          <div className="tag">{t("roi.losses.tag")}</div>
          <h2>{t("roi.losses.title")}</h2>
          <p className="how-intro" style={{ marginInline: "auto" }}>{t("roi.losses.intro")}</p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-bnum">A</div>
            <h3>{t("roi.losses.a.title")}</h3>
            <p>{t("roi.losses.a.body")}</p>
          </div>
          <div className="step">
            <div className="step-bnum">P</div>
            <h3>{t("roi.losses.p.title")}</h3>
            <p>{t("roi.losses.p.body")}</p>
          </div>
          <div className="step">
            <div className="step-bnum">Q</div>
            <h3>{t("roi.losses.q.title")}</h3>
            <p>{t("roi.losses.q.body")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
