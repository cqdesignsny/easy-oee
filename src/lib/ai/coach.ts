/**
 * AI Coach — weekly OEE analysis via Vercel AI Gateway.
 *
 * Routes through `@ai-sdk/gateway` so the call goes through the project's
 * AI Gateway: unified billing on the Vercel team, automatic OIDC auth on
 * deployments, and provider failover if Anthropic has a hiccup. Uses
 * Claude Sonnet 4.6 with prompt-cache control on the stable system prompt
 * so the cron's per-tenant fan-out reuses the cached prefix.
 *
 * Output is validated against a Zod schema by `generateObject`, so we get
 * a typed object back without hand-rolling a JSON parser.
 */

import { generateObject } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { z } from "zod";
import type { WeeklyContext } from "@/lib/db/queries/ai-context";

export const COACH_MODEL = "anthropic/claude-sonnet-4.6";

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

const SYSTEM_PROMPT = `You are the AI Coach for Easy OEE, an expert manufacturing assistant focused on improving Overall Equipment Effectiveness (OEE) for small and medium plants.

Your job: read a week of plant data and return THREE prioritized, concrete action plans the plant manager can execute this week. Each plan must be data-grounded — refer to specific numbers from the input. Never invent details.

Output rules:
- Priorities are 1, 2, 3. Order them by estimated OEE impact, highest first.
- Titles must be short and actionable, max 12 words.
- Each detail field: 2 sentences max, with the specific data point that triggered the recommendation.
- "responsible" should match a real plant role (e.g. maintenance lead, night-shift supervisor, ops manager).
- "estimatedOeeImpact" format: "+X.X% OEE" using a realistic estimate based on the loss size.`;

const actionSchema = z.object({
  id: z.string().describe("Stable identifier like action-1, action-2, action-3."),
  priority: z
    .union([z.literal(1), z.literal(2), z.literal(3)])
    .describe("Ranking 1 (highest impact) to 3."),
  title: z.string().max(120).describe("Short actionable title, max 12 words."),
  detail: z
    .string()
    .max(800)
    .describe("Two sentences max, must cite specific numbers from the input."),
  responsible: z.string().max(120).describe("A real plant role to own this action."),
  estimatedOeeImpact: z.string().describe("Format: +X.X% OEE"),
});

const analysisSchema = z.object({
  weekSummary: z
    .string()
    .max(800)
    .describe(
      "2-3 sentences. Mention the week's OEE, the change vs. prior week, and the principal issue.",
    ),
  topInsight: z
    .string()
    .max(280)
    .describe("Single most important takeaway, one sentence."),
  actions: z.array(actionSchema).length(3),
});

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

Generate the action plan in ${LANGUAGE_NAME[locale]}.`;
}

export async function generateWeeklyAnalysis(
  ctx: WeeklyContext,
  locale: CoachLocale = "en",
): Promise<CoachAnalysis> {
  const { object } = await generateObject({
    model: gateway(COACH_MODEL),
    schema: analysisSchema,
    maxOutputTokens: 1500,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
        providerOptions: {
          anthropic: { cacheControl: { type: "ephemeral" } },
        },
      },
      {
        role: "user",
        content: buildUserMessage(ctx, locale),
      },
    ],
  });

  const oeeThis = ctx.thisWeek.avgOee;
  const oeePrev = ctx.prevWeekOee;

  return {
    weekSummary: object.weekSummary,
    topInsight: object.topInsight,
    oeeThisWeek: oeeThis,
    oeePrevWeek: oeePrev,
    oeeChange: oeeThis != null && oeePrev != null ? oeeThis - oeePrev : null,
    actions: object.actions.map((a) => ({
      id: a.id,
      priority: a.priority,
      title: a.title,
      detail: a.detail,
      responsible: a.responsible,
      estimatedOeeImpact: a.estimatedOeeImpact,
      status: "pending" as const,
    })),
    generatedAt: new Date().toISOString(),
    locale,
  };
}
