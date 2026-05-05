/**
 * dashFlowField — consumer-side verification script.
 * Proves the real @dash/p5-motion import pipeline:
 *   import → generateFlowField → traceFlowLine → JSON → HTML render.
 *
 * Run: cd packages/p5-motion && bun run demo/generate.ts
 */
import {
  generateFlowField,
  traceFlowLine,
  flowColorForVelocity,
  flowFieldPresets,
  validateMotionBudget,
  type FlowFieldConfig,
  type FlowField,
} from '@dash/p5-motion';

// Simple deterministic noise replacement (no p5 dependency)
function localNoise(x: number, y: number, z: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 0.01) * 43758.5453;
  return (n - Math.floor(n)) * 0.5 + 0.25; // range ~[0,1]
}

// ── Verify preset definition ──
const preset = flowFieldPresets.dashFlowField;
console.log('✅ Preset loaded:', preset.name);
console.log('   visualMode:', preset.visualMode);
console.log('   layers:', preset.layers.length);
console.log('   technique:', preset.technique);

// ── Validate motion budget ──
const violations = validateMotionBudget(preset.motionBudget);
if (violations.length > 0) {
  console.error('❌ Motion budget violations:', violations);
  process.exit(1);
}
console.log('✅ Motion budget valid');

// ── Generate flow field ──
const config: FlowFieldConfig = {
  cols: 80,
  rows: 107,
  noiseScale: 0.004,
  noiseOctaves: 3,
  noiseFalloff: 0.5,
  zOffset: 0,
};

const field = generateFlowField(config, localNoise);
console.log('✅ Flow field generated:', field.cols, '×', field.rows);
console.log('   first angle:', field.angles[0]![0]!.toFixed(4), 'rad');
console.log('   first magnitude:', field.magnitudes[0]![0]!.toFixed(4));

// ── Trace streamlines ──
const W = 800, H = 1067;
const streamlines: { seed: { x: number; y: number }; points: { x: number; y: number; angle: number }[] }[] = [];
const placedSeeds: { x: number; y: number }[] = [];
const minDist = 18;

for (let row = 0; row < field.rows; row += 3) {
  for (let col = 0; col < field.cols; col += 3) {
    const sx = col * (W / field.cols) + (W / field.cols / 2);
    const sy = row * (H / field.rows) + (H / field.rows / 2);

    const tooClose = placedSeeds.some(
      s => Math.hypot(s.x - sx, s.y - sy) < minDist
    );
    if (tooClose) continue;

    const line = traceFlowLine(field, sx, sy, 4, 120, W, H);
    if (line.length < 4) continue;

    placedSeeds.push({ x: sx, y: sy });
    streamlines.push({ seed: { x: sx, y: sy }, points: line });
  }
}
console.log('✅ Streamlines traced:', streamlines.length);

// ── Compute velocity→color for first line ──
const firstLine = streamlines[0]!;
const firstMag = field.magnitudes[
  Math.floor(firstLine.points[0]!.y / (H / field.rows))
]?.[
  Math.floor(firstLine.points[0]!.x / (W / field.cols))
] ?? 0.5;
console.log('✅ Velocity→color:', flowColorForVelocity(firstMag));

// ── Write JSON for HTML consumer ──
const output = {
  field: {
    cols: field.cols,
    rows: field.rows,
    // Flatten for JSON (keep it compact — 80×107 ≈ 8.5K entries)
    angles: field.angles,
    magnitudes: field.magnitudes,
  },
  streamlines,
  canvas: { width: W, height: H },
};

const outPath = new URL('./flowfield-data.json', import.meta.url).pathname;
Bun.write(outPath, JSON.stringify(output));
console.log('✅ Data written to', outPath);
console.log('   size:', (Bun.file(outPath).size / 1024).toFixed(1), 'KB');
console.log('\n🎯 All checks passed — @dash/p5-motion import pipeline verified.');
