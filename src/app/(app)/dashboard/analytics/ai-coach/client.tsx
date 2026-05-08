"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/LanguageProvider";
import type { ActionPlan, CoachAnalysis } from "@/lib/ai/coach";
import { formatPlantDateTime } from "@/lib/time";

function pct(v: number | null): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function bucketClass(v: number | null): string {
  if (v == null) return "";
  if (v >= 0.85) return "oee-world-class";
  if (v >= 0.7) return "oee-good";
  if (v >= 0.5) return "oee-fair";
  return "oee-low";
}

function changeClass(v: number | null | undefined): string {
  if (v == null) return "";
  return v >= 0 ? "oee-world-class" : "oee-low";
}

export function AICoachClient({
  report,
  generatedAt,
  timezone,
}: {
  report: CoachAnalysis | null;
  generatedAt: string | null;
  timezone: string;
}) {
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actions, setActions] = useState<ActionPlan[]>(report?.actions ?? []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDetail, setEditDetail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleGenerate() {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/coach/generate", { method: "POST" });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setErrorMsg(body?.error ?? `Error ${res.status}`);
          return;
        }
        router.refresh();
      } catch (err) {
        setErrorMsg(String(err));
      }
    });
  }

  async function handleAction(
    actionId: string,
    status: "approved" | "edited" | "rejected",
    edits?: { title: string; detail: string },
  ) {
    const body: Record<string, string> = { actionId, status };
    if (edits) {
      body.editedTitle = edits.title;
      body.editedDetail = edits.detail;
    }

    const res = await fetch("/api/ai/coach/actions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;

    setActions((prev) =>
      prev.map((a) =>
        a.id === actionId
          ? {
              ...a,
              status,
              ...(edits ? { editedTitle: edits.title, editedDetail: edits.detail } : {}),
            }
          : a,
      ),
    );
    setEditingId(null);
  }

  const oeeChange = report?.oeeChange ?? null;

  return (
    <div>
      <div
        className="card"
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {report ? t("coach.status.available") : t("coach.status.empty")}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted2)" }}>
            {generatedAt
              ? `${t("coach.status.generatedOn")} ${formatPlantDateTime(generatedAt, timezone)}`
              : t("coach.status.firstRunHint")}
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="btn btn-primary"
          style={{ minWidth: 180 }}
        >
          {isPending
            ? t("coach.actions.generating")
            : report
              ? t("coach.actions.regenerate")
              : t("coach.actions.generate")}
        </button>
      </div>

      {errorMsg && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            borderColor: "rgba(248,113,113,0.3)",
            background: "rgba(248,113,113,0.05)",
            color: "var(--text)",
            fontSize: 13,
          }}
        >
          {t("coach.errors.prefix")} {errorMsg}
        </div>
      )}

      {report && (
        <>
          <div className="analytics-kpi-grid analytics-kpi-grid--3" style={{ marginBottom: 20 }}>
            <div className="card analytics-kpi-card">
              <div className="kpi-label">{t("coach.kpi.thisWeek")}</div>
              <div className={`kpi-big ${bucketClass(report.oeeThisWeek)}`}>
                {pct(report.oeeThisWeek)}
              </div>
            </div>
            <div className="card analytics-kpi-card">
              <div className="kpi-label">{t("coach.kpi.prevWeek")}</div>
              <div className={`kpi-big ${bucketClass(report.oeePrevWeek)}`}>
                {pct(report.oeePrevWeek)}
              </div>
            </div>
            <div className="card analytics-kpi-card">
              <div className="kpi-label">{t("coach.kpi.change")}</div>
              <div className={`kpi-big ${changeClass(oeeChange)}`}>
                {oeeChange == null
                  ? "—"
                  : `${oeeChange >= 0 ? "+" : ""}${(oeeChange * 100).toFixed(1)}%`}
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              marginBottom: 24,
              borderLeft: "3px solid var(--accent)",
            }}
          >
            <div className="kpi-label" style={{ marginBottom: 8 }}>
              {t("coach.summary.label")}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)" }}>
              {report.weekSummary}
            </p>
            {report.topInsight && (
              <p
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "var(--accent)",
                  fontWeight: 500,
                }}
              >
                {report.topInsight}
              </p>
            )}
          </div>

          <div className="kpi-label" style={{ marginBottom: 12 }}>
            {t("coach.actions.title")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {actions.map((action) => {
              const approved = action.status === "approved" || action.status === "edited";
              const rejected = action.status === "rejected";
              return (
                <div
                  key={action.id}
                  className="card"
                  style={{
                    borderColor: approved
                      ? "rgba(34,197,94,0.3)"
                      : rejected
                        ? "rgba(239,68,68,0.2)"
                        : "var(--border)",
                    opacity: rejected ? 0.55 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(110,179,250,0.12)",
                        color: "var(--blue, #60a5fa)",
                        fontSize: 12,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {action.priority}
                    </div>
                    <div style={{ flex: 1 }}>
                      {editingId === action.id ? (
                        <>
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="app-input"
                            style={{ width: "100%", marginBottom: 8 }}
                          />
                          <textarea
                            value={editDetail}
                            onChange={(e) => setEditDetail(e.target.value)}
                            rows={3}
                            className="app-input"
                            style={{ width: "100%", resize: "vertical" }}
                          />
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                            {action.status === "edited" && action.editedTitle
                              ? action.editedTitle
                              : action.title}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--muted)",
                              lineHeight: 1.6,
                              marginBottom: 6,
                            }}
                          >
                            {action.status === "edited" && action.editedDetail
                              ? action.editedDetail
                              : action.detail}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted2)" }}>
                            {t("coach.actions.responsible")}: {action.responsible}
                          </div>
                        </>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--oee-world-class, #22c55e)",
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        padding: "3px 10px",
                        borderRadius: 999,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {action.estimatedOeeImpact}
                    </div>
                  </div>

                  {action.status === "pending" && editingId !== action.id && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => handleAction(action.id, "approved")}
                        className="btn"
                        style={{
                          padding: "6px 16px",
                          fontSize: 12,
                          border: "1px solid rgba(34,197,94,0.3)",
                          background: "rgba(34,197,94,0.08)",
                          color: "#22c55e",
                        }}
                      >
                        {t("coach.actions.approve")}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(action.id);
                          setEditTitle(action.title);
                          setEditDetail(action.detail);
                        }}
                        className="btn btn-ghost"
                        style={{ padding: "6px 14px", fontSize: 12 }}
                      >
                        {t("coach.actions.edit")}
                      </button>
                      <button
                        onClick={() => handleAction(action.id, "rejected")}
                        className="btn"
                        style={{
                          padding: "6px 14px",
                          fontSize: 12,
                          border: "1px solid rgba(239,68,68,0.2)",
                          background: "transparent",
                          color: "var(--red, #f87171)",
                        }}
                      >
                        {t("coach.actions.reject")}
                      </button>
                    </div>
                  )}

                  {editingId === action.id && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() =>
                          handleAction(action.id, "edited", {
                            title: editTitle,
                            detail: editDetail,
                          })
                        }
                        className="btn"
                        style={{
                          padding: "6px 16px",
                          fontSize: 12,
                          border: "1px solid rgba(34,197,94,0.3)",
                          background: "rgba(34,197,94,0.08)",
                          color: "#22c55e",
                        }}
                      >
                        {t("coach.actions.save")}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn btn-ghost"
                        style={{ padding: "6px 14px", fontSize: 12 }}
                      >
                        {t("coach.actions.cancel")}
                      </button>
                    </div>
                  )}

                  {approved && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: "#22c55e",
                        fontWeight: 500,
                      }}
                    >
                      {action.status === "edited"
                        ? t("coach.actions.approvedWithEdits")
                        : t("coach.actions.approvedTag")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
