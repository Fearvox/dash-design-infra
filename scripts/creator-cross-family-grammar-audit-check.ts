#!/usr/bin/env bun
/**
 * creator:cross-family-grammar-audit-check
 *
 * Verifies the cross-family grammar audit diagnostic artifact:
 * - File exists at examples/creator-cross-family-grammar-audit.html
 * - Has a `.page` element (fixed-canvas pattern)
 * - Has all 6 findings (F1-F6) by ID
 * - Has the 5-class classification legend
 * - Classifies 14 diverged tokens
 * - Closes the 5 stale ledger candidates
 * - measure:check fits the fixed 1684x1191 canvas
 *
 * Public-safe: no surface edits, no telemetry, no network. Diagnostic only.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ARTIFACT = "examples/creator-cross-family-grammar-audit.html";
const NEEDLES = [
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "warm-paper",
  "dark-industrial",
  "creative-hybrid",
  "mixed",
  "14 diverged tokens",
  "Converged",
  "Family signature",
  "Creative content",
  "Addressable drift",
  "Design call",
  "Closed by",
  "creator-surface-consistency-route",
  "1684",
  "creator-warm-paper-page-geometry-route",
  "creator-ink-family-doc-route",
  "creator-font-sans-sans-serif-complete-route",
  "creator-type-size-token-explore-route",
  "creator-line-color-explore-route",
];

function fail(msg: string): never {
  console.error(`creator:cross-family-grammar-audit-check: FAIL ${msg}`);
  process.exit(1);
}

if (!existsSync(ARTIFACT)) fail(`missing ${ARTIFACT}`);

const html = readFileSync(ARTIFACT, "utf8");
if (!html.includes('class="page"')) fail("missing .page canvas element");

// Required needles (case-insensitive)
const lower = html.toLowerCase();
const missing = NEEDLES.filter((n) => !lower.includes(n.toLowerCase()));
if (missing.length > 0) {
  fail(`missing required needles: ${missing.join(", ")}`);
}

// CSS must use var(--paper) / var(--ink) / etc. — token layer present
const requiredTokens = ["--paper:", "--ink:", "--accent:", "--line:", "--panel:", "--space-4:"];
const missingTokens = requiredTokens.filter((t) => !html.includes(t));
if (missingTokens.length > 0) {
  fail(`missing required :root tokens: ${missingTokens.join(", ")}`);
}

// Diagnostic must reference convergence file family count (4 families)
if (!html.includes("4 visual families") && !html.includes("4distinct") && !html.includes("4 distinct")) {
  fail("missing '4 visual families' classification");
}

// Run measure:check as the fixed-canvas gate
const proc = Bun.spawn(
  ["bun", "run", "measure:check", "--", ARTIFACT, "--canvas=1684x1191"],
  { stdout: "pipe", stderr: "pipe", cwd: process.cwd() },
);
const stdout = await new Response(proc.stdout).text();
const exitCode = await proc.exited;
if (exitCode !== 0) {
  console.error(stdout);
  fail(`measure:check failed (exit ${exitCode})`);
}

console.log("creator:cross-family-grammar-audit-check: PASS");
console.log(`  artifact: ${ARTIFACT}`);
console.log(`  findings: F1-F6 present`);
console.log(`  classification: 4 visual families + 5-class legend`);
console.log(`  stale-candidate closure: 5 candidates referenced`);
console.log(`  measure:check: 1684x1191 fixed canvas fits`);
process.exit(0);
