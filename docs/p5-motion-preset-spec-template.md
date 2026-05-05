# P5 Motion Preset Spec Template v2

**Date:** 2026-05-01
**Author:** @Designer
**Scope:** extends `P5MotionPreset` contract to support complex generative techniques (shader, particle, data-driven, reaction-diffusion, etc.)

---

## Design Principle

> Every preset is a **repeatable visual contract**. The preset describes what the viewer should see, not how p5.js achieves it. Implementation is free to change; the contract stays.

---

## Preset Contract Fields

### Required (from existing `P5MotionPreset`)

| Field | Type | Purpose |
|-------|------|---------|
| `name` | `string` | kebab-case unique ID |
| `source` | `string` | path to reference analysis or design brief |
| `canvas` | `'portrait' \| 'landscape' \| 'square'` | canvas orientation |
| `layers` | `readonly string[]` | ordered layer names (bottom → top) |
| `does` | `readonly string[]` | 3-5 bullet description of visual behavior |
| `useWhen` | `readonly string[]` | 2-3 decision triggers for when to apply this preset |

### Extended Fields (new in v2)

| Field | Type | Purpose |
|-------|------|---------|
| `technique` | `TechniqueTag[]` | what generative method powers this preset |
| `visualMode` | `VisualMode` | which DASH editorial mode this belongs to |
| `motionBudget` | `MotionBudget` | per-layer motion intensity allocation |
| `colorContract` | `ColorContract` | which DASH palette this preset binds to |
| `inputContract` | `InputContract` | what external data this preset consumes (if any) |
| `shaderHint` | `boolean` | does this preset need WEBGL mode |

---

## Technique Taxonomy (`TechniqueTag`)

```
┌─── Deterministic Geometry ───┐
│ tile-grid                    │ existing: blueAppleCollageLoop
│ crop-reveal                  │ image-slice + controlled drift
│ scan-band                    │ existing: frontierPosterScan
│ isobar                       │ weather-style contour lines
└──────────────────────────────┘

┌─── Noise & Field ────────────┐
│ flow-field                   │ Perlin/simplex particle advection
│ noise-terrain                │ 2D noise → height map / color field
│ reaction-diffusion           │ Gray-Scott / Turing pattern
│ electric-field               │ existing: Electric Archive
└──────────────────────────────┘

┌─── Particle Systems ─────────┐
│ particle-trail               │ fading agent trails
│ boid-flock                   │ Reynolds flocking
│ attractor-field              │ Lorenz / Aizawa strange attractor
│ snow-globe                   │ drifting particles with gravity
└──────────────────────────────┘

┌─── Typography & Layout ──────┐
│ type-kinetic                 │ animated type (scale/opacity/position)
│ glyph-scatter                │ character-level particle system
│ calligraphic-stroke          │ velocity-based brush simulation
│ grid-morph                   │ layout grid animated transform
└──────────────────────────────┘

┌─── Shader & GL ──────────────┐
│ fragment-shader              │ custom GLSL fragment shader
│ vertex-displace              │ geometry displacement
│ ray-march                    │ signed distance field rendering
│ post-process                 │ blur / bloom / color-grade pass
└──────────────────────────────┘

┌─── Data-Driven ──────────────┐
│ audio-reactive               │ FFT / amplitude → visual params
│ api-stream                   │ real-time API data → visual mapping
│ time-series                  │ temporal data → animated glyph
│ graph-layout                 │ force-directed / hierarchical
└──────────────────────────────┘

┌─── L-System & Fractal ───────┐
│ l-system                     │ string rewriting → branching
│ fractal-tree                 │ recursive subdivision
│ mandelbrot                   │ escape-time fractal zoom
│ space-colony                 │ growth algorithm
└──────────────────────────────┘
```

---

## DASH Visual Mode Taxonomy (`VisualMode`)

```
evidence    — forensic, archival, documentary, cold data
editorial   — magazine, poster, one-pager, deck
kinetic     — motion-first, video, social clip
atmospheric — ambient, mood, background, installation
dashboard   — data display, monitoring, real-time
diagram     — explanatory, flow, architecture
```

Each preset declares one primary `visualMode`. A preset may support a secondary mode but must declare which is primary.

---

## Motion Budget (`MotionBudget`)

Per-layer motion intensity allocation. Ensures the "only one layer moves quickly" rule.

