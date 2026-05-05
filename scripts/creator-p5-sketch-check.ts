#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
  createMotionTimeline,
  flowColorForVelocity,
  flowFieldPresets,
  generateFlowField,
  traceFlowLine,
  validateMotionBudget,
  type MotionEasingName,
} from '../packages/p5-motion/src/index';

type TimelinePhase = { name?: string; start?: number; end?: number; easing?: MotionEasingName };
type FrameProbe = { frame?: number; label?: string; expected_phase?: string };
type CreatorP5Sketch = {
  route?: string;
  source_capsule?: string;
  surface?: string;
  job?: string;
  format?: { canvas?: string; sketch_canvas?: string; selector?: string; deliverables?: string[] };
  preserved_capsule_fields?: string[];
  p5_adapter?: { preset?: string; seed?: string; imports?: string[]; runtime_boundary?: string };
  sketch_contract?: {
    layers?: string[];
    motion_budget?: string;
    data_policy?: string;
    render_steps?: string[];
    remix_handles?: string[];
    timeline?: { totalFrames?: number; phases?: TimelinePhase[] };
  };
  frame_probes?: FrameProbe[];
  proof?: string[];
  public_boundary?: { allowed?: string[]; blocked?: string[] };
  retention?: string;
};

type Ledger = { winner?: string; candidates?: Array<{ id?: string; selection?: string }>; retained_routes?: Array<{ id?: string; selection?: string }> };

const routeId = 'creator-p5-sketch-route';
const jsonPath = 'examples/creator-p5-sketch.json';
const htmlPath = 'examples/creator-p5-sketch.html';
const workflowPath = 'usecases/creator/creator-p5-sketch.md';
const ledgerPath = 'examples/creator-mutation-candidates.json';
const packagePath = 'package.json';
const workflowIndexPath = 'docs/WORKFLOW_INDEX.md';
const readmePath = 'README.md';
const examplesReadmePath = 'examples/README.md';
const ciPath = '.github/workflows/ci.yml';
const artifactPath = '.artifacts/creator-p5-sketch-frame.json';

function fail(message: string): never {
  console.error(`creator-p5-sketch-check: FAIL ${message}`);
  process.exit(1);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, 'utf8');
}

function parseJson<T>(path: string): T {
  try {
    return JSON.parse(read(path)) as T;
  } catch (error) {
    fail(`${path} invalid JSON: ${(error as Error).message}`);
  }
}

function useful(value: unknown, field: string, min = 16): string {
  if (typeof value !== 'string' || value.trim().length < min) fail(`${field} must be useful text`);
  return value;
}

function list(value: unknown, field: string, min = 3): string[] {
  if (!Array.isArray(value) || value.length < min) fail(`${field} needs ${min}+ items`);
  for (const item of value) useful(item, field, 4);
  return value as string[];
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function localNoise(seed: string) {
  const h = hashSeed(seed) / 4294967295;
  return (x: number, y: number, z: number): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + h * 437.91) * 43758.5453;
    const unit = n - Math.floor(n);
    return Math.min(1, Math.max(0, unit * 0.72 + 0.14));
  };
}

const ledger = parseJson<Ledger>(ledgerPath);
const ledgerSelection = ledger.candidates?.find((candidate) => candidate.id === routeId)?.selection ?? ledger.retained_routes?.find((candidate) => candidate.id === routeId)?.selection;
if (!['selected', 'retained'].includes(ledgerSelection ?? '')) fail(`${ledgerPath} must keep ${routeId} selected or retained`);

const packageJson = parseJson<{ scripts?: Record<string, string> }>(packagePath);
if (packageJson.scripts?.['creator:p5-sketch-check'] !== 'bun scripts/creator-p5-sketch-check.ts') fail(`${packagePath} must expose creator:p5-sketch-check`);

