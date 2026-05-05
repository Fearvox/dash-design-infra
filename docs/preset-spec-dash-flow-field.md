# Preset Spec: `dashFlowField`

**Date:** 2026-05-01
**Author:** @Designer
**Status:** draft → @Coder implementation
**Template:** v2 (docs/p5-motion-preset-spec-template.md)

---

## P5MotionPresetV2 Contract

```ts
const dashFlowField: P5MotionPresetV2 = {
  name: 'dash-flow-field',
  source: 'docs/p5js-frontier-research.md §2.1 Flow Fields + Tyler Hobbs',
  canvas: 'portrait',

  layers: [
    'L0 solid ground',
    'L1 flow field lines',
    'L2 color wash',
    'L3 highlight accents',
  ],

  does: [
    'generates organic flow-field texture from Perlin noise',
    'maps flow velocity/direction to DASH brand palette',
    'produces editorial-grade background texture (not foreground spectacle)',
    'accepts seed + 3 parameters for reproducible infinite variation',
  ],

  useWhen: [
    'replacing static CSS gradients with organic editorial texture',
    'creating atmospheric poster backgrounds',
    'generating DASH-branded visual noise for decks/one-pagers',
  ],

  // ── v2 extensions ──

  technique: ['flow-field', 'noise-terrain'],
  visualMode: 'atmospheric',
  motionBudget: [
    { layerName: 'L0 solid ground',        intensity: 'static',   maxAmplitude: 0,    periodSeconds: 0 },
    { layerName: 'L1 flow field lines',    intensity: 'breathe',  maxAmplitude: 8,    periodSeconds: 24 },
    { layerName: 'L2 color wash',          intensity: 'drift',    maxAmplitude: 24,   periodSeconds: 16 },
    { layerName: 'L3 highlight accents',   intensity: 'breathe',  maxAmplitude: 4,    periodSeconds: 12 },
  ],
  colorContract: {
    primary: 'cream',
    background: 'cream',
    accent: 'green',
    glass: 'frost',
  },
  inputContract: {
    type: 'none',
    mapping: {},
  },
  shaderHint: false,
};
```

---

## Visual Design

### Layout

```
┌─────────────────────────────────────┐
│                                     │
│    L0: solid Cream #f8f5ef ground   │
│                                     │
│    L1: curving flow lines           │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│    color: Deep Green #10291F        │
│    weight: 1-3px, 60-120 lines     │
│    noise octaves: 2-3              │
│                                     │
│    L2: color wash overlay           │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │
│    Mid Green + Neon Yellow wash     │
│    alpha: 0.06-0.14                │
│    large noise field (1 octave)    │
│                                     │
│    L3: sparse highlight accents     │
│    ·  ·    ·   ·      ·  ·        │
│    Neon Yellow glow points          │
│    count: 12-24, r: 3-8px         │
│    placed on field convergence     │
│                                     │
└─────────────────────────────────────┘
```

### Color Mapping

Flow field velocity → DASH palette:

```
velocity 0.0 ................. Cream #f8f5ef      (no flow)
velocity 0.25 ................ Warm Sand #ddd6c7   (slow drift)
velocity 0.5 ................. Mid Green #35584C   (medium flow)
velocity 0.75 ................ Deep Green #10291F  (strong current)
velocity 1.0 ................. Neon Yellow #F0EE9B (convergence point)
```

### Noise Configuration

```
baseScale:   0.002-0.006   (larger = wider curves)
octaves:     2-3           (more = finer detail)
falloff:     0.5           (standard Perlin)
seed:        user-defined  (deterministic)
timeScale:   0.0003        (how fast field evolves per frame)
```

### Line Rendering

- **Algorithm**: Streamline placement (not random sampling)
  - Seed points placed on staggered grid (60-120 starting positions)
  - Each seed follows noise vector field for N steps
  - Skip seed if within `minDistance` of existing line → avoids clumping
