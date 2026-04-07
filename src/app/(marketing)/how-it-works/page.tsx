import Link from "next/link";

export const metadata = {
  title: "How Easy OEE Works — Real-Time OEE in 3 Steps",
  description:
    "From operator login to live OEE dashboard in under 60 seconds. See exactly how Easy OEE works on the shop floor.",
};

const STOPS = [
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
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="hero-content fi" style={{ textAlign: "center", maxWidth: 980, margin: "0 auto" }}>
          <div className="hero-eyebrow">How it works</div>
          <h1>FROM ZERO TO LIVE OEE IN ONE SHIFT.</h1>
          <p className="hero-sub">
            Here&apos;s exactly what happens when an operator picks up their phone and starts a
            shift in Easy OEE — and what you see as plant manager while it runs.
          </p>
        </div>
      </section>

      {/* THREE STEPS */}
      <section className="how-sec">
        <div className="section-tag tag">3 Steps</div>
        <h2 className="section-title">START. RUN. END.</h2>

        <div className="steps">
          <div className="step fi">
            <div className="step-num">01</div>
            <h3>SHIFT START</h3>
            <p style={{ color: "var(--muted2)", marginTop: 8, fontWeight: 500 }}>The operator logs in.</p>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              The operator opens Easy OEE on any device — phone, tablet, or shared floor terminal.
              No app download. No training manual.
            </p>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              They sign in, select their production line, choose their shift, enter the product
              being run, and establish the planned minutes and ideal rate.
            </p>
            <p style={{ color: "var(--accent)", marginTop: 12, fontWeight: 500 }}>
              Total time: under 60 seconds.
            </p>
          </div>

          <div className="step fi d1">
            <div className="step-num">02</div>
            <h3>DURING THE SHIFT</h3>
            <p style={{ color: "var(--muted2)", marginTop: 8, fontWeight: 500 }}>
              Stops get logged in real time.
            </p>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              When the machine stops, the operator taps the reason. That&apos;s the entire workflow.
              One tap.
            </p>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              The button turns amber. The timer starts. When the machine restarts, the operator
              taps again — the stop closes and the duration is calculated automatically.
            </p>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              No paper. No radio calls to the office. No end-of-day reconstruction.
            </p>
          </div>

          <div className="step fi d2">
            <div className="step-num">03</div>
            <h3>END OF SHIFT</h3>
            <p style={{ color: "var(--muted2)", marginTop: 8, fontWeight: 500 }}>
              OEE calculates automatically.
            </p>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              When the operator ends the shift, they record the good parts and bad parts produced.
              Easy OEE does the rest.
            </p>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              Availability, Performance, and Quality are calculated instantly. The OEE score
              appears. The shift summary is generated — every stop, every reason, every minute of
              lost production.
            </p>
            <p style={{ color: "var(--accent)", marginTop: 12, fontWeight: 500 }}>
              Zero manual calculation.
            </p>
          </div>
        </div>
      </section>

      {/* STOP REASONS */}
      <section className="feat-sec">
        <div className="section-tag tag">Standardized</div>
        <h2 className="section-title">10 STOP REASONS.</h2>
        <p className="section-intro">
          Every reason is consistent across all lines and all operators — so when you compare
          shifts or lines, you&apos;re comparing apples to apples.
        </p>

        <div style={{ marginTop: 40, maxWidth: 920, marginInline: "auto", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {STOPS.map(([num, label, desc], i) => (
            <div
              key={num}
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr 2fr",
                gap: 24,
                padding: "20px 28px",
                borderTop: i === 0 ? "none" : "1px solid var(--border)",
                background: i % 2 === 0 ? "rgba(239,245,249,0.02)" : "transparent",
              }}
            >
              <span style={{ color: "var(--accent)", fontFamily: "var(--font-dm-mono)", fontSize: 13 }}>{num}</span>
              <span style={{ fontWeight: 500 }}>{label}</span>
              <span style={{ color: "var(--muted2)", fontSize: 14 }}>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* OEE MATH */}
      <section className="how-sec">
        <div className="section-tag tag">The Math</div>
        <h2 className="section-title">HOW OEE IS CALCULATED.</h2>
        <p className="section-intro">
          Easy OEE computes all three components automatically. Here&apos;s what&apos;s happening
          under the hood.
        </p>

        <div className="steps" style={{ marginTop: 56 }}>
          <div className="step">
            <div className="step-num">A</div>
            <h3>AVAILABILITY</h3>
            <p style={{ fontFamily: "var(--font-dm-mono)", color: "var(--accent)", marginTop: 12, fontSize: 13 }}>
              (Planned − Stop) / Planned
            </p>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              Was the machine running when it was supposed to? Measures unplanned downtime as a
              percentage of scheduled production time.
            </p>
          </div>
          <div className="step">
            <div className="step-num">P</div>
            <h3>PERFORMANCE</h3>
            <p style={{ fontFamily: "var(--font-dm-mono)", color: "var(--accent)", marginTop: 12, fontSize: 13 }}>
              Parts / (Ideal Rate × Run Time)
            </p>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              Was the machine running at its ideal speed? Captures small stops, speed losses, and
              micro-stoppages that don&apos;t get recorded as full stops.
            </p>
          </div>
          <div className="step">
            <div className="step-num">Q</div>
            <h3>QUALITY</h3>
            <p style={{ fontFamily: "var(--font-dm-mono)", color: "var(--accent)", marginTop: 12, fontSize: 13 }}>
              Good / (Good + Bad)
            </p>
            <p style={{ color: "var(--muted2)", marginTop: 12 }}>
              Were the parts made right the first time? Measures the percentage of production
              output that meets quality standards without rework.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 60, textAlign: "center" }}>
          <div className="tag" style={{ justifyContent: "center" }}>Final formula</div>
          <h2 style={{ marginTop: 12 }}>OEE = A × P × Q</h2>
          <p style={{ color: "var(--muted2)", marginTop: 18, fontFamily: "var(--font-dm-mono)", fontSize: 13, letterSpacing: 1 }}>
            World class: 85%+ &nbsp;·&nbsp; Typical: 60–75% &nbsp;·&nbsp; Low: below 60%
          </p>
        </div>
      </section>

      {/* GETTING STARTED */}
      <section className="feat-sec">
        <div className="section-tag tag">Getting started</div>
        <h2 className="section-title">FOUR STEPS.</h2>
        <p className="section-intro">No IT department. No hardware. No training sessions.</p>

        <div className="steps" style={{ marginTop: 56, gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            ["1", "Create your account", "Sign up at app.easy-oee.com. Enter your company name. Takes 2 minutes. No credit card needed for the trial."],
            ["2", "Add your lines", "Enter each production line and its ideal parts-per-minute rate. Machine 1, Line A, Press 3 — whatever you call them on the floor."],
            ["3", "Invite operators", "Add operators by email. They get a login link. No training required — the interface is self-explanatory from the first use."],
            ["4", "Start your first shift", "Your first real OEE data will be on your screen before the shift ends. That's the whole onboarding process."],
          ].map(([n, t, d]) => (
            <div className="step" key={n}>
              <div className="step-num">{n}</div>
              <h3>{t}</h3>
              <p style={{ color: "var(--muted2)", marginTop: 12 }}>{d}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <Link href="/contact" className="btn">Start Your Free Trial — No Credit Card Required →</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="how-sec">
        <div className="section-tag tag">FAQ</div>
        <h2 className="section-title">QUICK ANSWERS.</h2>

        <div style={{ maxWidth: 880, marginInline: "auto", marginTop: 56 }}>
          {FAQS.map((f) => (
            <details
              key={f.q}
              style={{
                borderTop: "1px solid var(--border)",
                padding: "24px 0",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 500,
                  listStyle: "none",
                }}
              >
                {f.q}
              </summary>
              <p style={{ color: "var(--muted2)", marginTop: 14, lineHeight: 1.7 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div>
          <div className="tag">Want to see it live?</div>
          <h2>BOOK A FREE DEMO.</h2>
          <p style={{ color: "var(--muted2)", marginTop: 14, maxWidth: 580 }}>
            Thirty minutes. We&apos;ll configure it around your plant and run a live shift
            walkthrough together.
          </p>
        </div>
        <Link href="/contact" className="btn">Book a Free Demo →</Link>
      </section>
    </>
  );
}
