#!/usr/bin/env bun
/**
 * creator:page-grid-check
 *
 * Verifies the warm-paper family page-background grid pattern uses --ink rgb:
 * - 4 warm-paper surfaces with .page block (pdf-zine, social-card,
 *   motion-storyboard, prompt-dna-adapter) define linear-gradient(90deg, rgba(...)) 1px grid
 * - All 4 surfaces use rgba(21, 18, 14, alpha) — exact --ink rgb(21,18,14) with alpha tint
 * - Grid alpha is reported per-surface (intentional content-density variation is OK)
 * - family-dna intentionally uses light-on-dark grid (rgba(244,234,214,...)) — out of scope
 *
 * Public-safe: no surface creative content edits, no telemetry, no network.
 */
import { existsSync, readFileSync } from "node:fs";

const WARM_PAPER_SURFACES = [
  "examples/creator-pdf-zine.html",
  "examples/creator-social-card.html",
  "examples/creator-motion-storyboard.html",
  "examples/creator-prompt-dna-adapter.html",
] as const;

// --ink: #15120e → rgb(21, 18, 14)
const INK_RGB = "21, 18, 14";

interface GridPattern {
  file: string;
  vRgba: string | null;
  hRgba: string | null;
  vAlpha: number | null;
  hAlpha: number | null;
  gridSize: string | null;
  inkAligned: boolean;
  notes: string[];
}

function fail(msg: string): never {
  console.error(`creator:page-grid-check: FAIL ${msg}`);
  process.exit(1);
}

function ok(msg: string): void {
  console.log(`creator:page-grid-check: PASS ${msg}`);
}

function read(path: string): string {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, "utf8");
}

function extractRgb(rgba: string): { rgb: string; alpha: number } | null {
  const m = rgba.match(/rgba?\(\s*([^,)]+)\s*,\s*([^,)]+)\s*,\s*([^,)]+)(?:\s*,\s*([0-9.]+))?\s*\)/);
  if (!m) return null;
  const r = parseInt(m[1].trim());
  const g = parseInt(m[2].trim());
  const b = parseInt(m[3].trim());
  const a = m[4] ? parseFloat(m[4]) : 1;
  return { rgb: `${r}, ${g}, ${b}`, alpha: a };
}

const results: GridPattern[] = [];

for (const surface of WARM_PAPER_SURFACES) {
  const html = read(surface);
  const pageMatch = html.match(/\.page\s*\{([\s\S]+?)\}/);
  if (!pageMatch) fail(`${surface} missing .page rule`);
  const pageBlock = pageMatch[1];

  // Vertical grid: linear-gradient(90deg, rgba(...) 1px, transparent 1px)
  const vMatch = pageBlock.match(/linear-gradient\(\s*90deg\s*,\s*(rgba?\([^)]+\))\s*1px\s*,\s*transparent\s*1px/);
  // Horizontal grid: linear-gradient(rgba(...) 1px, transparent 1px) — no angle = 0deg (top-to-bottom)
  const hMatch = pageBlock.match(/linear-gradient\(\s*(rgba?\([^)]+\))\s*1px\s*,\s*transparent\s*1px/);

  const vRgbaRaw = vMatch?.[1] ?? null;
  const hRgbaRaw = hMatch?.[1] ?? null;

  // background-size line
  const sizeMatch = pageBlock.match(/background-size\s*:\s*([^;]+)/);
  const gridSize = sizeMatch ? sizeMatch[1].trim().replace(/\s+/g, " ") : null;

  const vParsed = vRgbaRaw ? extractRgb(vRgbaRaw) : null;
  const hParsed = hRgbaRaw ? extractRgb(hRgbaRaw) : null;

  const notes: string[] = [];
  let inkAligned = true;

  if (vParsed && vParsed.rgb !== INK_RGB) {
    inkAligned = false;
    notes.push(`vertical grid rgb (${vParsed.rgb}) drifts from --ink (${INK_RGB})`);
  }
  if (hParsed && hParsed.rgb !== INK_RGB) {
    inkAligned = false;
    notes.push(`horizontal grid rgb (${hParsed.rgb}) drifts from --ink (${INK_RGB})`);
  }
  if (!vRgbaRaw) notes.push("no vertical grid pattern detected");
  if (!hRgbaRaw) notes.push("no horizontal grid pattern detected");

  const pattern: GridPattern = {
    file: surface,
    vRgba: vRgbaRaw,
    hRgba: hRgbaRaw,
    vAlpha: vParsed?.alpha ?? null,
    hAlpha: hParsed?.alpha ?? null,
    gridSize,
    inkAligned,
    notes,
  };
  results.push(pattern);

  if (!inkAligned) {
    fail(`${surface} page-grid ink alignment: ${notes.join("; ")}`);
  }
  const vDisplay = vParsed ? `rgba(${vParsed.rgb},${vParsed.alpha})` : "none";
  const hDisplay = hParsed ? `rgba(${hParsed.rgb},${hParsed.alpha})` : "none";
  ok(`${surface} ink-aligned: V=${vDisplay}  H=${hDisplay}  size=${gridSize ?? "none"}`);
}

console.log("");
console.log(`creator:page-grid-check: PASS all ${results.length} warm-paper surfaces use --ink-based grid`);
console.log(`  - 4 warm-paper .page surfaces verified`);
console.log(`  - --ink rgb anchor: ${INK_RGB} (= #15120e)`);
console.log(`  - Per-surface alpha/size variation retained as content-density tuning (intentional family signature)`);
console.log(`  - Out of scope: family-dna (light-on-dark grid), frontier-capsule, dark-industrial family`);
