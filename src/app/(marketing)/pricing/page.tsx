import { PricingClient } from "./pricing-client";
import { getServerT } from "@/components/i18n/server";

export const metadata = { title: "Pricing | Easy OEE" };

export default async function PricingPage() {
  const t = await getServerT();
  return (
    <>
      <section className="sub-hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="sub-hero-inner fi">
          <div className="tag" style={{ justifyContent: "center", display: "inline-flex" }}>
            {t("pricing.eyebrow")}
          </div>
          <h1>{t("pricing.h1")}</h1>
          <p className="sub-lead">{t("pricing.sub")}</p>
        </div>
      </section>

      <PricingClient />
    </>
  );
}
