import { listOperators } from "@/server/actions/operator-auth";
import { PinForm } from "./pin-form";

export const metadata = { title: "Sign In — Easy OEE" };
export const dynamic = "force-dynamic";

export default async function PinPage() {
  const operators = await listOperators();

  return (
    <main className="op-shell" style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div className="app-tag">Operator Sign In</div>
        <h1 className="app-h1">PICK YOUR NAME</h1>
        <p style={{ color: "var(--muted2)", margin: "12px 0 28px" }}>
          Then enter your 4-digit PIN.
        </p>
        <PinForm operators={operators} />
      </div>
    </main>
  );
}
