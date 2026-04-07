import Link from "next/link";
import { getServerT } from "@/components/i18n/server";

export const metadata = {
  title: "How Easy OEE Works | Real-Time OEE in 3 Steps",
  description:
    "From operator login to live OEE dashboard in under 60 seconds. See exactly how Easy OEE works on the shop floor.",
};

const STOP_NUMS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"] as const;

export default async function HowItWorksPage() {
  const t = await getServerT();

  const stops = STOP_NUMS.map((n) => ({
    n,
    label: t(`stop.${n}.label`),
    desc: t(`stop.${n}.desc`),
  }));

  const faqs = [
    { q: t("how.faq.q1"), a: t("how.faq.a1") },
    { q: t("how.faq.q2"), a: t("how.faq.a2") },
    { q: t("how.faq.q3"), a: t("how.faq.a3") },
    { q: t("how.faq.q4"), a: t("how.faq.a4") },
    { q: t("how.faq.q5"), a: t("how.faq.a5") },
  ];

  return (
    <>
      <section className="sub-hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="sub-hero-inner fi">
          <div className="tag" style={{ justifyContent: "center", display: "inline-flex" }}>
            {t("how.eyebrow")}
          </div>
          <h1>
            {t("how.h1.line1")}
            <br />
            <em>{t("how.h1.line2")}</em>
          </h1>
          <p className="sub-lead">{t("how.sub")}</p>
        </div>
      </section>

      <section className="how-sec">
        <div className="center-block">
          <div className="tag">{t("how.steps.tag")}</div>
          <h2>{t("how.steps.title")}</h2>
          <p className="how-intro" style={{ marginInline: "auto" }}>{t("how.steps.intro")}</p>
        </div>

        <div className="steps">
          <div className="step fi">
            <div className="step-bnum">01</div>
            <h3>{t("how.s1.title")}</h3>
            <p>{t("how.s1.p1")}</p>
            <p>{t("how.s1.p2")}</p>
            <p style={{ color: "var(--accent)", fontWeight: 500 }}>{t("how.s1.p3")}</p>
          </div>

          <div className="step fi d1">
            <div className="step-bnum">02</div>
            <h3>{t("how.s2.title")}</h3>
            <p>{t("how.s2.p1")}</p>
            <p>{t("how.s2.p2")}</p>
            <p>{t("how.s2.p3")}</p>
          </div>

          <div className="step fi d2">
            <div className="step-bnum">03</div>
            <h3>{t("how.s3.title")}</h3>
            <p>{t("how.s3.p1")}</p>
            <p>{t("how.s3.p2")}</p>
            <p style={{ color: "var(--accent)", fontWeight: 500 }}>{t("how.s3.p3")}</p>
          </div>
        </div>
      </section>

      <section className="feat-sec">
        <div className="center-block">
          <div className="tag">{t("how.stops.tag")}</div>
          <h2>{t("how.stops.title")}</h2>
          <p className="how-intro" style={{ marginInline: "auto" }}>{t("how.stops.intro")}</p>
        </div>

        <div className="stop-list">
          {stops.map((s) => (
            <div key={s.n} className="stop-list-row">
              <span className="stop-num">{s.n}</span>
              <span className="stop-label">{s.label}</span>
              <span className="stop-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="how-sec">
        <div className="center-block">
          <div className="tag">{t("how.math.tag")}</div>
          <h2>{t("how.math.title")}</h2>
          <p className="how-intro" style={{ marginInline: "auto" }}>{t("how.math.intro")}</p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-bnum">A</div>
            <h3>{t("how.math.a.title")}</h3>
            <p style={{ color: "var(--accent)", fontFamily: "var(--font-dm-mono)", fontSize: 14 }}>
              {t("how.math.a.formula")}
            </p>
            <p>{t("how.math.a.body")}</p>
          </div>
          <div className="step">
            <div className="step-bnum">P</div>
            <h3>{t("how.math.p.title")}</h3>
            <p style={{ color: "var(--accent)", fontFamily: "var(--font-dm-mono)", fontSize: 14 }}>
              {t("how.math.p.formula")}
            </p>
            <p>{t("how.math.p.body")}</p>
          </div>
          <div className="step">
            <div className="step-bnum">Q</div>
            <h3>{t("how.math.q.title")}</h3>
            <p style={{ color: "var(--accent)", fontFamily: "var(--font-dm-mono)", fontSize: 14 }}>
              {t("how.math.q.formula")}
            </p>
            <p>{t("how.math.q.body")}</p>
          </div>
        </div>

        <div className="formula-final">
          <div className="tag" style={{ justifyContent: "center", display: "inline-flex" }}>
            {t("how.math.final.tag")}
          </div>
          <h2>{t("how.math.final.title")}</h2>
          <p>{t("how.math.final.scale")}</p>
        </div>
      </section>

      <section className="feat-sec">
        <div className="center-block">
          <div className="tag">{t("how.start.tag")}</div>
          <h2>{t("how.start.title")}</h2>
          <p className="how-intro" style={{ marginInline: "auto" }}>{t("how.start.intro")}</p>
        </div>

        <div className="steps" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { n: "1", title: t("how.start.s1.title"), body: t("how.start.s1.body") },
            { n: "2", title: t("how.start.s2.title"), body: t("how.start.s2.body") },
            { n: "3", title: t("how.start.s3.title"), body: t("how.start.s3.body") },
            { n: "4", title: t("how.start.s4.title"), body: t("how.start.s4.body") },
          ].map((s) => (
            <div className="step" key={s.n}>
              <div className="step-bnum">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <Link href="/sign-up" className="btn-y">
            {t("how.start.cta")}
          </Link>
        </div>
      </section>

      <section className="how-sec">
        <div className="center-block">
          <div className="tag">{t("how.faq.tag")}</div>
          <h2>{t("how.faq.title")}</h2>
        </div>

        <div className="faq-list">
          {faqs.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary className="faq-q">{f.q}</summary>
              <p className="faq-a">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div>
          <div className="tag" style={{ color: "var(--black)" }}>{t("how.ctaBand.tag")}</div>
          <h2>{t("how.ctaBand.title")}</h2>
          <p>{t("how.ctaBand.body")}</p>
        </div>
        <Link href="/contact" className="btn-y" style={{ background: "var(--black)", color: "var(--accent)" }}>
          {t("how.ctaBand.button")} →
        </Link>
      </section>
    </>
  );
}
