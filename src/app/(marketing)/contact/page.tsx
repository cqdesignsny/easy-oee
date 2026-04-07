import { db } from "@/lib/db/client";
import { demoLead } from "@/lib/db/schema";
import { z } from "zod";
import { redirect } from "next/navigation";
import { getServerT } from "@/components/i18n/server";

export const metadata = { title: "Book a Demo | Easy OEE" };

const LeadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  companyName: z.string().min(1).max(200),
  province: z.string().max(100).optional().or(z.literal("")),
  numLines: z.string().max(50).optional().or(z.literal("")),
  currentMethod: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

async function submitLead(formData: FormData) {
  "use server";
  const parsed = LeadSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    companyName: formData.get("companyName"),
    province: formData.get("province") ?? "",
    numLines: formData.get("numLines") ?? "",
    currentMethod: formData.get("currentMethod") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    redirect("/contact?error=invalid");
  }

  try {
    await db.insert(demoLead).values({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      companyName: parsed.data.companyName,
      province: parsed.data.province || null,
      numLines: parsed.data.numLines || null,
      currentMethod: parsed.data.currentMethod || null,
      notes: parsed.data.notes || null,
    });
  } catch (err) {
    console.error("[contact] failed to save lead", err);
    redirect("/contact?error=server");
  }

  redirect("/contact?success=1");
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(239,245,249,0.04)",
  border: "1px solid var(--border2)",
  borderRadius: 6,
  padding: "16px 18px",
  color: "var(--white)",
  fontSize: 17,
  fontFamily: "var(--font-dm-sans)",
  minHeight: 56,
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-dm-mono)",
  fontSize: 12,
  letterSpacing: 2.5,
  textTransform: "uppercase",
  color: "var(--muted2)",
  marginBottom: 10,
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const isSuccess = sp.success === "1";
  const t = await getServerT();

  return (
    <>
      <section className="sub-hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="sub-hero-inner fi">
          <div className="tag" style={{ justifyContent: "center", display: "inline-flex" }}>
            {t("contact.eyebrow")}
          </div>
          <h1>{t("contact.h1")}</h1>
          <p className="sub-lead">{t("contact.sub")}</p>
        </div>
      </section>

      <section className="how-sec">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {isSuccess ? (
            <div
              style={{
                border: "1px solid var(--accent)",
                padding: 48,
                borderRadius: 8,
                background: "rgba(3,191,181,0.04)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: 64,
                  color: "var(--accent)",
                  marginBottom: 16,
                  letterSpacing: 1,
                }}
              >
                {t("contact.success.title")}
              </div>
              <p style={{ color: "var(--muted2)", lineHeight: 1.7, fontSize: 18 }}>
                {t("contact.success.body")}
              </p>
            </div>
          ) : (
            <form action={submitLead} style={{ display: "grid", gap: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <label style={labelStyle}>{t("contact.firstName")}</label>
                  <input style={inputStyle} name="firstName" required />
                </div>
                <div>
                  <label style={labelStyle}>{t("contact.lastName")}</label>
                  <input style={inputStyle} name="lastName" required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t("contact.email")}</label>
                <input style={inputStyle} name="email" type="email" required />
              </div>
              <div>
                <label style={labelStyle}>{t("contact.company")}</label>
                <input style={inputStyle} name="companyName" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <label style={labelStyle}>{t("contact.province")}</label>
                  <select style={inputStyle} name="province">
                    <option value="">{t("contact.select")}</option>
                    <option>Ontario</option>
                    <option>Quebec</option>
                    <option>British Columbia</option>
                    <option>Alberta</option>
                    <option>California</option>
                    <option>Texas</option>
                    <option>New York</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t("contact.numLines")}</label>
                  <select style={inputStyle} name="numLines">
                    <option value="">{t("contact.select")}</option>
                    <option>1</option>
                    <option>2 to 5</option>
                    <option>6 to 10</option>
                    <option>10+</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t("contact.method")}</label>
                <select style={inputStyle} name="currentMethod">
                  <option value="">{t("contact.select")}</option>
                  <option>{t("contact.method.none")}</option>
                  <option>{t("contact.method.paper")}</option>
                  <option>{t("contact.method.excel")}</option>
                  <option>{t("contact.method.mes")}</option>
                  <option>{t("contact.method.other")}</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t("contact.notes")}</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 140, fontFamily: "inherit" }}
                  name="notes"
                />
              </div>
              <button type="submit" className="btn-y" style={{ justifySelf: "start" }}>
                {t("contact.submit")}
              </button>
              {sp.error && (
                <p style={{ color: "#ff7a7a", fontSize: 15 }}>
                  {sp.error === "invalid"
                    ? t("contact.error.invalid")
                    : t("contact.error.server")}
                </p>
              )}
            </form>
          )}
        </div>
      </section>
    </>
  );
}
