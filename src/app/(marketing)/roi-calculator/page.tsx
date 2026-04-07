import { ROICalculator } from "./calculator";

export const metadata = {
  title: "OEE ROI Calculator — How Much Is Your Downtime Costing You?",
  description:
    "Enter your plant's numbers. See exactly what your current OEE losses cost — and what improving them would return.",
};

export default function ROIPage() {
  return (
    <>
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="hero-content fi" style={{ textAlign: "center", maxWidth: 980, margin: "0 auto" }}>
          <div className="hero-eyebrow">ROI Calculator</div>
          <h1>HOW MUCH IS YOUR DOWNTIME COSTING YOU?</h1>
          <p className="hero-sub">
            Enter your plant&apos;s numbers. See exactly what your current OEE losses cost — and
            what improving them would return.
          </p>
        </div>
      </section>

      <ROICalculator />

      <section className="feat-sec">
        <div className="section-tag tag">Three loss types</div>
        <h2 className="section-title">WHERE DO OEE LOSSES COME FROM?</h2>
        <p className="section-intro">All three are measurable — and all three are recoverable.</p>

        <div className="steps" style={{ marginTop: 56 }}>
          <div className="step">
            <div className="step-num">A</div>
            <h3>AVAILABILITY LOSS</h3>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              Unplanned downtime: breakdowns, changeovers that ran long, material starvation,
              waiting on operators or maintenance.
            </p>
          </div>
          <div className="step">
            <div className="step-num">P</div>
            <h3>PERFORMANCE LOSS</h3>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              Speed losses: micro-stops too short to log, running below ideal rate, equipment
              wear slowing the line down.
            </p>
          </div>
          <div className="step">
            <div className="step-num">Q</div>
            <h3>QUALITY LOSS</h3>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              Scrap and rework: parts produced that don&apos;t meet spec the first time and either
              get tossed or have to be reworked.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
