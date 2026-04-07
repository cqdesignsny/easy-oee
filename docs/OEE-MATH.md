# OEE Math

> The single source of truth for OEE calculations is `src/lib/oee.ts`. This doc explains the formulas, the inputs, the edge cases, and provides worked examples and test cases.

## Definitions

**OEE — Overall Equipment Effectiveness** is the gold-standard manufacturing productivity metric. It expresses *actual productive output* as a percentage of *theoretical maximum output*. World class is 85%+; typical is 60–85%; below 60% indicates significant losses.

```
OEE = Availability × Performance × Quality
```

All three factors are decimals from 0 to 1. OEE is the same — store as a decimal, render as a percent.

## The three factors

### Availability — *Was the machine running when it was supposed to?*

```
Availability = Run Time / Planned Time

Run Time = Planned Minutes − Stop Minutes
```

- **Planned Minutes:** total scheduled production time for the shift (e.g. 480 = 8 hours)
- **Stop Minutes:** sum of every recorded stop's duration during the shift

### Performance — *Was the machine running at its ideal speed?*

```
Performance = (Total Parts) / (Ideal Rate × Run Time)

Total Parts = Good Parts + Bad Parts
```

- **Ideal Rate:** the theoretical maximum parts per minute, snapshotted from the `Line` at shift start
- **Run Time:** same as Availability (planned − stops)

Performance can theoretically exceed 1.0 (operator beat the ideal rate), but in practice we **cap it at 1.0** to avoid misleading OEE scores. The cap happens in `src/lib/oee.ts`.

### Quality — *Of all parts produced, how many were good?*

```
Quality = Good Parts / Total Parts
```

## Worked example

A morning shift on Machine 1:

| Input | Value |
|---|---|
| Planned Minutes | 480 (8h) |
| Stop Minutes | 60 |
| Good Parts | 780 |
| Bad Parts | 20 |
| Ideal Rate | 2 parts/min |

Calculations:

```
Run Time     = 480 − 60         = 420 min
Availability = 420 / 480        = 0.875   (87.5%)
Total Parts  = 780 + 20         = 800
Performance  = 800 / (2 × 420)  = 0.952   (95.2%)
Quality      = 780 / 800        = 0.975   (97.5%)

OEE = 0.875 × 0.952 × 0.975 = 0.812 (81.2%)
```

## Benchmarks

| Score | Classification |
|---|---|
| 100% | Perfect (theoretical) |
| 85%+ | World class |
| 60–85% | Typical (room for improvement) |
| < 60% | Low (significant losses) |

## Edge cases

The math has several places where naive division blows up. `calculateOee()` handles all of them:

| Case | What we return |
|---|---|
| `plannedMinutes <= 0` | `{ availability: null, performance: null, quality: null, oee: null }` |
| `stopMinutes >= plannedMinutes` | Run time = 0, availability = 0, perf = null (can't divide), quality = computed |
| `idealRate <= 0` | performance = `null` |
| `goodParts + badParts === 0` | quality = `null`, performance = 0 (no parts produced over real run time) |
| Stop still open at end of shift | Close the stop at `endedAt = now()` server-side before calculation |
| Performance > 1.0 | Capped at 1.0 |

When any factor is `null`, OEE itself is `null`. The UI renders `null` as "N/A" — never `0%`.

## Function signature

```ts
// src/lib/oee.ts

export type OeeInputs = {
  plannedMinutes: number;
  stopMinutes: number;
  goodParts: number;
  badParts: number;
  idealRate: number; // parts per minute
};

export type OeeResult = {
  availability: number | null;
  performance: number | null;
  quality: number | null;
  oee: number | null;
  // for the UI
  runTimeMinutes: number;
  totalParts: number;
};

export function calculateOee(inputs: OeeInputs): OeeResult;

// Helper to render decimals as percent strings: 0.812 → "81.2%"
export function formatPercent(value: number | null, opts?: { decimals?: number }): string;
```

## Test cases (the canon)

These live in `src/lib/oee.test.ts`. Any change to `oee.ts` must keep these green and add a test for the new behavior.

```ts
// 1. Happy path (the worked example above)
expect(calculateOee({
  plannedMinutes: 480, stopMinutes: 60,
  goodParts: 780, badParts: 20, idealRate: 2,
})).toEqual({
  availability: 0.875,
  performance: 0.9523809523809523,
  quality: 0.975,
  oee: 0.8124999999999999,
  runTimeMinutes: 420,
  totalParts: 800,
});

// 2. Zero planned minutes
expect(calculateOee({ plannedMinutes: 0, ... })).toMatchObject({
  availability: null, performance: null, quality: null, oee: null,
});

// 3. Zero parts
expect(calculateOee({ ..., goodParts: 0, badParts: 0 })).toMatchObject({
  quality: null, oee: null,
});

// 4. All planned time stopped
expect(calculateOee({ plannedMinutes: 480, stopMinutes: 480, ... })).toMatchObject({
  availability: 0,
  oee: 0,
});

// 5. Performance cap (operator overshot ideal rate)
expect(calculateOee({
  plannedMinutes: 100, stopMinutes: 0,
  goodParts: 300, badParts: 0, idealRate: 2,
})).toMatchObject({
  performance: 1, // capped from 1.5
});
```

## Display rules

- **OEE and factors are stored as decimals 0–1**, never as percents.
- **Display** uses `formatPercent()` which renders 1 decimal place by default: `81.2%`.
- **Color thresholds** in the UI:
  - `>= 0.85` → green (world class)
  - `>= 0.60` → amber (typical)
  - `< 0.60`  → red (low)
  - `null`    → gray "N/A"
