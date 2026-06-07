#!/usr/bin/env bun
/**
 * creator:heading-weight-check
 *
 * Verifies warm-paper family serif heading font-weight consistency:
 *
 * - 5 warm-paper functional surfaces (poster-surface, pdf-zine, social-card,
 *   motion-storyboard, prompt-dna-adapter) use font-weight:500 for h1/h2
 *   serif headings — the warm-paper editorial grammar consensus.
 *
 * - font-weight:900 on non-heading accent elements (.stamp, .eyebrow,
 *   .route, .proof-card-title) is intentional — those are structural
 *   accents, not heading-grammar drift. This check only inspects h1/h2/h3
 *   selectors.
 *
 * - Visual delta from 520→500 is imperceptible at display sizes; the
 *   machine enforcement prevents backslide.
 *
 * Public-safe: no creative content edits, no telemetry, no network.
 */
import { existsSync, readFileSync } from "node:fs";

const WARM_PAPER_FUNCTIONAL = [
  "examples/creator-poster-surface.html",
  "examples/creator-pdf-zine.html",
  "examples/creator-social-card.html",
  "examples/creator-motion-storyboard.html",
  "examples/creator-prompt-dna-adapter.html",
] as const;

const CONSENSUS_WEIGHT = "500";

interface HeadingWeight {
  file: string;
  selector: string;
  weight: string;
}

function fail(msg: string): never {
  console.error(`creator:heading-weight-check: FAIL ${msg}`);
  process.exit(1);
}

function ok(msg: string): void {
  console.log(`creator:heading-weight-check: PASS ${msg}`);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, "utf8");
}

const headers: HeadingWeight[] = [];

for (const surface of WARM_PAPER_FUNCTIONAL) {
  const html = read(surface);

  // Extract h1/h2/h3 font-weight declarations.
  // Match patterns: "h1 { ... font-weight: 500; ... }" or "h1, h2 { ... font-weight: 500; ... }"
  // Use a two-pass approach: find rules that target h1/h2/h3, then extract font-weight.

  // Pass 1: find CSS blocks containing heading selectors
  const headingRules = html.matchAll(
    /\b(h[123](?:\s*,\s*h[123])*)\s*\{([^}]+)\}/g,
  );

  for (const match of headingRules) {
    const selector = match[1].trim();
    const body = match[2];
    const weightMatch = body.match(/font-weight\s*:\s*(\d+)/);
    if (weightMatch) {
      const weight = weightMatch[1];
      headers.push({ file: surface, selector, weight });
    }
  }
}

let failures = 0;
for (const h of headers) {
  if (h.weight !== CONSENSUS_WEIGHT) {
    failures++;
    console.error(
      `creator:heading-weight-check: FAIL ${h.file} ${h.selector} font-weight:${h.weight} (expected ${CONSENSUS_WEIGHT})`,
    );
  }
}

if (failures > 0) {
  fail(`${failures} heading weight deviation(s) found`);
}

const summary = headers
  .map((h) => `  ${h.file.split("/").pop()} ${h.selector}=${h.weight}`)
  .join("\n");

ok(
  `${headers.length} heading rules across ${WARM_PAPER_FUNCTIONAL.length} warm-paper surfaces, all font-weight:${CONSENSUS_WEIGHT}`,
);
console.log(summary);
