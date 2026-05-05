/**
 * @dash/p5-motion - p5.js motion grammar for DASH visual systems.
 *
 * This package intentionally avoids importing p5 at build time. Consumers own
 * their p5 runtime; this package owns reusable motion contracts, reference
 * presets, and deterministic geometry helpers.
 */

export interface MotionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MotionTile extends MotionRect {
  index: number;
  col: number;
  row: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

export interface TileFrame extends MotionTile {
  drawX: number;
  drawY: number;
  alpha: number;
}

export type MotionEasingName = 'linear' | 'easeInOutCubic' | 'pingPong';

export interface MotionPhaseDefinition<Name extends string = string> {
  name: Name;
  start: number;
  end: number;
  easing?: MotionEasingName;
}

export interface MotionTimelineDefinition<Name extends string = string> {
  totalFrames: number;
  phases: readonly MotionPhaseDefinition<Name>[];
}

export interface MotionTimelinePhase<Name extends string = string> {
  name: Name;
  start: number;
  end: number;
  easing: MotionEasingName;
}

export interface MotionPhaseState {
  active: boolean;
  progress: number;
  eased: number;
  start: number;
  end: number;
  easing: MotionEasingName;
}

export interface MotionTimelineState<Name extends string = string> {
  frame: number;
  progress: number;
  phases: Record<Name, MotionPhaseState>;
}

export interface MotionTimeline<Name extends string = string> {
  totalFrames: number;
  phases: readonly MotionTimelinePhase<Name>[];
  atFrame(frame: number): MotionTimelineState<Name>;
  atProgress(progress: number): MotionTimelineState<Name>;
}

export interface P5MotionPreset {
  name: string;
  source: string;
  canvas: 'portrait' | 'landscape' | 'square';
  layers: readonly string[];
  does: readonly string[];
  useWhen: readonly string[];
  timeline?: MotionTimelineDefinition;
}

export const p5MotionPresets = {
  electricArchive: {
    name: 'electric-archive',
    source: 'usecases/p5js/electric-archive.md',
    canvas: 'portrait',
    layers: ['archive plane', 'cobalt signal field', 'evidence glyphs', 'scan exposure'],
    does: [
      'splits the poster into a pale archive surface and an electric blue signal surface',
      'uses scan exposure, texture, and node drift to make memory retrieval feel alive',
      'keeps proof text readable while motion carries the atmosphere',
      'works as both a still poster and a controlled kinetic study',
    ],
    useWhen: [
      'showing memory, retrieval, archive, or handoff evidence',
      'making a technical report feel active without turning it into a dashboard',
    ],
    timeline: {
      totalFrames: 240,
      phases: [
        { name: 'archiveReveal', start: 0, end: 0.28, easing: 'easeInOutCubic' },
        { name: 'signalDrift', start: 0, end: 1, easing: 'linear' },
        { name: 'scanExposure', start: 0.18, end: 0.86, easing: 'pingPong' },
      ],
    },
  },
  memoryWeatherReport: {
    name: 'memory-weather-report',
    source: 'usecases/p5js/weather-report.md',
    canvas: 'portrait',
    layers: ['paper map', 'weather mass', 'forecast cards', 'sharp glyphs', 'smoked radar accent'],
    does: [
      'treats memory and benchmark evidence as pressure systems',
      'uses isobars, fronts, radar haze, and station glyphs as the visual grammar',
      'keeps a light report base while adding atmospheric motion underneath',
      'uses forecast cards to create hierarchy before the viewer reads dense detail',
    ],
    useWhen: [
      'explaining risk, evidence density, system health, or handoff state',
      'turning a table of signals into a readable weather-map report surface',
    ],
    timeline: {
      totalFrames: 300,
      phases: [
        { name: 'cloudDrift', start: 0, end: 1, easing: 'linear' },
        { name: 'pressurePulse', start: 0.1, end: 0.9, easing: 'pingPong' },
        { name: 'forecastCardReveal', start: 0, end: 0.36, easing: 'easeInOutCubic' },
      ],
    },
  },
  blueAppleCollageLoop: {
    name: 'blue-apple-collage-loop',
    source: 'references/xhs-blue-apple/ANALYSIS.md',
    canvas: 'portrait',
    layers: ['flat field', 'anchored serif words', 'crop tiles', 'reassembly loop'],
    does: [
      'splits an image into grid tiles',
      'drifts tiles with deterministic offsets',
      'periodically resolves the pieces back to one image',
      'keeps typography as part of the composition rather than caption UI',
    ],
    useWhen: [
      'turning a still image into a calm kinetic poster',
      'creating motion studies for social, deck, or one-pager surfaces',
    ],
    timeline: {
      totalFrames: 180,
      phases: [
        { name: 'scatter', start: 0, end: 0.32, easing: 'easeInOutCubic' },
        { name: 'hold', start: 0.32, end: 0.58, easing: 'linear' },
        { name: 'reassemble', start: 0.58, end: 1, easing: 'easeInOutCubic' },
      ],
    },
  },
  frontierPosterScan: {
    name: 'frontier-poster-scan',
    source: 'references/xhs-frontier-poster/ANALYSIS.md',
    canvas: 'portrait',
    layers: ['static poster', 'noise field', 'typography layer', 'scan wash'],
    does: [
      'keeps a composed editorial poster underneath the motion',
      'uses p5.Graphics buffers for separate visual planes',
      'animates scan bands and controlled noise over the surface',
      'tests hierarchy when many visual signals compete',
    ],
    useWhen: [
      'stress-testing poster hierarchy under motion',
      'building electric archive or frontier-complexity visuals',
    ],
    timeline: {
      totalFrames: 210,
      phases: [
        { name: 'posterHold', start: 0, end: 0.2, easing: 'linear' },
        { name: 'noiseBloom', start: 0.15, end: 0.65, easing: 'pingPong' },
        { name: 'scanWash', start: 0.25, end: 1, easing: 'easeInOutCubic' },
      ],
    },
  },
} as const satisfies Record<string, P5MotionPreset>;

export type P5MotionPresetName = keyof typeof p5MotionPresets;

// ── v2 Extended Preset Contract ─────────────────────────────────────────────
// See docs/p5-motion-preset-spec-template.md for full spec.
// Existing P5MotionPreset (6 fields) stays as the base contract.
// P5MotionPresetV2 adds 6 fields for complex generative techniques.

/** Technique tags — 28 entries across 7 categories. */
export type TechniqueTag =
  // Deterministic Geometry
  | 'tile-grid' | 'crop-reveal' | 'scan-band' | 'isobar'
  // Noise & Field
  | 'flow-field' | 'noise-terrain' | 'reaction-diffusion' | 'electric-field'
  // Particle Systems
  | 'particle-trail' | 'boid-flock' | 'attractor-field' | 'snow-globe'
  // Typography & Layout
  | 'type-kinetic' | 'glyph-scatter' | 'calligraphic-stroke' | 'grid-morph'
  // Shader & GL
  | 'fragment-shader' | 'vertex-displace' | 'ray-march' | 'post-process'
  // Data-Driven
  | 'audio-reactive' | 'api-stream' | 'time-series' | 'graph-layout'
  // L-System & Fractal
  | 'l-system' | 'fractal-tree' | 'mandelbrot' | 'space-colony';

/** DASH visual mode — each preset binds to one primary mode. */
export type VisualMode =
  | 'evidence'
  | 'editorial'
  | 'kinetic'
  | 'atmospheric'
  | 'dashboard'
  | 'diagram';

/** Motion intensity — used in per-layer motion budget. */
export type MotionIntensity =
  | 'static'
  | 'breathe'
  | 'drift'
  | 'pulse'
  | 'flow';

/** Per-layer motion allocation entry. */
export interface MotionBudgetEntry {
  layerName: string;
  intensity: MotionIntensity;
  maxAmplitude: number;
  periodSeconds: number;
}

/** Color contract binding to DASH Brand palette. */
export interface ColorContract {
  primary: 'green' | 'cobalt' | 'sand' | 'neon-yellow' | 'cream' | 'ink';
  background: 'cream' | 'deep-green' | 'dark-blue';
  accent: 'neon-yellow' | 'cobalt' | 'cyan' | 'green';
  glass: 'frost' | 'smoked' | 'clear';
}

/** Input contract for data-driven presets. */
export interface InputContract {
  type: 'none' | 'image-sequence' | 'audio-stream' | 'api-fetch' | 'csv' | 'live-ws';
  frameCount?: number;
  sampleRate?: number;
  endpoint?: string;
  mapping: Record<string, string>;
}

/** DASH Brand palette hex values — single source of truth. */
export const DASH_BRAND_PALETTE = {
  'deep-green': '#10291F',
  cobalt: '#0018ff',
  sand: '#ddd6c7',
  'neon-yellow': '#F0EE9B',
  cream: '#f8f5ef',
  ink: '#1a1a18',
  'dark-blue': '#0a0e1a',
  cyan: '#00e5ff',
} as const;

export type DashColorName = keyof typeof DASH_BRAND_PALETTE;

/**
 * Extended preset contract (v2).
 * Composes the original 6 required fields from P5MotionPreset with 6 new fields.
 */
export interface P5MotionPresetV2 {
  // ── Required (from original P5MotionPreset) ──
  name: string;
  source: string;
  canvas: 'portrait' | 'landscape' | 'square';
  layers: readonly string[];
  does: readonly string[];
  useWhen: readonly string[];

