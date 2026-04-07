import Link from "next/link";

export const metadata = { title: "Pricing | Easy OEE" };

const tiers = [
  {
    name: "Starter",
    price: "$49",
    desc: "For single-line operations getting started with OEE tracking.",
    features: [
      "1 production line",
      "Up to 5 operators",
      "All 10 stop reason categories",
      "Real-time OEE dashboard",
      "Shift summary reports",
      "90-day data history",
    ],
  },
  {
    name: "Professional",
    price: "$129",
    desc: "Most popular. For multi-line plants ready to optimize.",
    featured: true,
    features: [
      "Up to 5 production lines",
      "Up to 25 operator accounts",
      "Multi-line comparison",
      "Supervisor dashboard",
      "CSV data export",
      "1-year data history",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For 5+ lines, multi-plant operations, or custom needs.",
    features: [
      "Unlimited lines and operators",
      "Custom stop reason categories",
      "Multi-plant dashboard",
      "Dedicated onboarding",
      "SLA and priority support",
      "Unlimited history",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="sub-hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="sub-hero-inner fi">
          <div className="tag" style={{ justifyContent: "center", display: "inline-flex" }}>
            Pricing
          </div>
          <h1>SIMPLE. TRANSPARENT.</h1>
          <p className="sub-lead">
            Plans in CAD. 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      <section className="how-sec">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            maxWidth: 1200,
            margin: "0 auto",
          }}
          className="pricing-grid"
        >
          {tiers.map((t) => (
            <div
              key={t.name}
              style={{
                border: t.featured ? "1px solid var(--accent)" : "1px solid var(--border)",
                padding: 40,
                borderRadius: 6,
                background: t.featured ? "rgba(3,191,181,0.04)" : "transparent",
              }}
            >
              <div className="tag" style={{ marginBottom: 12 }}>
                {t.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: 72,
                  lineHeight: 1,
                  color: "var(--accent)",
                  marginBottom: 10,
                }}
              >
                {t.price}
                {t.price !== "Custom" && (
                  <span style={{ fontSize: 18, color: "var(--muted2)", marginLeft: 8 }}>
                    CAD/mo
                  </span>
                )}
              </div>
              <p style={{ color: "var(--muted2)", fontSize: 17, lineHeight: 1.6, marginBottom: 32, minHeight: 76 }}>
                {t.desc}
              </p>
              <Link
                href="/contact"
                className="btn-y"
                style={{ display: "block", textAlign: "center", marginBottom: 28 }}
              >
                Start Free Trial
              </Link>
              <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 14 }}>
                {t.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      color: "var(--muted2)",
                      fontSize: 16,
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      lineHeight: 1.5,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--accent)", flexShrink: 0, marginTop: 4 }}>
                      <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
