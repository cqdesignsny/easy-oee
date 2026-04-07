import Link from "next/link";
import { HomeHero } from "@/components/marketing/HomeHero";
import { getServerT } from "@/components/i18n/server";

export default async function HomePage() {
  const t = await getServerT();

  const stats = [
    { n: t("home.stat1.n"), l: t("home.stat1.l") },
    { n: t("home.stat2.n"), l: t("home.stat2.l") },
    { n: t("home.stat3.n"), l: t("home.stat3.l") },
    { n: t("home.stat4.n"), l: t("home.stat4.l") },
  ];

  const pains = [
    { n: "01", strong: t("home.problem.p1.strong"), rest: t("home.problem.p1.rest") },
    { n: "02", strong: t("home.problem.p2.strong"), rest: t("home.problem.p2.rest") },
    { n: "03", strong: t("home.problem.p3.strong"), rest: t("home.problem.p3.rest") },
    { n: "04", strong: t("home.problem.p4.strong"), rest: t("home.problem.p4.rest") },
  ];

  const pills = [
    t("home.sol.pill1"),
    t("home.sol.pill2"),
    t("home.sol.pill3"),
    t("home.sol.pill4"),
    t("home.sol.pill5"),
  ];

  const steps = [
    { n: "1", title: t("home.how.s1.title"), body: t("home.how.s1.body") },
    { n: "2", title: t("home.how.s2.title"), body: t("home.how.s2.body") },
    { n: "3", title: t("home.how.s3.title"), body: t("home.how.s3.body") },
  ];

  const features = [
    { title: t("home.feat.f1.title"), body: t("home.feat.f1.body") },
    { title: t("home.feat.f2.title"), body: t("home.feat.f2.body") },
    { title: t("home.feat.f3.title"), body: t("home.feat.f3.body") },
    { title: t("home.feat.f4.title"), body: t("home.feat.f4.body") },
    { title: t("home.feat.f5.title"), body: t("home.feat.f5.body"), red: true },
    { title: t("home.feat.f6.title"), body: t("home.feat.f6.body"), red: true },
  ];

  const proofs = [
    { i: "DM", n: "Derek M.", r: t("home.proof.t1.role"), q: t("home.proof.t1.q") },
    { i: "SC", n: "Sarah C.", r: t("home.proof.t2.role"), q: t("home.proof.t2.q") },
    { i: "RL", n: "Robert L.", r: t("home.proof.t3.role"), q: t("home.proof.t3.q") },
  ];

  const stepIcons = [
    <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>,
    <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
    <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>,
  ];

  return (
    <>
      <HomeHero />

      {/* STATS BAR */}
      <div className="stats-bar">
        {stats.map((s, i) => (
          <div key={s.n + i} className={`stat fi${i ? ` d${i}` : ""}`}>
            <div className="stat-n">{s.n}</div>
            <div className="stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* PROBLEM */}
      <div className="problem">
        <div className="fi">
          <div className="tag">{t("home.problem.tag")}</div>
          <h2>{t("home.problem.title")}</h2>
          <p className="problem-intro">{t("home.problem.intro")}</p>
          <div className="pain-list">
            {pains.map((p) => (
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
              <span className="dash-lbl">{t("home.dash.live")}</span>
              <span className="dash-live">{t("home.dash.running")}</span>
            </div>
            <div className="oee-g">
              <div className="oee-c">
                <div className="oee-lb">{t("home.dash.availability")}</div>
                <div className="oee-v">91%</div>
                <div className="oee-br"><div className="oee-f" style={{ width: "91%" }} /></div>
              </div>
              <div className="oee-c">
                <div className="oee-lb">{t("home.dash.performance")}</div>
                <div className="oee-v w">78%</div>
                <div className="oee-br"><div className="oee-f w" style={{ width: "78%" }} /></div>
              </div>
              <div className="oee-c">
                <div className="oee-lb">{t("home.dash.quality")}</div>
                <div className="oee-v">98%</div>
                <div className="oee-br"><div className="oee-f" style={{ width: "98%" }} /></div>
              </div>
            </div>
            <div className="oee-main">
              <div className="oee-lb">{t("home.dash.oeeScore")}</div>
              <div className="oee-big">69%</div>
              <div className="oee-br" style={{ height: 3, marginTop: 10 }}>
                <div className="oee-f w" style={{ width: "69%" }} />
              </div>
            </div>
            <div className="dash-lbl" style={{ marginBottom: 9 }}>
              {t("home.dash.recentStops")}
            </div>
            {[
              [t("stop.01.label"), "18 min", "09:14"],
              [t("stop.03.label"), "7 min", "10:32"],
              [t("stop.02.label"), "22 min", "11:05"],
            ].map(([reason, mins, time]) => (
              <div key={String(reason) + String(time)} className="sr">
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
          <div className="tag">{t("home.sol.tag")}</div>
          <h2>{t("home.sol.title")}</h2>
        </div>
        <div className="sol-inner">
          <div className="fi d1">
            <p className="sol-body">{t("home.sol.body")}</p>
            <p className="sol-body-strong">{t("home.sol.bodyStrong")}</p>
            <div className="pills">
              {pills.map((p) => (
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
              {t("home.sol.cta")} →
            </Link>
          </div>
          <div className="fi d2">
            <div className="pull">
              &ldquo;{t("home.sol.pull")}
              <br />
              <span>
                {t("home.sol.pull2")}
                <br />
                {t("home.sol.pull3")}&rdquo;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-sec">
        <div className="fi">
          <div className="tag">{t("home.how.tag")}</div>
          <h2>{t("home.how.title")}</h2>
          <p className="how-intro">{t("home.how.intro")}</p>
        </div>
        <div className="steps fi d1">
          {steps.map((s, idx) => (
            <div key={s.n} className="step">
              <span className="step-bnum">{s.n}</span>
              <div className="step-ic">{stepIcons[idx]}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="feat-sec" id="features">
        <div className="fi">
          <div className="tag">{t("home.feat.tag")}</div>
          <h2>{t("home.feat.title")}</h2>
          <p className="how-intro">{t("home.feat.intro")}</p>
        </div>
        <div className="feat-grid fi d1">
          {features.map((f) => (
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
          <div className="tag">{t("home.proof.tag")}</div>
          <h2>{t("home.proof.title")}</h2>
        </div>
        <div className="proof-grid">
          {proofs.map((p, idx) => (
            <div key={p.i} className={`pc fi d${idx + 1}`}>
              <div className="stars" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => (
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
          <div className="tag">{t("home.pt.tag")}</div>
          <h2>
            {t("home.pt.title.line1")}
            <br />
            {t("home.pt.title.line2")}
          </h2>
          <p className="pt-intro">{t("home.pt.intro")}</p>
          <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/pricing" className="btn-y" style={{ padding: "13px 26px", fontSize: 14 }}>
              {t("home.pt.cta1")} →
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
                borderRadius: 999,
              }}
            >
              {t("home.pt.cta2")} →
            </Link>
          </div>
        </div>
        <div className="fi d2">
          <div className="roi-box">
            <div className="roi-title">{t("home.pt.roi.title")}</div>
            <p>{t("home.pt.roi.p1")}</p>
            <p>
              {t("home.pt.roi.p2.before")}
              <strong>{t("home.pt.roi.p2.strong")}</strong>
              {t("home.pt.roi.p2.after")}
            </p>
            <p>{t("home.pt.roi.p3")}</p>
            <p style={{ color: "var(--accent)", marginTop: 4 }}>{t("home.pt.roi.p4")}</p>
          </div>
        </div>
      </div>

      {/* CTA BAND */}
      <div className="cta-band">
        <div>
          <h2>{t("home.cta.title")}</h2>
          <p>{t("home.cta.body")}</p>
          <p className="cta-sub">{t("home.cta.sub")}</p>
        </div>
        <Link href="/contact" className="btn-dk">
          {t("home.cta.button")} →
        </Link>
      </div>
    </>
  );
}
