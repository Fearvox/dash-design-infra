#!/usr/bin/env bun
import {
  compositeSpecs,
  composeLayers,
  createMotionTimeline,
  dataWeatherPresets,
  flowColorForVelocity,
  flowFieldPresets,
  generateFlowField,
  kineticTypePresets,
  layoutKineticType,
  p5MotionPresets,
  sampleFlowField,
  traceFlowLine,
  validateLayerComposition,
  validateMotionBudget,
  validateWeatherData,
  weatherHueColor,
  weatherToVisualParams,
} from '../packages/p5-motion/src/index';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`p5-motion-check: ${message}`);
  }
}

function assertNoViolations(label: string, violations: readonly string[]) {
  if (violations.length > 0) {
    throw new Error(`p5-motion-check: ${label}: ${violations.join('; ')}`);
  }
}

const allV2Presets = [
  ...Object.values(flowFieldPresets),
  ...Object.values(kineticTypePresets),
  ...Object.values(dataWeatherPresets),
  ...Object.values(compositeSpecs).map((spec) => spec.preset),
];

for (const preset of allV2Presets) {
  assert(preset.name.length > 0, 'preset name must not be empty');
  assert(preset.layers.length > 0, `${preset.name} must declare layers`);
  assertNoViolations(`${preset.name} motion budget`, validateMotionBudget(preset.motionBudget));
}

const electricTimeline = createMotionTimeline(p5MotionPresets.electricArchive.timeline);
const electricState = electricTimeline.atFrame(42);
assert(electricState.phases.archiveReveal !== undefined, 'timeline keeps archiveReveal phase');
assert(electricState.phases.scanExposure.eased >= 0, 'timeline easing resolves');

const field = generateFlowField(
  { cols: 4, rows: 3, noiseScale: 0.1, noiseOctaves: 2, noiseFalloff: 0.5, zOffset: 0 },
  (x, y, z) => (Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) + 1) / 2,
);
assert(field.angles.length === 3, 'flow field rows match config');
assert(field.angles[0]?.length === 4, 'flow field columns match config');
assert(traceFlowLine(field, 8, 8, 4, 12, 64, 48).length > 0, 'flow line traces at least one point');
assert(Number.isFinite(sampleFlowField(field, 16, 16, 64, 48)), 'flow field samples angle');
assert(/^#[0-9a-f]{6}$/i.test(flowColorForVelocity(0.42)), 'velocity maps to hex color');

const typeLayout = layoutKineticType('DASH MOTION', 'hero', 720, 960);
assert(typeLayout.glyphs.length > 0, 'kinetic type layout emits glyphs');

const validWeather = validateWeatherData({
  temperature: 22,
  humidity: 64,
  windSpeed: 18,
  cloudCover: 42,
  location: 'Public demo',
  timestamp: '2026-05-05T00:00:00Z',
});
assert(validWeather.valid, 'weather validator accepts complete payload');
const weather = weatherToVisualParams(validWeather.data);
assert(weather.state === 'partial' || weather.state === 'live', 'weather params resolve to usable state');
assert(/^#[0-9a-f]{6}$/i.test(weatherHueColor(weather.params.hueShift)), 'weather hue maps to hex color');

const presetNames = [
  ...Object.values(p5MotionPresets).map((preset) => preset.name),
  ...allV2Presets.map((preset) => preset.name),
  'dash-ruler-grid',
];

for (const spec of Object.values(compositeSpecs)) {
  assertNoViolations(spec.composition.name, validateLayerComposition(spec.composition, presetNames));
  const plan = composeLayers(spec.composition, presetNames);
  assertNoViolations(`${spec.composition.name} compose`, plan.violations);
  assert(plan.layers.length === spec.composition.layers.length, 'compose preserves layer count');
}

console.log(`p5-motion-check: clean (${allV2Presets.length} v2 preset contracts)`);
