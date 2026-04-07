import Link from "next/link";

export const metadata = {
  title: "How Easy OEE Works — Real-Time OEE in 3 Steps",
  description:
    "From operator login to live OEE dashboard in under 60 seconds. See exactly how Easy OEE works on the shop floor.",
};

const STOPS: [string, string, string][] = [
  ["01", "Mechanical Failure", "Unplanned equipment breakdown or malfunction"],
  ["02", "Changeover", "Product or tooling change between runs"],
  ["03", "No Material", "Waiting for raw materials or components to arrive"],
  ["04", "Quality Check", "Inspection, measurement, or quality hold requiring stoppage"],
  ["05", "Scheduled Break", "Meal breaks, shift meetings, planned pauses"],
  ["06", "No Operator", "Waiting for an available qualified operator"],
  ["07", "Maintenance", "Planned preventive maintenance activities"],
  ["08", "Training", "Operator training activities during production hours"],
  ["09", "No Production Scheduled", "Planned idle time — line not scheduled to run"],
  ["10", "Other", "Anything not captured by the above categories"],
];

const FAQS = [
  {
    q: "Do operators need smartphones?",
    a: "No. Easy OEE works on any device with a browser — smartphones, tablets, shared terminals, or a PC on the floor. Many plants use an inexpensive wall-mounted tablet as the shared operator interface.",
  },
  {
    q: "What if an operator forgets to log a stop?",
    a: "Stops can be added or adjusted within the active shift. The plant manager can also review and edit shift data from the management view before the shift record is finalized.",
  },
  {
    q: "How long does operator training take?",
    a: "Most operators understand the interface within 5 minutes without any formal training. The workflow is: start shift, tap when machine stops, tap when it restarts, end shift. That's it.",
  },
  {
    q: "What if we have multiple shifts on the same line?",
    a: "Each shift is a separate record. Morning, Afternoon, and Night shifts on the same line are tracked independently and can be compared side by side in the management dashboard.",
  },
  {
    q: "What happens if the internet goes down on the floor?",
    a: "Easy OEE requires an internet connection to save data in real time. Most plants use a reliable WiFi network or mobile hotspot at the operator station. Offline mode is on the product roadmap.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* HERO */}
      <section className="sub-hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="sub-hero-inner fi">
          <div className="tag" style={{ justifyContent: "center", display: "inline-flex" }}>
            How it works
          </div>
          <h1>
            FROM ZERO TO LIVE OEE
            <br />
            <em>IN ONE SHIFT.</em>
          </h1>
          <p className="sub-lead">
            Here&apos;s exactly what happens when an operator picks up their phone and starts a
            shift in Easy OEE — and what you see as plant manager while it runs.
          </p>
        </div>
      </section>

      {/* THREE STEPS */}
      <section className="how-sec">
        <div className="center-block">
          <div className="tag">3 Steps</div>
          <h2>START. RUN. END.</h2>
          <p className="how-intro" style={{ marginInline: "auto" }}>
            One workflow, three moments. Every Easy OEE shift looks like this.
          </p>
        </div>

        <div className="steps">
          <div className="step fi">
            <div className="step-bnum">01</div>
            <h3>SHIFT START</h3>
            <p>
              The operator opens Easy OEE on any device — phone, tablet, or shared floor
              terminal. No app download. No training manual.
            </p>
            <p>
              They sign in, select their production line, choose their shift, enter the product
              being run, and set planned minutes and ideal rate.
            </p>
            <p style={{ color: "var(--accent)", fontWeight: 500 }}>
              Total time: under 60 seconds.
            </p>
          </div>

          <div className="step fi d1">
            <div className="step-bnum">02</div>
            <h3>DURING THE SHIFT</h3>
            <p>
              When the machine stops, the operator taps the reason. That&apos;s the entire
              workflow. One tap.
            </p>
            <p>
              The button turns red. The timer starts. When the machine restarts, the operator
              taps again — the stop closes and the duration is calculated automatically.
            </p>
            <p>No paper. No radio calls to the office. No end-of-day reconstruction.</p>
          </div>

          <div className="step fi d2">
            <div className="step-bnum">03</div>
            <h3>END OF SHIFT</h3>
            <p>
              The operator records good and bad parts produced. Easy OEE does the rest.
            </p>
            <p>
              Availability, Performance, and Quality are calculated instantly. The OEE score
              appears. The full shift summary is generated — every stop, every reason, every
              minute of lost production.
            </p>
            <p style={{ color: "var(--accent)", fontWeight: 500 }}>
              Zero manual calculation.
            </p>
          </div>
        </div>
      </section>

      {/* 10 STOP REASONS */}
      <section className="feat-sec">
        <div className="center-block">
          <div className="tag">Standardized</div>
          <h2>10 STOP REASONS.</h2>
          <p className="how-intro" style={{ marginInline: "auto" }}>
            Every reason is consistent across all lines and all operators — so when you compare
            shifts or lines, you&apos;re comparing apples to apples.
          </p>
        </div>

        <div className="stop-list">
          {STOPS.map(([num, label, desc]) => (
            <div key={num} className="stop-list-row">
              <span className="stop-num">{num}</span>
              <span className="stop-label">{label}</span>
              <span className="stop-desc">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* OEE MATH */}
      <section className="how-sec">
        <div className="center-block">
          <div className="tag">The math</div>
          <h2>HOW OEE IS CALCULATED.</h2>
          <p className="how-intro" style={{ marginInline: "auto" }}>
            Easy OEE computes all three components automatically. Here&apos;s what&apos;s
            happening under the hood.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-bnum">A</div>
            <h3>AVAILABILITY</h3>
            <p style={{ color: "var(--accent)", fontFamily: "var(--font-dm-mono)", fontSize: 14 }}>
              (Planned − Stop) / Planned
            </p>
            <p>
              Was the machine running when it was supposed to? Measures unplanned downtime as a
              percentage of scheduled production time.
            </p>
          </div>
          <div className="step">
            <div className="step-bnum">P</div>
            <h3>PERFORMANCE</h3>
            <p style={{ color: "var(--accent)", fontFamily: "var(--font-dm-mono)", fontSize: 14 }}>
              Parts / (Ideal Rate × Run Time)
            </p>
            <p>
              Was the machine running at its ideal speed? Captures small stops, speed losses,
              and micro-stoppages that don&apos;t get recorded as full stops.
            </p>
          </div>
          <div className="step">
            <div className="step-bnum">Q</div>
            <h3>QUALITY</h3>
            <p style={{ color: "var(--accent)", fontFamily: "var(--font-dm-mono)", fontSize: 14 }}>
              Good / (Good + Bad)
            </p>
            <p>
              Were the parts made right the first time? Measures the percentage of production
              output that meets quality standards without rework.
            </p>
          </div>
        </div>

        <div className="formula-final">
          <div className="tag" style={{ justifyContent: "center", display: "inline-flex" }}>
            Final formula
          </div>
          <h2>OEE = A × P × Q</h2>
          <p>
            World class: 85%+ &nbsp;·&nbsp; Typical: 60–75% &nbsp;·&nbsp; Low: below 60%
          </p>
        </div>
      </section>

      {/* GETTING STARTED */}
      <section className="feat-sec">
        <div className="center-block">
          <div className="tag">Getting started</div>
          <h2>FOUR STEPS.</h2>
          <p className="how-intro" style={{ marginInline: "auto" }}>
            No IT department. No hardware. No training sessions.
          </p>
        </div>

        <div className="steps" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            ["1", "Create your account", "Sign up at app.easy-oee.com. Enter your company name. Takes 2 minutes. No credit card needed for the trial."],
            ["2", "Add your lines", "Enter each production line and its ideal parts-per-minute rate. Machine 1, Line A, Press 3 — whatever you call them on the floor."],
            ["3", "Invite operators", "Add operators by email. They get a login link. No training required — the interface is self-explanatory from the first use."],
            ["4", "Start your first shift", "Your first real OEE data will be on your screen before the shift ends. That's the whole onboarding process."],
          ].map(([n, t, d]) => (
            <div className="step" key={n}>
              <div className="step-bnum">{n}</div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <Link href="/contact" className="btn-y">
            Start Your Free Trial — No Credit Card Required →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="how-sec">
        <div className="center-block">
          <div className="tag">FAQ</div>
          <h2>QUICK ANSWERS.</h2>
        </div>

        <div className="faq-list">
          {FAQS.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary className="faq-q">{f.q}</summary>
              <p className="faq-a">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div>
          <div className="tag" style={{ color: "var(--black)" }}>Want to see it live?</div>
          <h2>BOOK A FREE DEMO.</h2>
          <p>
            Thirty minutes. We&apos;ll configure it around your plant and run a live shift
            walkthrough together.
          </p>
        </div>
        <Link href="/contact" className="btn-y" style={{ background: "var(--black)", color: "var(--accent)" }}>
          Book a Free Demo →
        </Link>
      </section>
    </>
  );
}
