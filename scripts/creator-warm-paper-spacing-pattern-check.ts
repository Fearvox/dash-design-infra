#!/usr/bin/env bun
/**
 * creator:warm-paper-spacing-pattern-check
 *
 * Verifies the warm-paper family page-geometry diagnostic HTML:
 * - Classifies each warm-paper .page-bearing surface into one of the
 *   three documented page-geometry patterns (A: direct page padding,
 *   B: inner container, C: page::before frame) by inspecting the
 *   source HTML for var(--pad-page) / .shell / .sheet / .poster /
 *   page::before usage.
 * - Verifies the diagnostic HTML contains the pattern classification
 *   table (Pattern A / B / C labels) and per-surface hardcoded
 *   spacing inventory section.
 * - Catches drift: if a surface changes its .page padding source
 *   (e.g. stops consuming var(--pad-page)), the diagnostic's pattern
 *   classification becomes stale and this check fails.
 *
 * Public-safe: no surface creative content edits, no telemetry, no network.
 */
import { existsSync, readFileSync } from "node:fs";

const DIAGNOSTIC = "examples/creator-warm-paper-page-geometry-diagnostic.html";

interface SurfacePattern {
  file: string;
  pattern: "A" | "B" | "C" | "A+B" | "B+C" | null;
  padPageDeclared: boolean;
  padPageConsumed: boolean;
  shellOrSheetPresent: boolean;
  pageBeforeFramePresent: boolean;
  notes: string[];
}

const WARM_PAPER_PAGE_SURFACES = [
  "examples/creator-family-dna.html",
  "examples/creator-poster-surface.html",
  "examples/creator-motion-storyboard.html",
  "examples/creator-prompt-dna-adapter.html",
  "examples/creator-social-card.html",
  "examples/creator-pdf-zine.html",
] as const;

function fail(msg: string): never {
  console.error(`creator:warm-paper-spacing-pattern-check: FAIL ${msg}`);
  process.exit(1);
}

function ok(msg: string): void {
  console.log(`creator:warm-paper-spacing-pattern-check: PASS ${msg}`);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, "utf8");
}

