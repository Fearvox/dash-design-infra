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
