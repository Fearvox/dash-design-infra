# Preset Spec: `dashDataWeather`

**Date:** 2026-05-01
**Author:** @Designer
**Status:** draft → @Reviewer Phase 2 gate
**Template:** v2 (docs/preset-spec-dash-flow-field.md)

---

## P5MotionPresetV2 Contract

```ts
const dashDataWeather: P5MotionPresetV2 = {
  name: 'dash-data-weather',
  source: 'docs/p5js-frontier-research.md §2.7 数据驱动生成 + DASH evidence-driven editorial',
  canvas: 'portrait',

  layers: [
    'L0 solid ground',
    'L1 data visualization (primary)',
    'L2 ambient field (responsive background)',
    'L3 metadata panel',
  ],

  does: [
    'accepts external JSON weather data and maps fields to visual parameters',
    'renders an evidence-driven editorial weather mural (not a stock chart widget)',
    'handles no-data / partial-data / malformed-data fallback states with dignity',
    'clamps all visual outputs to DASH palette regardless of input extremes',
  ],

  useWhen: [
    'rendering live weather dashboards with editorial aesthetic',
    'generating data-background visuals for DASH posters/decks',
    'serving as the reference implementation for all future data-driven presets',
  ],

  // ── v2 extensions ──

  technique: ['api-stream', 'time-series'],
  visualMode: 'diagram',
  motionBudget: [
    { layerName: 'L0 solid ground',        intensity: 'static',   maxAmplitude: 0,    periodSeconds: 0 },
    { layerName: 'L1 data visualization',  intensity: 'breathe',  maxAmplitude: 6,    periodSeconds: 20 },
    { layerName: 'L2 ambient field',       intensity: 'drift',    maxAmplitude: 18,   periodSeconds: 22 },
    { layerName: 'L3 metadata panel',      intensity: 'static',   maxAmplitude: 0,    periodSeconds: 0 },
  ],
  colorContract: {
    primary: 'ink',
    background: 'cream',
    accent: 'neon-yellow',
    glass: 'frost',
  },
  inputContract: {
    type: 'api-fetch',
    mapping: {
      'temperature':    'hueShift',
      'humidity':       'density',
      'windSpeed':      'velocity',
      'cloudCover':     'alpha',
      'windDirection':  'flowAngle',
      'uvIndex':        'accentGlow',
      'visibility':     'blurRadius',
      'location':       'locationLabel',
      'timestamp':      'timeLabel',
    },
  },
  shaderHint: false,
};
```

---

## Visual Design

### Design Philosophy

dashDataWeather 是 DASH 数据驱动 visual 路线的 reference implementation。它证明一条核心命题：**数据可视化不等于图表**。DASH 的数据墙是 editorial-grade 的生成艺术，其中数据是输入信号，不是展示对象。

三条原则：
1. **Data as atmosphere, not chart** — 温度不画温度计，温度影响色调
2. **Fallback first** — 缺数据态不是 bug，是设计的完整状态
3. **Editorial, not dashboard** — 排版/层级/留白遵循瑞士风格，数据面板是 editorial layout 的一部分

### Layout

```
┌─────────────────────────────────────┐
│                                     │
│    L0: solid Cream #f8f5ef ground   │
│                                     │
│    L2: ambient field                │
│    ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿  │
│    noise-generated background       │
│    responds to weather data:        │
│    · temperature → hue (cold↔warm)  │
│    · humidity → density (sparse↔dense)│
│    · wind → velocity (slow↔fast)    │
│    · clouds → alpha (clear↔foggy)   │
│                                     │
│    L1: data visualization           │
│    ┌─────────────────────────┐      │
│    │  🌡 22°C  💧 65%        │      │
│    │  🌬 12km/h ☁ 40%       │      │
│    │                         │      │
│    │  [field responds live]  │      │
│    └─────────────────────────┘      │
│                                     │
│    L3: metadata panel               │
│    ─────────────────────────────    │
│    Shanghai · 2026-05-01 14:30 CST  │
│                                     │
└─────────────────────────────────────┘
```

### Color Mapping — Weather → Visual

