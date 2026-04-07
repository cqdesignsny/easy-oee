import Link from "next/link";

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="ticker">
          AVAILABILITY 94.2%<br />
          PERFORMANCE 87.1%<br />
          QUALITY 99.3%<br />
          OEE 81.6%<br />
          LINE 3 RUNNING<br />
          STOP: CHANGEOVER 12 MIN<br />
          SHIFT: MORNING<br />
          GOOD PARTS: 1,240<br />
          REJECT RATE: 0.7%
        </div>
        <div className="hero-content fi">
          <div className="hero-eyebrow">Built for Canadian manufacturers</div>
          <h1>
            YOU DON&apos;T KNOW
            <br />
            YOUR <em>REAL OEE.</em>
            <br />
            <span className="out">WE CAN FIX THAT.</span>
          </h1>
          <p className="hero-sub">
            Easy OEE gives plant managers real-time visibility into machine performance,
            downtime causes, and shift efficiency, from any device on the floor. No hardware.
            No IT department. Up and running today.
          </p>
          <div className="hero-actions">
            <Link href="/contact" className="btn-y">
              Book a Free Demo <ArrowRight />
            </Link>
            <Link href="/how-it-works" className="btn-ghost">
              See How It Works <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar">
        {[
          { n: "23%", l: "Average OEE improvement in year one" },
          { n: "<4 min", l: "Operator setup time per shift" },
          { n: "$0", l: "Setup fees, ever" },
          { n: "100%", l: "Web-based. Zero hardware required" },
        ].map((s, i) => (
          <div key={s.n} className={`stat fi${i ? ` d${i}` : ""}`}>
            <div className="stat-n">{s.n}</div>
            <div className="stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* PROBLEM */}
      <div className="problem">
        <div className="fi">
          <div className="tag">The problem</div>
          <h2>MOST PLANT MANAGERS ARE FLYING BLIND.</h2>
          <p className="problem-intro">
            If you&apos;re tracking OEE at all, you&apos;re probably doing it in a spreadsheet
            updated at end of shift. By the time you see the numbers, the shift is over and the
            losses are permanent.
          </p>
          <div className="pain-list">
            {[
              {
                n: "01",
                strong: "You don't know your real OEE.",
                rest:
                  " You have a feeling the line isn't performing. But a feeling isn't a number, and yesterday's number doesn't help you today.",
              },
              {
                n: "02",
                strong: "Stop reasons are vague or never recorded.",
                rest:
                  " \"Machine down\" is not a root cause. Without knowing why, you can't fix anything systematically.",
              },
              {
                n: "03",
                strong: "Shift-to-shift comparison is impossible.",
                rest:
                  " Without consistent data, every comparison turns into an argument instead of a conversation backed by evidence.",
              },
              {
                n: "04",
                strong: "By the time you see the data, it's too late.",
                rest:
                  " End-of-day reports tell you what happened. Easy OEE tells you what's happening, while you can still do something about it.",
              },
            ].map((p) => (
              <div key={p.n} className="pain-item">
                <span className="pain-num">{p.n}</span>
                <p className="pain-text">
                  <strong>{p.strong}</strong>
                  {p.rest}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="fi d2">
          <div className="dash">
            <div className="dash-hdr">
              <span className="dash-lbl">Live Shift / Line 2 / Morning</span>
              <span className="dash-live">Running</span>
            </div>
            <div className="oee-g">
              <div className="oee-c">
                <div className="oee-lb">Availability</div>
                <div className="oee-v">91%</div>
                <div className="oee-br"><div className="oee-f" style={{ width: "91%" }} /></div>
              </div>
              <div className="oee-c">
                <div className="oee-lb">Performance</div>
                <div className="oee-v w">78%</div>
                <div className="oee-br"><div className="oee-f w" style={{ width: "78%" }} /></div>
              </div>
              <div className="oee-c">
                <div className="oee-lb">Quality</div>
                <div className="oee-v">98%</div>
                <div className="oee-br"><div className="oee-f" style={{ width: "98%" }} /></div>
              </div>
            </div>
            <div className="oee-main">
              <div className="oee-lb">OEE Score</div>
              <div className="oee-big">69%</div>
              <div className="oee-br" style={{ height: 3, marginTop: 10 }}>
                <div className="oee-f w" style={{ width: "69%" }} />
              </div>
            </div>
            <div className="dash-lbl" style={{ marginBottom: 9 }}>
              Recent stops
            </div>
            {[
              ["Mechanical Failure", "18 min", "09:14"],
              ["No Material", "7 min", "10:32"],
              ["Changeover", "22 min", "11:05"],
            ].map(([reason, mins, time]) => (
              <div key={reason} className="sr">
                <span style={{ color: "var(--muted2)" }}>{reason}</span>
                <span style={{ color: "var(--red)" }}>{mins}</span>
                <span style={{ color: "rgba(239,245,249,.2)" }}>{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SOLUTION */}
      <section className="sol">
        <div className="fi">
          <div className="tag">The solution</div>
          <h2>OEE THAT UPDATES WHILE THE SHIFT RUNS.</h2>
        </div>
        <div className="sol-inner">
          <div className="fi d1">
            <p className="sol-body">
              Easy OEE connects the operator on the floor to the numbers on your screen. Every
              stop gets logged with a reason. Every part gets counted. Availability,
              Performance, and Quality calculate automatically. No formulas, no spreadsheets,
              no end-of-day data entry.
            </p>
            <p className="sol-body-strong">
              You see your OEE right now. Not tomorrow morning.
            </p>
            <div className="pills">
              {[
                "Real-time dashboard",
                "10 stop categories",
                "Auto OEE calculation",
                "Shift reports",
                "Any device",
              ].map((p) => (
                <div key={p} className="pill">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--accent)" }}>
                    <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>{" "}
                  {p}
                </div>
              ))}
            </div>
            <Link
              href="/how-it-works"
              className="btn-y"
              style={{ marginTop: 32, display: "inline-flex" }}
            >
              See the full walkthrough →
            </Link>
          </div>
          <div className="fi d2">
            <div className="pull">
              &ldquo;KNOW YOUR OEE
              <br />
              <span>
                BEFORE THE SHIFT ENDS.
                <br />
                NOT THE NEXT MORNING.&rdquo;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-sec">
        <div className="fi">
          <div className="tag">How it works</div>
          <h2>UP AND RUNNING IN ONE SHIFT.</h2>
          <p className="how-intro">
            No IT department. No hardware. Operators are logging real data within minutes of
            account setup.
          </p>
        </div>
        <div className="steps fi d1">
          {[
            {
              n: "1",
              title: "Operator Logs In",
              body:
                "Opens Easy OEE on any device. Phone, tablet, or floor terminal. Picks the line, shift type, product, and ideal rate. Under 60 seconds.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
            },
            {
              n: "2",
              title: "Stops Are Captured",
              body:
                "Machine stops? One tap to log the reason. Duration tracked automatically. Machine restarts? One more tap. The stop closes with duration calculated.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              n: "3",
              title: "OEE Is Calculated",
              body:
                "Availability, Performance, and Quality update in real time. Shift summary generated automatically. No formulas. No manual work. No next-morning surprises.",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
            },
          ].map((s) => (
            <div key={s.n} className="step">
              <span className="step-bnum">{s.n}</span>
              <div className="step-ic">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="feat-sec" id="features">
        <div className="fi">
          <div className="tag">Features</div>
          <h2>EVERYTHING A PLANT MANAGER ACTUALLY NEEDS.</h2>
          <p className="how-intro">
            Built for the realities of the shop floor. Not a generic BI tool retrofitted for
            manufacturing.
          </p>
        </div>
        <div className="feat-grid fi d1">
          {[
            {
              title: "Real-Time OEE Dashboard",
              body:
                "See Availability, Performance, and Quality update live as the shift progresses. No waiting for end-of-day reports.",
            },
            {
              title: "10 Standardized Stop Reasons",
              body:
                "Mechanical Failure, Changeover, No Material, Quality Check, Maintenance, and more. The same set across every operator and every line.",
            },
            {
              title: "Automatic Shift Reports",
              body:
                "Every shift generates a complete summary: good parts, bad parts, total downtime, top stop causes, and final OEE score. Zero data entry required.",
            },
            {
              title: "Multi-Line, Multi-Shift",
              body:
                "Track Morning, Afternoon, and Night shifts across as many lines as you run. All from one account.",
            },
            {
              title: "Company Data Privacy",
              body:
                "Your data stays yours. Operators see only their line. Managers see their plant. No data is ever shared across accounts.",
              red: true,
            },
            {
              title: "Zero Hardware Required",
              body:
                "Fully web-based. Works on the phone in the operator's pocket, the tablet on the line, or the PC in your office. Nothing to install.",
              red: true,
            },
          ].map((f) => (
            <div key={f.title} className="feat">
              <div className="feat-hd">
                <div className={`dot${f.red ? " r" : ""}`} />
                <h3>{f.title}</h3>
              </div>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROOF */}
      <section className="proof-sec">
        <div className="fi">
          <div className="tag">From the floor</div>
          <h2>PLANT MANAGERS WHO MADE THE SWITCH.</h2>
        </div>
        <div className="proof-grid">
          {[
            {
              i: "DM",
              n: "Derek M.",
              r: "Plant Manager, Ontario",
              q: "We went from a shared spreadsheet to live OEE data on my phone. The first week we found out changeover was eating 22% of our available time. We'd never measured it before.",
            },
            {
              i: "SC",
              n: "Sarah C.",
              r: "Operations Director, Quebec",
              q: "Our operators were skeptical. Two weeks in, they're the ones reminding each other to log stops because they can see the numbers in real time. Simple is what made it stick.",
            },
            {
              i: "RL",
              n: "Robert L.",
              r: "Plant Manager, Alberta",
              q: "Enterprise OEE platforms want $2,000 a month and six months to set up. Easy OEE was running on our floor the same afternoon we signed up. The difference is night and day.",
            },
          ].map((p, idx) => (
            <div key={p.i} className={`pc fi d${idx + 1}`}>
              <div className="stars" aria-label="5 out of 5 stars">
                {[0,1,2,3,4].map((i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ display: "inline-block", marginRight: 2 }}>
                    <path d="M8 0l2.36 5.13L16 5.94l-4 3.94.94 5.6L8 12.8 3.06 15.48 4 9.88 0 5.94l5.64-.81L8 0z" />
                  </svg>
                ))}
              </div>
              <p className="pq">&ldquo;{p.q}&rdquo;</p>
              <div className="pa">
                <div className="av">{p.i}</div>
                <div>
                  <div className="an">{p.n}</div>
                  <div className="ar">{p.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING TEASE */}
      <div className="pt">
        <div className="fi">
          <div className="tag">Pricing</div>
          <h2>
            STARTS AT $99/LINE/MONTH.
            <br />
            NO SETUP FEES. EVER.
          </h2>
          <p className="pt-intro">
            Priced per production line. You only pay for the lines you track. A single hour of
            downtime costs more than a full month of Easy OEE. The math is obvious on day one.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/pricing" className="btn-y" style={{ padding: "13px 26px", fontSize: 14 }}>
              See Full Pricing →
            </Link>
            <Link
              href="/roi-calculator"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "13px 26px",
                fontSize: 14,
                color: "var(--muted2)",
                textDecoration: "none",
                border: "1px solid var(--border2)",
                borderRadius: 2,
              }}
            >
              Calculate Your ROI →
            </Link>
          </div>
        </div>
        <div className="fi d2">
          <div className="roi-box">
            <div className="roi-title">THE MATH IS SIMPLE</div>
            <p>
              If your line runs 480 minutes per shift and your OEE is 65%, you&apos;re losing 168
              minutes of potential production every single shift.
            </p>
            <p>
              At a conservative $85/minute throughput value, that&apos;s{" "}
              <strong>$14,280 lost per week</strong> on a single line.
            </p>
            <p>Easy OEE Professional covers up to 5 lines for $249/month.</p>
            <p style={{ color: "var(--accent)", marginTop: 4 }}>
              A 5% OEE improvement returns the entire annual cost in under 3 days.
            </p>
          </div>
        </div>
      </div>

      {/* CTA BAND */}
      <div className="cta-band">
        <div>
          <h2>READY TO SEE YOUR REAL OEE?</h2>
          <p>
            Book a free 30-minute demo. We&apos;ll walk through the platform live using your own
            line setup. No slides, no pitch.
          </p>
          <p className="cta-sub">14-day free trial included. No credit card required.</p>
        </div>
        <Link href="/contact" className="btn-dk">
          Book Your Free Demo →
        </Link>
      </div>
    </>
  );
}
