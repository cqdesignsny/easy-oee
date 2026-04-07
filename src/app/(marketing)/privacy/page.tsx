import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Easy OEE",
  description: "How Easy OEE collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "180px 32px 120px" }}>
      <div className="tag">Legal</div>
      <h1 style={{ marginBottom: 14, fontSize: "clamp(48px, 7vw, 88px)" }}>PRIVACY POLICY</h1>
      <p style={{ color: "var(--muted)", fontFamily: "var(--font-dm-mono)", fontSize: 13, letterSpacing: 1.5 }}>
        Last updated: April 2026
      </p>

      <div style={{ marginTop: 56, color: "var(--muted2)", lineHeight: 1.8, fontSize: 18 }}>
        <p>
          Easy OEE Inc. (&quot;Easy OEE,&quot; &quot;we,&quot; &quot;us&quot;) operates the Easy
          OEE software-as-a-service platform at easy-oee.com. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>WHAT WE COLLECT</h2>
        <p>
          <strong>Account information.</strong> When you sign up we collect your name, email
          address, company name, and authentication identifiers from our auth provider (Clerk).
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>Production data.</strong> Shift records, machine stops, parts counts, OEE
          metrics, and operator activity that you and your team enter into the platform.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>Operational telemetry.</strong> Standard server logs (IP address, user agent,
          request timestamps) for security, debugging, and abuse prevention.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>HOW WE USE IT</h2>
        <ul style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
          <li>To provide and operate the Easy OEE service.</li>
          <li>To compute and display OEE metrics for your team.</li>
          <li>To send you operational and account-related emails.</li>
          <li>To improve product reliability and detect abuse.</li>
        </ul>
        <p style={{ marginTop: 16 }}>
          We do not sell your data. We do not use your production data to train AI models.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>WHERE IT&apos;S STORED</h2>
        <p>
          Easy OEE runs on Vercel (application hosting) and Neon (Postgres database). Both
          providers store data in North American regions. Authentication is handled by Clerk.
          Payments, when applicable, are handled by Stripe.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>YOUR RIGHTS</h2>
        <p>
          You may request a copy of your data, ask us to correct or delete it, or close your
          account at any time. Email{" "}
          <a href="mailto:privacy@easy-oee.com" style={{ color: "var(--accent)" }}>
            privacy@easy-oee.com
          </a>
          .
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>CONTACT</h2>
        <p>
          Easy OEE Inc.
          <br />
          Email:{" "}
          <a href="mailto:privacy@easy-oee.com" style={{ color: "var(--accent)" }}>
            privacy@easy-oee.com
          </a>
        </p>
      </div>

      <p style={{ marginTop: 64 }}>
        <Link href="/" style={{ color: "var(--accent)" }}>← Back home</Link>
      </p>
    </main>
  );
}
