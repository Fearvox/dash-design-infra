#!/usr/bin/env bun
/**
 * Creator Surface Health Check
 *
 * Dynamically discovers all creator-*.html surfaces in examples/,
 * maps each to its corresponding creator:*check script, runs every
 * individual surface gate, and reports per-surface PASS/FAIL with timing.
 *
 * Catches: broken individual surfaces, missing check scripts for new surfaces,
 * and surfaces present in examples/ but absent from the regression orchestrator.
 *
 * Slice: creator-surface-health-route
 * Darwin axis: proof method (per-surface health validation)
 */

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// ── Surface HTML → check script mapping ──
const SURFACE_CHECK_MAP: Record<string, string> = {
  'creator-poster-surface':    'creator:poster-check',
  'creator-prompt-dna-adapter': 'creator:prompt-dna-check',
  'creator-motion-storyboard':  'creator:motion-storyboard-check',
  'creator-social-card':        'creator:social-card-check',
  'creator-pdf-zine':           'creator:pdf-zine-check',
  'creator-p5-sketch':          'creator:p5-sketch-check',
  'creator-remotion-scene':     'creator:remotion-scene-check',
  'creator-manim-scene':        'creator:manim-scene-check',
  'creator-touchdesigner-tox':  'creator:touchdesigner-tox-check',
  'creator-browser-demo':       'creator:browser-demo-check',
  'creator-frontier-capsule':   'creator:capsule-check',
};

interface SurfaceResult {
  htmlFile: string;
  checkScript: string | null;
  passed: boolean;
  durationMs: number;
  detail: string;
}

async function runCheck(scriptName: string): Promise<{ passed: boolean; output: string }> {
  const proc = Bun.spawn(['bun', 'run', scriptName], {
    stdout: 'pipe',
    stderr: 'pipe',
    cwd: process.cwd(),
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  const output = stdout.trim() || stderr.trim();
  return { passed: exitCode === 0, output };
}

async function main() {
  console.log('creator-surface-health: scanning creator surfaces…\n');

  const examplesDir = 'examples';
  if (!existsSync(examplesDir)) {
    console.log('creator-surface-health: FAIL — examples/ directory not found');
    process.exit(1);
  }

  const allFiles = readdirSync(examplesDir, { withFileTypes: true });
  const surfaceFiles = allFiles
    .filter((e) => e.isFile() && e.name.startsWith('creator-') && e.name.endsWith('.html'))
    .map((e) => e.name);

  if (surfaceFiles.length === 0) {
    console.log('creator-surface-health: WARN — no creator-*.html surfaces found in examples/');
    process.exit(0);
  }

  const results: SurfaceResult[] = [];
  let mappedCount = 0;
  let unmappedCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  const start = performance.now();

  for (const htmlFile of surfaceFiles) {
    const stem = htmlFile.replace(/\.html$/, '');
    const checkScript = SURFACE_CHECK_MAP[stem] ?? null;

    if (!checkScript) {
      unmappedCount++;
      results.push({
        htmlFile,
        checkScript: null,
        passed: false,
        durationMs: 0,
        detail: 'no check script mapping — add to SURFACE_CHECK_MAP',
      });
      console.log(`  MISS  ${htmlFile}  (no check script mapped)`);
      continue;
    }

    const t0 = performance.now();
    const { passed, output } = await runCheck(checkScript);
    const durationMs = Math.round(performance.now() - t0);

    mappedCount++;
    if (passed) passedCount++;
    else failedCount++;

    const detail = output.split('\n').pop()?.trim() || output.slice(0, 120);
    results.push({ htmlFile, checkScript, passed, durationMs, detail });

    const status = passed ? 'PASS' : 'FAIL';
    console.log(`  ${status}  ${htmlFile}  → ${checkScript}  (${durationMs}ms)`);
    if (!passed && output) {
      // Print the last meaningful line of output for context
      console.log(`         ${detail}`);
    }
  }

  const totalMs = Math.round(performance.now() - start);
  const total = results.length;

  console.log(
    `\ncreator-surface-health: ${mappedCount} surfaces checked, ${unmappedCount} unmapped, ${passedCount}/${mappedCount} passed, ${failedCount} failed (${totalMs}ms)`,
  );

  if (unmappedCount > 0) {
    console.log('\nUNMAPPED SURFACES:');
    for (const r of results.filter((r) => r.checkScript === null)) {
      console.log(`  - ${r.htmlFile} (add to SURFACE_CHECK_MAP in scripts/creator-surface-health.ts)`);
    }
  }

  if (failedCount > 0) {
    console.log('\nFAILED SURFACES:');
    for (const r of results.filter((r) => !r.passed && r.checkScript !== null)) {
      console.log(`  - ${r.htmlFile}: ${r.detail}`);
    }
  }

  const allPassed = failedCount === 0 && unmappedCount === 0;
  console.log(
    `\ncreator-surface-health: ${allPassed ? 'PASS all surfaces healthy' : 'FAIL one or more surfaces unhealthy'}`,
  );
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('creator-surface-health: unexpected error', error);
  process.exit(1);
});
