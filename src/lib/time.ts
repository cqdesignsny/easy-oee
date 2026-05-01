/**
 * Plant-timezone formatting and date helpers.
 *
 * All times in the database are timestamptz (UTC). All times shown to users
 * or written to exports must be formatted in the plant's IANA timezone, which
 * is stored on company.timezone (default: "America/Toronto").
 *
 * Use these helpers everywhere. Never call new Date().toISOString().slice(0,10)
 * or new Date(x).toLocaleString() directly to display a time. The browser tz
 * of whoever is looking at the screen has nothing to do with what the plant
 * cares about, and using the server's UTC clock for "today" produces wrong
 * dates after 8pm local in North America.
 *
 * Pure JS, runs on the server (RSC, Server Actions, Route Handlers, cron jobs)
 * and on the client (timer components). No external deps.
 */

export const DEFAULT_TIMEZONE = "America/Toronto";

/** Common North American zones for the timezone picker. Roughly ordered by population. */
export const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: "America/Toronto", label: "Eastern (Toronto, NYC, Montreal)" },
  { value: "America/Halifax", label: "Atlantic (Halifax, Moncton)" },
  { value: "America/St_Johns", label: "Newfoundland (St. John's)" },
  { value: "America/Chicago", label: "Central (Chicago, Winnipeg)" },
  { value: "America/Denver", label: "Mountain (Denver, Edmonton)" },
  { value: "America/Phoenix", label: "Arizona (no DST)" },
  { value: "America/Los_Angeles", label: "Pacific (LA, Vancouver)" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "America/Monterrey", label: "Monterrey" },
  { value: "UTC", label: "UTC" },
];

export function isValidTimezone(tz: string | null | undefined): tz is string {
  if (!tz || typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Returns the input if valid, otherwise the default plant timezone. */
export function safeTimezone(tz: string | null | undefined): string {
  return isValidTimezone(tz) ? tz : DEFAULT_TIMEZONE;
}

/**
 * Plant-tz date string in YYYY-MM-DD form. Use for shift.shiftDate writes
 * and for "today" boundaries on the dashboard.
 *
 * Example: at 22:30 EDT on 2026-04-29 (= 02:30 UTC on 2026-04-30),
 * plantDateString(now, "America/Toronto") returns "2026-04-29".
 */
export function plantDateString(
  d: Date | string | null | undefined,
  tz: string,
): string {
  const date = d == null ? new Date() : typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimezone(tz),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * UTC instant corresponding to midnight (start-of-day) of a plant-tz date.
 * Used for stop-event range queries. DST-correct.
 *
 * plantDayStartUTC("2026-04-29", "America/Toronto") → 2026-04-29T04:00:00Z
 */
export function plantDayStartUTC(plantDateStr: string, tz: string): Date {
  const safeTz = safeTimezone(tz);
  // Naive guess: midnight UTC of that date
  const guess = new Date(`${plantDateStr}T00:00:00Z`);
  // What date+time does that show as in the plant tz?
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(guess);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const guessAsPlantStr = `${get("year")}-${get("month")}-${get("day")}T${get("hour") === "24" ? "00" : get("hour")}:${get("minute")}:${get("second")}`;
  // Difference between what we wanted (plantDateStr midnight) and what we got
  const wanted = Date.parse(`${plantDateStr}T00:00:00`);
  const got = Date.parse(guessAsPlantStr);
  const offsetMs = got - wanted;
  return new Date(guess.getTime() - offsetMs);
}

/** "Apr 29, 2026" */
export function formatPlantDate(
  d: Date | string | null | undefined,
  tz: string,
  locale: string = "en-US",
): string {
  if (d == null) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(locale, {
    timeZone: safeTimezone(tz),
    dateStyle: "medium",
  }).format(date);
}

/** "10:02 PM" (en-US) or "22:02" (other locales). */
export function formatPlantTime(
  d: Date | string | null | undefined,
  tz: string,
  locale: string = "en-US",
): string {
  if (d == null) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(locale, {
    timeZone: safeTimezone(tz),
    hour: "numeric",
    minute: "2-digit",
    hour12: locale.startsWith("en"),
  }).format(date);
}

/** "Apr 29, 2026, 10:02 PM" */
export function formatPlantDateTime(
  d: Date | string | null | undefined,
  tz: string,
  locale: string = "en-US",
): string {
  if (d == null) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(locale, {
    timeZone: safeTimezone(tz),
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * Machine-readable plant-tz timestamp for CSV / email exports:
 * "2026-04-29 22:02:53 EDT"
 */
export function formatPlantDateTimeMachine(
  d: Date | string | null | undefined,
  tz: string,
): string {
  if (d == null) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const safeTz = safeTimezone(tz);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const hour = get("hour") === "24" ? "00" : get("hour");
  const ymd = `${get("year")}-${get("month")}-${get("day")}`;
  const hms = `${hour}:${get("minute")}:${get("second")}`;
  const tzAbbr =
    new Intl.DateTimeFormat("en-US", {
      timeZone: safeTz,
      timeZoneName: "short",
    })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName")?.value ?? safeTz;
  return `${ymd} ${hms} ${tzAbbr}`;
}

/** Best-effort browser-detected IANA timezone, or default. Client-only. */
export function detectBrowserTimezone(): string {
  if (typeof Intl === "undefined") return DEFAULT_TIMEZONE;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimezone(tz) ? tz : DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}
