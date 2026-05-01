#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs';

type EvolutionLoop = {
  purpose?: string;
  anti_goal?: string;
  cycle?: string[];
  mutation_axes?: string[];
  fitness?: Record<string, string>;
  selection_rule?: string;
  retention_ladder?: string[];
  proof?: string[];
};

const loopPath = 'examples/creator-evolution-loop.json';
const doctrinePath = 'docs/CREATOR_EVOLUTION_ENGINE.md';

function fail(message: string): never {
  console.error(`creator-evolution-check: FAIL ${message}`);
  process.exit(1);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, 'utf8');
}

const raw = read(loopPath);
let loop: EvolutionLoop;
try {
  loop = JSON.parse(raw) as EvolutionLoop;
} catch (error) {
  fail(`${loopPath} is not valid JSON: ${(error as Error).message}`);
}

function requireText(value: unknown, field: string, needles: string[] = []): string {
  if (typeof value !== 'string' || value.trim().length < 20) fail(`${field} must be a useful string`);
  const lower = value.toLowerCase();
  for (const needle of needles) {
    if (!lower.includes(needle)) fail(`${field} must mention ${needle}`);
  }
  return value;
}

requireText(loop.purpose, 'purpose', ['evolve']);
requireText(loop.anti_goal, 'anti_goal', ['dashboard']);
requireText(loop.selection_rule, 'selection_rule', ['smallest']);

for (const field of ['cycle', 'mutation_axes', 'retention_ladder', 'proof'] as const) {
  const value = loop[field];
  if (!Array.isArray(value) || value.length < 5 || value.some((item) => typeof item !== 'string' || item.trim().length < 6)) {
    fail(`${field} must contain at least 5 useful items`);
  }
}

const cycleText = (loop.cycle ?? []).join(' ').toLowerCase();
for (const needle of ['observe', 'mutation', 'render', 'evaluate', 'select', 'retain', 'regression']) {
  if (!cycleText.includes(needle)) fail(`cycle must include ${needle}`);
}

const fitness = loop.fitness ?? {};
for (const key of ['creator_utility', 'memory_retention', 'artifact_proof', 'boundary_safety', 'minimal_core']) {
  requireText(fitness[key], `fitness.${key}`);
}

const proofText = (loop.proof ?? []).join(' ');
for (const command of ['creator:evolution-check', 'creator:capsule-check', 'docs:links', 'security:scan', 'hackathon:score']) {
  if (!proofText.includes(command)) fail(`proof must include ${command}`);
}

const doctrine = read(doctrinePath);
for (const needle of [
  'observe -> propose mutations -> render candidates -> evaluate -> select -> retain -> regress',
  'Anti-dashboard rule',
  '30-day self-evolution plan',
  'Fitness rubric',
  '中文摘要',
]) {
  if (!doctrine.includes(needle)) fail(`${doctrinePath} missing ${needle}`);
}

console.log('creator-evolution-check: PASS Darwin-style self-evolution doctrine + runbook');
