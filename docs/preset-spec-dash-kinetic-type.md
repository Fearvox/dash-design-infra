# Preset Spec: `dashKineticType`

**Date:** 2026-05-01
**Author:** @Designer
**Status:** draft → @Reviewer Phase 2 gate
**Template:** v2 (docs/preset-spec-dash-flow-field.md)

---

## P5MotionPresetV2 Contract

```ts
const dashKineticType: P5MotionPresetV2 = {
  name: 'dash-kinetic-type',
  source: 'docs/p5js-frontier-research.md §2.6 字体排版动画 + Zach Lieberman + Blue Apple',
  canvas: 'portrait',

  layers: [
    'L0 solid ground',
    'L1 typography composition',
    'L2 baseline accent',
    'L3 editorial overlay',
  ],

  does: [
    'renders text as compositional material — typography is layout, not UI caption',
    'positions type on a strict DASH baseline grid with Swiss/RISD restraint',
    'applies breathe/drift motion to individual glyphs or word blocks',
    'produces editorial-grade kinetic posters (not screensaver-style type animation)',
  ],

  useWhen: [
    'creating DASH editorial title cards, hero sections, or one-pager headers',
    'generating kinetic type posters for social/deck/presentation surfaces',
    'rendering data-driven label overlays (e.g. dashDataWeather annotations)',
  ],

  // ── v2 extensions ──

  technique: ['type-kinetic', 'calligraphic-stroke'],
  visualMode: 'editorial',
  motionBudget: [
    { layerName: 'L0 solid ground',        intensity: 'static',   maxAmplitude: 0,    periodSeconds: 0 },
    { layerName: 'L1 typography composition', intensity: 'drift',    maxAmplitude: 12,   periodSeconds: 20 },
    { layerName: 'L2 baseline accent',     intensity: 'drift',    maxAmplitude: 12,   periodSeconds: 18 },
    { layerName: 'L3 editorial overlay',   intensity: 'breathe',  maxAmplitude: 4,    periodSeconds: 14 },
  ],
  colorContract: {
    primary: 'ink',
    background: 'cream',
    accent: 'neon-yellow',
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

### Editorial Philosophy

dashKineticType 不是"文字动画工具"，而是**排版作为生成艺术母题**的 preset。遵守三条原则：

1. **文字即构图** — type 是视觉材料本身，不是 overlay/caption
2. **克制即力量** — Swiss/RISD 风格的严格网格 + 最小动效 = 最大编辑感
3. **网格是骨骼** — 所有元素系于 DASH baseline grid，偏离即意图

### Layout

```
┌─────────────────────────────────────┐
│                                     │
│    L0: solid Cream #f8f5ef ground   │
│    (editorial margin preserved)     │
│                                     │
│    ═══ L2: baseline accent ═══════ │
│    (Neon Yellow hairline at grids)  │
│                                     │
│    L1: typography composition       │
│                                     │
│       ┌──────────────────────┐      │
│       │   K I N E T I C      │      │
│       │   T  Y  P  O  G  R  │      │
│       │   A  P  H  Y         │      │
│       │                      │      │
│       │   editorial motion   │      │
│       │   at baseline speed  │      │
│       └──────────────────────┘      │
│                                     │
│    L3: editorial overlay            │
│    (subtle noise wash / soft edge)  │
│                                     │
└─────────────────────────────────────┘
```

### Composition Modes (3 primary layouts)

#### Mode A: Hero Word
- Single word or short phrase (3-12 chars)
- Centered, large scale (font-size: 12-18vw)
- Letters breathe individually — slow stagger (0.05s offset between chars)
- Perfect for DASH title cards, deck openers

#### Mode B: Editorial Block
- Longer text (20-80 chars, 2-6 lines)
- Left-aligned or centered, constrained to 55-65ch measure
- Block drifts as a unit (L1 intensity: drift at block level, breathe at line level)
- Perfect for one-pager body text, manifesto quotes

#### Mode C: Scattered Grid
- Individual words placed on staggered grid (3×3 to 5×4)
- Each word is an independent motion unit — phase-offset breathe
- Background accent grid (L2) connects positions
- Perfect for data labels, tag clouds, keyword clusters

### Baseline Grid System

```
grid-unit:    8px     (aligned with DASH 8px baseline)
font-size:    multiples of 4px (14/18/24/32/48/64)
line-height:  multiples of 8px (24/32/40/48/64/80)
letter-spacing: ±2px from default (tracking: tight/normal/wide)
```

DASH 现有 14px baseline（`@dash/scale` Perfect Fifth），本 preset 使用 8px grid 与 Tailwind/p5.js 对齐。两套 grid 不冲突 — 文字块内部用 DASH 14px，canvas 网格用 8px。

### Motion Grammar

每个 mode 的动效语言：

| Mode | Layer | Intensity | Description |
|------|-------|-----------|-------------|
| Hero | L1 chars | breathe | 0.05s phase stagger per char · slight y-displace (±3px) · alpha drift 0.9–1.0 |
| Block | L1 lines | drift | Whole block ±12px drift · lines individually phase-offset · rotation ±0.5° |
| Grid | L1 words | breathe | 2D breathe pattern (x ±4px, y ±2px) · phase = grid position |
| All | L2 accent | drift | Baseline hairline slowly scrolls/ripples · max amplitude 12px |
| All | L3 overlay | breathe | Noise wash · alpha 0.03–0.08 · connects L1 to L0 |

### Color Mapping

```
L0 background:      Cream #f8f5ef     (warm, editorial paper feel)
L1 primary text:    Ink #1a1a18       (high contrast on cream, >0.92)
L1 secondary text:  Deep Green #10291F (label/annotation text)
L1 accent text:     Neon Yellow #F0EE9B (on dark bg only, e.g. inverted mode)
L2 accent line:     Neon Yellow #F0EE9B (0.6 alpha, hairline 0.5px)
L3 overlay noise:   Sand #ddd6c7      (low alpha, connects surface to ground)
```

### Dark Mode Variant

```
L0 background:      Ink #1a1a18       (flipped)
L1 primary text:    Cream #f8f5ef     (flipped)
L1 secondary text:  Sand #ddd6c7
L1 accent text:     Neon Yellow #F0EE9B
L2 accent line:     Neon Yellow #F0EE9B (0.4 alpha)
L3 overlay noise:   Deep Green #10291F (low alpha)
```

### Anti-Patterns (Blocked by Design)

1. **No random position** — all type positions snap to grid intersections; deviation is parametric, not random
2. **No rotation > 2°** — Swiss minimalism demands justified precision; wild rotation breaks editorial tone
3. **No color outside DASH palette** — even the noise wash stays in-brand
4. **No fade-to-zero for primary content** — minimum alpha for L1 text is 0.7 (readability guarantee)
5. **No letter-by-letter chaos** — stagger is phase-offset breathe, not randomized explosion

---

## Parameter Space

Three primary parameters:

| Param | Range | Default | Controls |
|-------|-------|---------|----------|
| `composition` | `hero` / `block` / `grid` | `hero` | Layout mode (see §Composition Modes) |
| `motionScale` | 0.0 – 1.0 | 0.4 | Multiplier on all motion amplitudes (0 = static poster, 1 = full motion budget) |
| `textContent` | string | `"KINETIC"` | The text to render (for demo: 1-80 chars; truncation + ellipsis for overflow) |

### Extended Parameters (v2+)

| Param | Range | Default | Controls |
|-------|-------|---------|----------|
| `typeScale` | 0.6 – 1.4 | 1.0 | Font-size multiplier (relative to canvas-optimal default per mode) |
| `tracking` | `tight` / `normal` / `wide` | `normal` | Letter-spacing preset |
| `darkMode` | boolean | `false` | Toggle dark mode palette |
| `seed` | 1000 – 9999 | 4096 | Deterministic seed for noise/jitter |

### Parameter Interaction Matrix

| composition | motionScale effect | tracking sweet spot | textContent constraint |
|-------------|-------------------|---------------------|----------------------|
| `hero` | scales char-level breathe | `wide` | 3-12 chars |
| `block` | scales block+line drift | `normal` | 20-80 chars |
| `grid` | scales word-level breathe array | `tight` | ≤14 words (split by space) |

---

## Technical Implementation Notes

### What goes in `@dash/p5-motion` (reusable)

```ts
// ── Kinetic Type Types ──