```
temperature (°C) → hueShift
  -10°C ................ Deep Blue / Cobalt #0018ff    (freezing)
  0°C .................. Cool Green / Cyan #00e5ff     (cold)
  10°C ................. Mid Green #35584C             (cool)
  20°C ................. Cream #f8f5ef                 (comfort — baseline)
  30°C ................. Sand #ddd6c7                  (warm)
  40°C ................. Neon Yellow #F0EE9B           (hot)

humidity (%) → density
  0% ................... sparse (0.3 density)           (desert — wide open)
  50% .................. medium (0.6 density)           (normal)
  100% ................. dense (1.0 density)            (swamp — tight, cluttered)

windSpeed (km/h) → velocity
  0 km/h ............... static (velocity 0.0)          (calm)
  20 km/h .............. breathe (velocity 0.5)         (breezy)
  40 km/h .............. drift (velocity 0.8)           (windy)
  60+ km/h ............. flow-like (velocity 1.0)       (storm — max budget)

cloudCover (%) → alpha
  0% ................... clear (alpha 0.02)             (transparent overlay)
  50% .................. partly cloudy (alpha 0.08)     (semi-visible)
  100% ................. overcast (alpha 0.18)          (heavy fog wash)
```

### Mapped Visual Parameters (Complete)

| Weather Field | Unit | Range | Visual Param | Visual Effect | Clamp Rule |
|---------------|------|-------|-------------|---------------|------------|
| `temperature` | °C | -20 – 45 | `hueShift` | Cold blue → warm yellow ramp | clamp to [-20, 45] |
| `humidity` | % | 0 – 100 | `density` | Sparse → dense noise field | clamp to [0, 100] |
| `windSpeed` | km/h | 0 – 80 | `velocity` | Static → rapid field motion | clamp to [0, 80] |
| `cloudCover` | % | 0 – 100 | `alpha` | Clear → foggy overlay wash | clamp to [0, 100] |
| `windDirection` | ° | 0 – 360 | `flowAngle` | Noise field flow direction | wrap 360 → 0 |
| `uvIndex` | index | 0 – 11 | `accentGlow` | Neon Yellow glow intensity | clamp to [0, 11] |
| `visibility` | km | 0 – 20 | `blurRadius` | Sharp → soft focus | clamp to [0, 20] |

