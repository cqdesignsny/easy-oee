import { ROICalculator } from "./calculator";

export const metadata = {
  title: "OEE ROI Calculator | How Much Is Your Downtime Costing You?",
  description:
    "Enter your plant's numbers. See exactly what your current OEE losses cost, and what improving them would return.",
};

export default function ROIPage() {
  return (
    <>
      <section className="sub-hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="sub-hero-inner fi">
          <div className="tag" style={{ justifyContent: "center", display: "inline-flex" }}>
            ROI Calculator
          </div>
          <h1>
            HOW MUCH IS YOUR
            <br />
            <em>DOWNTIME COSTING YOU?</em>
          </h1>
          <p className="sub-lead">
            Enter your plant&apos;s numbers. See exactly what your current OEE losses cost, and
            what fixing them would put back in your pocket.
          </p>
        </div>
      </section>

      <ROICalculator />

      <section className="feat-sec">
        <div className="center-block">
          <div className="tag">Three loss types</div>
          <h2>WHERE OEE LOSSES COME FROM.</h2>
          <p className="how-intro" style={{ marginInline: "auto" }}>
            All three are measurable. All three are recoverable.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-bnum">A</div>
            <h3>AVAILABILITY LOSS</h3>
            <p>
              Unplanned downtime. Breakdowns, changeovers that ran long, material starvation,
              waiting on operators or maintenance.
            </p>
          </div>
          <div className="step">
            <div className="step-bnum">P</div>
            <h3>PERFORMANCE LOSS</h3>
            <p>
              Speed losses. Micro-stops too short to log, running below ideal rate, equipment
              wear slowing the line down.
            </p>
          </div>
          <div className="step">
            <div className="step-bnum">Q</div>
            <h3>QUALITY LOSS</h3>
            <p>
              Scrap and rework. Parts that don&apos;t meet spec the first time and either get
              tossed or have to be fixed.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
