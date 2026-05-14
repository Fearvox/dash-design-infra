#!/usr/bin/env bun
/**
 * Creator Playwright Health Check
 *
 * Validates that the Playwright Chromium binary is installed and functional
 * before any measure:check or print:render operations. Prevents silent 0/11
 * failures from Playwright binary version drift across all 11 retained
 * creator surfaces.
 *
 * Slice: creator-playwright-health-route
 * Darwin axis: proof method (infrastructure health pre-flight)
 */

import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

interface HealthVerdict {
  phase: string;
  passed: boolean;
  detail: string;
}

const VERDICTS: HealthVerdict[] = [];

function verdict(phase: string, passed: boolean, detail: string) {
  VERDICTS.push({ phase, passed, detail });
}

async function main() {
  console.log('creator-playwright-health: checking Playwright Chromium binary…\n');

  // Phase 1: Locate the Playwright cache directory
  const cacheDir = join(homedir(), 'Library', 'Caches', 'ms-playwright');
  const cacheExists = existsSync(cacheDir);

  verdict('cache-dir', cacheExists, cacheExists ? cacheDir : `cache directory not found at ${cacheDir}`);

  if (!cacheExists) {
    console.log('  FAIL\tcache-dir\t(not found)');
    console.log('\ncreator-playwright-health: FAIL — no Playwright cache directory');
    console.log('  Fix: npx playwright install chromium');
    process.exit(1);
  }

  // Phase 2: Find the chromium_headless_shell directory
  const { readdirSync } = await import('node:fs');
  const entries = readdirSync(cacheDir, { withFileTypes: true });

  const chromiumDirs = entries.filter(
    (e) => e.isDirectory() && e.name.startsWith('chromium_headless_shell-')
  );

  if (chromiumDirs.length === 0) {
    verdict('chromium-dir', false, 'no chromium_headless_shell-* directory in cache');
    console.log('  FAIL\tchromium-dir\t(not found)');
    console.log('\ncreator-playwright-health: FAIL — Chromium headless shell not installed');
    console.log('  Fix: npx playwright install chromium');
    process.exit(1);
  }

  const chromiumDir = chromiumDirs[0].name;
  const chromiumPath = join(cacheDir, chromiumDir);
  verdict('chromium-dir', true, join(cacheDir, chromiumDir));
  console.log(`  PASS\tchromium-dir\t(${chromiumDir})`);

  // Phase 3: Verify the headless shell binary exists
  const isMacArm = process.arch === 'arm64' && process.platform === 'darwin';
  const binaryName = isMacArm
    ? join('chrome-headless-shell-mac-arm64', 'chrome-headless-shell')
    : join('chrome-headless-shell', 'chrome-headless-shell');
  const binaryPath = join(chromiumPath, binaryName);
  const binaryExists = existsSync(binaryPath);

  verdict('binary', binaryExists, binaryExists ? binaryPath : `binary not found at ${binaryPath}`);

  if (!binaryExists) {
    console.log(`  FAIL\tbinary\t(not found at ${binaryPath})`);
    console.log('\ncreator-playwright-health: FAIL — Chromium headless shell binary missing');
    console.log('  Fix: npx playwright install chromium');
    process.exit(1);
  }

  console.log(`  PASS\tbinary\t(${binaryName})`);

  // Phase 4: Smoke test — verify Chromium launches via @dash/measure
  try {
    const proc = Bun.spawn(
      ['bun', 'run', 'measure:check', '--', 'examples/creator-poster-surface.html'],
      {
        stdout: 'pipe',
        stderr: 'pipe',
        cwd: process.cwd(),
      },
    );
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    if (exitCode === 0 && stdout.includes('Fits')) {
      verdict('smoke', true, `measure:check passes on poster surface`);
      console.log('  PASS\tsmoke\t(measure:check poster surface OK)');
    } else {
      const errMsg = (stderr + stdout).trim().slice(0, 200);
      verdict('smoke', false, `measure:check failed: ${errMsg}`);
      console.log(`  FAIL\tsmoke\t(${errMsg})`);
      console.log('\ncreator-playwright-health: FAIL — Chromium measure:check failed');
      console.log('  Fix: npx playwright install chromium');
      process.exit(1);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    verdict('smoke', false, `smoke spawn failed: ${msg}`);
    console.log(`  FAIL\tsmoke\t(${msg})`);
    console.log('\ncreator-playwright-health: FAIL — smoke test errored');
    console.log('  Fix: npx playwright install chromium');
    process.exit(1);
  }

  // Final verdict
  const allPassed = VERDICTS.every((v) => v.passed);
  console.log(`\ncreator-playwright-health: ${allPassed ? 'PASS all phases verified' : 'FAIL one or more phases failed'}`);

  if (!allPassed) {
    const failures = VERDICTS.filter((v) => !v.passed);
    console.log('\nFAILED PHASES:');
    for (const f of failures) {
      console.log(`  - ${f.phase}: ${f.detail}`);
    }
  }

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('creator-playwright-health: unexpected error', error);
  process.exit(1);
});
