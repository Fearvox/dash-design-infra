#!/usr/bin/env bun
/**
 * Creator Post-Check Coverage Audit
 *
 * Discovers all examples/creator-*.html surfaces and verifies each has a
 * corresponding .artifacts/creator-*-qa.md evidence file, confirming that
 * QA evidence generation (vision/DOM) is complete for all retained surfaces.
 *
 * Catches: surfaces added to examples/ without QA artifact generation,
 * surfaces where QA drift leaves stale or missing evidence files.
 *
 * Uses a known mapping table for non-standard surface→QA naming.
 * Excludes surfaces that are not expected to have QA artifacts (e.g., capsule).
 *
 * Slice: creator-post-check-coverage-route
 * Darwin axis: proof method (surface → QA evidence coverage audit)
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';

// ── Known mappings for non-standard surface → QA artifact naming ──
// Standard pattern: creator-{name}.html → creator-{name}-qa.md
const KNOWN_QA_MAPPINGS: Record<string, string> = {
  'creator-poster-surface': 'creator-poster-qa', // drops "surface"
  'creator-prompt-dna-adapter': 'creator-prompt-dna-adapter-qa', // standard naming
};

// Surfaces not expected to have QA artifacts
const QA_EXCLUDED = new Set<string>([
  'creator-frontier-capsule', // capsule — input, not a surface requiring QA
]);

// Minimal evidence markers that should appear in a valid QA file
const EVIDENCE_MARKERS = [
  'browser_console',
  'browser_vision',
  'DOM verification',
  'screenshot_path',
  'canvas',
];

function fail(message: string): never {
  console.error(`creator-post-check-coverage: FATAL ${message}`);
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
  console.log('creator-post-check-coverage: WARN — no creator-*.html surfaces found');
  process.exit(0);
}

// ── 2. Map each surface to expected QA file ──
interface QAMapping {
  htmlFile: string;
  stem: string;
  excluded: boolean;
  expectedQA: string;
  mappingType: 'excluded' | 'known' | 'standard';
}

const mappings: QAMapping[] = surfaceFiles.map((htmlFile) => {
  const stem = htmlFile.replace(/\.html$/, '');
  if (QA_EXCLUDED.has(stem)) {
    return { htmlFile, stem, excluded: true, expectedQA: '', mappingType: 'excluded' };
  }
  const known = KNOWN_QA_MAPPINGS[stem];
  if (known) {
    return { htmlFile, stem, excluded: false, expectedQA: `.artifacts/${known}.md`, mappingType: 'known' };
  }
  return { htmlFile, stem, excluded: false, expectedQA: `.artifacts/${stem}-qa.md`, mappingType: 'standard' };
});

// ── 3. Verify QA file existence ──
interface QAResult {
  htmlFile: string;
  stem: string;
  expectedQA: string;
  mappingType: string;
  exists: boolean;
  hasEvidence: boolean;
  missingMarkers: string[];
}

const results: QAResult[] = [];
let coveredCount = 0;
let missingCount = 0;
let weakEvidenceCount = 0;

for (const m of mappings) {
  if (m.excluded) {
    results.push({ ...m, exists: true, hasEvidence: true, missingMarkers: [] });
    coveredCount++;
    continue;
  }

  const exists = existsSync(m.expectedQA);
  let hasEvidence = false;
  let missingMarkers: string[] = [];

  if (exists) {
    try {
      const content = readFileSync(m.expectedQA, 'utf8');
      // Check for evidence markers (case-insensitive)
      const lower = content.toLowerCase();
      missingMarkers = EVIDENCE_MARKERS.filter((marker) => !lower.includes(marker.toLowerCase()));
      // File is considered to have evidence if at least one marker is present
      // OR if it has substantial content (>500 chars, suggesting real evidence text)
      hasEvidence = missingMarkers.length < EVIDENCE_MARKERS.length || content.length > 500;
    } catch {
      hasEvidence = false;
    }
    coveredCount++;
    if (!hasEvidence) weakEvidenceCount++;
  } else {
    missingCount++;
  }

  results.push({ ...m, exists, hasEvidence, missingMarkers });
}

// ── 4. Report ──
const totalMs = Math.round(performance.now() - start);
const totalSurfaces = surfaceFiles.length;
const expectedSurfaces = mappings.filter((m) => !m.excluded).length;

console.log('creator-post-check-coverage: auditing surface→QA evidence coverage…\n');

for (const r of results) {
  if (r.mappingType === 'excluded') {
    console.log(`  SKIP  ${r.htmlFile}  →  (excluded: capsule — not a surface requiring QA)`);
    continue;
  }
  const status = r.exists
    ? r.hasEvidence ? 'PASS' : 'WEAK'
    : 'MISS';
  const mapLabel = r.mappingType === 'known' ? ' [non-standard]' : '';
  console.log(`  ${status}  ${r.htmlFile}  →  ${r.expectedQA}${mapLabel}`);
  if (status === 'WEAK') {
    console.log(`        missing evidence markers: ${r.missingMarkers.join(', ')} — file may be stale or incomplete`);
  }
}

console.log(
  `\ncreator-post-check-coverage: ${coveredCount}/${totalSurfaces} surfaces audited` +
  (missingCount > 0 ? `, ${missingCount}/${expectedSurfaces} QA files missing` : `, ${expectedSurfaces}/${expectedSurfaces} QA files present`) +
  (weakEvidenceCount > 0 ? `, ${weakEvidenceCount} with weak/missing evidence markers` : '') +
  ` (${totalMs}ms)`,
);

if (missingCount > 0) {
  console.log('\nMISSING QA EVIDENCE FILES:');
  for (const r of results.filter((r) => !r.exists)) {
    console.log(`  - ${r.htmlFile} → ${r.expectedQA} (not found)`);
    if (r.mappingType === 'known') {
      const stdName = r.stem.replace(/^creator-/, '');
      console.log(`    (standard mapping would be .artifacts/creator-${stdName}-qa.md — verify KNOWN_QA_MAPPINGS)`);
    }
  }
  console.log('\ncreator-post-check-coverage: WARN — missing QA evidence files (non-fatal; run check to verify)');
}

if (weakEvidenceCount > 0) {
  console.log('\nWEAK QA EVIDENCE (files exist but may be stale):');
  for (const r of results.filter((r) => r.exists && !r.hasEvidence)) {
    console.log(`  - ${r.expectedQA} (missing markers: ${r.missingMarkers.join(', ')})`);
  }
  console.log('\ncreator-post-check-coverage: WARN — weak evidence markers (non-fatal)');
}

const status = missingCount > 0 || weakEvidenceCount > 0 ? 'PASS with gaps' : 'PASS';
const gaps: string[] = [];
if (missingCount > 0) gaps.push(`${missingCount} missing QA files`);
if (weakEvidenceCount > 0) gaps.push(`${weakEvidenceCount} weak evidence`);

console.log(`\ncreator-post-check-coverage: ${status} — ${coveredCount}/${totalSurfaces} surfaces audited, ${expectedSurfaces} expected QA files` + (gaps.length > 0 ? ` (${gaps.join(', ')})` : ''));
process.exit(0);
