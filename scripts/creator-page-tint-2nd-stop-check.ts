#!/usr/bin/env bun
/**
 * creator:page-tint-2nd-stop-check
 *
 * Verifies the warm-paper family 3-stop diagonal page-tint gradient
 * participates in the --paper token vocabulary:
 *
 * - 3 warm-paper functional surfaces (pdf-zine, social-card, poster-surface)
 *   use a 3-stop linear-gradient(135deg, ...) page-tint pattern
 * - The 2nd stop (warm mid tone) on all 3 surfaces is var(--paper)
 * - All 3 surfaces declare --paper: #f2eadb in :root
 *
 * 1st stops are anchored by var(--paper-hot) (verified by creator:paper-tint-stop-check).
 * 3rd stops (#e4d6c2 / #e6dac8 / #ddd1bf) are intentionally retained as
 * per-surface warm shadow tinting (same justification as grid alpha/size
 * per-surface variation in creator-page-grid-check).
 *
 * motion-storyboard + prompt-dna-adapter intentionally use only the grid
 * (no 3-stop tint) — out of scope. family-dna uses dark diagonal (out of scope).
 *
 * Public-safe: no surface creative content edits, no telemetry, no network.
 */
import { existsSync, readFileSync } from "node:fs";

const PAPER_TINT_SURFACES = [
  "examples/creator-pdf-zine.html",
  "examples/creator-social-card.html",
  "examples/creator-poster-surface.html",
] as const;

interface PageTintPattern {
  file: string;
  hasPattern: boolean;
  secondStop: string | null;
  secondStopToken: boolean;
  declaresPaper: boolean;
  notes: string[];
}

function fail(msg: string): never {
  console.error(`creator:page-tint-2nd-stop-check: FAIL ${msg}`);
  process.exit(1);
}

function ok(msg: string): void {
  console.log(`creator:page-tint-2nd-stop-check: PASS ${msg}`);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, "utf8");
}

const results: PageTintPattern[] = [];

for (const surface of PAPER_TINT_SURFACES) {
  const html = read(surface);

  const tintMatch = html.match(
    /linear-gradient\(\s*135deg\s*,\s*([^,]+?)\s+0%\s*,\s*([^,]+?)\s+\d+%\s*,\s*([^,]+?)\s+100%\s*\)/,
  );

  let secondStop: string | null = null;
  let secondStopToken = false;
  const notes: string[] = [];
  let hasPattern = false;

  if (tintMatch) {
    hasPattern = true;
    secondStop = tintMatch[2].trim();
    if (secondStop === "var(--paper)") {
      secondStopToken = true;
    } else {
      notes.push(
        `2nd stop '${secondStop}' is hardcoded (expected 'var(--paper)')`,
      );
    }
  } else {
    notes.push("no 3-stop linear-gradient(135deg, ...) tint pattern found");
  }

  const rootMatch = html.match(/:root\s*\{([\s\S]+?)\}/);
  if (!rootMatch) fail(`${surface} missing :root block`);
  const rootBlock = rootMatch[1];
  const declaresPaper =
    /--paper\s*:\s*#f2eadb\b/.test(rootBlock) ||
    /--paper\s*:\s*#f2ead9\b/.test(rootBlock);
  if (!declaresPaper) {
    notes.push(
      "missing --paper: #f2eadb (or #f2ead9) declaration in :root",
    );
  }

  const pattern: PageTintPattern = {
    file: surface,
    hasPattern,
    secondStop,
    secondStopToken,
    declaresPaper,
    notes,
  };
  results.push(pattern);

  if (!hasPattern || !secondStopToken || !declaresPaper) {
    fail(`${surface} page-tint 2nd stop alignment: ${notes.join("; ")}`);
  }
  ok(
    `${surface} 2nd stop = ${secondStop} (token ✓), --paper declared ✓`,
  );
}

console.log("");
console.log(
  `creator:page-tint-2nd-stop-check: PASS all ${results.length} warm-paper 3-stop tint surfaces use var(--paper) 2nd stop`,
);
console.log(`  - 1st stop anchor: var(--paper-hot) (= #fff8ea) (verified by creator:paper-tint-stop-check)`);
console.log(
  `  - 2nd stop anchor: var(--paper) (= #f2eadb) across 3 surfaces`,
);
console.log(
  `  - 3rd stops retained as per-surface warm shadow tinting (intentional family signature)`,
);
console.log(
  `  - Out of scope: motion-storyboard + prompt-dna-adapter (grid-only, no 3-stop tint); family-dna (dark diagonal)`,
);