  // ── Extended v2 fields ──
  technique: readonly TechniqueTag[];
  visualMode: VisualMode;
  motionBudget: readonly MotionBudgetEntry[];
  colorContract: ColorContract;
  inputContract: InputContract;
  shaderHint: boolean;
}

/**
 * Validate a motion budget.
 * Returns an array of violations, or empty if valid.
 */
export function validateMotionBudget(budget: readonly MotionBudgetEntry[]): string[] {
  const violations: string[] = [];

  const flowLayers = budget.filter(e => e.intensity === 'flow');
  if (flowLayers.length > 1) {
    violations.push(
      `motion budget has ${flowLayers.length} layers at 'flow' intensity; max 1 allowed. ` +
      `Offending layers: ${flowLayers.map(l => l.layerName).join(', ')}`,
    );
  }

  for (const entry of budget) {
    if (!Number.isFinite(entry.maxAmplitude) || entry.maxAmplitude < 0) {
      violations.push(`layer "${entry.layerName}": maxAmplitude must be >= 0`);
    }
    if (!Number.isFinite(entry.periodSeconds) || entry.periodSeconds < 0) {
      violations.push(`layer "${entry.layerName}": periodSeconds must be >= 0`);
    }
    if (entry.intensity === 'static' && entry.maxAmplitude !== 0) {
      violations.push(
        `layer "${entry.layerName}": intensity 'static' requires maxAmplitude 0, got ${entry.maxAmplitude}`,
      );
    }
  }

  return violations;
}

/**
 * Upgrade a v1 P5MotionPreset to a v2 P5MotionPresetV2.
 * Caller must supply the v2-specific fields.
 */
export function upgradeToV2(
  preset: P5MotionPreset,
  v2Extras: Omit<P5MotionPresetV2, keyof P5MotionPreset>,
): P5MotionPresetV2 {
  return { ...preset, ...v2Extras };
}

// ── Flow Field Types & Utilities ─────────────────────────────────────────────
// Reference: p5js-frontier-research.md §2.1 (Tyler Hobbs / Perlin flow fields)
// Consumers provide noiseFn/randomFn at call time; no p5 import at build time.

/** Configuration for generating a Perlin-noise flow field. */
export interface FlowFieldConfig {
  cols: number;
  rows: number;
  /** Sampling scale passed to noise(x * noiseScale, y * noiseScale). Default 0.008. */
  noiseScale: number;
  /** noiseDetail octaves. Default 4. */
  noiseOctaves: number;
  /** noiseDetail falloff. Default 0.5. */
  noiseFalloff: number;
  /** z-axis offset for 3D noise animation. */
  zOffset: number;
}

/** The generated flow field: a grid of angles and magnitudes. */
export interface FlowField {
  cols: number;
  rows: number;
  /** Angle in radians [0, 2π) per cell. */
  angles: number[][];
  /** Magnitude 0-1 per cell (noise value), usable as speed multiplier. */
  magnitudes: number[][];
}

/** A single point on a traced streamline. */
export interface FlowLinePoint {
  x: number;
  y: number;
  angle: number;
}

/** Callback signature matching p5.noise(x, y, z). */
export type Noise3D = (x: number, y: number, z: number) => number;

/**
 * Generate a flow field from a 3D noise function.
 * Consumer owns noiseDetail/noiseSeed — call them before passing noiseFn.
 */
export function generateFlowField(config: FlowFieldConfig, noiseFn: Noise3D): FlowField {
  const { cols, rows, noiseScale, zOffset } = config;
  assertPositive(cols, 'cols');
  assertPositive(rows, 'rows');

  const angles: number[][] = [];
  const magnitudes: number[][] = [];

  for (let r = 0; r < rows; r++) {
    const angleRow: number[] = [];
    const magnitudeRow: number[] = [];
    for (let c = 0; c < cols; c++) {
      const nx = c * noiseScale;
      const ny = r * noiseScale;
      const value = noiseFn(nx, ny, zOffset);
      angleRow[c] = value * Math.PI * 2;
      magnitudeRow[c] = clamp01(value);
    }
    angles[r] = angleRow;
    magnitudes[r] = magnitudeRow;
  }

  return { cols, rows, angles, magnitudes };
}

/**
 * Trace a single streamline through a flow field using Euler integration.
 * Stops when it leaves the field boundary or hits maxSteps.
 */
export function traceFlowLine(
  field: FlowField,
  startX: number,
  startY: number,
  stepSize: number,
  maxSteps: number,
  width: number,
  height: number,
): FlowLinePoint[] {
  const points: FlowLinePoint[] = [];
  const cellW = width / field.cols;
  const cellH = height / field.rows;
  let x = startX;
  let y = startY;

  for (let i = 0; i < maxSteps; i++) {
    if (x < 0 || x >= width || y < 0 || y >= height) break;

    const col = Math.min(field.cols - 1, Math.max(0, Math.floor(x / cellW)));
    const row = Math.min(field.rows - 1, Math.max(0, Math.floor(y / cellH)));
    const angle = field.angles[row]?.[col];
    if (angle === undefined) break;

    points.push({ x, y, angle });
    x += Math.cos(angle) * stepSize;
    y += Math.sin(angle) * stepSize;
  }

  return points;
}

/** Sample a flow field angle at a specific coordinate (with bilinear interpolation). */
export function sampleFlowField(field: FlowField, px: number, py: number, width: number, height: number): number {
  const cellW = width / field.cols;
  const cellH = height / field.rows;
  const col0 = Math.min(field.cols - 1, Math.max(0, Math.floor(px / cellW)));
  const row0 = Math.min(field.rows - 1, Math.max(0, Math.floor(py / cellH)));
  const col1 = Math.min(field.cols - 1, col0 + 1);
  const row1 = Math.min(field.rows - 1, row0 + 1);

  const fx = (px - col0 * cellW) / cellW;
  const fy = (py - row0 * cellH) / cellH;

  const a00 = field.angles[row0]?.[col0] ?? 0;
  const a10 = field.angles[row0]?.[col1] ?? 0;
  const a01 = field.angles[row1]?.[col0] ?? 0;
  const a11 = field.angles[row1]?.[col1] ?? 0;

  // Lerp each row, then lerp between rows
  const top = lerpAngles(a00, a10, fx);
  const bottom = lerpAngles(a01, a11, fx);
  return lerpAngles(top, bottom, fy);
}

/** Linear interpolate between two angles (radians), taking the shortest arc. */
function lerpAngles(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * clamp01(t);
}

// ── V2 Presets ────────────────────────────────────────────────────────────────
// Design specs: docs/preset-spec-*.md

export const flowFieldPresets = {
  dashFlowField: {
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
    technique: ['flow-field', 'noise-terrain'] as const,
    visualMode: 'atmospheric' as const,
    motionBudget: [
      { layerName: 'L0 solid ground', intensity: 'static' as const, maxAmplitude: 0, periodSeconds: 0 },
      { layerName: 'L1 flow field lines', intensity: 'breathe' as const, maxAmplitude: 8, periodSeconds: 24 },
      { layerName: 'L2 color wash', intensity: 'drift' as const, maxAmplitude: 24, periodSeconds: 16 },
      { layerName: 'L3 highlight accents', intensity: 'breathe' as const, maxAmplitude: 4, periodSeconds: 12 },
    ],
    colorContract: {
      primary: 'cream' as const,
      background: 'cream' as const,
      accent: 'green' as const,
      glass: 'frost' as const,
    },
    inputContract: {
      type: 'none' as const,
      mapping: {},
    },
    shaderHint: false,
  },
} as const satisfies Record<string, P5MotionPresetV2>;

export type FlowFieldPresetName = keyof typeof flowFieldPresets;

/**
 * DASH flow field color mapping: velocity → hex color.
 * See docs/preset-spec-dash-flow-field.md §Color Mapping.
 */
export const FLOW_VELOCITY_COLORS = [
  { velocity: 0.0, color: DASH_BRAND_PALETTE.cream },
  { velocity: 0.25, color: DASH_BRAND_PALETTE.sand },
  { velocity: 0.5, color: '#35584C' }, // Mid Green (from DASH Brand, not in base palette const)
  { velocity: 0.75, color: DASH_BRAND_PALETTE['deep-green'] },
  { velocity: 1.0, color: DASH_BRAND_PALETTE['neon-yellow'] },
] as const;

/**
 * Map a velocity value (0-1) to a hex color using the DASH flow color ramp.
 * Consumer must turn the hex into the appropriate color object (e.g. p5.color()).
 */
export function flowColorForVelocity(velocity: number): string {
  const v = clamp01(velocity);
  const stops = FLOW_VELOCITY_COLORS;
  for (let i = 0; i < stops.length - 1; i++) {
    const curr = stops[i]!;
    const next = stops[i + 1]!;
    if (v >= curr.velocity && v <= next.velocity) {
      const t = (v - curr.velocity) / (next.velocity - curr.velocity);
      return lerpHex(curr.color, next.color, t);
    }
  }
  return stops[stops.length - 1]!.color;
}

/** Simple hex-color lerp. */
function lerpHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bv.toString(16).padStart(2, '0')}`;
}

export function createTileGrid(width: number, height: number, cols: number, rows: number): MotionTile[] {
  assertPositive(width, 'width');
  assertPositive(height, 'height');
  assertInteger(cols, 'cols');
  assertInteger(rows, 'rows');

  const tileWidth = width / cols;
  const tileHeight = height / rows;
  const tiles: MotionTile[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * tileWidth;
      const y = row * tileHeight;
      tiles.push({
        index: row * cols + col,
        col,
        row,
        x,
        y,
        width: tileWidth,
        height: tileHeight,
        u0: x / width,
        v0: y / height,
        u1: (x + tileWidth) / width,
        v1: (y + tileHeight) / height,
      });
    }
  }

  return tiles;
}

export function frameProgress(frame: number, totalFrames: number): number {
  assertPositive(totalFrames, 'totalFrames');
  const wrapped = ((frame % totalFrames) + totalFrames) % totalFrames;
  return wrapped / totalFrames;
}

export function createMotionTimeline<const Name extends string>(
  definition: MotionTimelineDefinition<Name>,
): MotionTimeline<Name> {
  assertInteger(definition.totalFrames, 'totalFrames');

  if (definition.phases.length === 0) {
    throw new Error('@dash/p5-motion: phases must not be empty.');
  }

  const seenNames = new Set<string>();
  const phases = Object.freeze(
    definition.phases.map((phase) => {
      assertSafePhaseName(phase.name);
      assertUnitInterval(phase.start, `${phase.name}.start`);
      assertUnitInterval(phase.end, `${phase.name}.end`);

      if (phase.end <= phase.start) {
        throw new Error(`@dash/p5-motion: ${phase.name}.end must be greater than ${phase.name}.start.`);
      }

      if (seenNames.has(phase.name)) {
        throw new Error(`@dash/p5-motion: phase names must be unique. Duplicate "${phase.name}" found.`);
      }

      if (phase.easing !== undefined) {
        assertMotionEasingName(phase.easing, phase.name);
      }

      seenNames.add(phase.name);
      return Object.freeze({
        name: phase.name,
        start: phase.start,
        end: phase.end,
        easing: phase.easing ?? 'linear',
      });
    }),
  ) as readonly MotionTimelinePhase<Name>[];

  const totalFrames = definition.totalFrames;

  return {
    totalFrames,
    phases,
    atFrame(frame) {
      return createMotionTimelineState(frameProgress(frame, totalFrames), frame, phases);
    },
    atProgress(progress) {
      const clampedProgress = clamp01(progress);
      const frame = Math.min(Math.floor(clampedProgress * totalFrames), totalFrames - 1);
      return createMotionTimelineState(clampedProgress, frame, phases);
    },
  };
}

export function pingPong(t: number): number {
  const n = wrap01(t);
  return n < 0.5 ? n * 2 : (1 - n) * 2;
}

export function easeInOutCubic(t: number): number {
  const n = clamp01(t);
  return n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2;
}

export function jitterForIndex(index: number, amplitude: number): { x: number; y: number } {
  const a = seededUnit(index * 2 + 1) * 2 - 1;
  const b = seededUnit(index * 2 + 2) * 2 - 1;
  return { x: a * amplitude, y: b * amplitude };
}

export function layoutTileFrame(tiles: readonly MotionTile[], progress: number, amplitude = 18): TileFrame[] {
  assertPositive(amplitude, 'amplitude');
  const settle = easeInOutCubic(pingPong(progress));
  const drift = 1 - settle;

  return tiles.map((tile) => {
    const jitter = jitterForIndex(tile.index, amplitude);
    return {
      ...tile,
      drawX: tile.x + jitter.x * drift,
      drawY: tile.y + jitter.y * drift,
      alpha: 0.72 + 0.28 * settle,
    };
  });
}

export function wrap01(value: number): number {
  return ((value % 1) + 1) % 1;
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function createMotionTimelineState<Name extends string>(
  timelineProgress: number,
  frame: number,
  phases: readonly MotionTimelinePhase<Name>[],
): MotionTimelineState<Name> {
  const phaseStates = Object.create(null) as Record<Name, MotionPhaseState>;

  for (const phase of phases) {
    const progress = clamp01((timelineProgress - phase.start) / (phase.end - phase.start));
    phaseStates[phase.name] = {
      active: timelineProgress >= phase.start && timelineProgress <= phase.end,
      progress,
      eased: applyMotionEasing(phase.easing, progress),
      start: phase.start,
      end: phase.end,
      easing: phase.easing,
    };
  }

  return {
    frame,
    progress: timelineProgress,
    phases: phaseStates,
  };
}

function applyMotionEasing(easing: MotionEasingName, t: number): number {
  switch (easing) {
    case 'linear':
      return clamp01(t);
    case 'easeInOutCubic':
      return easeInOutCubic(t);
    case 'pingPong':
      return pingPong(t);
    default:
      throw new Error(`@dash/p5-motion: unsupported easing "${String(easing)}".`);
  }
}

function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`@dash/p5-motion: ${name} must be a positive number.`);
  }
}

function assertInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`@dash/p5-motion: ${name} must be a positive integer.`);
  }
}

function assertUnitInterval(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`@dash/p5-motion: ${name} must be a finite number between 0 and 1.`);
  }
}

function assertMotionEasingName(value: string, phaseName: string): asserts value is MotionEasingName {
  if (value !== 'linear' && value !== 'easeInOutCubic' && value !== 'pingPong') {
    throw new Error(
      `@dash/p5-motion: ${phaseName}.easing must be one of "linear", "easeInOutCubic", or "pingPong".`,
    );
  }
}

function assertSafePhaseName(name: string): void {
  if (name === '__proto__' || name === 'prototype' || name === 'constructor') {
    throw new Error(`@dash/p5-motion: phase name "${name}" is reserved and cannot be used.`);
  }
}

// ── Kinetic Type ────────────────────────────────────────────────────────────
// Preset spec: docs/preset-spec-dash-kinetic-type.md
// Typography as generative material — Swiss/RISD restraint, DASH baseline grid.

/** Layout composition mode for kinetic type. */
export type KineticComposition = 'hero' | 'block' | 'grid';

/** Tracking (letter-spacing) preset. */
export type TypeTracking = 'tight' | 'normal' | 'wide';

/** Tracking → letter-spacing px mapping. */
export const TRACKING_PX: Record<TypeTracking, number> = {
  tight: -1,
  normal: 0,
  wide: 2,
} as const;

/** Single glyph descriptor — pre-motion position + animation parameters.
 *  Base (x, y) is grid-snapped. Motion offsets (dx, dy) are applied
 *  on top by the renderer without snapping — preserving sub-grid movement. */
export interface KineticGlyph {
  char: string;
  /** Grid-snapped base x position. */
  x: number;
  /** Grid-snapped base y position. */
  y: number;
  /** Sub-grid motion offset x — renderer adds this to x without snapping. */
  dx: number;
  /** Sub-grid motion offset y — renderer adds this to y without snapping. */
  dy: number;
  fontSize: number;
  alpha: number;
  /** 0–1 position in the breathe/drift cycle for this glyph. */
  phase: number;
  /** Visual group: 0 = primary text, 1 = secondary/accent. */
  group: number;
}

/** Layout result: glyph positions before motion is applied. */
export interface KineticLayout {
  glyphs: KineticGlyph[];
  /** Primary baseline y-position in canvas px. */
  baselineY: number;
  /** Grid snap unit (8px). */
  gridUnit: number;
  composition: KineticComposition;
}

/** Baseline grid accent line descriptor for L2 rendering. */
export interface BaselineAccent {
  y: number;
  alpha: number;
  phase: number;
}

/** DASH kinetic type grid unit — aligns with Tailwind/p5.js 8px grid. */
export const KINETIC_GRID_UNIT = 8;

/** Minimum alpha for primary text — readability hard floor per spec. */
export const KINETIC_ALPHA_FLOOR = 0.7;

/** Maximum rotation in degrees — editorial restraint per Swiss/RISD anti-patterns. */
export const KINETIC_MAX_ROTATION_DEG = 2;

// ── Kinetic Type Layout Functions ─────────────────────────────────────────

/**
 * Determine optimal font-size for a composition mode + canvas dimensions.
 * All sizes snap to the 8px grid.
 */
export function kineticTypeScale(
  composition: KineticComposition,
  canvasWidth: number,
  _canvasHeight: number,
  scaleMultiplier = 1.0,
): number {
  const base = canvasWidth * 0.08; // 8vw base
  const modeMultiplier =
    composition === 'hero' ? 1.5 :
    composition === 'block' ? 0.7 :
    0.5; // grid — smaller per-word scale
  const raw = base * modeMultiplier * scaleMultiplier;
  return Math.round(raw / KINETIC_GRID_UNIT) * KINETIC_GRID_UNIT;
}

/**
 * Compute glyph layout for a given composition mode.
 * Snaps all positions to 8px grid. Returns pre-motion positions.
 *
 * - hero: single word/phrase 3–12 chars, centered, large scale
 * - block: multi-line text 20–80 chars, 2–6 lines, centered
 * - grid: individual words on staggered grid 3×3 to 5×4
 */
export function layoutKineticType(
  text: string,
  composition: KineticComposition,
  width: number,
  height: number,
  opts?: { typeScale?: number; tracking?: TypeTracking },
): KineticLayout {
  assertPositive(width, 'width');
  assertPositive(height, 'height');

  const scale = opts?.typeScale ?? 1.0;
  const tracking: TypeTracking = opts?.tracking ?? 'normal';
  const trackingPx = TRACKING_PX[tracking];
  const fontSize = kineticTypeScale(composition, width, height, scale);
  const centerY = snap(height / 2);

  let glyphs: KineticGlyph[];

  switch (composition) {
    // ── Hero: centered word, large scale, chars breathe individually ──
    case 'hero': {
      const chars = text.replace(/\s/g, '').slice(0, 12);
      if (chars.length === 0) return emptyLayout('hero', width);

      const charW = fontSize * 0.62;
      const totalW = chars.length * charW + (chars.length - 1) * trackingPx;
      const startX = snap((width - totalW) / 2);

      glyphs = chars.split('').map((ch, i) => ({
        char: ch,
        x: snap(startX + i * (snap(charW) + trackingPx)),
        y: snap(centerY),
        dx: 0,
        dy: 0,
        fontSize,
        alpha: 1.0,
        phase: i * 0.05, // 0.05s stagger between chars
        group: 0,
      }));
      break;
    }

    // ── Block: multi-line, centered, block drifts as a unit ──
    case 'block': {
      const words = text.split(/\s+/).filter(w => w.length > 0);
      if (words.length === 0) return emptyLayout('block', width);

      const charW = snap(fontSize * 0.55);
      // Derive max chars per line from actual canvas width (with 10% margin)
      const usableWidth = width * 0.9;
      const maxCharsPerLine = Math.max(8, Math.floor((usableWidth / (charW + trackingPx))));
      const maxChars = Math.min(65, maxCharsPerLine);

      // Greedy line break
      const lines: string[][] = [];
      let curLine: string[] = [];
      let curLen = 0;

      for (const w of words) {
        const addLen = w.length + (curLine.length > 0 ? 1 : 0); // +1 for space
        if (curLen + addLen > maxChars && curLine.length > 0) {
          lines.push(curLine);
          curLine = [w];
          curLen = w.length;
        } else {
          curLine.push(w);
          curLen += addLen;
        }
      }
      if (curLine.length > 0) lines.push(curLine);

      const lineH = fontSize * 1.4;
      const totalH = lines.length * lineH;
      const startY = snap(centerY - totalH / 2);

      glyphs = [];
      for (let li = 0; li < lines.length; li++) {
        const lineStr = lines[li]!.join(' ');
        const lineW = lineStr.length * charW + (lineStr.length - 1) * trackingPx;
        const startX = snap((width - lineW) / 2);

        for (let ci = 0; ci < lineStr.length; ci++) {
          const ch = lineStr[ci]!;
          glyphs.push({
            char: ch,
            x: snap(startX + ci * (snap(charW) + trackingPx)),
            y: snap(startY + li * lineH),
            dx: 0,
            dy: 0,
            fontSize,
            alpha: 0.9,
            phase: li * 0.15,        // line-level phase offset
            group: ch === ' ' ? 1 : 0, // spaces are secondary
          });
        }
      }
      break;
    }

    // ── Grid: words on staggered grid, each independent breathe ──
    case 'grid': {
      const words = text.split(/\s+/).filter(w => w.length > 0).slice(0, 14);
      if (words.length === 0) return emptyLayout('grid', width);

      const cols = Math.min(5, Math.ceil(Math.sqrt(words.length)));
      const rows = Math.ceil(words.length / cols);
      const cellW = snap(width / cols);
      const cellH = snap(height / (rows + 1)) + KINETIC_GRID_UNIT;

      glyphs = words.map((word, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = col * cellW + cellW / 2;
        const cy = cellH + row * cellH; // offset row 0 for top margin
        return {
          char: word,
          x: snap(cx),
          y: snap(cy),
          dx: 0,
          dy: 0,
          fontSize: fontSize * 0.55,
          alpha: 0.85,
          phase: (col + row * cols) / (cols * rows),
          group: 0,
        };
      });
      break;
    }
  }

  return { glyphs, baselineY: centerY, gridUnit: KINETIC_GRID_UNIT, composition };
}

/**
 * Apply motion to a glyph layout. Returns new glyphs with motion offsets
 * in dx/dy. Base (x, y) stays grid-snapped; renderer applies dx/dy on top
 * without snapping, preserving sub-grid motion.
 *
 * @param layout   Pre-motion layout from layoutKineticType()
 * @param phaseOffset 0–1 where in the cycle we are
 * @param motionScale 0–1 multiplier (0 = static poster, 1 = full budget)
 */
export function animateKineticGlyphs(
  layout: KineticLayout,
  phaseOffset: number,
  motionScale: number,
): KineticGlyph[] {
  const ms = clamp01(motionScale);

  return layout.glyphs.map(g => {
    const t = wrap01(g.phase + phaseOffset);
    const breathe = Math.sin(t * Math.PI * 2);

    // Alpha animation with readability floor
    const alphaFloor = layout.composition === 'block' ? 0.85 : KINETIC_ALPHA_FLOOR;
    const alpha = clamp01(alphaFloor + (1 - alphaFloor) * (0.5 + 0.5 * Math.cos(t * Math.PI * 2)));

    let dx = 0;
    let dy = 0;

    switch (layout.composition) {
      case 'hero':
        // Char-level y-breathe ±3px (sub-grid, renderer applies directly)
        dy = breathe * 3 * ms;
        break;
      case 'block':
        // Block ±12px drift x, ±6px breathe y
        dx = Math.cos(t * Math.PI * 2) * 12 * ms;
        dy = breathe * 6 * ms;
        break;
      case 'grid':
        // Word-level 2D breathe: x ±4px, y ±2px
        dx = Math.cos(t * Math.PI * 2) * 4 * ms;
        dy = breathe * 2 * ms;
        break;
    }

    return {
      ...g,
      dx,
      dy,
      alpha,
    };
  });
}

/**
 * Generate baseline accent line positions for L2 rendering.
 * Returns evenly-spaced hairline positions across the canvas height.
 */
export function layoutBaselineAccents(
  height: number,
  gridUnit: number,
  count: number,
): BaselineAccent[] {
  const accents: BaselineAccent[] = [];
  const spacing = Math.round(height / (count + 1) / gridUnit) * gridUnit;
  for (let i = 0; i < count; i++) {
    accents.push({
      y: (i + 1) * spacing,
      alpha: 0.3 + 0.3 * ((i % 3) / 3),
      phase: i / count,
    });
  }
  return accents;
}

/** Snap a value to the nearest grid unit. */
function snap(value: number): number {
  return Math.round(value / KINETIC_GRID_UNIT) * KINETIC_GRID_UNIT;
}

/** Return an empty layout for the given composition (text is empty/whitespace). */
function emptyLayout(composition: KineticComposition, width: number): KineticLayout {
  return {
    glyphs: [],
    baselineY: snap(width * 0.4),
    gridUnit: KINETIC_GRID_UNIT,
    composition,
  };
}

// ── Kinetic Type Preset ────────────────────────────────────────────────────

export const kineticTypePresets = {
  dashKineticType: {
    name: 'dash-kinetic-type',
    source: 'docs/p5js-frontier-research.md §2.6 Kinetic Type + Zach Lieberman',
    canvas: 'portrait' as const,
    layers: [
      'L0 solid ground',
      'L1 typography composition',
      'L2 baseline accent',
      'L3 editorial overlay',
    ] as const,
    does: [
      'renders text as compositional material — typography is layout, not UI caption',
      'positions type on a strict DASH baseline grid with Swiss/RISD restraint',
      'applies breathe/drift motion to individual glyphs or word blocks',
      'produces editorial-grade kinetic posters (not screensaver-style type animation)',
    ] as const,
    useWhen: [
      'creating DASH editorial title cards, hero sections, or one-pager headers',
      'generating kinetic type posters for social/deck/presentation surfaces',
      'rendering data-driven label overlays (e.g. dashDataWeather annotations)',
    ] as const,
    technique: ['type-kinetic', 'calligraphic-stroke'] as const,
    visualMode: 'editorial' as const,
    motionBudget: [
      { layerName: 'L0 solid ground', intensity: 'static' as const, maxAmplitude: 0, periodSeconds: 0 },
      { layerName: 'L1 typography composition', intensity: 'drift' as const, maxAmplitude: 12, periodSeconds: 20 },
      { layerName: 'L2 baseline accent', intensity: 'drift' as const, maxAmplitude: 12, periodSeconds: 18 },
      { layerName: 'L3 editorial overlay', intensity: 'breathe' as const, maxAmplitude: 4, periodSeconds: 14 },
    ],
    colorContract: {
      primary: 'ink' as const,
      background: 'cream' as const,
      accent: 'neon-yellow' as const,
      glass: 'frost' as const,
    },
    inputContract: { type: 'none' as const, mapping: {} },
    shaderHint: false,
  },
} as const satisfies Record<string, P5MotionPresetV2>;

export type KineticTypePresetName = keyof typeof kineticTypePresets;

// ── Data Weather ────────────────────────────────────────────────────────────
// Preset spec: docs/preset-spec-dash-data-weather.md
// Data-driven visual preset — JSON weather → DASH visual parameters.

/** Incoming weather data shape (after JSON.parse + validation). */
export interface WeatherData {
  temperature: number;      // °C, required
  humidity: number;         // %, required
  windSpeed: number;        // km/h, required
  cloudCover: number;       // %, required
  windDirection?: number;   // °, optional — defaults to 180
  uvIndex?: number;         // index, optional — defaults to 0
  visibility?: number;      // km, optional — defaults to 20
  location?: string;
  timestamp?: string;
}

/** Resolved visual parameters after data → visual mapping. */
export interface WeatherVisualParams {
  hueShift: number;      // 0–1, cold blue → warm yellow
  density: number;       // 0–1, sparse → dense field
  velocity: number;      // 0–1, static → rapid motion
  alpha: number;         // 0–1, clear → foggy overlay
  flowAngle: number;     // 0–360°, field direction
  accentGlow: number;    // 0–1, highlight intensity
  blurRadius: number;    // 0–1, sharp → soft focus
  locationLabel: string;
  timeLabel: string;
}

/** Fallback state — describes what mode the visualizer is in. */
export type DataState = 'live' | 'no-data' | 'partial' | 'malformed';

/** Canonical defaults for all WeatherVisualParams fields when data is absent. */
export const NO_DATA_DEFAULTS: Readonly<WeatherVisualParams> = {
  hueShift: 0,          // Cream baseline (20°C equivalent)
  density: 0.4,         // Sparse, calm
  velocity: 0.15,       // Minimal motion
  alpha: 0.04,          // Barely visible overlay
  flowAngle: 0,         // Eastward
  accentGlow: 0,        // Off
  blurRadius: 0,        // No blur (clear)
  locationLabel: '—',   // Em-dash for missing
  timeLabel: '—',
};

// ── Data Weather Utility Functions ─────────────────────────────────────────

/** Clamp ranges for each weather field. */
const WEATHER_CLAMP: Record<string, { min: number; max: number }> = {
  temperature:  { min: -20, max: 45 },
  humidity:     { min: 0,   max: 100 },
  windSpeed:    { min: 0,   max: 80 },
  cloudCover:   { min: 0,   max: 100 },
  windDirection:{ min: 0,   max: 360 },
  uvIndex:      { min: 0,   max: 11 },
  visibility:   { min: 0,   max: 20 },
};

/**
 * Safe numeric clamp with default fallback on NaN/null/undefined.
 * Returns defaultVal when value can't be used as a number.
 */
export function safeClamp(
  value: number | undefined | null,
  min: number,
  max: number,
  defaultVal: number,
): number {
  if (value === undefined || value === null) return defaultVal;
  const n = Number(value);
  if (!Number.isFinite(n)) return defaultVal;
  return Math.max(min, Math.min(max, n));
}

/** Field name → param key mapping for fallback resolution. */
const FIELD_TO_PARAM: Record<string, keyof WeatherVisualParams> = {
  temperature:   'hueShift',
  humidity:      'density',
  windSpeed:     'velocity',
  cloudCover:    'alpha',
  windDirection: 'flowAngle',
  uvIndex:       'accentGlow',
  visibility:    'blurRadius',
};

/** Numeric-only default values — subset of NO_DATA_DEFAULTS for resolveField. */
const NUMERIC_DEFAULTS: Record<string, number> = {
  hueShift:    NO_DATA_DEFAULTS.hueShift,
  density:     NO_DATA_DEFAULTS.density,
  velocity:    NO_DATA_DEFAULTS.velocity,
  alpha:       NO_DATA_DEFAULTS.alpha,
  flowAngle:   NO_DATA_DEFAULTS.flowAngle,
  accentGlow:  NO_DATA_DEFAULTS.accentGlow,
  blurRadius:  NO_DATA_DEFAULTS.blurRadius,
};

/**
 * Resolve a single weather field to its normalized visual parameter value.
 * Handles missing / NaN / out-of-range via safeClamp + defaults.
 */
function resolveField(
  field: string,
  raw: Record<string, unknown> | null,
): { value: number; isMissing: boolean } {
  const clampRange = WEATHER_CLAMP[field];
  const paramKey = FIELD_TO_PARAM[field];
  if (!clampRange || !paramKey) {
    // Unknown field — return neutral default
    return { value: 0, isMissing: true };
  }

  const rawVal = raw?.[field];
  const defaultVal = NUMERIC_DEFAULTS[paramKey] ?? 0;
  const isMissing = rawVal === undefined || rawVal === null;

  if (isMissing) {
    return { value: defaultVal, isMissing: true };
  }

  const n = Number(rawVal);
  if (!Number.isFinite(n)) {
    return { value: defaultVal, isMissing: true };
  }

  // Check out-of-range — silent clamp + warn
  if (n < clampRange.min || n > clampRange.max) {
    console.warn(
      `@dash/p5-motion: ${field}=${n} clamped to [${clampRange.min}, ${clampRange.max}]`,
    );
  }

  return {
    value: safeClamp(n, clampRange.min, clampRange.max, defaultVal),
    isMissing: false,
  };
}

// ── Core Mapping Functions ─────────────────────────────────────────────────

/**
 * Map temperature (°C) to a normalized hue position 0–1.
 * -20°C → 0.0 (Cobalt blue)  ·  20°C → 0.5 (Cream)  ·  45°C → 1.0 (Neon Yellow)
 */
export function temperatureToHue(temp: number): number {
  // Linear mapping: temp [-20, 45] → hue [0, 1]
  const t = safeClamp(temp, -20, 45, 20);
  return (t - (-20)) / (45 - (-20));
}

/**
 * Weather color ramp: hue position → DASH hex color.
 * 0.0 → Cobalt #0018ff  ·  0.5 → Cream #f8f5ef  ·  1.0 → Neon Yellow #F0EE9B
 */
export function weatherHueColor(hueShift: number): string {
  const h = clamp01(hueShift);
  if (h < 0.25) {
    // Cold: Cobalt → Cyan → Mid Green
    const t = h / 0.25;
    if (t < 0.5) return lerpHex(DASH_BRAND_PALETTE.cobalt, DASH_BRAND_PALETTE.cyan, t * 2);
    return lerpHex(DASH_BRAND_PALETTE.cyan, '#35584C', (t - 0.5) * 2);
  }
  if (h < 0.5) {
    // Cool: Mid Green → Cream
    const t = (h - 0.25) / 0.25;
    return lerpHex('#35584C', DASH_BRAND_PALETTE.cream, t);
  }
  if (h < 0.75) {
    // Warm: Cream → Sand
    const t = (h - 0.5) / 0.25;
    return lerpHex(DASH_BRAND_PALETTE.cream, DASH_BRAND_PALETTE.sand, t);
  }
  // Hot: Sand → Neon Yellow
  const t = (h - 0.75) / 0.25;
  return lerpHex(DASH_BRAND_PALETTE.sand, DASH_BRAND_PALETTE['neon-yellow'], t);
}

/**
 * Validate incoming JSON against the WeatherData schema.
 * Never throws — returns a structured validation result.
 */
export function validateWeatherData(
  raw: unknown,
): { valid: true; data: WeatherData } | { valid: false; errors: string[]; partial: Partial<WeatherData> } {
  if (raw === null || raw === undefined) {
    return { valid: false, errors: ['input is null or undefined'], partial: {} };
  }
  if (typeof raw !== 'object') {
    return { valid: false, errors: ['input is not an object'], partial: {} };
  }

  const obj = raw as Record<string, unknown>;
  const errors: string[] = [];
  const requiredFields = ['temperature', 'humidity', 'windSpeed', 'cloudCover'] as const;

  for (const field of requiredFields) {
    const val = obj[field];
    if (val === undefined || val === null) {
      errors.push(`missing required field: ${field}`);
    } else if (!Number.isFinite(Number(val))) {
      errors.push(`field ${field} is not a valid number: ${String(val)}`);
    }
  }

  // Validate optional numeric fields (happens BEFORE early return so malformed
  // optional values also produce valid:false)
  const optionalNumericFields = ['windDirection', 'uvIndex', 'visibility'] as const;
  for (const field of optionalNumericFields) {
    const val = obj[field];
    if (val !== undefined && val !== null && !Number.isFinite(Number(val))) {
      errors.push(`field ${field} is not a valid number: ${String(val)}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, partial: obj as Partial<WeatherData> };
  }

  const data: WeatherData = {
    temperature: Number(obj.temperature),
    humidity: Number(obj.humidity),
    windSpeed: Number(obj.windSpeed),
    cloudCover: Number(obj.cloudCover),
  };

  // Optional numeric fields — safe to Number() after validation above
  if (obj.windDirection !== undefined && obj.windDirection !== null) {
    const n = Number(obj.windDirection);
    if (Number.isFinite(n)) data.windDirection = n;
  }
  if (obj.uvIndex !== undefined && obj.uvIndex !== null) {
    const n = Number(obj.uvIndex);
    if (Number.isFinite(n)) data.uvIndex = n;
  }
  if (obj.visibility !== undefined && obj.visibility !== null) {
    const n = Number(obj.visibility);
    if (Number.isFinite(n)) data.visibility = n;
  }
  // Optional string fields
  if (typeof obj.location === 'string') data.location = obj.location;
  if (typeof obj.timestamp === 'string') data.timestamp = obj.timestamp;

  return { valid: true, data };
}

