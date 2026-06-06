#!/usr/bin/env bun
/**
 * creator:pad-page-token-check
 *
 * Verifies the warm-paper family --pad-page token layer:
 * - 3 Pattern A surfaces (motion-storyboard, poster-surface, prompt-dna-adapter)
 *   define --pad-page: 56px in :root
 * - All 3 surfaces use var(--pad-page) on the .page padding
 * - family-dna declares --pad-page: 56px as the warm-paper visual reference
 *   (does not need to consume var(--pad-page) on .page — family-dna intentionally
 *    uses asymmetric 44×52×32 for title-then-card rhythm per page-geometry diagnostic)
 *
 * Public-safe: no surface creative content edits, no telemetry, no network.
 */
import { existsSync, readFileSync } from "node:fs";

const TOKEN_NAME = "--pad-page";
const TOKEN_VALUE = "56px";
const CONSUMING_SURFACES = [
  "examples/creator-motion-storyboard.html",
  "examples/creator-poster-surface.html",
  "examples/creator-prompt-dna-adapter.html",
] as const;
const REFERENCE_SURFACES = [
  "examples/creator-family-dna.html",
] as const;

function fail(msg: string): never {
  console.error(`creator:pad-page-token-check: FAIL ${msg}`);
  process.exit(1);
}

function ok(msg: string): void {
  console.log(`creator:pad-page-token-check: PASS ${msg}`);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, "utf8");
}

// Phase 1: validate consuming surfaces declare the token in :root
for (const surface of CONSUMING_SURFACES) {
  const html = read(surface);
  const rootMatch = html.match(/:root\s*\{([\s\S]+?)\}/);
  if (!rootMatch) fail(`${surface} missing :root block`);
  const rootBlock = rootMatch[1];
  // Token must be declared with the value 56px
  const tokenDecl = rootBlock.match(/--pad-page\s*:\s*([^;]+);/);
  if (!tokenDecl) fail(`${surface} :root missing ${TOKEN_NAME} declaration`);
  const declaredValue = tokenDecl[1].trim().replace(/\s+/g, " ");
  if (declaredValue !== TOKEN_VALUE) {
    fail(`${surface} ${TOKEN_NAME} declared as "${declaredValue}", expected "${TOKEN_VALUE}"`);
  }
  // Surface must use var(--pad-page) in body CSS (search for the var() reference)
  if (!html.includes("var(--pad-page)")) {
    fail(`${surface} does not consume var(--pad-page) in body CSS`);
  }
  ok(`${surface} declares ${TOKEN_NAME}: ${TOKEN_VALUE} and consumes var(${TOKEN_NAME})`);
}

// Phase 2: validate reference surfaces declare the token (may or may not consume)
for (const surface of REFERENCE_SURFACES) {
  const html = read(surface);
  const rootMatch = html.match(/:root\s*\{([\s\S]+?)\}/);
  if (!rootMatch) fail(`${surface} missing :root block`);
  const rootBlock = rootMatch[1];
  const tokenDecl = rootMatch[1].match(/--pad-page\s*:\s*([^;]+);/);
  if (!tokenDecl) fail(`${surface} :root missing ${TOKEN_NAME} reference declaration`);
  const declaredValue = tokenDecl[1].trim().replace(/\s+/g, " ");
  if (declaredValue !== TOKEN_VALUE) {
    fail(`${surface} ${TOKEN_NAME} declared as "${declaredValue}", expected "${TOKEN_VALUE}"`);
  }
  ok(`${surface} declares ${TOKEN_NAME}: ${TOKEN_VALUE} as warm-paper reference (consumption optional)`);
}

// Phase 3: anti-drift — assert no consuming surface re-introduces hardcoded 56px on .page
for (const surface of CONSUMING_SURFACES) {
  const html = read(surface);
  // Find the .page rule and check its padding is var(--pad-page) (not 56px)
  const pageMatch = html.match(/\.page\s*\{([\s\S]+?)\}/);
  if (!pageMatch) fail(`${surface} missing .page rule`);
  const pageBlock = pageMatch[1];
  const paddingDecl = pageBlock.match(/padding\s*:\s*([^;]+);/);
  if (!paddingDecl) fail(`${surface} .page missing padding declaration`);
  const paddingValue = paddingDecl[1].trim().replace(/\s+/g, " ");
  if (paddingValue === "56px") {
    fail(`${surface} .page padding is still hardcoded "56px" — must use var(--pad-page)`);
  }
  if (paddingValue !== "var(--pad-page)") {
    fail(`${surface} .page padding is "${paddingValue}" — expected var(--pad-page)`);
  }
  ok(`${surface} .page padding uses var(--pad-page) (no hardcoded 56px regression)`);
}

console.log("");
console.log(`creator:pad-page-token-check: PASS all ${CONSUMING_SURFACES.length + REFERENCE_SURFACES.length} surfaces verified`);
console.log(`  - ${CONSUMING_SURFACES.length} Pattern A consumers (motion-storyboard, poster-surface, prompt-dna-adapter)`);
console.log(`  - ${REFERENCE_SURFACES.length} warm-paper reference (family-dna)`);
console.log(`  - Token: ${TOKEN_NAME} = ${TOKEN_VALUE} (Pattern A page padding anchor)`);