/** Layout composition mode. */
export type KineticComposition = 'hero' | 'block' | 'grid';

/** Tracking preset. */
export type TypeTracking = 'tight' | 'normal' | 'wide';

/** Tracking → letter-spacing px mapping. */
export const TRACKING_PX: Record<TypeTracking, number> = {
  tight: -1,
  normal: 0,
  wide: 2,
};

/** Single glyph descriptor for the renderer. */
export interface KineticGlyph {
  char: string;
  x: number;
  y: number;
  fontSize: number;
  alpha: number;
  phase: number;        // 0-1, determines position in breathe cycle
  group: number;        // 0 = primary text, 1 = secondary accent
}

/** Layout result: glyph positions pre-motion. */
export interface KineticLayout {
  glyphs: KineticGlyph[];
  baselineY: number;    // primary baseline in canvas px
  gridUnit: number;     // 8px
  composition: KineticComposition;
}

/** Baseline grid accent line descriptor. */
export interface BaselineAccent {
  y: number;
  alpha: number;
  phase: number;
}
```

### Layout Functions (pure, no p5 dependency)

```ts
/**
 * Compute glyph layout for a given composition mode.
 * Snaps all positions to 8px grid. Returns pre-motion positions.
 */
export function layoutKineticType(
  text: string,
  composition: KineticComposition,
  width: number,
  height: number,
  opts?: { typeScale?: number; tracking?: TypeTracking }
): KineticLayout;

