import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Easy OEE",
  description: "The terms governing use of the Easy OEE platform.",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "180px 32px 120px" }}>
      <div className="tag">Legal</div>
      <h1 style={{ marginBottom: 14, fontSize: "clamp(48px, 7vw, 88px)" }}>TERMS OF SERVICE</h1>
      <p style={{ color: "var(--muted)", fontFamily: "var(--font-dm-mono)", fontSize: 13, letterSpacing: 1.5 }}>
        Last updated: April 2026
      </p>

      <div style={{ marginTop: 56, color: "var(--muted2)", lineHeight: 1.8, fontSize: 18 }}>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Easy
          OEE software-as-a-service platform operated by Easy OEE Inc. (&quot;Easy OEE,&quot;
          &quot;we,&quot; &quot;us&quot;). By creating an account or using the service you agree
          to these Terms.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>THE SERVICE</h2>
        <p>
          Easy OEE provides web-based tools for tracking Overall Equipment Effectiveness and
          related production metrics. We may add, modify, or remove features over time.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>YOUR ACCOUNT</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials
          and for all activity that occurs under your account. You must promptly notify us of any
          unauthorized use.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>YOUR DATA</h2>
        <p>
          You retain ownership of all data you submit to Easy OEE. You grant us a limited license
          to host, process, and display that data solely to provide the service. We will not sell
          your data, share it with third parties for marketing, or use it to train AI models.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>FEES & BILLING</h2>
        <p>
          Paid plans are billed in advance on a monthly or annual basis. Fees are non-refundable
          except where required by law. We may change pricing with at least 30 days&apos; notice
          before your next renewal.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>ACCEPTABLE USE</h2>
        <p>
          You agree not to misuse the service, including attempting to gain unauthorized access,
          interfering with operation, reverse engineering, or using it to violate any law.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>DISCLAIMER</h2>
        <p>
          Easy OEE is provided &quot;as is&quot; without warranties of any kind. We do not
          guarantee that the service will be uninterrupted or error-free. Production decisions
          based on data displayed in Easy OEE remain your responsibility.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>LIMITATION OF LIABILITY</h2>
        <p>
          To the maximum extent permitted by law, Easy OEE&apos;s total liability for any claim
          arising out of these Terms or the service is limited to the fees you paid in the twelve
          months preceding the claim.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>GOVERNING LAW</h2>
        <p>
          These Terms are governed by the laws of the Province of Ontario, Canada, without
          regard to conflict-of-laws principles.
        </p>

        <h2 style={{ fontSize: 28, marginTop: 48, marginBottom: 16 }}>CONTACT</h2>
        <p>
          Questions about these Terms?{" "}
          <a href="mailto:legal@easy-oee.com" style={{ color: "var(--accent)" }}>
            legal@easy-oee.com
          </a>
        </p>
      </div>

      <p style={{ marginTop: 64 }}>
        <Link href="/" style={{ color: "var(--accent)" }}>← Back home</Link>
      </p>
    </main>
  );
}
