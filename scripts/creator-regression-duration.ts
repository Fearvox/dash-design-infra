#!/usr/bin/env bun
/**
 * Creator Regression Duration Tracker
 *
 * Reads the timing manifest written by the regression orchestrator
 * (from the last run), compares against stored baselines, and flags
 * performance regressions (>2x baseline). First run creates baseline
 * (never fails). Does NOT re-run the orchestrator.
 *
 * Slice: creator-regression-duration-route
 * Darwin axis: proof method
 *
 * Exit codes:
 *   0 — healthy: all checks within baseline or first run
 *   1 — unhealthy: one or more checks exceed 2x baseline threshold
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CWD = process.cwd();
const TIMING_PATH = join(CWD, 'examples', 'creator-regression-timing.json');
const BASELINE_PATH = join(CWD, 'examples', 'creator-regression-duration-baseline.json');
const REGRESSION_THRESHOLD = 2.0; // 2x baseline

interface CheckTiming {
  name: string;
  durationMs: number;
}

interface TimingManifest {
  timestamp: string;
  totalMs: number;
  passed: number;
  failed: number;
  checks: CheckTiming[];
}

interface BaselineEntry {
  baselineMs: number;
  count: number;
  totalMs: number;
}

interface Baseline {
  lastUpdated: string;
  totalRunMs: number;
  checkCount: number;
  checks: Record<string, BaselineEntry>;
}

interface RegressionIssue {
  check: string;
  currentMs: number;
  baselineMs: number;
  ratio: number;
}

function loadTiming(): TimingManifest | null {
  if (!existsSync(TIMING_PATH)) {
    console.log('creator-regression-duration: no timing manifest found — run creator:regression first');
    return null;
  }
  try {
    const raw = readFileSync(TIMING_PATH, 'utf-8');
    return JSON.parse(raw) as TimingManifest;
  } catch {
    console.warn('creator-regression-duration: could not parse timing manifest');
    return null;
  }
}

function loadBaseline(): Baseline | null {
  if (!existsSync(BASELINE_PATH)) return null;
  try {
    const raw = readFileSync(BASELINE_PATH, 'utf-8');
    return JSON.parse(raw) as Baseline;
  } catch {
    return null;
  }
}

function saveBaseline(baseline: Baseline) {
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + '\n');
}

async function main() {
  console.log('creator-regression-duration: reading timing manifest…\n');

  const timing = loadTiming();
  if (!timing) {
    console.log('creator-regression-duration: SKIP no timing data available');
    console.log('  Run "bun creator:regression" first to generate timing manifest.');
    process.exit(0);
  }

  console.log(`  Timing from: ${timing.timestamp}`);
  console.log(`  Checks: ${timing.passed}/${timing.passed + timing.failed} passed, ${timing.totalMs}ms total\n`);

  // Load existing baseline
  const baseline = loadBaseline();

  // First run: create baseline
  if (!baseline) {
    const newBaseline: Baseline = {
      lastUpdated: new Date().toISOString(),
      totalRunMs: timing.totalMs,
      checkCount: timing.checks.length,
      checks: {},
    };
    for (const t of timing.checks) {
      newBaseline.checks[t.name] = {
        baselineMs: t.durationMs,
        count: 1,
        totalMs: t.durationMs,
      };
    }
    saveBaseline(newBaseline);
    console.log(`creator-regression-duration: BASELINE_CREATED ${timing.checks.length} checks, ${timing.totalMs}ms total`);
    console.log(`  Baseline saved to: ${BASELINE_PATH}`);
    console.log(`  All checks recorded. Future runs will compare against this baseline.`);
    process.exit(0);
  }

  // Compare against baseline
  const regressions: RegressionIssue[] = [];
  const newChecks: string[] = [];
  const updatedChecks: string[] = [];

  for (const t of timing.checks) {
    const entry = baseline.checks[t.name];

    if (!entry) {
      baseline.checks[t.name] = {
        baselineMs: t.durationMs,
        count: 1,
        totalMs: t.durationMs,
      };
      newChecks.push(t.name);
      continue;
    }

    const ratio = t.durationMs / entry.baselineMs;

    if (ratio > REGRESSION_THRESHOLD) {
      regressions.push({
        check: t.name,
        currentMs: t.durationMs,
        baselineMs: entry.baselineMs,
        ratio,
      });
    }

    // Update running average
    entry.count += 1;
    entry.totalMs += t.durationMs;
    entry.baselineMs = Math.round(entry.totalMs / entry.count);
    updatedChecks.push(t.name);
  }

  // Detect removed checks
  const removedChecks = Object.keys(baseline.checks).filter(
    (name) => !timing.checks.find((t) => t.name === name),
  );
  for (const name of removedChecks) {
    delete baseline.checks[name];
  }

  baseline.lastUpdated = new Date().toISOString();
  baseline.totalRunMs = timing.totalMs;
  baseline.checkCount = timing.checks.length;
  saveBaseline(baseline);

  // Report
  if (newChecks.length > 0) {
    console.log(`  New checks added to baseline: ${newChecks.join(', ')}`);
  }
  if (removedChecks.length > 0) {
    console.log(`  Checks removed from baseline: ${removedChecks.join(', ')}`);
  }
  if (updatedChecks.length > 0 && newChecks.length === 0 && regressions.length === 0) {
    console.log(`  All ${updatedChecks.length} checks within threshold. Baselines updated.`);
  }

  if (regressions.length > 0) {
    console.log(`\n  REGRESSIONS DETECTED:`);
    for (const r of regressions) {
      console.log(`    ✗ ${r.check}`);
      console.log(`      ${r.baselineMs}ms → ${r.currentMs}ms (${r.ratio.toFixed(1)}x baseline)`);
    }
    console.log(`\ncreator-regression-duration: FAIL ${regressions.length} checks exceed ${REGRESSION_THRESHOLD}x baseline`);
    process.exit(1);
  }

  console.log(`\ncreator-regression-duration: PASS all checks within threshold`);
  process.exit(0);
}

main().catch((error) => {
  console.error('creator-regression-duration: unexpected error', error);
  process.exit(1);
});
