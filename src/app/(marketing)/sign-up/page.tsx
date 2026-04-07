import Link from "next/link";
import { SignUpClient } from "./sign-up-client";
import { getServerT } from "@/components/i18n/server";

export const metadata = { title: "Start Free Trial | Easy OEE" };
export const dynamic = "force-dynamic";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; lines?: string }>;
}) {
  const sp = await searchParams;
  const t = await getServerT();
  const planFromUrl = (sp.plan === "starter" || sp.plan === "pro" ? sp.plan : "pro") as
    | "starter"
    | "pro";
  const linesFromUrl = Math.max(1, Math.min(20, Number(sp.lines) || 2));

  return (
    <>
      <section className="sub-hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="sub-hero-inner fi">
          <div className="tag" style={{ justifyContent: "center", display: "inline-flex" }}>
            {t("nav.signIn")}
          </div>
          <h1>
            START YOUR
            <br />
            <em>FREE TRIAL.</em>
          </h1>
          <p className="sub-lead">
            14-day free trial. No credit card required to start. Pay only when you&apos;re ready
            to keep tracking.
          </p>
        </div>
      </section>

      <section className="how-sec">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <SignUpClient initialPlan={planFromUrl} initialLines={linesFromUrl} />

          <p style={{ textAlign: "center", marginTop: 32, color: "var(--muted2)" }}>
            Already have an account?{" "}
            <Link href="/sign-in" style={{ color: "var(--accent)" }}>
              Sign in here
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
