import { db } from "@/lib/db/client";
import { demoLead } from "@/lib/db/schema";
import { z } from "zod";
import { redirect } from "next/navigation";

export const metadata = { title: "Book a Demo — Easy OEE" };

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
  background: "rgba(245,242,237,0.04)",
  border: "1px solid var(--border)",
  borderRadius: 2,
  padding: "14px 16px",
  color: "var(--white)",
  fontSize: 14,
  fontFamily: "var(--font-dm-sans)",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-dm-mono)",
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 8,
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const isSuccess = sp.success === "1";

  return (
    <main className="eo-section" style={{ paddingTop: 160, minHeight: "100vh" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div className="section-tag">Book a Demo</div>
        <h1 className="eo-h2">SEE YOUR REAL OEE.</h1>
        <p className="section-intro" style={{ marginBottom: 48 }}>
          30-minute walkthrough on Zoom. We&apos;ll show you the platform with sample plant data
          and answer your questions.
        </p>

        {isSuccess ? (
          <div
            style={{
              border: "1px solid var(--accent)",
              padding: 40,
              borderRadius: 4,
              background: "rgba(232,255,71,0.04)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: 48,
                color: "var(--accent)",
                marginBottom: 12,
              }}
            >
              REQUEST RECEIVED
            </div>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Thanks. We&apos;ll be in touch within one business day to schedule your demo.
            </p>
          </div>
        ) : (
          <form action={submitLead} style={{ display: "grid", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <label style={labelStyle}>First name</label>
                <input style={inputStyle} name="firstName" required />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input style={inputStyle} name="lastName" required />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Work email</label>
              <input style={inputStyle} name="email" type="email" required />
            </div>
            <div>
              <label style={labelStyle}>Company</label>
              <input style={inputStyle} name="companyName" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <label style={labelStyle}>Province</label>
                <select style={inputStyle} name="province">
                  <option value="">Select…</option>
                  <option>Ontario</option>
                  <option>Quebec</option>
                  <option>British Columbia</option>
                  <option>Alberta</option>
                  <option>Manitoba</option>
                  <option>Saskatchewan</option>
                  <option>Nova Scotia</option>
                  <option>New Brunswick</option>
                  <option>Newfoundland and Labrador</option>
                  <option>Prince Edward Island</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Number of lines</label>
                <select style={inputStyle} name="numLines">
                  <option value="">Select…</option>
                  <option>1</option>
                  <option>2–5</option>
                  <option>6–10</option>
                  <option>10+</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Current OEE method</label>
              <select style={inputStyle} name="currentMethod">
                <option value="">Select…</option>
                <option>Not tracking yet</option>
                <option>Paper / whiteboard</option>
                <option>Excel / spreadsheets</option>
                <option>MES / enterprise system</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 120, fontFamily: "inherit" }}
                name="notes"
              />
            </div>
            <button type="submit" className="btn-primary" style={{ justifySelf: "start" }}>
              Request Demo →
            </button>
            {sp.error && (
              <p style={{ color: "var(--accent2)", fontSize: 13 }}>
                {sp.error === "invalid"
                  ? "Please check your inputs and try again."
                  : "Something went wrong on our side. Please try again or email hello@easy-oee.com."}
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