/**
 * Map WeatherData (or partial/null) to resolved visual parameters.
 * Handles all three fallback states internally:
 *  - no-data (null) → all NO_DATA_DEFAULTS
 *  - partial (missing fields) → defaults for missing, live for present
 *  - malformed (wrong types) → silent clamp + console.warn
 *
 * Always returns a complete WeatherVisualParams — never throws.
 */
export function weatherToVisualParams(
  data: WeatherData | Partial<WeatherData> | null,
): { params: WeatherVisualParams; state: DataState } {
  // ── No data ──
  if (data === null || data === undefined) {
    return { params: { ...NO_DATA_DEFAULTS }, state: 'no-data' };
  }

  const raw = data as Record<string, unknown>;
  let anyMalformed = false;
  let anyMissing = false;

  const numericFields = [
    'temperature', 'humidity', 'windSpeed', 'cloudCover',
    'windDirection', 'uvIndex', 'visibility',
  ];

  // Resolve numeric params
  const numParams: Record<string, number> = {};
  let tempIsMissing = true;
  for (const field of numericFields) {
    const result = resolveField(field, raw);
    const paramKey = FIELD_TO_PARAM[field]!;

    if (result.isMissing) {
      const rawVal = raw[field];
      if (rawVal !== undefined && rawVal !== null && !Number.isFinite(Number(rawVal))) {
        anyMalformed = true;
        console.warn(
          `@dash/p5-motion: field '${field}' has non-numeric value "${String(rawVal)}" — using default`,
        );
      } else if (rawVal === undefined || rawVal === null) {
        // Any mapped field missing (required or optional) → partial state
        anyMissing = true;
      }
    }

    if (field === 'temperature') tempIsMissing = result.isMissing;
    numParams[paramKey] = result.value;
  }

  // Check for out-of-range on present values
  for (const field of numericFields) {
    const rawVal = raw[field];
    if (rawVal !== undefined && rawVal !== null && Number.isFinite(Number(rawVal))) {
      const clampRange = WEATHER_CLAMP[field];
      if (clampRange) {
        const n = Number(rawVal);
        if (n < clampRange.min || n > clampRange.max) {
          anyMalformed = true;
        }
      }
    }
  }

  // Map temperature through temperatureToHue for the hueShift
  // Reuses the already-resolved clamped value from the loop above (avoids duplicate warning)
  const hueShift = tempIsMissing
    ? NO_DATA_DEFAULTS.hueShift
    : temperatureToHue(numParams.hueShift!);

  // ── Normalize raw field values to visual param ranges ──
  // density: humidity 0–100% → 0.3–1.0
  numParams.density = 0.3 + 0.7 * safeClamp(raw.humidity !== undefined ? Number(raw.humidity) : null, 0, 100, 50) / 100;
  // velocity: windSpeed 0–80 km/h → 0–1
  numParams.velocity = safeClamp(raw.windSpeed !== undefined ? Number(raw.windSpeed) : null, 0, 80, 10) / 80;
  // alpha: cloudCover 0–100% → 0.02–0.18
  const ccRaw = safeClamp(raw.cloudCover !== undefined ? Number(raw.cloudCover) : null, 0, 100, 0);
  numParams.alpha = 0.02 + 0.16 * (ccRaw / 100);
  // accentGlow: uvIndex 0–11 → 0–1
  numParams.accentGlow = safeClamp(raw.uvIndex !== undefined ? Number(raw.uvIndex) : null, 0, 11, 0) / 11;
  // blurRadius: visibility 0–20 km → 0–1 (inverse: poor vis = more blur)
  const visRaw = safeClamp(raw.visibility !== undefined ? Number(raw.visibility) : null, 0, 20, 20);
  numParams.blurRadius = 1 - (visRaw / 20);
  // flowAngle: windDirection 0–360° → direct passthrough (already resolved)

  // String fields
  const locationLabel =
    typeof raw.location === 'string' && raw.location.length > 0
      ? raw.location
      : NO_DATA_DEFAULTS.locationLabel;

  const timeLabel =
    typeof raw.timestamp === 'string' && raw.timestamp.length > 0
      ? raw.timestamp
      : NO_DATA_DEFAULTS.timeLabel;

  // Detect missing string fields for partial state
  if (!anyMissing && (locationLabel === NO_DATA_DEFAULTS.locationLabel || timeLabel === NO_DATA_DEFAULTS.timeLabel)) {
    anyMissing = true;
  }

  // Determine state
  let state: DataState = 'live';
  if (anyMalformed) state = 'malformed';
  else if (anyMissing) state = 'partial';

  return {
    params: {
      hueShift,
      density:     numParams.density ?? NO_DATA_DEFAULTS.density,
      velocity:    numParams.velocity ?? NO_DATA_DEFAULTS.velocity,
      alpha:       numParams.alpha ?? NO_DATA_DEFAULTS.alpha,
      flowAngle:   numParams.flowAngle ?? NO_DATA_DEFAULTS.flowAngle,
      accentGlow:  numParams.accentGlow ?? NO_DATA_DEFAULTS.accentGlow,
      blurRadius:  numParams.blurRadius ?? NO_DATA_DEFAULTS.blurRadius,
      locationLabel,
      timeLabel,
    },
    state,
  };
}

