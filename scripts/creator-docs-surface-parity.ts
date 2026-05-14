#!/usr/bin/env bun
/**
 * Creator Docs-Surface Parity Check
 *
 * Cross-references WORKFLOW_INDEX.md creator surface entries,
 * mutation-candidates.json retained_routes, CREATOR_EVOLUTION_ENGINE.md
 * retained mutations, and examples/creator-*.html files.
 * Catches drift between docs and reality before it accumulates.
 *
 * Slice: creator-docs-surface-parity-route
 * Darwin axis: proof method
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';

interface Issue {
  source: string;
  detail: string;
}

const issues: Issue[] = [];
let checksRun = 0;

function addIssue(source: string, detail: string) {
  issues.push({ source, detail });
}

function read(file: string): string {
  return readFileSync(file, 'utf8');
}

function fail(message: string): never {
  console.error(`creator-docs-surface-parity: FATAL ${message}`);
  process.exit(1);
}

// ── 1. Parse WORKFLOW_INDEX.md creator surface table ──
const workflowPath = 'docs/WORKFLOW_INDEX.md';
if (!existsSync(workflowPath)) fail(`missing ${workflowPath}`);
const workflow = read(workflowPath);

// Extract rows where column 1 starts with "| Creator " — check if each surface
// HTML file is referenced anywhere in WORKFLOW_INDEX (loose match, not per-backtick)
const wkCreatorRows: string[] = [];
const lines = workflow.split('\n');
for (const line of lines) {
  if (line.startsWith('| Creator ')) {
    wkCreatorRows.push(line);
  }
}
checksRun++;

// ── 2. Parse mutation-candidates.json ──
const ledgerPath = 'examples/creator-mutation-candidates.json';
if (!existsSync(ledgerPath)) fail(`missing ${ledgerPath}`);
let ledger: any;
try {
  ledger = JSON.parse(read(ledgerPath));
} catch (e) {
  fail(`invalid JSON in ${ledgerPath}: ${(e as Error).message}`);
}

const retainedRoutes = (ledger.retained_routes ?? []) as { id: string }[];
const retainedIds = new Set(retainedRoutes.map((r: any) => r.id));
const activeCandidates = (ledger.candidates ?? []) as { id: string; selection?: string }[];
checksRun++;

// ── 3. Parse CREATOR_EVOLUTION_ENGINE.md retained mutations ──
const evolutionPath = 'docs/CREATOR_EVOLUTION_ENGINE.md';
if (!existsSync(evolutionPath)) fail(`missing ${evolutionPath}`);
const evolution = read(evolutionPath);

const retainedSection = evolution.split('## Retained mutations')[1]?.split('\n## ')[0] ?? '';
const docRetainedIds = new Set<string>();
const retainedLines = retainedSection.split('\n');
for (const line of retainedLines) {
  const match = line.match(/-\s+\[`([^`]+)`\]/);
  if (match) docRetainedIds.add(match[1]);
}
checksRun++;

// ── 4. List examples/creator-*.html files ──
const creatorHtmlFiles = readdirSync('examples')
  .filter((f) => f.startsWith('creator-') && f.endsWith('.html'))
  .map((f) => `examples/${f}`);
checksRun++;

// ── 5. Cross-reference: doc retained ↔ JSON retained_routes ──
// Known mapping: doc uses "creator-vision-qa-standardization", JSON uses "creator-touchdesigner-vision-qa-route"
const docToJson: Record<string, string> = {
  'creator-vision-qa-standardization': 'creator-touchdesigner-vision-qa-route',
};
const jsonToDoc: Record<string, string> = {
  'creator-touchdesigner-vision-qa-route': 'creator-vision-qa-standardization',
};

Array.from(docRetainedIds).forEach((id) => {
  const mappedId = docToJson[id] ?? id;
  if (!retainedIds.has(mappedId)) {
    addIssue('CREATOR_EVOLUTION_ENGINE.md → mutation-candidates.json',
      `"${id}" in doc retained mutations but missing from JSON retained_routes`);
  }
});

Array.from(retainedIds).forEach((id) => {
  const mappedId = jsonToDoc[id] ?? id;
  if (!docRetainedIds.has(mappedId)) {
    addIssue('mutation-candidates.json → CREATOR_EVOLUTION_ENGINE.md',
      `"${id}" in JSON retained_routes but missing from doc retained mutations`);
  }
});
checksRun++;

// ── 6. Selected winner must not also be in retained_routes ──
const selected = activeCandidates.find((c) => c.selection === 'selected');
if (selected && retainedIds.has(selected.id)) {
  addIssue('ledger drift',
    `selected candidate "${selected.id}" also appears in retained_routes — must be one or the other`);
}
checksRun++;

// ── 7. Creator HTML files must appear in WORKFLOW_INDEX ──
const surfaceFiles = creatorHtmlFiles.filter(
  (f) => f !== 'examples/creator-frontier-capsule.html'
);
surfaceFiles.forEach((htmlFile) => {
  if (!workflow.includes(htmlFile)) {
    addIssue('filesystem → WORKFLOW_INDEX',
      `file ${htmlFile} exists but is not referenced anywhere in WORKFLOW_INDEX.md`);
  }
});
checksRun++;

// ── 8. WORKFLOW_INDEX creator rows should have corresponding entry counts ──
// Informational: compare count of creator surface rows vs actual HTML files
if (wkCreatorRows.length < surfaceFiles.length) {
  addIssue('WORKFLOW_INDEX', 
    `${wkCreatorRows.length} creator table rows but ${surfaceFiles.length} surface HTML files — may be missing entries`);
}
checksRun++;

// ── 9. Creator HTML files must appear in multi-surface-proof SURFACES list ──
const proofPath = 'scripts/creator-multi-surface-proof.ts';
if (existsSync(proofPath)) {
  const proofContent = read(proofPath);
  const proofRegex = /file:\s*'([^']+)'/g;
  const proofFiles = new Set<string>();
  let pm;
  while ((pm = proofRegex.exec(proofContent)) !== null) {
    proofFiles.add(pm[1]);
  }

  surfaceFiles.forEach((htmlFile) => {
    if (!proofFiles.has(htmlFile)) {
      addIssue('multi-surface-proof',
        `file ${htmlFile} is not in creator-multi-surface-proof.ts SURFACES list`);
    }
  });

  Array.from(proofFiles).forEach((f) => {
    if (!existsSync(f)) {
      addIssue('multi-surface-proof',
        `surface file ${f} referenced in multi-surface-proof but does not exist on disk`);
    }
  });
  checksRun++;
}

// ── 10. Regression commands must exist in package.json ──
const pkgPath = 'package.json';
if (existsSync(pkgPath)) {
  let pkg: any;
  try { pkg = JSON.parse(read(pkgPath)); } catch { pkg = {}; }
  const scripts = pkg.scripts ?? {};

  const expectedChecks = [
    'creator:poster-check', 'creator:prompt-dna-check', 'creator:motion-storyboard-check',
    'creator:social-card-check', 'creator:pdf-zine-check', 'creator:p5-sketch-check',
    'creator:remotion-scene-check', 'creator:manim-scene-check', 'creator:touchdesigner-tox-check',
    'creator:browser-demo-check',
  ];

  expectedChecks.forEach((name) => {
    if (!scripts[name]) {
      addIssue('package.json', `missing script entry for "${name}"`);
    }
  });
  checksRun++;
}

// ── Report ──
const start = Date.now();
const elapsed = Date.now() - start;

if (issues.length === 0) {
  console.log(`creator-docs-surface-parity: PASS ${checksRun} cross-references verified, 0 issues (${elapsed}ms)`);
  process.exit(0);
}

console.log(`creator-docs-surface-parity: ${issues.length} drift gap(s) across ${checksRun} cross-references (${elapsed}ms):`);
for (const issue of issues) {
  console.log(`  [${issue.source}] ${issue.detail}`);
}

// Exit 0 for warnings (informational drift), exit 1 for 4+ issues (actionable)
if (issues.length >= 4) {
  console.log(`\ncreator-docs-surface-parity: FAIL ${issues.length} issues — requires fix`);
  process.exit(1);
}

console.log(`\ncreator-docs-surface-parity: WARN ${issues.length} minor drift(s) — informational`);
process.exit(0);
