"use client";

import { useState } from "react";
import { fmtCAD, fmtUSD, monthlyCostUSD, usdToCad, type PlanId } from "@/lib/pricing";
import { useT } from "@/components/i18n/LanguageProvider";

export function SignUpClient({
  initialPlan,
  initialLines,
}: {
  initialPlan: PlanId;
  initialLines: number;
}) {
  const t = useT();
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [lines, setLines] = useState(initialLines);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const usd = monthlyCostUSD(plan, lines);
  const cad = usdToCad(usd);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: when Stripe is wired, this will:
    //   1. POST to /api/checkout/session with { plan, lines, companyName, email }
    //   2. Server creates a Stripe Customer + Checkout Session
    //   3. redirect to session.url
    //   4. Stripe webhook /api/webhooks/stripe creates Company + grants access on success
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div
        className="card"
        style={{
          padding: 48,
          textAlign: "center",
          border: "1px solid var(--accent)",
          background: "rgba(3,191,181,0.04)",
        }}
      >
        <div style={{ fontFamily: "var(--font-bebas)", fontSize: 56, color: "var(--accent)", marginBottom: 14 }}>
          YOU&apos;RE ON THE LIST
        </div>
        <p style={{ color: "var(--muted2)", fontSize: 17, lineHeight: 1.7 }}>
          Stripe checkout will go here once we wire it up. For now we&apos;ve saved your
          interest at <strong style={{ color: "var(--white)" }}>{email || companyName}</strong>{" "}
          and someone from the team will reach out within one business day to get you running.
        </p>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 24 }}>
          (Want immediate access? Use the demo password on{" "}
          <a href="/sign-in" style={{ color: "var(--accent)" }}>/sign-in</a>.)
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 36 }}>
      {/* Plan toggle */}
      <label className="field-label">Plan</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {(["starter", "pro"] as PlanId[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlan(p)}
            className={plan === p ? "btn" : "btn btn-ghost"}
            style={{ minHeight: 56 }}
          >
            {t(`pricing.${p}.name`)}
          </button>
        ))}
      </div>

      {/* Lines selector */}
      <label className="field-label">How many production lines?</label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontFamily: "var(--font-bebas)", fontSize: 56, color: "var(--accent)", lineHeight: 1 }}>
          {lines}
        </span>
        <span style={{ fontFamily: "var(--font-bebas)", fontSize: 32, color: "var(--white)" }}>
          {fmtUSD(usd)}{" "}
          <span style={{ fontSize: 14, color: "var(--muted2)" }}>USD/mo</span>
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={20}
        step={1}
        value={lines}
        onChange={(e) => setLines(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--accent)" }}
      />
      <p style={{ color: "var(--muted2)", fontSize: 13, marginTop: 6, marginBottom: 24, fontFamily: "var(--font-dm-mono)", letterSpacing: 0.5 }}>
        ≈ {fmtCAD(cad)} CAD/mo · billed monthly · cancel anytime
      </p>

      {/* Company + email */}
      <label className="field-label">Company name</label>
      <input
        className="field"
        type="text"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Maple Manufacturing"
        required
        style={{ marginBottom: 18 }}
      />

      <label className="field-label">Work email</label>
      <input
        className="field"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        required
        style={{ marginBottom: 24 }}
      />

      <button
        type="submit"
        className="btn"
        disabled={submitting}
        style={{ width: "100%", opacity: submitting ? 0.7 : 1 }}
      >
        {submitting ? "Starting trial…" : "START FREE TRIAL"}
      </button>

      <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 14, textAlign: "center" }}>
        Stripe checkout is being wired in. After we go live you&apos;ll be redirected to a
        secure Stripe page to confirm your card. No charge until day 15.
      </p>
    </form>
  );
}