### Input JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "WeatherData",
  "type": "object",
  "required": ["temperature", "humidity", "windSpeed", "cloudCover"],
  "properties": {
    "temperature":   { "type": "number" },
    "humidity":      { "type": "number", "minimum": 0, "maximum": 100 },
    "windSpeed":     { "type": "number", "minimum": 0 },
    "windDirection": { "type": "number", "minimum": 0, "maximum": 360 },
    "cloudCover":    { "type": "number", "minimum": 0, "maximum": 100 },
    "uvIndex":       { "type": "number", "minimum": 0, "maximum": 11 },
    "visibility":    { "type": "number", "minimum": 0 },
    "location":      { "type": "string" },
    "timestamp":     { "type": "string", "format": "date-time" }
  }
}
```

---

## Fallback State Design

### State A: No Data (`input === null | undefined`)

```
┌─────────────────────────────────────┐
│                                     │
│         ╭─────────────╮            │
│         │  No signal  │            │
│         ╰─────────────╯            │
│                                     │
│    L2: slow, neutral ambient field  │
│    hueShift = 0 (Cream baseline)    │
│    density = 0.4 (sparse, calm)     │
│    velocity = 0.15 (minimal motion) │
│    alpha = 0.04 (barely visible)    │
│                                     │
│    L3:                             │
│    — · No data available · —       │
│                                     │
└─────────────────────────────────────┘
```

**Visual strategy**: 不是"空白"或"错误"，而是一个 calm, neutral ambient field。画面在"等待数据"时的稳定状态本身就是设计。用 `—` 表示元数据缺失位（em-dash → 设计信号）。

Default parameter values when no data:
```ts
const NO_DATA_DEFAULTS = {
  hueShift: 0,         // Cream baseline
  density: 0.4,        // Sparse
  velocity: 0.15,      // Minimal
  alpha: 0.04,         // Barely visible
  flowAngle: 0,        // Eastward (0°)
  accentGlow: 0,       // Off
  blurRadius: 0,       // No blur
  locationLabel: '—',  // Em-dash for missing
  timeLabel: '—',      // Em-dash for missing
};
```

### State B: Partial Data (some fields missing)

```
┌─────────────────────────────────────┐
│                                     │
│    L2: partial field response       │
│    present fields drive their       │
│    respective visual params         │
│    missing fields → neutral default │
│                                     │
│    L3:                             │
│    Shanghai · 22°C · — · 40%       │
│    (missing fields shown as —)     │
│                                     │
└─────────────────────────────────────┘
```

**Visual strategy**: 有数据的字段正常映射，缺失字段回落到 `NO_DATA_DEFAULTS`。L3 metadata 中缺失字段用 em-dash 表示。

Field-level fallback:
```ts
function resolveWeatherParam(
  field: keyof WeatherData,
  data: Partial<WeatherData> | null
): number {
  if (!data || data[field] === undefined || data[field] === null) {
    return NO_DATA_DEFAULTS[fieldToParam(field)];
  }
  const raw = Number(data[field]);
  if (!Number.isFinite(raw)) return NO_DATA_DEFAULTS[fieldToParam(field)];
  return raw;
}
```

### State C: Malformed Data (type mismatch / out of range)

```
┌─────────────────────────────────────┐
│                                     │
│    L2: clamped field response       │
│    out-of-range values clamped      │
│    non-numeric → default            │
│                                     │
│    L3:                             │
│    (no error message — silent clamp)│
│                                     │
└─────────────────────────────────────┘
```

**Visual strategy**: 静默 clamp。DASH 是 editorial 系统，不是运维监控台——不在画布上放错误信息。OoB 值 clamping + 控制台警告 (`console.warn`)。

---

## Parameter Space

Three primary parameters (end-user facing):

| Param | Range | Default | Controls |
|-------|-------|---------|----------|
| `dataUrl` | URL string | `null` | Weather JSON endpoint (null = no-data state) |
| `updateInterval` | 0 – 3600 | 60 | Seconds between auto-refetch (0 = manual only) |
| `motionScale` | 0.0 – 1.0 | 0.5 | Multiplier on L2 ambient field motion |

UI labels (end-user facing):
- "Data source" (dataUrl input + refresh button)
- "Refresh every" (updateInterval, dropdown: 10s / 30s / 60s / 5m / manual)
- "Ambient intensity" (motionScale slider)

### Dashboard Mode Parameter Set

When used as background for dashDataWeather (i.e. combined with dashKineticType for labels), the following virtual params are mapped internally:

| Internal Param | Source | Range | Notes |
|----------------|--------|-------|-------|
| `hueShift` | `temperature` | -20–45 °C | Mapped to Cobalt→Neon Yellow ramp |
| `density` | `humidity` | 0–100% | Mapped 0.3–1.0 |
| `velocity` | `windSpeed` | 0–80 km/h | Mapped 0.0–1.0 |
| `alpha` | `cloudCover` | 0–100% | Mapped 0.02–0.18 |
| `flowAngle` | `windDirection` | 0–360° | Direct passthrough |
| `accentGlow` | `uvIndex` | 0–11 | Mapped 0.0–1.0 |
| `blurRadius` | `visibility` | 0–20 km | Mapped 0.0–1.0 |

---

## Technical Implementation Notes

### What goes in `@dash/p5-motion` (reusable)

```ts
// ── Data Weather Types ──

/** Incoming weather data shape (after JSON.parse + validation). */
export interface WeatherData {
  temperature: number;     // required
  humidity: number;        // required
  windSpeed: number;       // required
  cloudCover: number;      // required
  windDirection?: number;  // optional — defaults to 180 (south)
  uvIndex?: number;        // optional — defaults to 0
  visibility?: number;     // optional — defaults to 20 (clear)
  location?: string;
  timestamp?: string;
}

/** Resolved visual parameters (after data → visual mapping). */
export interface WeatherVisualParams {
  hueShift: number;      // 0–1, maps to color ramp
  density: number;       // 0–1, field element density
  velocity: number;      // 0–1, field motion speed
  alpha: number;         // 0–1, overlay opacity
  flowAngle: number;     // 0–360, field direction
  accentGlow: number;    // 0–1, highlight intensity
  blurRadius: number;    // 0–1, soft focus amount
  locationLabel: string;
  timeLabel: string;
}

/** Fallback state enum. */
export type DataState = 'live' | 'no-data' | 'partial' | 'malformed';
```

### Core Functions (pure, no p5 dependency)

```ts
/**
 * Map raw WeatherData to resolved visual parameters.
 * Handles all fallback states internally — always returns a valid VisualParams.
 * Warnings go to console.warn, never to canvas.
 */
