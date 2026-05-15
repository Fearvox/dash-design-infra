#!/usr/bin/env bun
/**
 * Creator Measure-Print Cache
 *
 * Wraps measure:check + print:render with SHA-256 content-hash caching.
 * Cache entries stored at .cache/measure-print/{hash}.json — gitignored,
 * auto-invalidated on content change. Supports --no-cache to force fresh runs.
 *
 * Slice: creator-measure-print-cache-route
 * Darwin axis: proof method
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CWD = process.cwd();
const CACHE_DIR = join(CWD, '.cache', 'measure-print');

const NO_CACHE = process.argv.includes('--no-cache');

interface Surface {
  name: string;
  file: string;
  canvas: string;
}

const SURFACES: Surface[] = [
  { name: 'poster', file: 'examples/creator-poster-surface.html', canvas: '1684x1191' },
  { name: 'prompt-dna', file: 'examples/creator-prompt-dna-adapter.html', canvas: '1684x1191' },
  { name: 'motion-storyboard', file: 'examples/creator-motion-storyboard.html', canvas: '1684x1191' },
  { name: 'social-card', file: 'examples/creator-social-card.html', canvas: '1200x630' },
  { name: 'pdf-zine', file: 'examples/creator-pdf-zine.html', canvas: '1684x1191' },
  { name: 'p5-sketch', file: 'examples/creator-p5-sketch.html', canvas: '1684x1191' },
  { name: 'remotion-scene', file: 'examples/creator-remotion-scene.html', canvas: '1684x1191' },
  { name: 'manim-scene', file: 'examples/creator-manim-scene.html', canvas: '1684x1191' },
  { name: 'touchdesigner-tox', file: 'examples/creator-touchdesigner-tox.html', canvas: '1684x1191' },
  { name: 'browser-demo', file: 'examples/creator-browser-demo.html', canvas: '1684x1191' },
  { name: 'frontier-capsule', file: 'examples/creator-frontier-capsule.html', canvas: '1684x1191' },
];

interface CacheEntry {
  hash: string;
  source: string;
  canvas: string;
  measurePass: boolean;
  measureOutput: string;
  printPass: boolean;
  printOutput: string;
  timestamp: string;
}

function sha256(filePath: string): string {
  const buf = readFileSync(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

function readCache(hash: string): CacheEntry | null {
  const cacheFile = join(CACHE_DIR, `${hash}.json`);
  if (!existsSync(cacheFile)) return null;
  try {
    const raw = readFileSync(cacheFile, 'utf-8');
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.hash !== hash) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry): void {
  mkdirSync(CACHE_DIR, { recursive: true });
  const cacheFile = join(CACHE_DIR, `${entry.hash}.json`);
  writeFileSync(cacheFile, JSON.stringify(entry, null, 2), 'utf-8');
}

async function runCommand(
  cmd: string,
  args: string[],
): Promise<{ passed: boolean; output: string; durationMs: number }> {
  const start = performance.now();
  const proc = Bun.spawn([cmd, ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    cwd: CWD,
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  const durationMs = Math.round(performance.now() - start);
  return { passed: exitCode === 0, output: (stdout + stderr).trim(), durationMs };
}

async function proofSurface(surface: Surface): Promise<{ measure: boolean; measureOut: string; print: boolean; printOut: string }> {
  const measureArgs = ['run', 'measure:check', '--', surface.file];
  if (surface.canvas !== '1684x1191') {
    measureArgs.push(`--canvas=${surface.canvas}`);
  }
  const m = await runCommand('bun', measureArgs);

  const printFile = `/tmp/dash-${surface.name}-cache.pdf`;
  const printArgs = [
    'run', 'print:render', '--', surface.file, printFile,
    `--canvas=${surface.canvas}`,
  ];
  const p = await runCommand('bun', printArgs);

  return { measure: m.passed, measureOut: m.output, print: p.passed, printOut: p.output };
}

async function main() {
  const mode = NO_CACHE ? 'NO-CACHE (forced fresh)' : 'CACHED (safe)';
  console.log(`creator-measure-print-cache: ${mode} — SHA-256 content-hash measure+print cache…\n`);

  let cached = 0;
  let fresh = 0;
  const results: Array<{ name: string; status: string; source: string; measureMs?: number; printMs?: number }> = [];
  const start = performance.now();

  for (const surface of SURFACES) {
    const filePath = join(CWD, surface.file);
    if (!existsSync(filePath)) {
      console.log(`  ${surface.name.padEnd(22)} MISSING (${surface.file})`);
      results.push({ name: surface.name, status: 'MISSING', source: 'filesystem' });
      continue;
    }

    const hash = sha256(filePath);

    if (!NO_CACHE) {
      const cachedEntry = readCache(hash);
      if (cachedEntry) {
        const mStatus = cachedEntry.measurePass ? 'PASS' : 'FAIL';
        const pStatus = cachedEntry.printPass ? 'PASS' : 'FAIL';
        console.log(`  ${surface.name.padEnd(22)} CACHED  measure:${mStatus}  print:${pStatus}  (hash:${hash.slice(0, 12)})`);
        results.push({ name: surface.name, status: cachedEntry.measurePass && cachedEntry.printPass ? 'PASS' : 'FAIL', source: 'cache' });
        cached++;
        continue;
      }
    }

    const mStart = performance.now();
    const proof = await proofSurface(surface);
    const measureMs = Math.round(performance.now() - mStart);

    // measure and print run sequentially in proofSurface; approximate print timing
    const printMs = measureMs; // same spawn block

    const entry: CacheEntry = {
      hash,
      source: surface.file,
      canvas: surface.canvas,
      measurePass: proof.measure,
      measureOutput: proof.measureOut.slice(0, 500),
      printPass: proof.print,
      printOutput: proof.printOut.slice(0, 500),
      timestamp: new Date().toISOString(),
    };
    writeCache(entry);

    const mStatus = proof.measure ? 'PASS' : 'FAIL';
    const pStatus = proof.print ? 'PASS' : 'FAIL';
    console.log(`  ${surface.name.padEnd(22)} FRESH   measure:${mStatus} (${String(measureMs).padStart(5)}ms)  print:${pStatus}`);
    results.push({ name: surface.name, status: proof.measure && proof.print ? 'PASS' : 'FAIL', source: 'fresh', measureMs, printMs });
    fresh++;
  }

  const totalMs = Math.round(performance.now() - start);
  const passCount = results.filter((r) => r.status === 'PASS').length;

  console.log(
    `\ncreator-measure-print-cache: ${passCount}/${results.length} pass, ${cached} cached, ${fresh} fresh, ${totalMs}ms total`,
  );

  const allPassed = passCount === results.length;
  if (!allPassed) {
    console.log('\nFAILED SURFACES:');
    for (const r of results) {
      if (r.status !== 'PASS' && r.status !== 'MISSING') {
        console.log(`  - ${r.name}: FAIL (source: ${r.source})`);
      }
    }
  }

  console.log(
    `\ncreator-measure-print-cache: ${allPassed ? 'PASS all surfaces verified' : 'FAIL one or more surfaces failed'}`,
  );
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('creator-measure-print-cache: unexpected error', error);
  process.exit(1);
});
