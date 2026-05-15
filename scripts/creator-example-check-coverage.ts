#!/usr/bin/env bun
/**
 * Creator Example Check Coverage Audit
 *
 * Discovers all examples/creator-*.html surfaces and verifies each has a
 * corresponding creator:*check script in package.json. Uses a known mapping
 * table for non-standard surface→check naming, with auto-derivation for
 * standard surfaces.
 *
 * Catches: surfaces added to examples/ without a check script, check scripts
 * renamed/deleted while surfaces remain, and naming convention mismatches.
 *
 * Slice: creator-example-check-coverage-route
 * Darwin axis: proof method (example surface → check script coverage audit)
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';

// ── Known mappings for non-standard surface → check script naming ──
// Standard pattern: creator-{name}.html → creator:{name}-check
// These exceptions don't follow the standard pattern:
const KNOWN_MAPPINGS: Record<string, string> = {
  'creator-poster-surface': 'creator:poster-check',
  'creator-prompt-dna-adapter': 'creator:prompt-dna-check',
  'creator-frontier-capsule': 'creator:capsule-check',
};

function fail(message: string): never {
  console.error(`creator-example-check-coverage: FATAL ${message}`);
  process.exit(1);
}

const start = performance.now();

// ── 1. Discover all examples/creator-*.html surfaces ──
const examplesDir = 'examples';
if (!existsSync(examplesDir)) fail(`missing ${examplesDir}/`);

const surfaceFiles = readdirSync(examplesDir, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.startsWith('creator-') && e.name.endsWith('.html'))
  .map((e) => e.name);

if (surfaceFiles.length === 0) {
  console.log('creator-example-check-coverage: WARN — no creator-*.html surfaces found');
  process.exit(0);
}

// ── 2. Map each surface to expected check script ──
interface SurfaceMapping {
  htmlFile: string;
  stem: string;
  expectedScript: string;
  mappingType: 'known' | 'standard';
}

const mappings: SurfaceMapping[] = surfaceFiles.map((htmlFile) => {
  const stem = htmlFile.replace(/\.html$/, '');
  const known = KNOWN_MAPPINGS[stem];
  if (known) {
    return { htmlFile, stem, expectedScript: known, mappingType: 'known' };
  }
  // Standard derivation: creator-{name} → creator:{name}-check
  const name = stem.replace(/^creator-/, '');
  return { htmlFile, stem, expectedScript: `creator:${name}-check`, mappingType: 'standard' };
});

// ── 3. Read package.json scripts ──
const pkgPath = 'package.json';
if (!existsSync(pkgPath)) fail(`missing ${pkgPath}`);

let pkg: any;
try {
  pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
} catch (e) {
  fail(`invalid package.json: ${(e as Error).message}`);
}

const scripts = pkg.scripts ?? {};
const scriptNames = new Set(Object.keys(scripts));

// ── 4. Verify each surface has a corresponding check script ──
interface CoverageResult {
  htmlFile: string;
  stem: string;
  expectedScript: string;
  mappingType: string;
  exists: boolean;
}

const results: CoverageResult[] = [];
let coveredCount = 0;
let missingCount = 0;

for (const m of mappings) {
  const exists = scriptNames.has(m.expectedScript);
  if (exists) coveredCount++;
  else missingCount++;
  results.push({ ...m, exists });
}

// ── 5. Inverse check: any creator:*check scripts without a matching surface? ──
// Creator check scripts that SHOULD have a matching surface
// Skip infrastructure scripts (regression, health, surface, script, docs, cron, autonomy, mutation, evolution, capsule, workflow, orphan, contact, multi, darwin, playwright)
const infraSkip = new Set([
  'creator:regression', 'creator:capsule-check', 'creator:evolution-check',
  'creator:mutation-check', 'creator:surface-health', 'creator:script-health',
  'creator:docs-surface-parity', 'creator:cron-slice-health',
  'creator:darwin-autonomy-check', 'creator:workflow-gate-health',
  'creator:orphan-script', 'creator:multi-surface-proof',
  'creator:playwright-health-check', 'creator:agent-context-health',
  'creator:contact-sheet-check', 'creator:skill-package-check',
  'creator:example-check-coverage', 'creator:post-check-coverage',
]);

const expectedScripts = new Set(mappings.map((m) => m.expectedScript));
const orphanScripts: string[] = [];
scriptNames.forEach((name) => {
  if (name.startsWith('creator:') && !infraSkip.has(name) && !expectedScripts.has(name)) {
    orphanScripts.push(name);
  }
});

// ── 6. Report ──
const totalMs = Math.round(performance.now() - start);

console.log('creator-example-check-coverage: auditing surface→check script coverage…\n');

for (const r of results) {
  const status = r.exists ? 'PASS' : 'MISS';
  const mapLabel = r.mappingType === 'known' ? ' [non-standard]' : '';
  console.log(`  ${status}  ${r.htmlFile}  →  ${r.expectedScript}${mapLabel}`);
}

console.log(
  `\ncreator-example-check-coverage: ${coveredCount}/${results.length} surfaces covered` +
  (missingCount > 0 ? `, ${missingCount} missing` : '') +
  (orphanScripts.length > 0 ? `, ${orphanScripts.length} orphan scripts` : '') +
  ` (${totalMs}ms)`,
);

if (missingCount > 0) {
  console.log('\nMISSING CHECK SCRIPTS (add to package.json):');
  for (const r of results.filter((r) => !r.exists)) {
    console.log(`  - ${r.htmlFile} → missing "${r.expectedScript}"`);
  }
  // If KNOWN_MAPPINGS entry is wrong, suggest the standard derivation
  for (const r of results.filter((r) => !r.exists && r.mappingType === 'known')) {
    const stdName = r.stem.replace(/^creator-/, '');
    const stdScript = `creator:${stdName}-check`;
    console.log(`    (standard derivation would be "${stdScript}" — check if mapping needs updating)`);
  }
}

if (orphanScripts.length > 0) {
  console.log('\nORPHAN CHECK SCRIPTS (no matching surface HTML):');
  for (const name of orphanScripts) {
    console.log(`  - ${name} (in package.json but no matching examples/creator-*.html surface)`);
  }
}

const allCovered = missingCount === 0;
if (!allCovered) {
  console.log('\ncreator-example-check-coverage: FAIL missing check scripts');
  process.exit(1);
}

console.log(`\ncreator-example-check-coverage: PASS all ${results.length} surfaces have check scripts`);
process.exit(0);