```
type MotionBudget = {
  layerName: string;
  intensity: 'static' | 'breathe' | 'drift' | 'pulse' | 'flow';
  maxAmplitude: number;   // px
  periodSeconds: number;   // full cycle time
}[];
```

| Intensity | Visual | Use |
|-----------|--------|-----|
| `static` | no motion | base poster, typography, glass cards |
| `breathe` | slow opacity/scale | weather mass, background texture |
| `drift` | slow positional | cloud, isobar, noise field |
| `pulse` | brief snap | sharp glyphs, data points |
| `flow` | continuous movement | particles, scan bands, trails |

**Rule**: at most 1 layer at `flow` intensity at any time.

---

## Color Contract (`ColorContract`)

```ts
type ColorContract = {
  primary: 'green' | 'cobalt' | 'sand' | 'neon-yellow' | 'cream' | 'ink';
  background: 'cream' | 'deep-green' | 'dark-blue';
  accent: 'neon-yellow' | 'cobalt' | 'cyan';
  glass: 'frost' | 'smoked' | 'clear';
};
```

Maps to DASH Brand palette:
- `green` → Deep Green `#10291F`
- `cobalt` → `#0018ff` (Electric Archive signature)
- `sand` → Warm Sand `#ddd6c7`
- `neon-yellow` → `#F0EE9B`
- `cream` → `#f8f5ef`
- `ink` → `#1a1a18`

---

## Input Contract (`InputContract`)

For data-driven presets:

```ts
type InputContract = {
  type: 'none' | 'image-sequence' | 'audio-stream' | 'api-fetch' | 'csv' | 'live-ws';
  frameCount?: number;        // for image sequences
  sampleRate?: number;        // for audio
  endpoint?: string;          // for API
  mapping: Record<string, string>;  // data field → visual param
};
```

---

## Example: Electric Archive as v2 Spec

```ts
const electricArchive: P5MotionPresetV2 = {
  // Required
  name: 'electric-archive',
  source: 'references/xhs-frontier-poster/ANALYSIS.md',
  canvas: 'portrait',
  layers: [
    'L0 paper map',
    'L1 weather mass',
    'L2 soft frost cards',
    'L3 sharp data glyphs',
    'L4 smoked radar accent',
  ],
  does: [
    'composes a structured editorial base poster',
    'overlays sampled image frames as atmospheric weather mass',
    'animates scan bands and electric field lines',
    'renders sparse sharp glyphs (dots/fronts/stations)',
    'adds selective smoked-radar glow on right side',
  ],
  useWhen: [
    'creating a kinetic editorial poster from static references',
    'stress-testing visual hierarchy under motion',
    'building evidence-grade memory visualizations',
  ],

  // Extended v2
  technique: ['scan-band', 'electric-field', 'particle-trail', 'post-process'],
  visualMode: 'editorial',
  motionBudget: [
    { layerName: 'L0 paper map', intensity: 'static', maxAmplitude: 0, periodSeconds: 0 },
    { layerName: 'L1 weather mass', intensity: 'breathe', maxAmplitude: 42, periodSeconds: 16 },
    { layerName: 'L2 soft frost cards', intensity: 'static', maxAmplitude: 0, periodSeconds: 0 },
    { layerName: 'L3 sharp data glyphs', intensity: 'pulse', maxAmplitude: 34, periodSeconds: 4 },
    { layerName: 'L4 smoked radar accent', intensity: 'drift', maxAmplitude: 72, periodSeconds: 8 },
  ],
  colorContract: {
    primary: 'cobalt',
    background: 'dark-blue',
    accent: 'cyan',
    glass: 'smoked',
  },
  inputContract: {
    type: 'image-sequence',
    frameCount: 20,
    mapping: { 'frame-index': 'scan exposure' },
  },
  shaderHint: false,
};
```

---

## Validation Rules

1. Every layer in `layers` must have an entry in `motionBudget`
2. At most one layer at `flow` intensity
3. `technique` tags must match the preset's `does` descriptions
4. `colorContract` must resolve to DASH Brand palette hex values
5. `inputContract.type` must match actual data consumption
6. `shaderHint: true` requires WEBGL canvas mode

---

## Next: Implementation TypeScript Interface

Once this spec template is approved, @Coder will extend `P5MotionPreset` in `packages/p5-motion/src/index.ts` to the v2 interface, keeping backward compatibility with existing presets.
