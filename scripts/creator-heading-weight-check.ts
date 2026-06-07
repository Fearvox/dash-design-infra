#!/usr/bin/env bun
/**
 * creator:heading-weight-check
 *
 * Verifies no creator surface uses the non-standard font-weight:520.
 * font-weight:520 is not a standard CSS value — browsers silently map
 * it to 500 for non-variable fonts like Georgia. This check catches any
 * drift back to the legacy 520 value.
 *
 * Checks all functional creator surfaces (examples/creator-*.html,
 * excluding diagnostics and audits).
 *
 * Public-safe: no telemetry, no network, no surface creative content edits.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, basename } from "node:path";

const EXAMPLES_DIR = "examples";

// Diagnostic/audit surfaces — not functional, skip
const DIAGNOSTIC_PATTERNS = [
  "creator-accent-family-signature-diagnostic",
  "creator-bg-token-diagnostic",
  "creator-cross-family-grammar-audit",
  "creator-family-dna-spacing-grammar-audit",
  "creator-family-grammar-audit",
  "creator-font-grammar-audit",
  "creator-ink-family-diagnostic",
  "creator-muted-surface-diagnostic",
  "creator-non-warm-paper-font-diagnostic",
  "creator-pad-shell-pattern-b-diagnostic",
  "creator-radius-token-audit",
  "creator-type-size-audit",
  "creator-type-size-token-audit",
  "creator-warm-paper-page-geometry-diagnostic",
];

const NON_STANDARD_WEIGHTS = [520, 510, 530, 540, 550, 560, 570, 580, 590];

function fail(msg: string): never {
  console.error(`creator:heading-weight-check: FAIL ${msg}`);
  process.exit(1);
}

function ok(msg: string): void {
  console.log(`creator:heading-weight-check: PASS ${msg}`);
}

function isDiagnostic(name: string): boolean {
  return DIAGNOSTIC_PATTERNS.some((p) => name.startsWith(p));
}

// Discover functional surfaces
const files = readdirSync(EXAMPLES_DIR).filter(
  (f) => f.startsWith("creator-") && extname(f) === ".html" && !isDiagnostic(basename(f, ".html"))
);

if (files.length === 0) fail("no functional creator surfaces found");

let passed = 0;
let failed = 0;
const issues: string[] = [];

for (const file of files.sort()) {
  const path = `${EXAMPLES_DIR}/${file}`;
  if (!existsSync(path)) {
    issues.push(`${file}: missing`);
    failed++;
    continue;
  }

  const html = readFileSync(path, "utf8");

  // Extract all font-weight values
  const weightMatches = html.matchAll(/font-weight\s*:\s*(\d+)/g);
  const weights: number[] = [];
  for (const m of weightMatches) {
    weights.push(parseInt(m[1], 10));
  }

  // Check for non-standard weights
  const badWeights = weights.filter((w) => NON_STANDARD_WEIGHTS.includes(w));
  if (badWeights.length > 0) {
    issues.push(`${file}: non-standard font-weight(s) ${[...new Set(badWeights)].join(",")}`);
    failed++;
  } else {
    ok(`${file}: ${weights.length} weight(s) all standard (${[...new Set(weights)].join(",") || "none"})`);
    passed++;
  }
}

console.log(`\ncreator:heading-weight-check: ${passed}/${passed + failed} PASS`);
if (failed > 0) {
  for (const issue of issues) {
    console.error(`  ${issue}`);
  }
  process.exit(1);
}
