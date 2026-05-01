#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';

type Adapter = {
  source_capsule?: string;
  adapter?: { id?: string; kind?: string; job?: string; surface_targets?: string[] };
  input_contract?: { required?: string[]; optional?: string[] };
  prompt_dna?: Record<string, unknown>;
  preview?: { kind?: string; deliverables?: string[]; prohibited_media?: string[] };
  proof?: string[];
  public_boundary?: { allowed?: string[]; blocked?: string[] };
  retention?: string;
};

const jsonPath = 'examples/creator-prompt-dna-adapter.json';
const htmlPath = 'examples/creator-prompt-dna-adapter.html';
const workflowPath = 'usecases/creator/creator-prompt-dna-adapter.md';
const ledgerPath = 'examples/creator-mutation-candidates.json';
const adapterId = 'adapter-prompt-dna-route';

function fail(message: string): never {
  console.error(`creator-prompt-dna-check: FAIL ${message}`);
  process.exit(1);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, 'utf8');
}

function useful(value: unknown, field: string, min = 12): string {
  if (typeof value !== 'string' || value.trim().length < min) fail(`${field} must be useful text`);
  return value;
}

function list(value: unknown, field: string, min = 3): string[] {
  if (!Array.isArray(value) || value.length < min) fail(`${field} needs ${min}+ items`);
  for (const item of value) useful(item, field, 4);
  return value as string[];
}

let adapter: Adapter;
try {
  adapter = JSON.parse(read(jsonPath)) as Adapter;
} catch (error) {
  fail(`${jsonPath} invalid JSON: ${(error as Error).message}`);
}

const ledger = JSON.parse(read(ledgerPath)) as { winner?: string; candidates?: Array<{ id?: string; selection?: string }> };
const selected = ledger.candidates?.find((candidate) => candidate.selection === 'selected');
if (ledger.winner !== adapterId || selected?.id !== adapterId) {
  fail(`${ledgerPath} must select ${adapterId} before retaining this adapter route`);
}

if (adapter.source_capsule !== 'examples/creator-frontier-capsule.json') fail('source_capsule must point to creator capsule');
if (adapter.adapter?.id !== adapterId) fail(`adapter.id must be ${adapterId}`);
useful(adapter.adapter?.kind, 'adapter.kind', 20);
useful(adapter.adapter?.job, 'adapter.job', 40);
list(adapter.adapter?.surface_targets, 'adapter.surface_targets', 3);
list(adapter.input_contract?.required, 'input_contract.required', 5);
list(adapter.input_contract?.optional, 'input_contract.optional', 4);

const dna = adapter.prompt_dna ?? {};
for (const key of ['core_intent', 'composition', 'motion_memory', 'negative_space']) useful(dna[key], `prompt_dna.${key}`, 30);
for (const key of ['visual_grammar', 'palette', 'remix_handles', 'blocked_outputs']) list(dna[key], `prompt_dna.${key}`, 4);

useful(adapter.preview?.kind, 'preview.kind', 20);
const deliverables = list(adapter.preview?.deliverables, 'preview.deliverables', 2);
if (!deliverables.includes('examples/creator-prompt-dna-adapter.html')) fail('preview.deliverables must include HTML proof card');
const prohibited = list(adapter.preview?.prohibited_media, 'preview.prohibited_media', 4).join(' ').toLowerCase();
for (const needle of ['raw', 'generated', 'video', 'private']) if (!prohibited.includes(needle)) fail(`preview.prohibited_media must cover ${needle}`);

const proof = list(adapter.proof, 'proof', 5).join(' ');
for (const command of ['creator:prompt-dna-check', 'measure:check', 'print:render', 'security:scan', 'browser visual QA']) if (!proof.includes(command)) fail(`proof must include ${command}`);

const blocked = list(adapter.public_boundary?.blocked, 'public_boundary.blocked', 5).join(' ').toLowerCase();
for (const needle of ['private', 'raw', 'local', 'api', 'cookies', 'client']) if (!blocked.includes(needle)) fail(`public_boundary.blocked must cover ${needle}`);
useful(adapter.retention, 'retention', 50);

const html = read(htmlPath);
for (const needle of ['Creator Prompt DNA Adapter', adapterId, 'no raw generated media', 'preview recipe', 'remix handles']) if (!html.includes(needle)) fail(`${htmlPath} missing ${needle}`);
for (const forbidden of ['<img', '<video', '<audio', 'data:image', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov']) {
  if (html.toLowerCase().includes(forbidden)) fail(`${htmlPath} must not embed raw media via ${forbidden}`);
}
const workflow = read(workflowPath);
for (const needle of ['Adapter contract', 'Preview artifact', 'Script gate', 'Mutation selected', 'Public boundary', 'Remix rule', '中文摘要']) if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
console.log('creator-prompt-dna-check: PASS prompt DNA adapter contract + proof card + workflow');
