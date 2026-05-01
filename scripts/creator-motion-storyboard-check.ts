#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';

type StoryFrame = { frame?: string; time?: string; composition?: string; motion?: string };
type Storyboard = {
  route?: string;
  source_capsule?: string;
  purpose?: string;
  canvas?: { width?: number; height?: number; frames?: number; delivery?: string };
  timeline?: StoryFrame[];
  public_boundary?: { allowed?: string[]; blocked?: string[] };
  proof?: string[];
  retention?: string;
};
type Ledger = { winner?: string; candidates?: Array<{ id?: string; selection?: string }> };

const jsonPath = 'examples/creator-motion-storyboard.json';
const htmlPath = 'examples/creator-motion-storyboard.html';
const workflowPath = 'usecases/creator/creator-motion-storyboard.md';
const ledgerPath = 'examples/creator-mutation-candidates.json';
const readmePath = 'README.md';
const examplesReadmePath = 'examples/README.md';
const workflowIndexPath = 'docs/WORKFLOW_INDEX.md';
const hackathonPath = 'docs/HACKATHON_SDD_LOOP.md';
const packagePath = 'package.json';
const routeId = 'creator-motion-storyboard-route';
function fail(message: string): never { console.error(`creator-motion-storyboard-check: FAIL ${message}`); process.exit(1); }
function read(path: string): string { if (!existsSync(path)) fail(`missing ${path}`); return readFileSync(path, 'utf8'); }
function useful(value: unknown, field: string, min = 18): string { if (typeof value !== 'string' || value.trim().length < min) fail(`${field} must be useful text`); return value; }
function list(value: unknown, field: string, min = 3): string[] { if (!Array.isArray(value) || value.length < min) fail(`${field} needs ${min}+ items`); for (const item of value) useful(item, field, 4); return value as string[]; }
let board: Storyboard;
try { board = JSON.parse(read(jsonPath)) as Storyboard; } catch (error) { fail(`${jsonPath} invalid JSON: ${(error as Error).message}`); }
let ledger: Ledger;
try { ledger = JSON.parse(read(ledgerPath)) as Ledger; } catch (error) { fail(`${ledgerPath} invalid JSON: ${(error as Error).message}`); }
const ledgerEntry = ledger.candidates?.find((candidate) => candidate.id === routeId);
if (ledger.winner !== routeId || ledgerEntry?.selection !== 'selected') fail(`${ledgerPath} must select ${routeId}`);
const packageJson = JSON.parse(read(packagePath) || '{}') as { scripts?: Record<string, string> };
if (packageJson.scripts?.['creator:motion-storyboard-check'] !== 'bun scripts/creator-motion-storyboard-check.ts') fail(`${packagePath} must expose creator:motion-storyboard-check`);
if (board.route !== routeId) fail(`route must be ${routeId}`);
if (board.source_capsule !== 'examples/creator-frontier-capsule.json') fail('source_capsule must point to creator capsule');
useful(board.purpose, 'purpose', 60);
if (board.canvas?.width !== 1684 || board.canvas?.height !== 1191 || board.canvas?.frames !== 6) fail('canvas must be 1684x1191 with 6 frames');
useful(board.canvas?.delivery, 'canvas.delivery', 30);
const timeline = board.timeline ?? [];
if (timeline.length !== 6) fail('timeline must contain exactly 6 frames');
for (const [index, frame] of timeline.entries()) {
  useful(frame.frame, `timeline[${index}].frame`, 8);
  useful(frame.time, `timeline[${index}].time`, 5);
  useful(frame.composition, `timeline[${index}].composition`, 35);
  useful(frame.motion, `timeline[${index}].motion`, 25);
}
const blocked = list(board.public_boundary?.blocked, 'public_boundary.blocked', 5).join(' ').toLowerCase();
for (const needle of ['raw', 'generated', 'private', 'local', 'api', 'cookies', 'client']) if (!blocked.includes(needle)) fail(`public_boundary.blocked must cover ${needle}`);
list(board.public_boundary?.allowed, 'public_boundary.allowed', 4);
const proof = list(board.proof, 'proof', 6).join(' ');
for (const command of ['creator:motion-storyboard-check', 'measure:check', 'print:render', 'browser DOM overflow', 'browser visual QA', 'security:scan', 'hackathon:score']) if (!proof.includes(command)) fail(`proof must include ${command}`);
useful(board.retention, 'retention', 70);
const html = read(htmlPath);
for (const needle of ['Creator Motion Storyboard', 'CREATOR-MOTION-STORYBOARD-ROUTE', 'NO RAW VIDEO', 'six frame motion storyboard', 'Not a video renderer', '@page{size:1684px 1191px', 'width:1684px;height:1191px']) if (!html.includes(needle)) fail(`${htmlPath} missing ${needle}`);
for (const forbidden of ['<img', '<video', '<audio', 'data:image', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov']) {
  if (html.toLowerCase().includes(forbidden)) fail(`${htmlPath} must not embed raw media via ${forbidden}`);
}
const workflow = read(workflowPath);
for (const needle of ['Mutation selected', 'Public boundary', 'Remix rule', 'Contact-sheet bridge', '中文摘要']) if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
for (const [path, needles] of [
  [readmePath, ['Creator Motion Storyboard', 'creator:motion-storyboard-check', 'creator-motion-storyboard.html']],
  [examplesReadmePath, ['Creator Storyboard', 'creator-motion-storyboard.html', 'print:render']],
  [workflowIndexPath, ['Creator motion storyboard', 'creator-motion-storyboard.html', 'creator:motion-storyboard-check']],
  [hackathonPath, ['creator:motion-storyboard-check', 'creator-motion-storyboard.html', 'raw generated video']],
] as const) {
  const text = read(path);
  for (const needle of needles) if (!text.includes(needle)) fail(`${path} missing ${needle}`);
}
console.log('creator-motion-storyboard-check: PASS motion storyboard contract + fixed-canvas artifact + workflow');
