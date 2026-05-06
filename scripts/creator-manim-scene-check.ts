#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

type Beat = {
  id?: string;
  time?: string;
  title?: string;
  visual?: string;
  motion?: string;
  narration_intent?: string;
};

type CreatorManimScene = {
  route?: string;
  source_capsule?: string;
  surface?: string;
  job?: string;
  format?: { canvas?: string; preview_canvas?: string; selector?: string; deliverables?: string[] };
  preserved_capsule_fields?: string[];
  manim_adapter?: {
    scene_class?: string;
    runtime_boundary?: string;
    render_command?: string;
    dependencies?: string[];
    style_tokens?: Record<string, string>;
  };
  scene_contract?: {
    duration_seconds?: number;
    resolution?: string;
    beats?: Beat[];
    remix_handles?: string[];
    blocked_moves?: string[];
  };
  proof?: string[];
  public_boundary?: { allowed?: string[]; blocked?: string[] };
  retention?: string;
};

type Ledger = {
  winner?: string;
  candidates?: Array<{ id?: string; selection?: string }>;
  retained_routes?: Array<{ id?: string; selection?: string }>;
};

const routeId = 'creator-manim-scene-route';
const jsonPath = 'examples/creator-manim-scene.json';
const htmlPath = 'examples/creator-manim-scene.html';
const workflowPath = 'usecases/creator/creator-manim-scene.md';
const ledgerPath = 'examples/creator-mutation-candidates.json';
const packagePath = 'package.json';
const workflowIndexPath = 'docs/WORKFLOW_INDEX.md';
const readmePath = 'README.md';
const examplesReadmePath = 'examples/README.md';
const ciPath = '.github/workflows/ci.yml';
const agentsPath = 'AGENTS.md';
const evolutionPath = 'docs/CREATOR_EVOLUTION_ENGINE.md';
const artifactPath = '.artifacts/creator-manim-scene.py';
const summaryPath = '.artifacts/creator-manim-scene-summary.json';

