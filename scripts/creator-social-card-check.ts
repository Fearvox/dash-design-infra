#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';

type SocialCard = {
  route?: string;
  source_capsule?: string;
  surface?: string;
  job?: string;
  format?: { canvas?: string; selector?: string; deliverables?: string[] };
  preserved_capsule_fields?: string[];
  social_contract?: {
    platform_targets?: string[];
    message_hierarchy?: string[];
    safe_crop?: string;
    alt_text?: string;
  };
  social_grammar?: Record<string, string>;
  proof?: string[];
  public_boundary?: { allowed?: string[]; blocked?: string[] };
  retention?: string;
};

type Ledger = { winner?: string; candidates?: Array<{ id?: string; selection?: string }>; retained_routes?: Array<{ id?: string; selection?: string }> };

const routeId = 'creator-social-card-route';
const jsonPath = 'examples/creator-social-card.json';
const htmlPath = 'examples/creator-social-card.html';
const workflowPath = 'usecases/creator/creator-social-card.md';
const ledgerPath = 'examples/creator-mutation-candidates.json';
const packagePath = 'package.json';
const workflowIndexPath = 'docs/WORKFLOW_INDEX.md';
const readmePath = 'README.md';
const examplesReadmePath = 'examples/README.md';
const ciPath = '.github/workflows/ci.yml';

function fail(message: string): never {
  console.error(`creator-social-card-check: FAIL ${message}`);
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

const ledger = parseJson<Ledger>(ledgerPath);
const ledgerSelection = ledger.candidates?.find((candidate) => candidate.id === routeId)?.selection ?? ledger.retained_routes?.find((candidate) => candidate.id === routeId)?.selection;
if (!['selected', 'retained'].includes(ledgerSelection ?? '')) fail(`${ledgerPath} must keep ${routeId} selected or retained`);

const packageJson = parseJson<{ scripts?: Record<string, string> }>(packagePath);
if (packageJson.scripts?.['creator:social-card-check'] !== 'bun scripts/creator-social-card-check.ts') fail(`${packagePath} must expose creator:social-card-check`);

const card = parseJson<SocialCard>(jsonPath);
if (card.route !== routeId) fail(`route must be ${routeId}`);
if (card.source_capsule !== 'examples/creator-frontier-capsule.json') fail('source_capsule must point to creator frontier capsule');
useful(card.surface, 'surface');
useful(card.job, 'job', 60);
if (card.format?.canvas !== '1200x630') fail('format.canvas must be 1200x630');
if (card.format?.selector !== '.page') fail('format.selector must be .page');
const deliverables = list(card.format?.deliverables, 'format.deliverables', 2);
if (!deliverables.includes(htmlPath)) fail('format.deliverables must include social card HTML');

const preserved = card.preserved_capsule_fields ?? [];
for (const field of ['creator', 'intent', 'memory', 'grammar', 'inputs.blocked', 'proof', 'remix_rule']) {
  if (!preserved.includes(field)) fail(`preserved_capsule_fields must include ${field}`);
}

list(card.social_contract?.platform_targets, 'social_contract.platform_targets', 4);
list(card.social_contract?.message_hierarchy, 'social_contract.message_hierarchy', 4);
useful(card.social_contract?.safe_crop, 'social_contract.safe_crop', 70);
useful(card.social_contract?.alt_text, 'social_contract.alt_text', 40);

for (const key of ['layout', 'type', 'color', 'motion']) useful(card.social_grammar?.[key], `social_grammar.${key}`, 20);

const proof = list(card.proof, 'proof', 6).join(' ');
for (const command of ['creator:social-card-check', 'measure:check', '1200x630', 'print:render', 'browser visual QA', 'security:scan', 'hackathon:score']) {
  if (!proof.includes(command)) fail(`proof must include ${command}`);
}

const blocked = list(card.public_boundary?.blocked, 'public_boundary.blocked', 5).join(' ').toLowerCase();
for (const needle of ['private', 'raw', 'local', 'api', 'cookies', 'tokens', 'account', 'client']) {
  if (!blocked.includes(needle)) fail(`public_boundary.blocked must cover ${needle}`);
}
list(card.public_boundary?.allowed, 'public_boundary.allowed', 4);
useful(card.retention, 'retention', 90);

const html = read(htmlPath);
for (const needle of ['Creator Social Card', 'CREATOR-SOCIAL-CARD-ROUTE', '1200x630', 'no raw generated media', 'proof before post', 'remix', 'creator-frontier-capsule.json']) {
  if (!html.includes(needle)) fail(`${htmlPath} missing ${needle}`);
}
for (const forbidden of ['<img', '<video', '<audio', 'data:image', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov']) {
  if (html.toLowerCase().includes(forbidden)) fail(`${htmlPath} must not embed raw media via ${forbidden}`);
}

const workflow = read(workflowPath);
for (const needle of ['Mutation selected', 'Production contract', 'QA checks', 'Public boundary', 'Remix rule', '中文摘要']) {
  if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
}

for (const [path, needles] of [
  [workflowIndexPath, ['Creator social card', 'creator-social-card.html', 'creator:social-card-check', '1200x630']],
  [readmePath, ['Creator Social Card', 'creator:social-card-check', 'creator-social-card.html']],
  [examplesReadmePath, ['Creator Social Card', 'creator-social-card.html', '1200x630']],
  [ciPath, ['Creator Social Card Check', 'bun creator:social-card-check']],
] as const) {
  const text = read(path);
  for (const needle of needles) if (!text.includes(needle)) fail(`${path} missing ${needle}`);
}

console.log('creator-social-card-check: PASS social card contract + fixed-canvas artifact + workflow');