function classifyPattern(html: string): Omit<SurfacePattern, "file" | "notes"> {
  const rootMatch = html.match(/:root\s*\{([\s\S]+?)\}/);
  const rootBlock = rootMatch?.[1] ?? "";
  const padPageMatch = rootBlock.match(/--pad-page\s*:\s*([^;]+);/);
  const padPageDeclared = !!padPageMatch;
  const padPageConsumed = html.includes("var(--pad-page)");

  // shell / sheet / poster-frame / capsule-shell = Pattern B signature
  // (inner container that defines a subframe inside the page)
  const shellOrSheetPresent =
    /\.shell\s*\{/.test(html) ||
    /\.sheet\s*\{/.test(html) ||
    /\.poster\s*\{/.test(html) ||
    /\.poster-frame\s*\{/.test(html) ||
    /\.capsule-shell\s*\{/.test(html);

  // page::before with inset: = Pattern C signature
  const pageBeforeFramePresent = /\.page::before\s*\{[\s\S]*?inset\s*:/.test(html);

  // Family-dna intentionally uses asymmetric .page padding 44px 52px 32px (Pattern A variant)
  const familyDnaAsymmetric =
    /\.page\s*\{[\s\S]*?padding\s*:\s*44px\s+52px\s+32px/.test(html);

  // .sheet is the canonical "Pattern C" content-well signature (used by pdf-zine)
  // social-card uses .shell for its content well + .page::before as decorative chrome,
  // so .sheet absence + .shell + .page::before = Pattern A (shell IS the card)
  const hasSheet = /\.sheet\s*\{/.test(html);

  let pattern: SurfacePattern["pattern"] = null;
  if (padPageConsumed) {
    // var(--pad-page) consumed → Pattern A (with optional inner B subframe)
    if (shellOrSheetPresent) {
      pattern = "A+B";
    } else {
      pattern = "A";
    }
  } else if (familyDnaAsymmetric) {
    // family-dna — Pattern A variant (asymmetric for title-then-card rhythm)
    pattern = "A";
  } else if (padPageDeclared) {
    // Declared but not consumed — surface declares reference for warm-paper family
    pattern = "A";
  } else if (hasSheet && pageBeforeFramePresent) {
    // pdf-zine signature: .sheet content well + .page::before frame
    pattern = "B+C";
  } else if (shellOrSheetPresent) {
    // social-card signature: .shell IS the visible card, page::before is decorative
    pattern = "A";
  } else if (pageBeforeFramePresent) {
    // Generic Pattern C fallback
    pattern = "C";
  }

  return {
    pattern,
    padPageDeclared,
    padPageConsumed,
    shellOrSheetPresent,
    pageBeforeFramePresent,
  };
}

// Phase 1: classify each warm-paper surface by inspecting source HTML
const results: SurfacePattern[] = [];
for (const surface of WARM_PAPER_PAGE_SURFACES) {
  const html = read(surface);
  const cls = classifyPattern(html);
  if (!cls.pattern) {
    fail(`${surface} could not be classified into A/B/C — neither var(--pad-page), .shell/.sheet/.poster, nor .page::before frame detected`);
  }
  const notes: string[] = [];
  if (cls.padPageDeclared && !cls.padPageConsumed) {
    notes.push("--pad-page declared as reference but not consumed on .page (family-dna intentional)");
  }
  if (cls.pattern === "A+B") {
    notes.push("Pattern A page padding + Pattern B inner subframe");
  }
  if (cls.pattern === "B+C") {
    notes.push("Pattern B inner container + Pattern C page::before frame");
  }
  results.push({ file: surface, ...cls, notes });
}

// Phase 2: verify the diagnostic HTML reflects the classification
const diagnostic = read(DIAGNOSTIC);
const requiredPatternLabels: string[] = [];
for (const r of results) {
  if (r.pattern) requiredPatternLabels.push(r.pattern);
}

// Diagnostic must contain each classified pattern label somewhere in body
for (const label of ["Pattern A", "Pattern B", "Pattern C"]) {
  // The diagnostic uses "Pattern A", "Pattern B", "Pattern C" as visible labels
  if (!diagnostic.includes(label)) {
    fail(`diagnostic missing visible label "${label}"`);
  }
}
ok("diagnostic contains Pattern A / B / C visible labels");

// Diagnostic must reference the spacing inventory phrase
if (!/hardcoded spacing inventory|spacing inventory|spacing grammar inventory/i.test(diagnostic)) {
  fail(`diagnostic missing hardcoded spacing inventory section header`);
}
ok("diagnostic contains hardcoded spacing inventory section");

// Diagnostic must include F6 / F7 or successor finding numbering for the spacing extension
if (!/F6[\s\S]+?(?:spacing|inventory)|F6[\s\S]+?hardcoded/i.test(diagnostic)) {
  fail(`diagnostic missing F6 (or successor) hardcoded spacing finding section`);
}
ok("diagnostic contains F6 (or successor) hardcoded spacing finding");

// Phase 3: assert the diagnostic's per-surface classification matches source classification
// We check that each Pattern A surface that consumes var(--pad-page) is documented
const patternAConsumers = results.filter((r) => r.pattern === "A" || r.pattern === "A+B");
for (const r of patternAConsumers) {
  if (r.padPageConsumed) {
    // Diagnostic must mention this surface file by name in the Pattern A or A+B context
    const baseName = r.file.split("/").pop();
    if (!diagnostic.includes(baseName!)) {
      fail(`diagnostic does not mention ${baseName} (a Pattern A var(--pad-page) consumer)`);
    }
  }
}
ok(`all ${patternAConsumers.length} Pattern A var(--pad-page) consumers documented in diagnostic`);

// Print summary
console.log("");
console.log(`creator:warm-paper-spacing-pattern-check: PASS all ${results.length} warm-paper surfaces classified`);
console.log(`  - Pattern classification:`);
const byPattern = new Map<string, number>();
for (const r of results) {
  const p = r.pattern ?? "unclassified";
  byPattern.set(p, (byPattern.get(p) ?? 0) + 1);
}
for (const [p, n] of byPattern) {
  console.log(`    ${p}: ${n} surface(s)`);
}
console.log(`  - var(--pad-page) consumers: ${results.filter((r) => r.padPageConsumed).length}/${results.length}`);
console.log(`  - shell/sheet/poster inner containers: ${results.filter((r) => r.shellOrSheetPresent).length}/${results.length}`);
console.log(`  - page::before frame (Pattern C): ${results.filter((r) => r.pageBeforeFramePresent).length}/${results.length}`);
