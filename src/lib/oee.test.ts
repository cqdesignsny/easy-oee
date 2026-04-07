import { describe, it, expect } from "vitest";
import { computeOEE, computeLossTree, formatPercent, oeeBucket } from "./oee";

describe("computeOEE", () => {
  it("happy path — the canonical worked example", () => {
    const r = computeOEE({
      plannedMinutes: 480,
      stopMinutes: 60,
      goodParts: 780,
      badParts: 20,
      idealRate: 2,
    });
    expect(r.runTimeMinutes).toBe(420);
    expect(r.totalParts).toBe(800);
    expect(r.availability).toBeCloseTo(0.875, 4);
    expect(r.performance).toBeCloseTo(0.9524, 4);
    expect(r.quality).toBeCloseTo(0.975, 4);
    expect(r.oee).toBeCloseTo(0.8125, 4);
  });

  it("zero planned minutes → all null", () => {
    const r = computeOEE({
      plannedMinutes: 0,
      stopMinutes: 0,
      goodParts: 0,
      badParts: 0,
      idealRate: 2,
    });
    expect(r.availability).toBeNull();
    expect(r.oee).toBeNull();
  });

  it("zero parts → quality null, oee null", () => {
    const r = computeOEE({
      plannedMinutes: 480,
      stopMinutes: 0,
      goodParts: 0,
      badParts: 0,
      idealRate: 2,
    });
    expect(r.quality).toBeNull();
    expect(r.oee).toBeNull();
  });

  it("zero ideal rate → performance null, oee null", () => {
    const r = computeOEE({
      plannedMinutes: 480,
      stopMinutes: 0,
      goodParts: 100,
      badParts: 0,
      idealRate: 0,
    });
    expect(r.performance).toBeNull();
    expect(r.oee).toBeNull();
  });

  it("entire shift stopped → availability 0, oee 0", () => {
    const r = computeOEE({
      plannedMinutes: 480,
      stopMinutes: 480,
      goodParts: 0,
      badParts: 0,
      idealRate: 2,
    });
    expect(r.availability).toBe(0);
    expect(r.runTimeMinutes).toBe(0);
  });

  it("over-stopped (stop > planned) → run time clamped to 0", () => {
    const r = computeOEE({
      plannedMinutes: 480,
      stopMinutes: 600,
      goodParts: 0,
      badParts: 0,
      idealRate: 2,
    });
    expect(r.runTimeMinutes).toBe(0);
    expect(r.availability).toBe(0);
  });

  it("performance is capped at 1.0 when operator beats ideal rate", () => {
    const r = computeOEE({
      plannedMinutes: 100,
      stopMinutes: 0,
      goodParts: 300,
      badParts: 0,
      idealRate: 2, // ideal would be 200; operator made 300
    });
    expect(r.performance).toBe(1);
  });
});

describe("formatPercent", () => {
  it("formats decimals as percent strings", () => {
    expect(formatPercent(0.812)).toBe("81.2%");
    expect(formatPercent(1)).toBe("100.0%");
    expect(formatPercent(0)).toBe("0.0%");
  });
  it("returns N/A for null", () => {
    expect(formatPercent(null)).toBe("N/A");
  });
  it("respects decimals option", () => {
    expect(formatPercent(0.8125, { decimals: 2 })).toBe("81.25%");
  });
});

describe("computeLossTree", () => {
  it("partitions planned minutes into 4 buckets that sum to plannedMinutes", () => {
    const t = computeLossTree({
      plannedMinutes: 480,
      stopMinutes: 60,
      goodParts: 780,
      badParts: 20,
      idealRate: 2,
    });
    expect(t.plannedMinutes).toBe(480);
    expect(t.downtimeMinutes).toBe(60);
    const sum = t.goodMinutes + t.qualityLossMinutes + t.speedLossMinutes + t.downtimeMinutes;
    expect(sum).toBeCloseTo(480, 4);
    expect(t.goodMinutes).toBeGreaterThan(t.qualityLossMinutes);
  });

  it("zero ideal rate → all run time becomes speed loss", () => {
    const t = computeLossTree({
      plannedMinutes: 480,
      stopMinutes: 60,
      goodParts: 0,
      badParts: 0,
      idealRate: 0,
    });
    expect(t.speedLossMinutes).toBe(420);
    expect(t.downtimeMinutes).toBe(60);
  });
});

describe("oeeBucket", () => {
  it("classifies world-class / typical / low / na", () => {
    expect(oeeBucket(0.9)).toBe("world-class");
    expect(oeeBucket(0.85)).toBe("world-class");
    expect(oeeBucket(0.7)).toBe("typical");
    expect(oeeBucket(0.59)).toBe("low");
    expect(oeeBucket(null)).toBe("na");
  });
});