function fail(message: string): never {
  console.error(`creator-manim-scene-check: FAIL ${message}`);
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

function routeSelection(ledger: Ledger, id: string): string | undefined {
  return ledger.candidates?.find((candidate) => candidate.id === id)?.selection ?? ledger.retained_routes?.find((route) => route.id === id)?.selection;
}

function pyString(value: string): string {
  return JSON.stringify(value.replace(/\s+/g, ' ').trim());
}

function className(value: string): string {
  if (!/^[A-Z][A-Za-z0-9_]*$/.test(value)) fail('manim_adapter.scene_class must be a valid PascalCase Python class name');
  return value;
}

const ledger = parseJson<Ledger>(ledgerPath);
if (!['selected', 'retained'].includes(routeSelection(ledger, routeId) ?? '')) fail(`${ledgerPath} must keep ${routeId} selected or retained`);

const packageJson = parseJson<{ scripts?: Record<string, string> }>(packagePath);
if (packageJson.scripts?.['creator:manim-scene-check'] !== 'bun scripts/creator-manim-scene-check.ts') fail(`${packagePath} must expose creator:manim-scene-check`);

const scene = parseJson<CreatorManimScene>(jsonPath);
if (scene.route !== routeId) fail(`route must be ${routeId}`);
if (scene.source_capsule !== 'examples/creator-frontier-capsule.json') fail('source_capsule must point to creator frontier capsule');
useful(scene.surface, 'surface');
useful(scene.job, 'job', 120);
if (scene.format?.canvas !== '1920x1080') fail('format.canvas must be 1920x1080');
if (scene.format?.preview_canvas !== '1684x1191') fail('format.preview_canvas must be 1684x1191');
if (scene.format?.selector !== '.page') fail('format.selector must be .page');
const deliverables = list(scene.format?.deliverables, 'format.deliverables', 4);
for (const deliverable of [htmlPath, artifactPath, summaryPath, '/tmp/dash-creator-manim-scene.pdf']) {
  if (!deliverables.includes(deliverable)) fail(`format.deliverables must include ${deliverable}`);
}

const preserved = scene.preserved_capsule_fields ?? [];
for (const field of ['creator', 'intent', 'memory', 'grammar', 'inputs.blocked', 'tool_path', 'proof', 'remix_rule']) {
  if (!preserved.includes(field)) fail(`preserved_capsule_fields must include ${field}`);
}

const adapter = scene.manim_adapter ?? {};
const sceneClass = className(useful(adapter.scene_class, 'manim_adapter.scene_class', 6));
useful(adapter.runtime_boundary, 'manim_adapter.runtime_boundary', 150);
const renderCommand = useful(adapter.render_command, 'manim_adapter.render_command', 32);
if (renderCommand !== `manim -ql ${artifactPath} ${sceneClass}`) fail('manim_adapter.render_command must use the generated artifact path and scene class');
const dependencies = list(adapter.dependencies, 'manim_adapter.dependencies', 3).join(' ').toLowerCase();
for (const needle of ['external', 'manim', 'dash core', 'rendered mp4', 'outside git']) {
  if (!dependencies.includes(needle)) fail(`manim_adapter.dependencies must mention ${needle}`);
}
const tokens = adapter.style_tokens ?? {};
for (const key of ['background', 'paper', 'accent', 'warning', 'line']) {
  if (!/^#[0-9a-f]{6}$/i.test(tokens[key] ?? '')) fail(`manim_adapter.style_tokens.${key} must be a hex color`);
}

const contract = scene.scene_contract ?? {};
if (contract.duration_seconds !== 45) fail('scene_contract.duration_seconds must be 45');
if (contract.resolution !== '1920x1080') fail('scene_contract.resolution must be 1920x1080');
const beats = contract.beats ?? [];
if (beats.length !== 5) fail('scene_contract.beats must contain exactly 5 beats');
const beatIds = new Set<string>();
for (let index = 0; index < beats.length; index += 1) {
  const beat = beats[index]!;
  const id = useful(beat.id, `scene_contract.beats[${index}].id`, 3);
  if (beatIds.has(id)) fail(`duplicate beat id ${id}`);
  beatIds.add(id);
  useful(beat.time, `scene_contract.beats[${index}].time`, 8);
  useful(beat.title, `scene_contract.beats[${index}].title`, 5);
  useful(beat.visual, `scene_contract.beats[${index}].visual`, 50);
  useful(beat.motion, `scene_contract.beats[${index}].motion`, 35);
  useful(beat.narration_intent, `scene_contract.beats[${index}].narration_intent`, 50);
}
list(contract.remix_handles, 'scene_contract.remix_handles', 6);
const blockedMoves = list(contract.blocked_moves, 'scene_contract.blocked_moves', 4).join(' ').toLowerCase();
for (const needle of ['manim', 'core dependency', 'mp4', 'private', 'browser measure']) {
  if (!blockedMoves.includes(needle)) fail(`scene_contract.blocked_moves must cover ${needle}`);
}

const proof = list(scene.proof, 'proof', 7).join(' ');
for (const command of ['creator:manim-scene-check', 'measure:check', 'print:render', 'browser visual QA', 'security:scan', 'hackathon:score', 'typecheck']) {
  if (!proof.includes(command)) fail(`proof must include ${command}`);
}
const blocked = list(scene.public_boundary?.blocked, 'public_boundary.blocked', 5).join(' ').toLowerCase();
for (const needle of ['private', 'raw', 'local', 'api', 'cookies', 'tokens', 'secrets', 'account', 'client']) {
  if (!blocked.includes(needle)) fail(`public_boundary.blocked must cover ${needle}`);
}
list(scene.public_boundary?.allowed, 'public_boundary.allowed', 5);
useful(scene.retention, 'retention', 140);

const html = read(htmlPath);
for (const needle of ['Creator Manim Scene Adapter', routeId, 'MANIM EXTERNAL RUNTIME', 'scene class', 'no renderer dependency', 'proof before render', 'CreatorCapsuleScene', '@page{size:1684px 1191px', 'width:1684px;height:1191px']) {
  if (!html.includes(needle)) fail(`${htmlPath} missing ${needle}`);
}
for (const forbidden of ['<img', '<video', '<audio', 'data:image', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov']) {
  if (html.toLowerCase().includes(forbidden)) fail(`${htmlPath} must not embed raw media via ${forbidden}`);
}

const workflow = read(workflowPath);
for (const needle of ['Mutation selected', 'Manim adapter contract', 'QA checks', 'Public boundary', 'Remix rule', '中文摘要']) {
  if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
}

for (const [path, needles] of [
  [workflowIndexPath, ['Creator Manim scene', 'creator-manim-scene.html', 'creator:manim-scene-check', 'Manim Community Edition']],
  [readmePath, ['Creator Manim Scene', 'creator:manim-scene-check', 'creator-manim-scene.html']],
  [examplesReadmePath, ['Creator Manim Scene', 'creator-manim-scene.html', 'creator:manim-scene-check']],
  [ciPath, ['Creator Manim Scene Check', 'bun creator:manim-scene-check']],
  [agentsPath, ['Creator Manim Scene', 'creator:manim-scene-check', 'creator-manim-scene.html']],
  [evolutionPath, ['creator-manim-scene-route', 'creator-manim-scene.md']],
] as const) {
  const text = read(path);
  for (const needle of needles) if (!text.includes(needle)) fail(`${path} missing ${needle}`);
}

mkdirSync('.artifacts', { recursive: true });
const generated = `# Generated by bun creator:manim-scene-check from ${jsonPath}\n# Public-safe adapter stub only. Render externally; do not commit rendered video.\nfrom manim import *\n\n\nclass ${sceneClass}(Scene):\n    def construct(self):\n        self.camera.background_color = ${pyString(tokens.background ?? '#0f172a')}\n        title = Text("Creator Capsule Scene", font_size=56, color=${pyString(tokens.paper ?? '#f8f1df')})\n        subtitle = Text("proof before render", font_size=26, color=${pyString(tokens.accent ?? '#8db4ff')}).next_to(title, DOWN)\n        self.play(FadeIn(title), FadeIn(subtitle, shift=UP * 0.2), run_time=1.2)\n        self.wait(0.4)\n${beats.map((beat, index) => {
  const title = pyString(`${index + 1}. ${beat.title ?? 'Beat'}`);
  const visual = pyString(beat.visual ?? '');
  return `        # beat:${beat.id}\n        beat_${index} = VGroup(\n            Text(${title}, font_size=34, color=${pyString(tokens.paper ?? '#f8f1df')}),\n            Text(${visual}, font_size=20, color=${pyString(tokens.accent ?? '#8db4ff')}).scale(0.72),\n        ).arrange(DOWN, aligned_edge=LEFT).to_edge(LEFT).shift(DOWN * 0.35)\n        self.play(FadeOut(title), FadeOut(subtitle), FadeIn(beat_${index}, shift=RIGHT * 0.2), run_time=0.8)\n        self.wait(0.5)\n        self.play(FadeOut(beat_${index}, shift=UP * 0.15), run_time=0.45)\n`;
}).join('')}        stamp = Text("external Manim runtime · no raw media in git", font_size=24, color=${pyString(tokens.warning ?? '#d4a373')})\n        self.play(FadeIn(stamp), run_time=0.8)\n        self.wait(0.8)\n`;
writeFileSync(artifactPath, generated);
writeFileSync(
  summaryPath,
  `${JSON.stringify({ route: routeId, scene_class: sceneClass, beats: beats.map((beat) => beat.id), render_command: renderCommand, generated: artifactPath }, null, 2)}\n`,
);
const generatedText = read(artifactPath);
for (const needle of ['from manim import *', `class ${sceneClass}(Scene):`, 'proof before render', 'external Manim runtime', 'no raw media in git']) {
  if (!generatedText.includes(needle)) fail(`${artifactPath} missing ${needle}`);
}
for (const beat of beats) {
  if (!generatedText.includes(`# beat:${beat.id}`)) fail(`${artifactPath} missing beat marker ${beat.id}`);
}

console.log(`creator-manim-scene-check: PASS Manim scene contract + ${beats.length} beats + generated ${artifactPath}`);
