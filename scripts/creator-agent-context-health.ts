#!/usr/bin/env bun
/**
 * Creator Agent Context Health Check
 *
 * Validates the four core agent-facing docs are present, parseable, and
 * structurally sound before any autonomous Darwin run starts. Catches missing
 * or corrupted agent context files that would cause downstream errors.
 *
 * Slice: creator-agent-context-route
 * Darwin axis: proof method
 */

import { existsSync, readFileSync } from 'node:fs';

interface Check {
  file: string;
  label: string;
  passed: boolean;
  detail: string;
}

const checks: Check[] = [];

function addCheck(file: string, label: string, passed: boolean, detail: string) {
  checks.push({ file, label, passed, detail });
}

function read(file: string): string {
  return readFileSync(file, 'utf8');
}

function fail(message: string): never {
  console.error(`creator-agent-context-health: FATAL ${message}`);
  process.exit(1);
}

const start = performance.now();

// ── 1. AGENTS.md ──
const agentsPath = 'AGENTS.md';
if (!existsSync(agentsPath)) {
  addCheck(agentsPath, 'presence', false, 'file missing — agents cannot bootstrap');
} else {
  addCheck(agentsPath, 'presence', true, 'present');
  const content = read(agentsPath);

  // Required sections
  const requiredHeadings = [
    /##\s+What This Repo Provides/i,
    /##\s+Default Commands/i,
    /##\s+Public Boundary/i,
  ];
  let missingHeadings = 0;
  for (const re of requiredHeadings) {
    if (!re.test(content)) {
      missingHeadings++;
      addCheck(agentsPath, `section`, false, `missing required section matching "${re.source}"`);
    }
  }
  if (missingHeadings === 0) {
    addCheck(agentsPath, 'sections', true, `${requiredHeadings.length} required sections found`);
  }
}

// ── 2. WORKFLOW_INDEX.md ──
const workflowPath = 'docs/WORKFLOW_INDEX.md';
if (!existsSync(workflowPath)) {
  addCheck(workflowPath, 'presence', false, 'file missing');
} else {
  addCheck(workflowPath, 'presence', true, 'present');
  const content = read(workflowPath);

  const requiredSections = [
    { re: /##\s+Workflow Matrix/i, name: 'Workflow Matrix' },
    { re: /##\s+Agent Routing Rules/i, name: 'Agent Routing Rules' },
  ];
  let missing = 0;
  for (const s of requiredSections) {
    if (!s.re.test(content)) {
      missing++;
      addCheck(workflowPath, 'section', false, `missing "${s.name}" section`);
    }
  }
  if (missing === 0) {
    addCheck(workflowPath, 'sections', true, `${requiredSections.length} required sections found`);
  }

  // Check internal links are resolvable (resolve relative to docs/)
  const linkRegex = /\]\(([^)]+)\)/g;
  let linkMatch;
  let brokenLinks = 0;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const href = linkMatch[1];
    if (href.startsWith('http') || href.startsWith('#')) continue;
    // Resolve relative to docs/ directory
    let resolved = href;
    if (resolved.startsWith('../')) {
      resolved = resolved.replace(/\.\.\//g, '');
    } else if (resolved.startsWith('./')) {
      resolved = 'docs/' + resolved.slice(2);
    } else if (!resolved.startsWith('/')) {
      resolved = 'docs/' + resolved;
    }
    const cleanPath = resolved.split('#')[0];
    if (cleanPath && !existsSync(cleanPath)) {
      brokenLinks++;
      if (brokenLinks <= 3) {
        addCheck(workflowPath, 'link', false, `broken link: "${href}" → "${cleanPath}" not found`);
      }
    }
  }
  if (brokenLinks === 0) {
    addCheck(workflowPath, 'links', true, 'all internal links resolve');
  } else {
    addCheck(workflowPath, 'links', false, `${brokenLinks} broken internal links`);
  }
}

