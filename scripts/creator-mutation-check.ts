#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';

type Fitness = {
  creator_utility?: number;
  memory_retention?: number;
  artifact_proof?: number;
  boundary_safety?: number;
  minimal_core?: number;
};

type Candidate = {
  id?: string;
  axis?: string;
  mutation?: string;
  phenotype?: string;
  fitness?: Fitness;
  risk?: string;
  selection?: string;
};

type Ledger = {
  observation?: string;
  population?: string;
  selection_pressure?: string;
  candidates?: Candidate[];
  winner?: string;
  retention?: string;
  regression?: string[];
};

const ledgerPath = 'examples/creator-mutation-candidates.json';
const workflowPath = 'usecases/creator/creator-mutation-candidates.md';

function fail(message: string): never {
  console.error(`creator-mutation-check: FAIL ${message}`);
  process.exit(1);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, 'utf8');
}

function usefulText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length < 20) fail(`${field} must be a useful string`);
  return value;
}

const raw = read(ledgerPath);
let ledger: Ledger;
try {
  ledger = JSON.parse(raw) as Ledger;
} catch (error) {
  fail(`${ledgerPath} is not valid JSON: ${(error as Error).message}`);
}

usefulText(ledger.observation, 'observation');
usefulText(ledger.population, 'population');
usefulText(ledger.selection_pressure, 'selection_pressure');
usefulText(ledger.retention, 'retention');

const candidates = ledger.candidates ?? [];
if (candidates.length < 3 || candidates.length > 5) fail('candidates must contain 3-5 mutations');

const allowedAxes = new Set(['surface', 'visual grammar', 'tool adapter', 'proof method', 'capsule schema', 'agent routing rule', 'command']);
const ids = new Set<string>();
let selectedCount = 0;
for (let index = 0; index < candidates.length; index += 1) {
  const candidate = candidates[index];
  const id = usefulText(candidate.id, `candidates[${index}].id`);
  if (ids.has(id)) fail(`duplicate candidate id ${id}`);
  ids.add(id);
  if (typeof candidate.axis !== 'string' || candidate.axis.trim().length < 3) fail(`candidates[${index}].axis must be a string`);
  const axis = candidate.axis;
  if (!allowedAxes.has(axis)) fail(`candidate ${id} uses unsupported axis ${axis}`);
  usefulText(candidate.mutation, `candidates[${index}].mutation`);
  usefulText(candidate.phenotype, `candidates[${index}].phenotype`);
  usefulText(candidate.risk, `candidates[${index}].risk`);
  if (candidate.selection === 'selected') selectedCount += 1;

  const fitness = candidate.fitness ?? {};
  for (const key of ['creator_utility', 'memory_retention', 'artifact_proof', 'boundary_safety', 'minimal_core'] as const) {
    const score = fitness[key];
    if (!Number.isInteger(score) || score < 1 || score > 10) fail(`candidate ${id} fitness.${key} must be integer 1-10`);
  }
}

if (selectedCount !== 1) fail('exactly one candidate must be selected');
if (!ledger.winner || !ids.has(ledger.winner)) fail('winner must match a candidate id');
const selected = candidates.find((candidate) => candidate.selection === 'selected');
if (selected?.id !== ledger.winner) fail('winner must be the selected candidate');

const regression = ledger.regression ?? [];
for (const command of ['creator:mutation-check', 'creator:poster-check', 'creator:prompt-dna-check', 'creator:motion-storyboard-check', 'creator:evolution-check', 'creator:capsule-check', 'docs:links', 'security:scan', 'hackathon:score']) {
  if (!regression.some((item) => item.includes(command))) fail(`regression must include ${command}`);
}

const workflow = read(workflowPath);
for (const needle of ['Anti-dashboard pressure', 'Current retained winner', 'Selection rule', '中文摘要']) {
  if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
}

console.log('creator-mutation-check: PASS candidate ledger + selection pressure + regression contract');
