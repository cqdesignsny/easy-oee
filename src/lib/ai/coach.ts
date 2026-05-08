/**
 * AI Coach — Anthropic-powered weekly OEE analysis.
 *
 * Reads the rolled-up week of plant data (from `getWeeklyContextForAI`)
 * and asks Claude Sonnet 4.6 to produce three prioritized action plans.
 * Output is structured JSON, parsed and stored on `company.ai_coach_report`.
 *
 * The system prompt is marked with `cache_control: ephemeral` so we get
 * a cache hit across the weekly cron's per-company iterations and any
 * manual re-runs in the same window.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { WeeklyContext } from "@/lib/db/queries/ai-context";

export const COACH_MODEL = "claude-sonnet-4-6";

export type CoachActionStatus = "pending" | "approved" | "edited" | "rejected";

export type ActionPlan = {
  id: string;
  priority: 1 | 2 | 3;
  title: string;
  detail: string;
  responsible: string;
  estimatedOeeImpact: string;
  status: CoachActionStatus;
  editedTitle?: string;
  editedDetail?: string;
};

export type CoachAnalysis = {
  weekSummary: string;
  topInsight: string;
  oeeThisWeek: number | null;
  oeePrevWeek: number | null;
  oeeChange: number | null;
  actions: ActionPlan[];
  generatedAt: string;
  locale: string;
};

export type CoachLocale = "en" | "es" | "fr";

const STOP_LABELS: Record<CoachLocale, Record<string, string>> = {
  en: {
    mechanical_failure: "mechanical failure",
    no_material: "no material",
    changeover: "changeover",
    quality_check: "quality check",
    scheduled_break: "scheduled break",
    no_operator: "no operator",
    maintenance: "maintenance",
    training: "training",
    no_production_scheduled: "no production scheduled",
    other: "other",
  },
  es: {
    mechanical_failure: "falla mecánica",
    no_material: "falta de material",
    changeover: "cambio de producto",
    quality_check: "control de calidad",
    scheduled_break: "descanso programado",
    no_operator: "falta de operario",
    maintenance: "mantenimiento",
    training: "capacitación",
    no_production_scheduled: "sin producción programada",
    other: "otro",
  },
  fr: {
    mechanical_failure: "panne mécanique",
    no_material: "manque de matière",
    changeover: "changement de produit",
    quality_check: "contrôle qualité",
    scheduled_break: "pause programmée",
    no_operator: "manque d'opérateur",
    maintenance: "maintenance",
    training: "formation",
    no_production_scheduled: "pas de production prévue",
    other: "autre",
  },
};

const SHIFT_LABELS: Record<CoachLocale, Record<string, string>> = {
  en: { morning: "morning shift", afternoon: "afternoon shift", night: "night shift" },
  es: { morning: "turno mañana", afternoon: "turno tarde", night: "turno noche" },
  fr: { morning: "quart du matin", afternoon: "quart de l'après-midi", night: "quart de nuit" },
};

const LANGUAGE_NAME: Record<CoachLocale, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
};

function pct(v: number | null): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set — cannot run AI Coach.");
  }
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT_BASE = `You are the AI Coach for Easy OEE, an expert manufacturing assistant focused on improving Overall Equipment Effectiveness (OEE) for small and medium plants.

Your job: read a week of plant data and return THREE prioritized, concrete action plans the plant manager can execute this week. Each plan must be data-grounded — refer to specific numbers from the input. Never invent details.

Output rules:
- Return ONLY a JSON object matching the schema below. No prose before or after, no markdown fences.
- Priorities are 1, 2, 3. Order them by estimated OEE impact, highest first.
- Titles must be short and actionable, max 12 words.
- Each detail field: 2 sentences max, with the specific data point that triggered the recommendation.
- "responsible" should match a real plant role (e.g. maintenance lead, night-shift supervisor, ops manager).
- "estimatedOeeImpact" format: "+X.X% OEE" using a realistic estimate based on the loss size.

Schema:
{
  "weekSummary": "2-3 sentences. Mention the week's OEE, the change vs. prior week, and the principal issue.",
  "topInsight": "Single most important takeaway, one sentence.",
  "actions": [
    { "id": "action-1", "priority": 1, "title": "...", "detail": "...", "responsible": "...", "estimatedOeeImpact": "+X.X% OEE" },
    { "id": "action-2", "priority": 2, ... },
    { "id": "action-3", "priority": 3, ... }
  ]
}`;

function buildUserMessage(ctx: WeeklyContext, locale: CoachLocale): string {
  const stops = STOP_LABELS[locale];
  const shifts = SHIFT_LABELS[locale];

  const stopsLines = ctx.stops.length
    ? ctx.stops
        .map(
          (st) =>
            `- ${stops[st.reason] ?? st.reason}: ${st.totalMinutes.toFixed(0)} min (${st.occurrences} events)`,
        )
        .join("\n")
    : "- no stops recorded this week";

  const linesLines = ctx.byLine.length
    ? ctx.byLine
        .map(
          (l) =>
            `- ${l.lineName}: OEE ${pct(l.avgOee)} (target ${pct(l.targetOee)}) over ${l.totalShifts} shifts; A ${pct(l.avgAvailability)} P ${pct(l.avgPerformance)} Q ${pct(l.avgQuality)}`,
        )
        .join("\n")
    : "- no per-line data this week";

  const shiftLines = ctx.byShift.length
    ? ctx.byShift
        .map(
          (sh) =>
            `- ${shifts[sh.shiftType] ?? sh.shiftType}: OEE ${pct(sh.avgOee)} over ${sh.totalShifts} shifts`,
        )
        .join("\n")
    : "- no shift-type data this week";

  const operatorLines = ctx.byOperator.slice(0, 5).length
    ? ctx.byOperator
        .slice(0, 5)
        .map(
          (op) => `- ${op.operatorName}: OEE ${pct(op.avgOee)} over ${op.totalShifts} shifts`,
        )
        .join("\n")
    : "- no operator data this week";

  return `Plant: ${ctx.companyName}
Week window (plant timezone ${ctx.timezone}): ${ctx.weekStartPlantDate} → ${ctx.weekEndPlantDate}

OEE this week:
- Average: ${pct(ctx.thisWeek.avgOee)}
- Previous week: ${pct(ctx.prevWeekOee)}
- Shifts completed: ${ctx.thisWeek.totalShifts}
- Good parts: ${ctx.thisWeek.totalGoodParts.toLocaleString()}
- Defects: ${ctx.thisWeek.totalBadParts.toLocaleString()}
- Availability ${pct(ctx.thisWeek.avgAvailability)} · Performance ${pct(ctx.thisWeek.avgPerformance)} · Quality ${pct(ctx.thisWeek.avgQuality)}
- Total planned minutes: ${ctx.thisWeek.totalPlannedMinutes}

Top stop reasons:
${stopsLines}

OEE by line:
${linesLines}

OEE by shift type:
${shiftLines}

OEE by operator (lowest first, top 5):
${operatorLines}

Generate the JSON action plan in ${LANGUAGE_NAME[locale]}. Begin response with the opening JSON brace.`;
}

function parseJsonResponse(text: string): unknown {
  // The prefill should make this clean. Strip code fences just in case.
  const stripped = text.replace(/```json\n?|```\n?/g, "").trim();
  // If the model continues after a complete JSON object (extra prose),
  // truncate at the last balanced brace.
  const start = stripped.indexOf("{");
  if (start === -1) throw new Error("AI Coach: no JSON object in response");
  let depth = 0;
  let end = -1;
  for (let i = start; i < stripped.length; i++) {
    const c = stripped[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error("AI Coach: unbalanced JSON in response");
  return JSON.parse(stripped.slice(start, end + 1));
}

export async function generateWeeklyAnalysis(
  ctx: WeeklyContext,
  locale: CoachLocale = "en",
): Promise<CoachAnalysis> {
  const client = getClient();

  const message = await client.messages.create({
    model: COACH_MODEL,
    max_tokens: 1500,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT_BASE,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      { role: "user", content: buildUserMessage(ctx, locale) },
      { role: "assistant", content: "{" },
    ],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Re-attach the prefill brace so the JSON parser sees a complete object.
  const parsed = parseJsonResponse("{" + text);

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("AI Coach: parsed payload is not an object");
  }
  const p = parsed as Record<string, unknown>;

  const actionsIn = Array.isArray(p.actions) ? p.actions : [];
  const actions: ActionPlan[] = actionsIn.slice(0, 3).map((rawAction, idx) => {
    const a = (rawAction ?? {}) as Record<string, unknown>;
    const priorityRaw = Number(a.priority);
    const priority: 1 | 2 | 3 =
      priorityRaw === 1 || priorityRaw === 2 || priorityRaw === 3
        ? priorityRaw
        : ((idx + 1) as 1 | 2 | 3);
    return {
      id: typeof a.id === "string" && a.id ? a.id : `action-${idx + 1}`,
      priority,
      title: typeof a.title === "string" ? a.title : "",
      detail: typeof a.detail === "string" ? a.detail : "",
      responsible: typeof a.responsible === "string" ? a.responsible : "",
      estimatedOeeImpact:
        typeof a.estimatedOeeImpact === "string" ? a.estimatedOeeImpact : "",
      status: "pending" as const,
    };
  });

  const oeeThis = ctx.thisWeek.avgOee;
  const oeePrev = ctx.prevWeekOee;

  return {
    weekSummary: typeof p.weekSummary === "string" ? p.weekSummary : "",
    topInsight: typeof p.topInsight === "string" ? p.topInsight : "",
    oeeThisWeek: oeeThis,
    oeePrevWeek: oeePrev,
    oeeChange: oeeThis != null && oeePrev != null ? oeeThis - oeePrev : null,
    actions,
    generatedAt: new Date().toISOString(),
    locale,
  };
}