const sketch = parseJson<CreatorP5Sketch>(jsonPath);
if (sketch.route !== routeId) fail(`route must be ${routeId}`);
if (sketch.source_capsule !== 'examples/creator-frontier-capsule.json') fail('source_capsule must point to creator frontier capsule');
useful(sketch.surface, 'surface');
useful(sketch.job, 'job', 80);
if (sketch.format?.canvas !== '1684x1191') fail('format.canvas must be 1684x1191');
if (sketch.format?.sketch_canvas !== '800x1067') fail('format.sketch_canvas must be 800x1067');
if (sketch.format?.selector !== '.page') fail('format.selector must be .page');
const deliverables = list(sketch.format?.deliverables, 'format.deliverables', 3);
for (const deliverable of [htmlPath, artifactPath, '/tmp/dash-creator-p5-sketch.pdf']) {
  if (!deliverables.includes(deliverable)) fail(`format.deliverables must include ${deliverable}`);
}

const preserved = sketch.preserved_capsule_fields ?? [];
for (const field of ['creator', 'intent', 'memory', 'grammar', 'inputs.blocked', 'tool_path', 'proof', 'remix_rule']) {
  if (!preserved.includes(field)) fail(`preserved_capsule_fields must include ${field}`);
}

const preset = flowFieldPresets.dashFlowField;
if (sketch.p5_adapter?.preset !== preset.name) fail(`p5_adapter.preset must be ${preset.name}`);
const imports = list(sketch.p5_adapter?.imports, 'p5_adapter.imports', 6).join(' ');
for (const requiredImport of ['flowFieldPresets.dashFlowField', 'generateFlowField', 'traceFlowLine', 'flowColorForVelocity', 'createMotionTimeline', 'validateMotionBudget']) {
  if (!imports.includes(requiredImport)) fail(`p5_adapter.imports must include ${requiredImport}`);
}
const seed = useful(sketch.p5_adapter?.seed, 'p5_adapter.seed', 8);
useful(sketch.p5_adapter?.runtime_boundary, 'p5_adapter.runtime_boundary', 90);

list(sketch.sketch_contract?.layers, 'sketch_contract.layers', 4);
useful(sketch.sketch_contract?.motion_budget, 'sketch_contract.motion_budget', 80);
useful(sketch.sketch_contract?.data_policy, 'sketch_contract.data_policy', 90);
list(sketch.sketch_contract?.render_steps, 'sketch_contract.render_steps', 5);
list(sketch.sketch_contract?.remix_handles, 'sketch_contract.remix_handles', 5);

const budgetViolations = validateMotionBudget(preset.motionBudget);
if (budgetViolations.length > 0) fail(`dash-flow-field motion budget invalid: ${budgetViolations.join('; ')}`);

const timelineSpec = sketch.sketch_contract?.timeline;
if (!timelineSpec?.totalFrames || timelineSpec.totalFrames < 120) fail('timeline.totalFrames must be at least 120');
const phases = timelineSpec.phases ?? [];
if (phases.length !== 3) fail('timeline.phases must contain exactly 3 phases');
for (const phase of phases) {
  useful(phase.name, 'timeline.phase.name', 4);
  if (typeof phase.start !== 'number' || typeof phase.end !== 'number' || phase.end <= phase.start) fail(`timeline phase ${phase.name} needs increasing start/end`);
  if (!['linear', 'easeInOutCubic', 'pingPong'].includes(phase.easing ?? '')) fail(`timeline phase ${phase.name} has unsupported easing`);
}
const timeline = createMotionTimeline({ totalFrames: timelineSpec.totalFrames, phases: phases as Array<{ name: string; start: number; end: number; easing: MotionEasingName }> });

const probes = sketch.frame_probes ?? [];
if (probes.length !== 4) fail('frame_probes must contain exactly 4 probes');
const probeStates = probes.map((probe, index) => {
  if (!Number.isInteger(probe.frame) || probe.frame! < 0 || probe.frame! >= timeline.totalFrames) fail(`frame_probes[${index}].frame must fit timeline`);
  useful(probe.label, `frame_probes[${index}].label`, 6);
  useful(probe.expected_phase, `frame_probes[${index}].expected_phase`, 4);
  const state = timeline.atFrame(probe.frame!);
  const phase = state.phases[probe.expected_phase!];
  if (!phase?.active) fail(`frame ${probe.frame} must activate ${probe.expected_phase}`);
  return {
    frame: probe.frame,
    label: probe.label,
    progress: Number(state.progress.toFixed(4)),
    expected_phase: probe.expected_phase,
    eased: Number(phase.eased.toFixed(4)),
  };
});

