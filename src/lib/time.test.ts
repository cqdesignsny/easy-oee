import { describe, it, expect } from "vitest";
import {
  DEFAULT_TIMEZONE,
  formatPlantDate,
  formatPlantDateTime,
  formatPlantDateTimeMachine,
  formatPlantTime,
  isValidTimezone,
  plantDateString,
  plantDayStartUTC,
  safeTimezone,
} from "./time";

const TORONTO = "America/Toronto";
const VANCOUVER = "America/Los_Angeles";

describe("isValidTimezone", () => {
  it("accepts valid IANA zones", () => {
    expect(isValidTimezone("America/Toronto")).toBe(true);
    expect(isValidTimezone("Europe/Paris")).toBe(true);
    expect(isValidTimezone("UTC")).toBe(true);
  });
  it("rejects garbage", () => {
    expect(isValidTimezone("EST5EDT")).toBe(true); // POSIX zones are accepted
    expect(isValidTimezone("Not/A_Zone")).toBe(false);
    expect(isValidTimezone("")).toBe(false);
    expect(isValidTimezone(null)).toBe(false);
    expect(isValidTimezone(undefined)).toBe(false);
  });
});

describe("safeTimezone", () => {
  it("returns the input when valid", () => {
    expect(safeTimezone("America/Vancouver")).toBe("America/Vancouver");
  });
  it("falls back to default for invalid input", () => {
    expect(safeTimezone(null)).toBe(DEFAULT_TIMEZONE);
    expect(safeTimezone("Bogus/Zone")).toBe(DEFAULT_TIMEZONE);
  });
});

describe("plantDateString", () => {
  it("returns the plant-tz date, not the UTC date, around the day boundary", () => {
    // 2026-04-30T02:30:00Z is 2026-04-29 22:30 EDT.
    // The plant-tz date is Apr 29, NOT Apr 30 (which is what UTC would say).
    const lateNightUtc = new Date("2026-04-30T02:30:00.000Z");
    expect(plantDateString(lateNightUtc, TORONTO)).toBe("2026-04-29");
  });
  it("matches UTC for mid-day timestamps", () => {
    const noonUtc = new Date("2026-04-30T16:00:00.000Z");
    expect(plantDateString(noonUtc, TORONTO)).toBe("2026-04-30");
  });
  it("differs across zones for the same instant", () => {
    const t = new Date("2026-04-30T05:00:00.000Z");
    // 5am UTC = 1am EDT (Apr 30) but 10pm PDT (Apr 29)
    expect(plantDateString(t, TORONTO)).toBe("2026-04-30");
    expect(plantDateString(t, VANCOUVER)).toBe("2026-04-29");
  });
  it("handles invalid timezones via fallback", () => {
    const t = new Date("2026-04-30T16:00:00.000Z");
    expect(plantDateString(t, "Bogus/Zone")).toBe("2026-04-30");
  });
});

describe("plantDayStartUTC", () => {
  it("returns the UTC instant of midnight in the plant tz", () => {
    // EDT (UTC-4) — midnight Apr 29 = 04:00 UTC
    const start = plantDayStartUTC("2026-04-29", TORONTO);
    expect(start.toISOString()).toBe("2026-04-29T04:00:00.000Z");
  });
  it("works for west-coast plants", () => {
    // PDT (UTC-7) — midnight Apr 29 = 07:00 UTC
    const start = plantDayStartUTC("2026-04-29", VANCOUVER);
    expect(start.toISOString()).toBe("2026-04-29T07:00:00.000Z");
  });
  it("UTC is its own day-start", () => {
    expect(plantDayStartUTC("2026-04-29", "UTC").toISOString()).toBe(
      "2026-04-29T00:00:00.000Z",
    );
  });
});

describe("formatters", () => {
  const t = new Date("2026-04-30T02:02:53.270Z"); // 2026-04-29 22:02 EDT

  it("formatPlantDate gives the plant-tz date", () => {
    expect(formatPlantDate(t, TORONTO)).toBe("Apr 29, 2026");
  });

  it("formatPlantTime gives a 12-hour time in en-US", () => {
    const out = formatPlantTime(t, TORONTO);
    // Could be "10:02 PM" or "10:02 p.m." depending on Node ICU build
    expect(out).toMatch(/10:02\s*(PM|p\.?m\.?)/i);
  });

  it("formatPlantDateTime combines both", () => {
    const out = formatPlantDateTime(t, TORONTO);
    expect(out).toContain("Apr 29, 2026");
    expect(out).toMatch(/10:02/);
  });

  it("formatPlantDateTimeMachine is YYYY-MM-DD HH:MM:SS TZ", () => {
    const out = formatPlantDateTimeMachine(t, TORONTO);
    expect(out).toMatch(/^2026-04-29 22:02:53 [A-Z]+$/);
  });

  it("returns empty string for null input", () => {
    expect(formatPlantDate(null, TORONTO)).toBe("");
    expect(formatPlantTime(undefined, TORONTO)).toBe("");
    expect(formatPlantDateTime(null, TORONTO)).toBe("");
    expect(formatPlantDateTimeMachine(null, TORONTO)).toBe("");
  });

  it("handles UTC", () => {
    const out = formatPlantDateTimeMachine(t, "UTC");
    expect(out).toMatch(/^2026-04-30 02:02:53 UTC$/);
  });
});