/**
 * Apply motion to a glyph layout.
 * phaseOffset 0-1 = where in the breathe/drift cycle we are.
 */
export function animateKineticGlyphs(
  layout: KineticLayout,
  phaseOffset: number,
  motionScale: number
): KineticGlyph[];

/**
 * Generate baseline accent positions.
 */
export function layoutBaselineAccents(
  height: number,
  gridUnit: number,
  count: number
): BaselineAccent[];

/**
 * Determine font-size for a composition mode + canvas size.
 */
export function kineticTypeScale(
  composition: KineticComposition,
  canvasWidth: number,
  canvasHeight: number,
  scaleMultiplier?: number
): number;
```

### What stays in consuming sketch (p5js-lab)
- p5 runtime lifecycle (setup/draw)
- `p.textFont()` with Geist Sans (DASH primary font)
- `p.text()` / `p.textSize()` / `p.textAlign()` calls for each glyph
- Baseline accent line rendering (`p.line()` with `strokeWeight(0.5)`)
- UI controls wiring (composition selector, motionScale slider, text input)
- Dark mode toggle
- `Noise3D` callback for L3 overlay noise

### Font Strategy

| Font | Usage | Source |
|------|-------|--------|
| Geist Sans | Primary text (all modes) | `@dash/scale` — DASH primary UI font |
| Geist Sans (bold) | Hero mode emphasis | `@dash/scale` |
| Geist Mono | Code/annotation text | `@dash/scale` |

⚠️ p5.js font loading: `loadFont()` must be called in `preload()`, not `setup()`. Font file must be a `.ttf` or `.otf` file accessible at a URL path. Consumer sketch is responsible for font loading; `@dash/p5-motion` is font-agnostic (operates on glyph positions only).

### Implementation Estimations

| Component | Lines | Complexity |
|-----------|------:|:----------:|
| Types + exports (`index.ts`) | ~40 | Low |
| `layoutKineticType()` | ~80 | Medium — 3 composition modes |
| `animateKineticGlyphs()` | ~40 | Low |
| Consumer sketch (p5js-lab) | ~120 | Medium — render loop |
| **Total (p5-motion)** | **~160** | |
| **Total (sketch)** | **~120** | |

---

## Acceptance Criteria

- [ ] `bun run typecheck` passes (zero errors)
- [ ] Three composition modes produce visually distinct results at default params
- [ ] Motion budget validates — `validateMotionBudget(dashKineticType.motionBudget)` returns []
- [ ] All colors resolve to DASH Brand palette (`DASH_BRAND_PALETTE` values only)
- [ ] Still mode (`motionScale=0`) produces a static poster-grade layout
- [ ] Full motion (`motionScale=1`) respects budget: no layer exceeds `flow` intensity
- [ ] Hero mode: characters stagger with 0.05s offset, max y-displace ±3px
- [ ] Block mode: block drifts as unit ±12px, rotation ≤ ±0.5°
- [ ] Grid mode: ≥4 words placed on staggered grid, each independent breathe
- [ ] Glyph positions snap to 8px grid in all modes
- [ ] Primary text alpha never drops below 0.7 (readability hard floor)
- [ ] No rotation exceeds 2° (editorial restraint checker)
- [ ] `seed` produces deterministic output (same seed + params = same layout)
- [ ] Visual mode taxonomy audit: reads as `editorial`, not `kinetic` — restrained, Swiss/RISD, not chaotic
- [ ] Dark mode toggle flips palette correctly

---

## References

- Researcher: `docs/p5js-frontier-research.md §2.6 字体排版动画`
- Zach Lieberman: https://instagram.com/zach.lieberman (Daily Sketches)
- Blue Apple reference: `references/xhs-blue-apple/ANALYSIS.md`
- DASH Brand: `@dash/tokens` + `@dash/scale` (14px baseline / Perfect Fifth)
- Swiss Style (International Typographic Style): grid systems, Helvetica, asymmetry in grid, Akzidenz-Grotesk
- RISD graphic design: conceptual rigor, editorial restraint, typography as form
- p5.js typography: https://p5js.org/reference/p5/text/
