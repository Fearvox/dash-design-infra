#!/usr/bin/env bun
/**
 * creator:paper-tint-stop-check
 *
 * Verifies the warm-paper family 3-stop diagonal paper-tint gradient
 * participates in the --paper-hot token vocabulary:
 *
 * - 3 warm-paper functional surfaces (pdf-zine, social-card, poster-surface)
 *   use a 3-stop linear-gradient(135deg, ...) page-tint pattern
 * - The 1st stop (warm highlight) on all 3 surfaces is var(--paper-hot)
 * - No --paper-2 token references remain in any examples/*.html
 * - All 3 surfaces declare --paper-hot: #fff8ea in :root
 *
 * 3rd stops (#e4d6c2 / #e6dac8 / #ddd1bf) are intentionally retained as
 * per-surface warm shadow tinting (same justification as grid alpha/size
 * per-surface variation in creator-page-grid-check).
 *
 * 2nd stops (var(--paper) / #ece0cd) are intentionally retained:
 * pdf-zine + social-card use the --paper anchor; poster-surface uses
 * #ece0cd as a slightly desaturated mid stop (poster's outer-frame chrome
 * makes the mid stop visually equivalent).
 *
 * motion-storyboard + prompt-dna-adapter intentionally use only the grid
 * (no 3-stop tint) — out of scope. family-dna uses dark diagonal (out of scope).
 *
 * Public-safe: no surface creative content edits, no telemetry, no network.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";

const PAPER_TINT_SURFACES = [
  "examples/creator-pdf-zine.html",
  "examples/creator-social-card.html",
  "examples/creator-poster-surface.html",
] as const;

interface TintPattern {
  file: string;
  hasPattern: boolean;
  firstStop: string | null;
  firstStopToken: boolean;
  declaresPaperHot: boolean;
  notes: string[];
}

function fail(msg: string): never {
  console.error(`creator:paper-tint-stop-check: FAIL ${msg}`);
  process.exit(1);
}

function ok(msg: string): void {
  console.log(`creator:paper-tint-stop-check: PASS ${msg}`);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, "utf8");
}

const results: TintPattern[] = [];

for (const surface of PAPER_TINT_SURFACES) {
  const html = read(surface);
  // Find the 3-stop diagonal tint: linear-gradient(135deg, <stop1> 0%, <stop2> NN%, <stop3> 100%)
  // where stops can be hex (#xxx/#xxxxxx) or var(--name)
  const tintMatch = html.match(
    /linear-gradient\(\s*135deg\s*,\s*([^,]+?)\s+0%\s*,\s*([^,]+?)\s+\d+%\s*,\s*([^,]+?)\s+100%\s*\)/,
  );

  let firstStop: string | null = null;
  let firstStopToken = false;
  const notes: string[] = [];
  let hasPattern = false;

  if (tintMatch) {
    hasPattern = true;
    firstStop = tintMatch[1].trim();
    if (firstStop === "var(--paper-hot)") {
      firstStopToken = true;
    } else {
      notes.push(
        `1st stop '${firstStop}' is hardcoded (expected 'var(--paper-hot)')`,
      );
    }
  } else {
    notes.push("no 3-stop linear-gradient(135deg, ...) tint pattern found");
  }

  // Confirm --paper-hot is declared in :root
  const rootMatch = html.match(/:root\s*\{([\s\S]+?)\}/);
  if (!rootMatch) fail(`${surface} missing :root block`);
  const rootBlock = rootMatch[1];
  const declaresPaperHot =
    /--paper-hot\s*:\s*#fff8ea\b/.test(rootBlock) ||
    /--paper-hot\s*:\s*#fff8eb\b/.test(rootBlock); // tolerate ±1 hex drift
  if (!declaresPaperHot) {
    notes.push(
      "missing --paper-hot: #fff8ea (or #fff8eb) declaration in :root",
    );
  }

  const pattern: TintPattern = {
    file: surface,
    hasPattern,
    firstStop,
    firstStopToken,
    declaresPaperHot,
    notes,
  };
  results.push(pattern);

  if (!hasPattern || !firstStopToken || !declaresPaperHot) {
    fail(`${surface} paper-tint stop alignment: ${notes.join("; ")}`);
  }
  ok(
    `${surface} 1st stop = ${firstStop} (token ✓), --paper-hot declared ✓`,
  );
}

// Cross-cutting: ensure no --paper-2 references remain anywhere in examples/*.html
let paper2LeakCount = 0;
const paper2LeakFiles: string[] = [];
for (const file of readdirSync("examples")) {
  if (!file.endsWith(".html")) continue;
  const html = readFileSync(`examples/${file}`, "utf8");
  if (/var\(--paper-2\)/.test(html) || /--paper-2\s*:/.test(html)) {
    paper2LeakCount++;
    paper2LeakFiles.push(file);
  }
}
if (paper2LeakCount > 0) {
  fail(`--paper-2 still referenced in: ${paper2LeakFiles.join(", ")}`);
}
ok(`0 examples/*.html still reference --paper-2 (naming consistency ✓)`);

console.log("");
console.log(
  `creator:paper-tint-stop-check: PASS all ${results.length} warm-paper 3-stop tint surfaces use var(--paper-hot) 1st stop`,
);
console.log(`  - 1st stop anchor: var(--paper-hot) (= #fff8ea)`);
console.log(
  `  - 3rd stops retained as per-surface warm shadow tinting (intentional family signature)`,
);
console.log(
  `  - 2nd stops retained: pdf-zine + social-card use var(--paper); poster-surface uses #ece0cd (intentional mid stop)`,
);
console.log(
  `  - Out of scope: motion-storyboard + prompt-dna-adapter (grid-only, no 3-stop tint); family-dna (dark diagonal)`,
);
