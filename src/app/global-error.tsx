"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[global-error]", error);
    }
  }, [error]);

  return (
    <html>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#003038",
          color: "#EFF5F9",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 480, padding: "40px 32px", textAlign: "center" }}>
          <div
            style={{
              color: "#03BFB5",
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Easy OEE
          </div>
          <h1
            style={{
              fontSize: 56,
              margin: "16px 0 8px 0",
              lineHeight: 1.1,
            }}
          >
            Something broke at the top level
          </h1>
          <p style={{ color: "rgba(239,245,249,0.65)", fontSize: 17, lineHeight: 1.5 }}>
            We&apos;ve been notified. Try again, or come back in a minute.
          </p>
          {error.digest ? (
            <p style={{ color: "rgba(239,245,249,0.4)", fontSize: 12, marginTop: 16 }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              marginTop: 32,
              background: "#03BFB5",
              color: "#003038",
              padding: "12px 32px",
              border: "none",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
