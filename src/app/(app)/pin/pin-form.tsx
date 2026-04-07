"use client";

import { useActionState, useState } from "react";
import { verifyPin, type PinState } from "@/server/actions/operator-auth";

type Operator = { id: string; fullName: string };

export function PinForm({ operators }: { operators: Operator[] }) {
  const [operatorId, setOperatorId] = useState<string>(operators[0]?.id ?? "");
  const [pin, setPin] = useState("");
  const [state, formAction, pending] = useActionState<PinState, FormData>(verifyPin, {});

  const tap = (digit: string) => {
    if (pin.length >= 4) return;
    setPin(pin + digit);
  };
  const back = () => setPin(pin.slice(0, -1));
  const clear = () => setPin("");

  return (
    <form action={formAction}>
      <label className="field-label">Operator</label>
      <select
        className="field"
        name="operatorId"
        value={operatorId}
        onChange={(e) => setOperatorId(e.target.value)}
        style={{ marginBottom: 24 }}
      >
        {operators.length === 0 && <option value="">No operators seeded</option>}
        {operators.map((o) => (
          <option key={o.id} value={o.id}>
            {o.fullName}
          </option>
        ))}
      </select>

      <input type="hidden" name="pin" value={pin} />
      <div className="pin-display">{pin.padEnd(4, "•").split("").join(" ")}</div>

      <div className="pin-pad">
        {["1","2","3","4","5","6","7","8","9"].map((d) => (
          <button type="button" key={d} className="pin-key" onClick={() => tap(d)}>
            {d}
          </button>
        ))}
        <button type="button" className="pin-key" onClick={clear}>C</button>
        <button type="button" className="pin-key" onClick={() => tap("0")}>0</button>
        <button type="button" className="pin-key" onClick={back}>←</button>
      </div>

      {state.error && (
        <p style={{ color: "#ff7a7a", marginTop: 18, textAlign: "center" }}>{state.error}</p>
      )}

      <button
        type="submit"
        className="btn"
        disabled={pending || pin.length !== 4 || !operatorId}
        style={{ width: "100%", marginTop: 24, opacity: pin.length === 4 && !pending ? 1 : 0.5 }}
      >
        {pending ? "Signing in…" : "SIGN IN"}
      </button>
    </form>
  );
}