export function weatherToVisualParams(
  data: WeatherData | Partial<WeatherData> | null
): { params: WeatherVisualParams; state: DataState };

/**
 * Validate incoming JSON against WeatherData schema.
 * Returns validation result without throwing.
 */
export function validateWeatherData(
  raw: unknown
): { valid: true; data: WeatherData } | { valid: false; errors: string[]; partial: Partial<WeatherData> };

/**
 * Clamp a value to [min, max], returning min/max when out of range.
 * Returns defaultVal on NaN/undefined/null.
 */
export function safeClamp(
  value: number | undefined | null,
  min: number,
  max: number,
  defaultVal: number
): number;

/**
 * Map temperature to hue position on the DASH weather ramp.
 */
export function temperatureToHue(temp: number): number;

/**
 * Weather color ramp: cold → warm.
 * Returns hex from DASH_BRAND_PALETTE.
 */
export function weatherHueColor(hueShift: number): string;

/**
 * NO_DATA_DEFAULTS — canonical defaults for all WeatherVisualParams fields.
 */
export const NO_DATA_DEFAULTS: Readonly<WeatherVisualParams>;
```

### Data Fetch + Validation Flow

```ts
// Consumer sketch owns fetch. @dash/p5-motion owns transform.
async function fetchAndVisualize(url: string): Promise<WeatherVisualParams> {
  const response = await fetch(url);
  const raw = await response.json();
  const { params } = weatherToVisualParams(raw); // always succeeds
  return params;
}
```

### What stays in consuming sketch (p5js-lab)
- `fetch()` call with error handling (network timeout → no-data state)
- p5 lifecycle: `setup()` / `draw()` consuming `WeatherVisualParams`
- L2 ambient field rendering (flow-field-style, driven by visual params)
- L1 data visualization rendering (numeric labels + visual indicators)
- L3 metadata panel rendering (location + timestamp)
- UI controls: dataUrl input, refresh button, updateInterval dropdown
- Auto-refetch timer (setInterval based on updateInterval)

### Implementation Estimations

| Component | Lines | Complexity |
|-----------|------:|:----------:|
| Types + exports (`index.ts`) | ~50 | Low |
| `validateWeatherData()` | ~35 | Low |
| `weatherToVisualParams()` | ~60 | Medium — 3 fallback states |
| `safeClamp()` + `temperatureToHue()` etc. | ~30 | Low |
| Consumer sketch (p5js-lab) | ~150 | Medium |
| **Total (p5-motion)** | **~175** | |
| **Total (sketch)** | **~150** | |

---

## Acceptance Criteria

- [ ] `bun run typecheck` passes (zero errors)
- [ ] No-data state renders calm neutral field (all params at NO_DATA_DEFAULTS)
- [ ] Partial data: present fields drive their visual params; missing → default; L3 shows `—`
- [ ] Malformed data: silent clamp, no error text on canvas, console.warn only
- [ ] All 7 visual params produce observable differences at data extremes (cold/hot, dry/humid, calm/stormy)
- [ ] Motion budget validates — `validateMotionBudget(dashDataWeather.motionBudget)` returns []
- [ ] All colors resolve to DASH Brand palette
- [ ] `fetch()` failure → no-data state (not crash, not blank canvas)
- [ ] JSON with extra fields → accepted (forward-compatible, ignore unknown)
- [ ] JSON with wrong types (e.g. `"temperature": "hot"`) → malformed → clamp
- [ ] Temperature -20°C → Cobalt blue hue; 45°C → Neon Yellow hue
- [ ] Data refresh respects `updateInterval` — no fetch faster than configured
- [ ] Visual mode taxonomy audit: reads as `diagram`, not `dashboard` — editorial data mural, not a monitoring screen
- [ ] `inputContract.mapping` matches actual field→param keys

---

## References

- Researcher: `docs/p5js-frontier-research.md §2.7 数据驱动生成`
- Memory Weather Map: existing prototype (visual reference)
- DASH Brand: `@dash/tokens` — Deep Green #10291F / Mid Green #35584C / Neon Yellow #F0EE9B / Cream #f8f5ef / Sand #ddd6c7 / Cobalt #0018ff / Cyan #00e5ff
- JSON Schema spec: https://json-schema.org/draft/2020-12
- Nature of Code: flow field rendering (for L2 ambient field)
- OpenWeather API: https://openweathermap.org/api (reference data shape, not hard dependency)
