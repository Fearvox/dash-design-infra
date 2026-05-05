/**
 * @dash/p5-motion/composer — Multi-layer compositing infrastructure.
 *
 * Design strategy: concrete compositions first, extract common patterns after
 * validation. All types and utilities are p5-free — consumers own the rendering
 * pipeline and call p5.blendMode() / p5.Graphics at their discretion.
 *
 * Key constraint: does NOT fork the preset contract. Compositions are lightweight
 * metadata bundles that reference standard P5MotionPresetV2 presets by name.
 *
 * Reference: docs/p5js-frontier-research.md §3.2 §4.3 (Tier 3 — Layer Composer)
 */

import type { P5MotionPresetV2, VisualMode } from './index';
// NOTE: no runtime import from ./index — avoids circular dependency
// (index.ts re-exports this module). Preset names are string constants here.

// ── Blend Modes ────────────────────────────────────────────────────────────

/** Blend modes available for layer compositing.
 *  Described as a contract — consumers map these to p5.blendMode() calls. */
export type LayerBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'add'
  | 'difference';

/** Known blend modes for runtime lookup / validation. */
export const LAYER_BLEND_MODES: readonly LayerBlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'add', 'difference',
] as const;

// ── Layer Transform ─────────────────────────────────────────────────────────

/** Per-layer transform and animation phase offset.
 *  Consumer applies these before calling the child preset's draw routine. */
export interface LayerTransform {
  /** Opacity in [0, 1]. Default 1. */
  alpha: number;
  /** Pixel offset from origin. Default 0. */
  offsetX: number;
  offsetY: number;
  /** Uniform scale factor. Default 1. */
  scale: number;
  /** Animation phase offset in seconds. Shifts this layer's timeline
   *  relative to sibling layers, enabling staggered animation. */
  phaseOffset: number;
}

/** Identity transform — pass-through with no modification. */
export const IDENTITY_TRANSFORM: LayerTransform = {
  alpha: 1,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  phaseOffset: 0,
};

// ── Composed Layer ──────────────────────────────────────────────────────────

/** A single composed layer wrapping a child preset with blend + transform. */
export interface ComposedLayer {
  /** Reference to a child preset by its P5MotionPresetV2.name. */
  presetRef: string;
  /** Blend mode applied when compositing this layer over previous layers. */
  blend: LayerBlendMode;
  /** Transform applied to this layer before rendering. */
  transform: LayerTransform;
  /** Z-order — lower values render first (bottom), higher render last (top).
   *  Must be unique within a composition. */
  zIndex: number;
}

// ── Layer Composition ───────────────────────────────────────────────────────

/** Describes a multi-preset composition: a stack of presets rendered together. */
export interface LayerComposition {
  /** Unique kebab-case name. */
  name: string;
  /** Reference to design doc or research section. */
  source: string;
  /** Canvas orientation. */
  canvas: 'portrait' | 'landscape' | 'square';
  /** Ordered layer stack — consumers sort by zIndex before rendering. */
  layers: readonly ComposedLayer[];
  /** Which DASH visual mode this composition targets. */
  visualMode: VisualMode;
  /** Human-readable description of what the composition achieves. */
  does: readonly string[];
  /** Decision triggers for when to use this composition. */
  useWhen: readonly string[];
}

// ── Composite Spec ──────────────────────────────────────────────────────────

/**
 * Lightweight bundle: a standard P5MotionPresetV2 + its layer composition
 * metadata. Does NOT fork the preset contract — `preset` is a plain
 * P5MotionPresetV2, and `composition` carries the compositing details
 * (blend modes, z-order, phase offsets).
 */
export interface CompositeSpec {
  /** The preset as a standard P5MotionPresetV2 — no contract extension. */
  preset: P5MotionPresetV2;
  /** Composition metadata describing how child presets stack. */
  composition: LayerComposition;
}

// ── Validation ─────────────────────────────────────────────────────────────

/**
 * Validate a layer composition for structural correctness.
 * Returns an array of violation messages — empty means valid.
 *
 * Checks:
 *  - Every presetRef resolves to a known preset name
 *  - zIndex values are unique across layers
 *  - alpha in [0, 1], scale > 0 and finite
 */
export function validateLayerComposition(
  composition: LayerComposition,
  availablePresetNames: readonly string[],
): string[] {
  const violations: string[] = [];
  const zSeen = new Set<number>();

  for (const layer of composition.layers) {
    // ── presetRef exists ──
    if (!availablePresetNames.includes(layer.presetRef)) {
      violations.push(
        `layer presetRef "${layer.presetRef}" not found. ` +
        `Available: [${availablePresetNames.join(', ')}]`,
      );
    }

    // ── unique zIndex ──
    if (zSeen.has(layer.zIndex)) {
      violations.push(
        `duplicate zIndex ${layer.zIndex} in "${composition.name}". ` +
        `Each layer must have a unique zIndex.`,
      );
    }
    zSeen.add(layer.zIndex);

    // ── alpha range ──
    if (layer.transform.alpha < 0 || layer.transform.alpha > 1) {
      violations.push(
        `layer "${layer.presetRef}": alpha must be 0–1, got ${layer.transform.alpha}`,
      );
    }

    // ── scale range ──
    if (layer.transform.scale <= 0 || !Number.isFinite(layer.transform.scale)) {
      violations.push(
        `layer "${layer.presetRef}": scale must be positive finite, got ${layer.transform.scale}`,
      );
    }
  }

  return violations;
}

