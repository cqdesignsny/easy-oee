import Link from "next/link";

export const metadata = { title: "Pricing — Easy OEE" };

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
    desc: "Most popular — for multi-line plants ready to optimize.",
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
      "Unlimited lines & operators",
      "Custom stop reason categories",
      "Multi-plant dashboard",
      "Dedicated onboarding",
      "SLA + priority support",
      "Unlimited history",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="eo-section" style={{ paddingTop: 160, minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: 80 }}>
        <div className="section-tag">Pricing</div>
        <h1 className="eo-h2">SIMPLE. TRANSPARENT.</h1>
        <p className="section-intro" style={{ margin: "0 auto" }}>
          Plans in CAD. 14-day free trial. No credit card required.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {tiers.map((t) => (
          <div
            key={t.name}
            style={{
              border: t.featured
                ? "1px solid var(--accent)"
                : "1px solid var(--border)",
              padding: 40,
              borderRadius: 4,
              background: t.featured ? "rgba(232,255,71,0.04)" : "transparent",
            }}
          >
            <div className="section-tag" style={{ marginBottom: 12 }}>
              {t.name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: 64,
                lineHeight: 1,
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              {t.price}
              {t.price !== "Custom" && (
                <span style={{ fontSize: 16, color: "var(--muted)", marginLeft: 8 }}>
                  CAD/mo
                </span>
              )}
            </div>
            <p
              style={{
                color: "var(--muted)",
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 32,
                minHeight: 60,
              }}
            >
              {t.desc}
            </p>
            <Link
              href="/contact"
              className="btn-primary"
              style={{ display: "block", textAlign: "center", marginBottom: 28 }}
            >
              Start Free Trial
            </Link>
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
              {t.features.map((f) => (
                <li
                  key={f}
                  style={{
                    color: "var(--muted)",
                    fontSize: 14,
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ color: "var(--accent)" }}>→</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
