#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';

type Capsule = {
  creator?: string;
  intent?: string;
  memory?: string[];
  surface?: string;
  grammar?: Record<string, string>;
  inputs?: { allowed?: string[]; blocked?: string[] };
  tool_path?: string[];
  proof?: string[];
  remix_rule?: string;
};

const capsulePath = 'examples/creator-frontier-capsule.json';
const boardPath = 'examples/creator-frontier-capsule.html';
const workflowPath = 'usecases/creator/creator-frontier-capsule.md';

function fail(message: string): never {
  console.error(`creator-capsule-check: FAIL ${message}`);
  process.exit(1);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, 'utf8');
}

const raw = read(capsulePath);
let capsule: Capsule;
try {
  capsule = JSON.parse(raw) as Capsule;
} catch (error) {
  fail(`${capsulePath} is not valid JSON: ${(error as Error).message}`);
}

const requiredStringFields: Array<keyof Capsule> = ['creator', 'intent', 'surface', 'remix_rule'];
for (const field of requiredStringFields) {
  const value = capsule[field];
  if (typeof value !== 'string' || value.trim().length < 8) {
    fail(`field ${String(field)} must be a useful string`);
  }
}

for (const field of ['memory', 'tool_path', 'proof'] as const) {
  const value = capsule[field];
  if (!Array.isArray(value) || value.length < 3 || value.some((item) => typeof item !== 'string' || item.trim().length < 4)) {
    fail(`field ${field} must contain at least 3 useful items`);
  }
}

const grammarKeys = ['layout', 'type', 'color', 'motion'];
for (const key of grammarKeys) {
  const value = capsule.grammar?.[key];
  if (!value || value.trim().length < 8) fail(`grammar.${key} is missing or too thin`);
}

const allowed = capsule.inputs?.allowed ?? [];
const blocked = capsule.inputs?.blocked ?? [];
if (allowed.length < 3) fail('inputs.allowed must name public-safe inputs');
if (blocked.length < 3) fail('inputs.blocked must name private/source exclusions');

const blockedText = blocked.join(' ').toLowerCase();
for (const needle of ['private', 'api', 'raw']) {
  if (!blockedText.includes(needle)) fail(`inputs.blocked should explicitly cover ${needle}`);
}

const proofText = (capsule.proof ?? []).join(' ');
for (const needle of ['measure:check', 'print:render', 'security:scan']) {
  if (!proofText.includes(needle)) fail(`proof must include ${needle}`);
}

const board = read(boardPath);
for (const needle of ['Creator Frontier Capsule', 'creator-frontier-capsule.json', 'remix rule', 'public boundary']) {
  if (!board.includes(needle)) fail(`${boardPath} missing ${needle}`);
}

const workflow = read(workflowPath);
for (const needle of ['Capsule schema', 'Tool adapter rules', 'Public boundary', '中文摘要']) {
  if (!workflow.includes(needle)) fail(`${workflowPath} missing ${needle}`);
}

console.log('creator-capsule-check: PASS examples/creator-frontier-capsule.json + board + workflow');