const field = generateFlowField({ cols: 24, rows: 32, noiseScale: 0.024, noiseOctaves: 3, noiseFalloff: 0.5, zOffset: 0.18 }, localNoise(seed));
const width = 800;
const height = 1067;
const streamlines: Array<{ seed: { x: number; y: number }; length: number; end: { x: number; y: number } }> = [];
for (let y = 72; y < height - 72; y += 112) {
  for (let x = 64; x < width - 64; x += 120) {
    const line = traceFlowLine(field, x, y, 5, 72, width, height);
    if (line.length < 8) continue;
    const end = line[line.length - 1]!;
    streamlines.push({
      seed: { x, y },
      length: line.length,
      end: { x: Number(end.x.toFixed(2)), y: Number(end.y.toFixed(2)) },
    });
  }
}
if (streamlines.length < 24) fail(`expected at least 24 deterministic streamlines, got ${streamlines.length}`);

const firstMagnitude = field.magnitudes[0]?.[0] ?? 0;
const firstColor = flowColorForVelocity(firstMagnitude);
if (!/^#[0-9a-f]{6}$/i.test(firstColor)) fail('flowColorForVelocity must return a hex color');

const proof = list(sketch.proof, 'proof', 7).join(' ');
for (const command of ['creator:p5-sketch-check', 'p5:motion-check', 'measure:check', 'print:render', 'browser visual QA', 'security:scan', 'hackathon:score']) {
  if (!proof.includes(command)) fail(`proof must include ${command}`);
}

const blocked = list(sketch.public_boundary?.blocked, 'public_boundary.blocked', 5).join(' ').toLowerCase();
for (const needle of ['private', 'raw', 'local', 'api', 'cookies', 'tokens', 'account', 'client']) {
  if (!blocked.includes(needle)) fail(`public_boundary.blocked must cover ${needle}`);
}
list(sketch.public_boundary?.allowed, 'public_boundary.allowed', 5);
useful(sketch.retention, 'retention', 110);

const html = read(htmlPath);
for (const needle of ['Creator P5 Sketch Adapter', routeId, 'dash-flow-field', 'no p5 runtime import', 'deterministic frame contract', 'creator-frontier-capsule.json', 'proof before render', 'remix handles', '@page{size:1684px 1191px', 'width:1684px;height:1191px']) {
  if (!html.includes(needle)) fail(`${htmlPath} missing ${needle}`);
}
for (const forbidden of ['<img', '<video', '<audio', 'data:image', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov']) {
  if (html.toLowerCase().includes(forbidden)) fail(`${htmlPath} must not embed raw media via ${forbidden}`);
}

const workflow = read(workflowPath);
for (const needle of ['Mutation selected', 'P5 adapter contract', 'QA checks', 'Public boundary', 'Remix rule', '中文摘要']) {
  if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
}

for (const [path, needles] of [
  [workflowIndexPath, ['Creator p5 sketch', 'creator-p5-sketch.html', 'creator:p5-sketch-check', 'dash-flow-field']],
  [readmePath, ['Creator P5 Sketch', 'creator:p5-sketch-check', 'creator-p5-sketch.html']],
  [examplesReadmePath, ['Creator P5 Sketch', 'creator-p5-sketch.html', 'p5:motion-check']],
  [ciPath, ['Creator P5 Sketch Check', 'bun creator:p5-sketch-check']],
] as const) {
  const text = read(path);
  for (const needle of needles) if (!text.includes(needle)) fail(`${path} missing ${needle}`);
}

mkdirSync('.artifacts', { recursive: true });
writeFileSync(
  artifactPath,
  `${JSON.stringify({ route: routeId, preset: preset.name, seed, canvas: { width, height }, streamlines: streamlines.length, firstColor, probeStates }, null, 2)}\n`,
);

console.log(`creator-p5-sketch-check: PASS p5 sketch contract + ${streamlines.length} streamlines + ${probeStates.length} frame probes`);