// ── 3. CREATOR_EVOLUTION_ENGINE.md ──
const evolutionPath = 'docs/CREATOR_EVOLUTION_ENGINE.md';
if (!existsSync(evolutionPath)) {
  addCheck(evolutionPath, 'presence', false, 'file missing');
} else {
  addCheck(evolutionPath, 'presence', true, 'present');
  const content = read(evolutionPath);

  const requiredSections = [
    { re: /##\s+Evolution loop/i, name: 'Evolution loop' },
    { re: /##\s+Retained mutations/i, name: 'Retained mutations' },
    { re: /##\s+Fitness rubric/i, name: 'Fitness rubric' },
  ];
  let missing = 0;
  for (const s of requiredSections) {
    if (!s.re.test(content)) {
      missing++;
      addCheck(evolutionPath, 'section', false, `missing "${s.name}" section`);
    }
  }
  if (missing === 0) {
    addCheck(evolutionPath, 'sections', true, `${requiredSections.length} required sections found`);
  }
}

// ── 4. creator-mutation-candidates.json ──
const ledgerPath = 'examples/creator-mutation-candidates.json';
if (!existsSync(ledgerPath)) {
  addCheck(ledgerPath, 'presence', false, 'file missing');
} else {
  addCheck(ledgerPath, 'presence', true, 'present');

  let ledger: any;
  try {
    ledger = JSON.parse(read(ledgerPath));
  } catch (e) {
    addCheck(ledgerPath, 'parse', false, `invalid JSON: ${(e as Error).message}`);
    ledger = null;
  }

  if (ledger) {
    const requiredFields = [
      { key: 'observation', type: 'string' },
      { key: 'population', type: 'string' },
      { key: 'selection_pressure', type: 'string' },
      { key: 'candidates', type: 'array' },
      { key: 'retained_routes', type: 'array' },
      { key: 'regression', type: 'array' },
    ];

    let fieldIssues = 0;
    for (const f of requiredFields) {
      const val = ledger[f.key];
      if (val === undefined || val === null) {
        fieldIssues++;
        addCheck(ledgerPath, 'field', false, `missing required field "${f.key}"`);
      } else if (f.type === 'array' && !Array.isArray(val)) {
        fieldIssues++;
        addCheck(ledgerPath, 'field', false, `field "${f.key}" is not an array`);
      } else if (f.type === 'string' && typeof val !== 'string') {
        fieldIssues++;
        addCheck(ledgerPath, 'field', false, `field "${f.key}" is not a string`);
      }
    }

    if (fieldIssues === 0) {
      addCheck(ledgerPath, 'fields', true, `${requiredFields.length} required fields present and typed`);

      // Validate candidate count
      const candidateCount = ledger.candidates.length;
      if (candidateCount >= 3 && candidateCount <= 5) {
        addCheck(ledgerPath, 'candidates', true, `${candidateCount} active candidates (3-5 range)`);
      } else {
        addCheck(ledgerPath, 'candidates', false, `${candidateCount} candidates (expected 3-5)`);
      }

      // Validate exactly one "selected" winner
      const selectedCount = ledger.candidates.filter((c: any) => c.selection === 'selected').length;
      if (selectedCount === 1) {
        addCheck(ledgerPath, 'selection', true, 'exactly 1 selected winner');
      } else {
        addCheck(ledgerPath, 'selection', false, `${selectedCount} selected winners (expected 1)`);
      }
    }
  }
}

// ── Report ──
const elapsed = Math.round(performance.now() - start);
const passed = checks.filter((c) => c.passed).length;
const failed = checks.filter((c) => !c.passed).length;

console.log('creator-agent-context-health: scanning agent-facing docs…\n');

for (const c of checks) {
  const status = c.passed ? 'PASS' : 'FAIL';
  console.log(`  ${status}  ${c.file}  ${c.label}  ${c.detail}`);
}

console.log(`\ncreator-agent-context-health: ${passed}/${checks.length} checks passed, ${failed} failures (${elapsed}ms)`);

if (failed > 0) {
  console.log('\ncreator-agent-context-health: FAIL agent context not healthy');
  process.exit(1);
}

console.log('\ncreator-agent-context-health: PASS agent context healthy');
process.exit(0);