// ── Compose ────────────────────────────────────────────────────────────────

/**
 * Build an ordered layer execution plan from a composition.
 * Sorts layers by zIndex (low → high = bottom → top), validates structure,
 * and returns both the sorted plan and any violations.
 *
 * Consumer workflow:
 *   1. Call composeLayers() to get the ordered plan
 *   2. If violations.length > 0, surface errors before rendering
 *   3. Render each layer bottom→top: apply blend mode, transform, draw child preset
 */
export function composeLayers(
  composition: LayerComposition,
  availablePresetNames: readonly string[],
): { layers: readonly ComposedLayer[]; violations: string[] } {
  const violations = validateLayerComposition(composition, availablePresetNames);
  const sorted = [...composition.layers].sort((a, b) => a.zIndex - b.zIndex);
  return { layers: sorted, violations };
}

// ── Known Preset Names (registry) ──────────────────────────────────────────

/** Preset names available for composition — grows as presets land. */
export const KNOWN_PRESET_NAMES: readonly string[] = [
  'dash-flow-field',            // #50 dashFlowField — flow field anchor preset
  'dash-kinetic-type',          // #51 dashKineticType — typography animation preset
  'frontier-poster-scan',       // v1 preset — available as blending target
  'blue-apple-collage-loop',    // v1 preset — available as blending target
  'dash-ruler-grid',            // synthetic ruler grid layer — renderable now
];

// ── Concrete Composite Specs ───────────────────────────────────────────────
// Strategy: 3 concrete compositions covering blend modes, z-ordering,
// phase offsets, and synthetic overlay. All are renderable today — no
// empty placeholders.