- **Line style**: `vertex()` chains (p5.js v2.2.3 removed `curveVertex` from instance API; use dense point sampling with stepSize ≤ 2.5 to maintain smooth appearance), `strokeWeight(1-3)`, `strokeCap(ROUND)`
- **Line count**: 60 (sparse) to 120 (dense), controlled by density param

---

## Parameter Space

Three primary parameters (3-axis sweet spot):

| Param | Range | Default | Controls |
|-------|-------|---------|----------|
| `density` | 0.1 – 1.0 | 0.6 | Line count: 60→120 |
| `turbulence` | 0.0 – 1.0 | 0.5 | Noise octaves: 1→3, amplitude scale |
| `seed` | 1000 – 9999 | 2048 | Deterministic seed for reproducible output |

UI labels (end-user facing):
- "Flow density" (density)
- "Turbulence" (turbulence)
- "Seed" (seed + regenerate button)

---

## Technical Implementation Notes

### What goes in `@dash/p5-motion` (reusable)
- `FlowField` type: `{ cols, rows, angles: number[][], magnitudes: number[][] }`
- `FlowFieldConfig` type: `{ cols, rows, noiseScale, noiseOctaves, noiseFalloff, zOffset }`
- `Noise3D` callback type: `(x: number, y: number, z: number) => number`
- `FlowLinePoint` type: `{ x, y, angle }`
- `generateFlowField(config, noiseFn)` → `FlowField` — pure function, no p5 dependency
- `traceFlowLine(field, startX, startY, stepSize, maxSteps, width, height)` → `FlowLinePoint[]` — pure function
- `sampleFlowField(field, px, py, cellWidth, cellHeight)` → `number` — bilinear interpolation
- `flowColorForVelocity(velocity)` → `string` — 5-level DASH color ramp hex

### What stays in consuming sketch (p5js-lab)
- p5 runtime lifecycle (setup/draw)
- UI controls wiring
- Color wash + highlight layer rendering
- Export/screenshot logic
- `Noise3D` callback bridging: `(x, y, z) => p.noise(x, y, z)`
- ⚠️ **p5.js v2.2.3 incompatibility**: `curveVertex()` does not exist on the p5 instance in v2. Use `p.vertex()` with dense sampling (`stepSize ≤ 2.5`) instead. Also, `p.noLoop()` called in `setup()` prevents `draw()` from executing — call it at the end of `draw()` instead.

### Streamline Placement Algorithm (pseudocode)

```ts
// In @dash/p5-motion (pure functions):
const field = generateFlowField(config, noiseFn);
const line = traceFlowLine(field, startX, startY, stepSize, maxSteps, width, height);

// In consumer sketch (p5 rendering):
// NOTE: p5.js v2.2.3 removed curveVertex() from instance API.
// Use vertex() with dense point sampling (stepSize ≤ 2.5) for smooth curves.
for (const pt of line) {
  p.vertex(pt.x, pt.y);
}
```

---

## Acceptance Criteria

- [ ] `bun run typecheck` passes (zero errors)
- [ ] Still mode (`?still=1`) produces a static poster-grade image
- [ ] Animated mode shows slow, organic field evolution (breathe intensity only)
- [ ] Three params (density/turbulence/seed) produce visually distinct outputs at extremes
- [ ] All colors resolve to DASH Brand palette (no hardcoded non-DASH colors)
- [ ] Lines do not clump — streamline placement with `minDistance` works
- [ ] `seed` produces deterministic output (same seed = same image)
- [ ] Visual mode taxonomy audit: reads as `atmospheric`, not `kinetic` — calm, editorial, background-grade

---

## References

- Researcher: `docs/p5js-frontier-research.md §2.1 Flow Fields`
- Tyler Hobbs: https://tylerxhobbs.com/fidenza
- Nature of Code: https://natureofcode.com/ (Chapter: Flow Fields)
- Coding Train: https://thecodingtrain.com/ (Search: flow field)
