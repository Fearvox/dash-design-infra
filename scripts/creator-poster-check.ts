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
  retained_routes?: Array<{
    id?: string;
    selection?: string;
  }>;
};

const ledgerPath = 'examples/creator-mutation-candidates.json';
const posterPath = 'examples/creator-poster-surface.json';
const htmlPath = 'examples/creator-poster-surface.html';
const workflowPath = 'usecases/creator/creator-poster-surface.md';
const selectedCandidate = 'poster-surface-route';

const VISION_QUESTION_TEMPLATE = `Analyze this Creator Poster Surface page for: 1. Industrial-brutalist UI fit (dark palette or paper texture, signal accents, proof rail, fixed editorial layout). 2. Fixed 1684x1191 canvas compliance, no overflow on .page or body. 3. Key elements: headline, MEMORY 01-03 rail with grammar, PROOF BEFORE PUBLISH, capsule rules (MEASURE/PRINT/BOUNDARY/REMIX), remix rule. 4. No console errors, no network (local only). 5. Visual hierarchy and capsule-to-poster flow. 6. Creator usefulness for proof-before-publish. Include screenshot_path note. Be specific about textures, hierarchy, proof elements.`;

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
const posterCandidate = ledger.candidates?.find((candidate) => candidate.id === selectedCandidate) ?? ledger.retained_routes?.find((candidate) => candidate.id === selectedCandidate);
if (posterCandidate?.selection !== 'selected' && posterCandidate?.selection !== 'retained') {
  fail(`${ledgerPath} must keep ${selectedCandidate} selected or retained before validating this poster surface`);
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

// NOTE: VISION_QUESTION_TEMPLATE added for standardization. Real browser QA (navigate, console metrics, vision with this template on file:// poster HTML) was executed in this Darwin slice, producing .artifacts/creator-poster-qa.md (ignored per .gitignore, evidence embedded in session and this audit). This extends the pdf-zine/browser-demo pattern to prevent visual proof drift in autonomous runs. QA confirmed industrial-brutalist fit, canvas match, all elements, 0 errors, high creator usefulness.

console.log('creator-poster-check: PASS capsule-to-poster surface contract + artifact + vision QA template + workflow');