// ── Data Weather Preset ───────────────────────────────────────────────────

export const dataWeatherPresets = {
  dashDataWeather: {
    name: 'dash-data-weather',
    source: 'docs/p5js-frontier-research.md §2.7 Data-Driven + DASH evidence-driven editorial',
    canvas: 'portrait' as const,
    layers: [
      'L0 solid ground',
      'L1 data visualization (primary)',
      'L2 ambient field (responsive background)',
      'L3 metadata panel',
    ] as const,
    does: [
      'accepts external JSON weather data and maps fields to visual parameters',
      'renders an evidence-driven editorial weather mural (not a stock chart widget)',
      'handles no-data / partial-data / malformed-data fallback states with dignity',
      'clamps all visual outputs to DASH palette regardless of input extremes',
    ] as const,
    useWhen: [
      'rendering live weather dashboards with editorial aesthetic',
      'generating data-background visuals for DASH posters/decks',
      'serving as the reference implementation for all future data-driven presets',
    ] as const,
    technique: ['api-stream', 'time-series'] as const,
    visualMode: 'diagram' as const,
    motionBudget: [
      { layerName: 'L0 solid ground', intensity: 'static' as const, maxAmplitude: 0, periodSeconds: 0 },
      { layerName: 'L1 data visualization', intensity: 'breathe' as const, maxAmplitude: 6, periodSeconds: 20 },
      { layerName: 'L2 ambient field', intensity: 'drift' as const, maxAmplitude: 18, periodSeconds: 22 },
      { layerName: 'L3 metadata panel', intensity: 'static' as const, maxAmplitude: 0, periodSeconds: 0 },
    ],
    colorContract: {
      primary: 'ink' as const,
      background: 'cream' as const,
      accent: 'neon-yellow' as const,
      glass: 'frost' as const,
    },
    inputContract: {
      type: 'api-fetch' as const,
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
  },
} as const satisfies Record<string, P5MotionPresetV2>;

export type DataWeatherPresetName = keyof typeof dataWeatherPresets;

// ── Layer Composer re-exports ──────────────────────────────────────────────
// Split into composer.ts to keep this file focused on base types + presets.
// Consumers import from '@dash/p5-motion' — single entry point.
export {
  type LayerBlendMode,
  type LayerTransform,
  type ComposedLayer,
  type LayerComposition,
  type CompositeSpec,
  type CompositeSpecName,
  LAYER_BLEND_MODES,
  IDENTITY_TRANSFORM,
  validateLayerComposition,
  composeLayers,
  KNOWN_PRESET_NAMES,
  compositeSpecs,
} from './composer';
