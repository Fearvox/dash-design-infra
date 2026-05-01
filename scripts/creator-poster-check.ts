#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';

type Poster = {
  source_capsule?: string;
  surface?: string;
  job?: string;
  format?: { canvas?: string; selector?: string; deliverables?: string[] };
  preserved_capsule_fields?: string[];
  poster_grammar?: Record<string, string>;
  proof?: string[];
  public_boundary?: { allowed?: string[]; blocked?: string[] };
  retention?: string;
};

type Ledger = {
  winner?: string;
  candidates?: Array<{
    id?: string;
    selection?: string;
  }>;
};

const ledgerPath = 'examples/creator-mutation-candidates.json';
const posterPath = 'examples/creator-poster-surface.json';
const htmlPath = 'examples/creator-poster-surface.html';
const workflowPath = 'usecases/creator/creator-poster-surface.md';
const selectedCandidate = 'poster-surface-route';

function fail(message: string): never {
  console.error(`creator-poster-check: FAIL ${message}`);
  process.exit(1);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, 'utf8');
}

function usefulText(value: unknown, field: string, min = 12): string {
  if (typeof value !== 'string' || value.trim().length < min) fail(`${field} must be a useful string`);
  return value;
}

function parseJson<T>(path: string): T {
  try {
    return JSON.parse(read(path)) as T;
  } catch (error) {
    fail(`${path} is not valid JSON: ${(error as Error).message}`);
  }
}

const ledger = parseJson<Ledger>(ledgerPath);
const selected = ledger.candidates?.find((candidate) => candidate.selection === 'selected');
if (ledger.winner !== selectedCandidate || selected?.id !== selectedCandidate) {
  fail(`${ledgerPath} must select ${selectedCandidate} before retaining this poster surface`);
}

const poster = parseJson<Poster>(posterPath);
if (poster.source_capsule !== 'examples/creator-frontier-capsule.json') fail('source_capsule must point to creator frontier capsule');
usefulText(poster.surface, 'surface');
usefulText(poster.job, 'job', 30);
if (poster.format?.canvas !== '1684x1191') fail('format.canvas must be 1684x1191');
if (poster.format?.selector !== '.page') fail('format.selector must be .page');
if (!Array.isArray(poster.format?.deliverables) || !poster.format?.deliverables?.includes('examples/creator-poster-surface.html')) fail('format.deliverables must include poster HTML');

const preserved = poster.preserved_capsule_fields ?? [];
for (const field of ['creator', 'intent', 'memory', 'grammar', 'inputs.blocked', 'proof', 'remix_rule']) {
  if (!preserved.includes(field)) fail(`preserved_capsule_fields must include ${field}`);
}

for (const key of ['layout', 'type', 'color', 'motion']) {
  usefulText(poster.poster_grammar?.[key], `poster_grammar.${key}`);
}

const proof = poster.proof ?? [];
for (const command of ['creator:poster-check', 'measure:check', 'print:render', 'security:scan', 'browser visual QA']) {
  if (!proof.some((item) => item.includes(command))) fail(`proof must include ${command}`);
}

const blockedText = (poster.public_boundary?.blocked ?? []).join(' ').toLowerCase();
for (const needle of ['private', 'raw', 'local', 'api', 'cookies']) {
  if (!blockedText.includes(needle)) fail(`public_boundary.blocked must cover ${needle}`);
}
usefulText(poster.retention, 'retention', 30);
if ((poster.retention ?? '').toLowerCase().includes('package primitive')) {
  if (!(poster.retention ?? '').toLowerCase().includes('do not promote')) fail('retention must not promote a package primitive yet');
}

const html = read(htmlPath);
for (const needle of ['Creator Poster Surface', 'creator-frontier-capsule.json', 'proof before publish', 'remix']) {
  if (!html.includes(needle)) fail(`${htmlPath} missing ${needle}`);
}

const workflow = read(workflowPath);
for (const needle of ['Mutation selected', 'Public boundary', 'Remix rule', '中文摘要']) {
  if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
}

console.log('creator-poster-check: PASS capsule-to-poster surface contract + artifact + workflow');