export const compositeSpecs = {

  /**
   * dashFlowFieldPoster — atmospheric flow field + editorial poster overlay.
   *
   * Scenario: organic flow texture as background, static editorial poster
   * layer on top with soft-light blending. Demonstrates blend-mode bridge
   * between atmospheric and editorial visual modes.
   */
  dashFlowFieldPoster: {
    preset: {
      name: 'dash-flow-field-poster',
      source: 'docs/p5js-frontier-research.md §4.3 Layer Composer',
      canvas: 'portrait',
      layers: [
        'L0 atmospheric flow',
        'L1 editorial poster',
      ],
      does: [
        'composes an organic flow-field background texture',
        'overlays an editorial poster frame with soft-light blending',
        'keeps poster layer crisp while fusing into the atmospheric base',
        'demonstrates blend-mode compositing between visual modes',
      ],
      useWhen: [
        'creating an editorial visual with atmospheric depth',
        'testing blend-mode compositing across visual modes',
      ],
      technique: ['flow-field', 'scan-band'],
      visualMode: 'editorial',
      motionBudget: [
        { layerName: 'L0 atmospheric flow', intensity: 'breathe', maxAmplitude: 8, periodSeconds: 24 },
        { layerName: 'L1 editorial poster', intensity: 'static', maxAmplitude: 0, periodSeconds: 0 },
      ],
      colorContract: {
        primary: 'cream',
        background: 'cream',
        accent: 'green',
        glass: 'frost',
      },
      inputContract: { type: 'none', mapping: {} },
      shaderHint: false,
    } satisfies P5MotionPresetV2,

    composition: {
      name: 'dash-flow-field-poster',
      source: 'docs/p5js-frontier-research.md §4.3',
      canvas: 'portrait',
      visualMode: 'editorial',
      does: [
        'composes an organic flow-field background texture',
        'overlays an editorial poster frame with soft-light blending',
      ],
      useWhen: [
        'creating an editorial visual with atmospheric depth',
      ],
      layers: [
        {
          presetRef: 'dash-flow-field',
          blend: 'normal',
          transform: IDENTITY_TRANSFORM,
          zIndex: 0,
        },
        {
          presetRef: 'frontier-poster-scan',
          blend: 'soft-light',
          transform: { alpha: 0.85, offsetX: 0, offsetY: 0, scale: 1, phaseOffset: 8 },
          zIndex: 10,
        },
      ],
    } satisfies LayerComposition,
  } satisfies CompositeSpec,

  /**
   * dashFieldScan — atmospheric flow + kinetic scan band overlay.
   *
   * Scenario: organic flow-field base with energetic horizontal scan lines
   * on top using screen blend. Scan bands run on a phase-accelerated
   * timeline, demonstrating per-layer animation offset.
   */
  dashFieldScan: {
    preset: {
      name: 'dash-field-scan',
      source: 'docs/p5js-frontier-research.md §4.3 Layer Composer',
      canvas: 'portrait',
      layers: [
        'L0 flow texture',
        'L1 scan band overlay',
      ],
      does: [
        'lays down organic flow-field texture as atmospheric bedding',
        'superimposes horizontal scan bands with screen blend mode',
        'scan bands drift on a phase-accelerated timeline',
        'demonstrates z-ordered composite with per-layer animation offset',
      ],
      useWhen: [
        'need atmospheric background with kinetic energy overlay',
        'testing per-layer animation phase offset in composition',
      ],
      technique: ['flow-field', 'scan-band'],
      visualMode: 'kinetic',
      motionBudget: [
        { layerName: 'L0 flow texture', intensity: 'breathe', maxAmplitude: 6, periodSeconds: 24 },
        { layerName: 'L1 scan band overlay', intensity: 'flow', maxAmplitude: 32, periodSeconds: 8 },
      ],
      colorContract: {
        primary: 'cream',
        background: 'cream',
        accent: 'cobalt',
        glass: 'frost',
      },
      inputContract: { type: 'none', mapping: {} },
      shaderHint: false,
    } satisfies P5MotionPresetV2,

    composition: {
      name: 'dash-field-scan',
      source: 'docs/p5js-frontier-research.md §4.3',
      canvas: 'portrait',
      visualMode: 'kinetic',
      does: [
        'lays down organic flow-field texture as atmospheric bedding',
        'superimposes horizontal scan bands with screen blend mode',
      ],
      useWhen: [
        'need atmospheric background with kinetic energy overlay',
      ],
      layers: [
        {
          presetRef: 'dash-flow-field',
          blend: 'normal',
          transform: IDENTITY_TRANSFORM,
          zIndex: 0,
        },
        {
          presetRef: 'frontier-poster-scan',
          blend: 'screen',
          transform: { alpha: 0.45, offsetX: 0, offsetY: 0, scale: 1, phaseOffset: 4 },
          zIndex: 10,
        },
      ],
    } satisfies LayerComposition,
  } satisfies CompositeSpec,

  /**
   * dashFlowRuler — flow field base + synthetic ruler/grid overlay.
   *
   * Scenario: organic flow backdrop with a clean measurement grid on top
   * using multiply blend. The ruler layer is immediately renderable — it
   * draws horizontal/vertical guide lines + crosshair markers. Later,
   * #52 dashDataWeather can replace or augment this layer with real data.
   *
   * This validates the composition contract with a genuinely drawable
   * synthetic layer (not an empty placeholder).
   */
  dashFlowRuler: {
    preset: {
      name: 'dash-flow-ruler',
      source: 'docs/p5js-frontier-research.md §4.3 Layer Composer',
      canvas: 'portrait',
      layers: [
        'L0 flow atmosphere',
        'L1 ruler grid overlay',
      ],
      does: [
        'provides an organic flow-field as the atmospheric backdrop',
        'draws a synthetic ruler grid with multiply blend on top',
        'renders horizontal/vertical guide lines with crosshair markers',
        'demonstrates compositing with a drawable synthetic child layer',
      ],
      useWhen: [
        'validating the composition contract with a renderable overlay',
        'laying the groundwork for data-driven compositing (#52 integration)',
      ],
      technique: ['flow-field', 'time-series'],
      visualMode: 'dashboard',
      motionBudget: [
        { layerName: 'L0 flow atmosphere', intensity: 'breathe', maxAmplitude: 6, periodSeconds: 24 },
        { layerName: 'L1 ruler grid overlay', intensity: 'pulse', maxAmplitude: 12, periodSeconds: 6 },
      ],
      colorContract: {
        primary: 'cream',
        background: 'cream',
        accent: 'neon-yellow',
        glass: 'frost',
      },
      inputContract: { type: 'none', mapping: {} },
      shaderHint: false,
    } satisfies P5MotionPresetV2,

    composition: {
      name: 'dash-flow-ruler',
      source: 'docs/p5js-frontier-research.md §4.3',
      canvas: 'portrait',
      visualMode: 'dashboard',
      does: [
        'provides an organic flow-field as the atmospheric backdrop',
        'draws a synthetic ruler grid with multiply blend on top',
      ],
      useWhen: [
        'validating the composition contract with a renderable overlay',
      ],
      layers: [
        {
          presetRef: 'dash-flow-field',
          blend: 'normal',
          transform: IDENTITY_TRANSFORM,
          zIndex: 0,
        },
        {
          presetRef: 'dash-ruler-grid',
          blend: 'multiply',
          transform: { alpha: 0.75, offsetX: 0, offsetY: 0, scale: 1, phaseOffset: 0 },
          zIndex: 10,
        },
      ],
    } satisfies LayerComposition,
  } satisfies CompositeSpec,
} as const satisfies Record<string, CompositeSpec>;

export type CompositeSpecName = keyof typeof compositeSpecs;
