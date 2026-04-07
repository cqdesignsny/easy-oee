# OEE Math Reference

Single source of truth for the calculation. Implementation lives in `lib/oee.ts` and is unit-tested in `lib/oee.test.ts`. **Do not reimplement this anywhere else in the codebase.**

## Formula

```
OEE = Availability × Performance × Quality
```

## Components

### Availability — was the machine running when it was supposed to?

```
Availability = (Planned Minutes − Stop Minutes) / Planned Minutes
```

- **Planned Minutes** — total scheduled production minutes for the shift (operator input at shift start, default 480 for an 8h shift)
- **Stop Minutes** — sum of all `stop.minutes` rows for this shift

**Example:** 480 planned, 60 stopped → 420/480 = **87.5%**

### Performance — was the machine running at ideal speed?

```
Performance = (Good + Bad parts) / (Ideal Rate × Run Time Minutes)
```

- **Run Time** = Planned − Stop Minutes
- **Ideal Rate** = max theoretical parts/min (set at shift start, defaults from `line.idealRate`)

**Example:** 800 parts, ideal 2/min, run time 420 min → 800/(2×420) = 800/840 = **95.2%**

### Quality — of the parts produced, how many were good?

```
Quality = Good Parts / (Good + Bad parts)
```

**Example:** 780 good, 20 bad → 780/800 = **97.5%**

### OEE

```
OEE = 0.875 × 0.952 × 0.975 = 0.812 → 81.2%
```

## Benchmarks

| Score      | Classification |
|------------|----------------|
| 100%       | Perfect (theoretical only) |
| ≥ 85%      | World class    |
| 60–85%     | Typical        |
| < 60%      | Low (significant losses) |

## Edge cases — return `null`, never `NaN`/`Infinity`

| Condition                       | Component returning null |
|---------------------------------|--------------------------|
| `plannedMinutes == 0`           | Availability, OEE        |
| `goodParts + badParts == 0`     | Quality, Performance, OEE|
| `idealRate == 0`                | Performance, OEE         |
| `runTime <= 0` (over-stopped)   | Availability clamped to 0, Performance null |

When a component is `null`, OEE is `null` (don't multiply with zeros).

## Storage

- All four metrics stored as **decimal 0–1** in Postgres (`numeric` column)
- Display formatted as percentage with 1 decimal: `(value * 100).toFixed(1) + "%"`
- `null` displays as `"N/A"` with a tooltip explaining why

## Why we compute server-side only

The Bubble v0 had bug where the calculation ran client-side and silently failed when an input was missing. In this rebuild:
- The "End Shift" Server Action calls `computeOEE()` and writes the four numbers to the `shift` row in one transaction
- The client never computes OEE — it only displays it
- Live "current OEE" mid-shift is also computed in a Server Component on each render

## Reference implementation

```ts
// lib/oee.ts
export type OEEInput = {
  plannedMinutes: number;
  stopMinutes: number;
  goodParts: number;
  badParts: number;
  idealRate: number;
};

export type OEEResult = {
  availability: number | null;
  performance: number | null;
  quality: number | null;
  oee: number | null;
  runTimeMinutes: number;
  totalParts: number;
};

export function computeOEE(i: OEEInput): OEEResult {
  const runTimeMinutes = Math.max(0, i.plannedMinutes - i.stopMinutes);
  const totalParts = i.goodParts + i.badParts;

  const availability =
    i.plannedMinutes > 0 ? runTimeMinutes / i.plannedMinutes : null;

  const performance =
    i.idealRate > 0 && runTimeMinutes > 0
      ? totalParts / (i.idealRate * runTimeMinutes)
      : null;

  const quality = totalParts > 0 ? i.goodParts / totalParts : null;

  const oee =
    availability != null && performance != null && quality != null
      ? availability * performance * quality
      : null;

  return { availability, performance, quality, oee, runTimeMinutes, totalParts };
}
```
