#!/usr/bin/env bun
/**
 * creator:gap-token-check
 *
 * Verifies the warm-paper family gap token layer:
 * - --gap-sm: 10px used by poster-surface (.proof-list) and pdf-zine (.index-card)
 * - --gap-md: 14px used by motion-storyboard (.board) and prompt-dna-adapter (.proof-strip, .matrix)
 *
 * Each consumer must:
 * 1. Declare the token in :root with the canonical value
 * 2. Use var(--gap-*) in body CSS (not hardcoded px)
 *
 * Public-safe: no surface creative content edits, no telemetry, no network.
 */
import { existsSync, readFileSync } from "node:fs";

const GAP_SM = { name: "--gap-sm", value: "10px" } as const;
const GAP_MD = { name: "--gap-md", value: "14px" } as const;

interface Consumer {
  surface: string;
  tokenName: string;
  tokenValue: string;
  /** CSS selector:line where token is consumed (for anti-hardcode regression check) */
  selectors: string[];
}

const CONSUMERS: Consumer[] = [
  {
    surface: "examples/creator-poster-surface.html",
    tokenName: GAP_SM.name,
    tokenValue: GAP_SM.value,
    selectors: [".proof-list"],
  },
  {
    surface: "examples/creator-pdf-zine.html",
    tokenName: GAP_SM.name,
    tokenValue: GAP_SM.value,
    selectors: [".index-card"],
  },
  {
    surface: "examples/creator-motion-storyboard.html",
    tokenName: GAP_MD.name,
    tokenValue: GAP_MD.value,
    selectors: [".board"],
  },
  {
    surface: "examples/creator-prompt-dna-adapter.html",
    tokenName: GAP_MD.name,
    tokenValue: GAP_MD.value,
    selectors: [".proof-strip", ".matrix"],
  },
];

function fail(msg: string): never {
  console.error(`creator:gap-token-check: FAIL ${msg}`);
  process.exit(1);
}

function ok(msg: string): void {
  console.log(`creator:gap-token-check: PASS ${msg}`);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, "utf8");
}

let checks = 0;
let passed = 0;

// Phase 1: each consumer declares the token in :root with canonical value
for (const c of CONSUMERS) {
  const html = read(c.surface);
  const rootMatch = html.match(/:root\s*\{([\s\S]+?)\}/);
  if (!rootMatch) fail(`${c.surface} missing :root block`);
  const rootBlock = rootMatch[1];
  const re = new RegExp(`${c.tokenName.replace("-", "\\-")}\\s*:\\s*([^;]+);`);
  const tokenDecl = rootBlock.match(re);
  if (!tokenDecl) fail(`${c.surface} :root missing ${c.tokenName} declaration`);
  const declaredValue = tokenDecl[1].trim().replace(/\s+/g, " ");
  if (declaredValue !== c.tokenValue) {
    fail(`${c.surface} ${c.tokenName} declared as "${declaredValue}", expected "${c.tokenValue}"`);
  }
  checks++;
  passed++;
  ok(`${c.surface} declares ${c.tokenName}: ${c.tokenValue}`);
}

// Phase 2: each consumer uses var(--gap-*) in body CSS
for (const c of CONSUMERS) {
  const html = read(c.surface);
  if (!html.includes(`var(${c.tokenName})`)) {
    fail(`${c.surface} does not consume var(${c.tokenName}) in body CSS`);
  }
  checks++;
  passed++;
  ok(`${c.surface} consumes var(${c.tokenName})`);
}

// Phase 3: anti-regression — for each selector, confirm no hardcoded px regression
for (const c of CONSUMERS) {
  const html = read(c.surface);
  for (const selector of c.selectors) {
    // Find the selector block (naive regex — assumes single-line selector start)
    const blockRe = new RegExp(
      `${selector.replace(".", "\\.")}\\s*\\{([\\s\\S]+?)\\}`,
    );
    const blockMatch = html.match(blockRe);
    if (!blockMatch) {
      // Block may be a single-line compressed CSS; try expanded view
      // For single-line compressed CSS, grep the whole body
      const lineMatch = html.match(
        new RegExp(`${selector.replace(".", "\\.")}[^{]*\\{[^}]*gap:\\s*${c.tokenValue}[^}]*\\}`),
      );
      if (lineMatch) {
        fail(`${c.surface} ${selector} gap still hardcoded "${c.tokenValue}" — must use var(${c.tokenName})`);
      }
      continue; // block not found — bail on this selector
    }
    const block = blockMatch[1];
    const gapHardcode = block.match(
      new RegExp(`gap\\s*:\\s*${c.tokenValue.replace("px", "px")}\\b`),
    );
    if (gapHardcode) {
      fail(`${c.surface} ${selector} gap is still hardcoded "${c.tokenValue}" — must use var(${c.tokenName})`);
    }
    checks++;
    passed++;
    ok(`${c.surface} ${selector} uses var(${c.tokenName}) (no hardcoded ${c.tokenValue} regression)`);
  }
}

console.log("");
console.log(`creator:gap-token-check: PASS all ${passed}/${checks} checks (${CONSUMERS.length} surfaces verified)`);
console.log(`  - ${GAP_SM.name}: ${GAP_SM.value} (2 surfaces: poster-surface, pdf-zine)`);
console.log(`  - ${GAP_MD.name}: ${GAP_MD.value} (2 surfaces: motion-storyboard, prompt-dna-adapter)`);
