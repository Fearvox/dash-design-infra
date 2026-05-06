#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';

type PdfZine = {
  route?: string;
  source_capsule?: string;
  surface?: string;
  job?: string;
  format?: { canvas?: string; selector?: string; deliverables?: string[] };
  preserved_capsule_fields?: string[];
  zine_contract?: {
    page_model?: string;
    panel_sequence?: string[];
    fold_rule?: string;
    print_rule?: string;
    accessibility_note?: string;
  };
  zine_grammar?: Record<string, string>;
  proof?: string[];
  public_boundary?: { allowed?: string[]; blocked?: string[] };
  retention?: string;
};

type Ledger = { winner?: string; candidates?: Array<{ id?: string; selection?: string }>; retained_routes?: Array<{ id?: string; selection?: string }> };

const routeId = 'creator-pdf-zine-route';
const jsonPath = 'examples/creator-pdf-zine.json';
const htmlPath = 'examples/creator-pdf-zine.html';
const workflowPath = 'usecases/creator/creator-pdf-zine.md';
const ledgerPath = 'examples/creator-mutation-candidates.json';
const packagePath = 'package.json';
const workflowIndexPath = 'docs/WORKFLOW_INDEX.md';
const readmePath = 'README.md';
const examplesReadmePath = 'examples/README.md';
const agentsPath = 'AGENTS.md';
const ciPath = '.github/workflows/ci.yml';

function fail(message: string): never {
  console.error(`creator-pdf-zine-check: FAIL ${message}`);
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

function useful(value: unknown, field: string, min = 14): string {
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

const ledger = parseJson<Ledger>(ledgerPath);
if (!['selected', 'retained'].includes(routeSelection(ledger, routeId) ?? '')) fail(`${ledgerPath} must keep ${routeId} selected or retained`);

const packageJson = parseJson<{ scripts?: Record<string, string> }>(packagePath);
if (packageJson.scripts?.['creator:pdf-zine-check'] !== 'bun scripts/creator-pdf-zine-check.ts') fail(`${packagePath} must expose creator:pdf-zine-check`);

const zine = parseJson<PdfZine>(jsonPath);
if (zine.route !== routeId) fail(`route must be ${routeId}`);
if (zine.source_capsule !== 'examples/creator-frontier-capsule.json') fail('source_capsule must point to creator frontier capsule');
useful(zine.surface, 'surface');
useful(zine.job, 'job', 90);
if (zine.format?.canvas !== '1684x1191') fail('format.canvas must be 1684x1191');
if (zine.format?.selector !== '.page') fail('format.selector must be .page');
const deliverables = list(zine.format?.deliverables, 'format.deliverables', 2);
if (!deliverables.includes(htmlPath)) fail('format.deliverables must include zine HTML');

const preserved = zine.preserved_capsule_fields ?? [];
for (const field of ['creator', 'intent', 'memory', 'grammar', 'inputs.blocked', 'proof', 'remix_rule']) {
  if (!preserved.includes(field)) fail(`preserved_capsule_fields must include ${field}`);
}

useful(zine.zine_contract?.page_model, 'zine_contract.page_model', 110);
const panels = list(zine.zine_contract?.panel_sequence, 'zine_contract.panel_sequence', 6).join(' ').toLowerCase();
for (const needle of ['idea', 'capsule', 'proof', 'boundary', 'remix', 'handoff']) {
  if (!panels.includes(needle)) fail(`zine_contract.panel_sequence must include ${needle}`);
}
useful(zine.zine_contract?.fold_rule, 'zine_contract.fold_rule', 120);
useful(zine.zine_contract?.print_rule, 'zine_contract.print_rule', 70);
useful(zine.zine_contract?.accessibility_note, 'zine_contract.accessibility_note', 80);

for (const key of ['layout', 'type', 'color', 'motion']) useful(zine.zine_grammar?.[key], `zine_grammar.${key}`, 20);

const proof = list(zine.proof, 'proof', 7).join(' ');
for (const command of ['creator:pdf-zine-check', 'measure:check', '1684x1191', 'print:render', 'browser visual QA', 'docs:links', 'security:scan', 'hackathon:score']) {
  if (!proof.includes(command)) fail(`proof must include ${command}`);
}

const blocked = list(zine.public_boundary?.blocked, 'public_boundary.blocked', 5).join(' ').toLowerCase();
for (const needle of ['private', 'raw', 'local', 'api', 'cookies', 'tokens', 'secrets', 'account', 'client']) {
  if (!blocked.includes(needle)) fail(`public_boundary.blocked must cover ${needle}`);
}
list(zine.public_boundary?.allowed, 'public_boundary.allowed', 5);
useful(zine.retention, 'retention', 120);
if (!zine.retention?.toLowerCase().includes('do not promote')) fail('retention must block premature package promotion');

const html = read(htmlPath);
for (const needle of ['Creator PDF Zine', 'CREATOR-PDF-ZINE-ROUTE', '1684x1191', 'one-sheet process zine', 'proof before print', 'no raw generated media', 'remix', 'creator-frontier-capsule.json']) {
  if (!html.includes(needle)) fail(`${htmlPath} missing ${needle}`);
}
for (const forbidden of ['<img', '<video', '<audio', 'data:image', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov']) {
  if (html.toLowerCase().includes(forbidden)) fail(`${htmlPath} must not embed raw media via ${forbidden}`);
}

const workflow = read(workflowPath);
for (const needle of ['Mutation selected', 'PDF zine contract', 'QA checks', 'Public boundary', 'Remix rule', '中文摘要']) {
  if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
}

for (const [path, needles] of [
  [workflowIndexPath, ['Creator PDF zine', 'creator-pdf-zine.html', 'creator:pdf-zine-check', 'single-sheet PDF']],
  [readmePath, ['Creator PDF Zine', 'creator-pdf-zine.html', 'creator:pdf-zine-check']],
  [examplesReadmePath, ['Creator PDF Zine', 'creator-pdf-zine.html', '1684x1191']],
  [agentsPath, ['Creator PDF Zine', 'creator:pdf-zine-check', 'creator-pdf-zine.html']],
  [ciPath, ['Creator PDF Zine Check', 'bun creator:pdf-zine-check']],
] as const) {
  const text = read(path);
  for (const needle of needles) if (!text.includes(needle)) fail(`${path} missing ${needle}`);
}

console.log('creator-pdf-zine-check: PASS PDF zine contract + fixed-canvas artifact + workflow');
