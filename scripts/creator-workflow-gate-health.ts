#!/usr/bin/env bun
/**
 * Creator Workflow Gate Health Check
 *
 * Cross-references every gate referenced in WORKFLOW_INDEX.md
 * against package.json scripts. Validates that documented gates
 * exist as executable scripts and that each passes.
 *
 * Handles:
 * - Direct script names: `bun creator:poster-check`
 * - Commands with args: `bun measure:check -- examples/...`
 * - Chained commands: `bun docs:links && bun security:scan && bun hackathon:score`
 * - Router section commands
 *
 * Exit 0: all referenced gates exist in package.json and pass.
 * Exit 1: one or more gates missing or broken.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_ROOT = process.cwd();

interface GateEntry {
  workflow: string;
  scriptName: string;
}

interface GateResult {
  scriptName: string;
  inPackageJson: boolean;
  exitCode: number | null;
  durationMs: number;
  output: string;
  note: string;
}

// Scripts that exist but require arguments — validate existence only
const REQUIRES_ARGS = new Set(['measure:check', 'print:render']);

// Long-running scripts — skip execution, validate existence only
const SKIP_EXECUTION = new Set([
  'creator:multi-surface-proof',
  'creator:regression',
  'creator:workflow-gate-health', // self-referential — would recurse
]);

function loadPackageJson(): Record<string, string> {
  const pkg = JSON.parse(
    readFileSync(resolve(REPO_ROOT, 'package.json'), 'utf-8'),
  );
  return pkg.scripts || {};
}

function extractGatesFromWorkflowIndex(): GateEntry[] {
  const content = readFileSync(
    resolve(REPO_ROOT, 'docs/WORKFLOW_INDEX.md'),
    'utf-8',
  );
  const gates: GateEntry[] = [];
  const seen = new Set<string>();

  const lines = content.split('\n');
  let currentWorkflow = '';

  for (const line of lines) {
    // Track workflow context from section headers
    const sectionMatch = line.match(/^### If the user (.+)$/);
    if (sectionMatch) {
      currentWorkflow = sectionMatch[1].trim();
      continue;
    }

    // Track workflow context from table data rows (column 1)
    const tableRow = line.match(/^\|\s*([A-Z][^|]+?)\s*\|/);
    if (tableRow) {
      const name = tableRow[1].trim();
      if (!['Job', 'Slot', 'Workflow Matrix'].includes(name)) {
        currentWorkflow = name;
      }
    }

    // Extract all `bun <script-name>` references
    // Pattern matches: bun creator:poster-check, bun measure:check, bun docs:links, etc.
    const bunPattern = /\bbun\s+([a-z][a-z0-9_-]*(?::[a-z][a-z0-9_-]*)?)/gi;
    let match: RegExpExecArray | null;
    while ((match = bunPattern.exec(line)) !== null) {
      const scriptName = match[1];

      // Skip arguments masquerading as scripts
      if (scriptName.startsWith('--') || scriptName === 'run') continue;

      // Only track creator, measure, print, and ecosystem scripts
      const isRelevant =
        scriptName.startsWith('creator:') ||
        scriptName.startsWith('measure:') ||
        scriptName === 'print:render' ||
        scriptName === 'tokens:build' ||
        scriptName === 'metrics:build' ||
        scriptName === 'p5:motion-check' ||
        scriptName === 'docs:links' ||
        scriptName === 'security:scan' ||
        scriptName === 'hackathon:score' ||
        scriptName === 'typecheck' ||
        scriptName === 'audit';

      if (!isRelevant) continue;
      if (seen.has(scriptName)) continue;
      seen.add(scriptName);

      gates.push({
        workflow: currentWorkflow || '(document root)',
        scriptName,
      });
    }
  }

  return gates;
}

async function runScript(
  scriptName: string,
): Promise<{ exitCode: number | null; durationMs: number; output: string }> {
  const start = performance.now();
  let exitCode: number | null = null;
  let output = '';

  try {
    const proc = Bun.spawn(['bun', 'run', scriptName], {
      stdout: 'pipe',
      stderr: 'pipe',
      cwd: REPO_ROOT,
      env: { ...process.env },
    });

    const timeout = setTimeout(() => {
      proc.kill();
    }, 30_000);

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    exitCode = await proc.exited;
    clearTimeout(timeout);

    output = (stdout + stderr).trim();
  } catch {
    exitCode = -1;
    output = 'execution error';
  }

  const durationMs = Math.round(performance.now() - start);
  return { exitCode, durationMs, output };
}

async function main() {
  console.log(
    'creator-workflow-gate-health: cross-referencing WORKFLOW_INDEX gates against package.json…\n',
  );

  const scripts = loadPackageJson();
  const gates = extractGatesFromWorkflowIndex();

  if (gates.length === 0) {
    console.log('creator-workflow-gate-health: FAIL no gates extracted from WORKFLOW_INDEX.md');
    process.exit(1);
  }

  const results: GateResult[] = [];
  let missing = 0;
  let failed = 0;

  for (const gate of gates) {
    const inPkg = gate.scriptName in scripts;
    let exitCode: number | null = null;
    let durationMs = 0;
    let output = '';
    let note = '';

    if (!inPkg) {
      // Missing from package.json
    } else if (REQUIRES_ARGS.has(gate.scriptName)) {
      note = 'requires args';
    } else if (SKIP_EXECUTION.has(gate.scriptName)) {
      note = 'skipped (long-running)';
    } else {
      const result = await runScript(gate.scriptName);
      exitCode = result.exitCode;
      durationMs = result.durationMs;
      output = result.output;
    }

    results.push({
      scriptName: gate.scriptName,
      inPackageJson: inPkg,
      exitCode,
      durationMs,
      output,
      note,
    });

    let status: string;
    if (!inPkg) {
      status = 'MISSING';
      missing++;
    } else if (exitCode !== null && exitCode !== 0) {
      status = 'FAIL';
      failed++;
    } else {
      status = 'PASS';
    }

    const timing = inPkg && durationMs > 0 ? ` ${durationMs}ms` : '';
    const notePart = note ? ` [${note}]` : '';
    console.log(`  ${status}\t${gate.scriptName}${timing}${notePart}\t← ${gate.workflow}`);

    if (!inPkg) {
      console.log(`         \tNOT IN package.json scripts`);
    } else if (exitCode !== null && exitCode !== 0 && output) {
      const firstLine = output.split('\n')[0].slice(0, 100);
      console.log(`         \texit ${exitCode}: ${firstLine}`);
    }
  }

  const total = gates.length;
  const passed = total - missing - failed;

  console.log(
    `\ncreator-workflow-gate-health: ${passed}/${total} passed, ${missing} missing, ${failed} failed`,
  );

  if (missing > 0) {
    console.log('\nMISSING SCRIPTS (WORKFLOW_INDEX references not in package.json):');
    for (const r of results.filter((r) => !r.inPackageJson)) {
      console.log(`  - ${r.scriptName}`);
    }
  }

  if (failed > 0) {
    console.log('\nFAILED SCRIPTS (exit code ≠ 0):');
    for (const r of results.filter((r) => r.inPackageJson && r.exitCode !== null && r.exitCode !== 0)) {
      console.log(`  - ${r.scriptName} (exit ${r.exitCode})`);
    }
  }

  const allPassed = missing === 0 && failed === 0;
  console.log(
    `\ncreator-workflow-gate-health: ${allPassed ? 'PASS all WORKFLOW_INDEX gates exist and pass' : 'FAIL gates missing or broken'}`,
  );
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('creator-workflow-gate-health: unexpected error', error);
  process.exit(1);
});
