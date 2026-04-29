"use client";

/**
 * Fullscreen barcode/QR scanner modal.
 *
 * Tries the native `BarcodeDetector` API first (Chrome/Edge/Safari Tech
 * Preview), falls back to `@zxing/browser`. Releases the camera stream
 * cleanly on close.
 *
 * Props:
 *   open      — controls visibility
 *   onClose   — called when the user dismisses
 *   onDetect  — called once with the scanned text; the parent decides what
 *               to do with it (fill an input, copy to clipboard, etc.)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/components/i18n/LanguageProvider";

type Detector = {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
};

declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats?: string[] }) => Detector;
  }
}

export function ScanModal({
  open,
  onClose,
  onDetect,
}: {
  open: boolean;
  onClose: () => void;
  onDetect: (value: string) => void;
}) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stoppedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const cleanup = useCallback(() => {
    stoppedRef.current = true;
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    stoppedRef.current = false;
    setError(null);
    setStarting(true);

    let zxingControls: { stop?: () => void } | null = null;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (stoppedRef.current) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStarting(false);

        // Path A: native BarcodeDetector
        if (typeof window !== "undefined" && window.BarcodeDetector) {
          const detector = new window.BarcodeDetector({
            formats: [
              "code_128", "code_39", "code_93", "ean_13", "ean_8",
              "itf", "qr_code", "upc_a", "upc_e", "data_matrix", "pdf417", "aztec",
            ],
          });
          const tick = async () => {
            if (stoppedRef.current || !videoRef.current) return;
            try {
              const found = await detector.detect(videoRef.current);
              if (found && found.length > 0 && found[0].rawValue) {
                onDetect(found[0].rawValue);
                cleanup();
                return;
              }
            } catch {
              // ignore per-frame errors, keep looping
            }
            requestAnimationFrame(tick);
          };
          tick();
          return;
        }

        // Path B: @zxing/browser fallback
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromStream(
          stream,
          videoRef.current!,
          (res) => {
            if (res && !stoppedRef.current) {
              onDetect(res.getText());
              try { controls.stop(); } catch {}
              cleanup();
            }
          },
        );
        zxingControls = controls;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("Permission") || msg.includes("denied")) {
          setError(t("scan.errPerm"));
        } else if (msg.includes("NotFound") || msg.includes("not found")) {
          setError(t("scan.errNoCamera"));
        } else {
          setError(t("scan.errGeneric"));
        }
        setStarting(false);
      }
    })();

    return () => {
      try { zxingControls?.stop?.(); } catch {}
      cleanup();
    };
  }, [open, onDetect, cleanup, t]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
        }}
      >
        <strong style={{ fontFamily: "var(--font-bebas)", fontSize: 22, letterSpacing: 1 }}>
          {t("scan.title")}
        </strong>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 999,
            padding: "6px 14px",
            cursor: "pointer",
          }}
        >
          {t("scan.close")}
        </button>
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Reticle */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "min(80vw, 460px)",
              height: 200,
              border: "2px solid var(--accent)",
              borderRadius: 18,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            }}
          />
        </div>
        {(starting || error) && (
          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 24,
              padding: 14,
              borderRadius: 12,
              background: error ? "rgba(255,92,92,0.18)" : "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error ?? t("scan.starting")}
          </div>
        )}
      </div>
      <div
        style={{
          padding: "12px 16px 20px",
          color: "rgba(255,255,255,0.7)",
          fontSize: 13,
          textAlign: "center",
        }}
      >
        {t("scan.hint")}
      </div>
    </div>
  );
}
