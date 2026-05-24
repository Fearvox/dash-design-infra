#!/usr/bin/env bun
/* build.ts — EverMind × Beta Fund Workshop deck build entrypoint.
 *
 *   bun run apps/evermind-workshop/build
 *
 * The deck is a single self-contained HTML file at src/index.html with all CSS + JS inlined.
 * Build = read src/index.html → light validation → write dist/index.html.
 * Validation:
 *   - <html> + </html> balanced
 *   - 16 <section class="slide"> (or .slide) blocks present
 *   - required brand tokens present (Atkinson, Cormorant, Fragment Mono)
 *   - no Plus Jakarta / JetBrains Mono residue
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

const APP_ROOT = path.dirname(path.dirname(import.meta.url.replace("file://", "")));
const SRC = path.join(APP_ROOT, "src", "index.html");
const DIST = path.join(APP_ROOT, "dist", "index.html");

async function read(p: string): Promise<string> {
  return await fs.readFile(p, "utf8");
}

async function writeAtomic(p: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, "utf8");
}

function validate(html: string): void {
  const checks: { label: string; pass: boolean; detail?: string }[] = [];

  // Structural
  checks.push({ label: "<html> present", pass: /<html\b/i.test(html) });
  checks.push({ label: "</html> present", pass: /<\/html>/i.test(html) });
  checks.push({ label: "<title> present", pass: /<title>/i.test(html) });

  // Slide count — count data-slide="N" attributes (unique to slide sections)
  const slideMatches = html.match(/data-slide="\d+"/gi) ?? [];
  checks.push({
    label: "slide count == 16",
    pass: slideMatches.length === 16,
    detail: `found ${slideMatches.length}`,
  });

  // Brand tokens
  checks.push({ label: "Atkinson Hyperlegible referenced", pass: /Atkinson Hyperlegible/i.test(html) });
  checks.push({ label: "Cormorant Garamond referenced", pass: /Cormorant Garamond/i.test(html) });
  checks.push({ label: "Fragment Mono referenced", pass: /Fragment Mono/i.test(html) });
  checks.push({ label: "EverMind gold #e39b00 present", pass: /#e39b00/i.test(html) });
  checks.push({ label: "EverMind cream #f2f1e9 present", pass: /#f2f1e9/i.test(html) });

  // Anti-residue
  checks.push({ label: "no Plus Jakarta residue", pass: !/Plus Jakarta/i.test(html) });
  checks.push({ label: "no JetBrains Mono residue", pass: !/JetBrains Mono/i.test(html) });

  const failed = checks.filter((c) => !c.pass);
  if (failed.length > 0) {
    console.error("✗ build validation failed:");
    for (const c of failed) console.error(`  - ${c.label}${c.detail ? " (" + c.detail + ")" : ""}`);
    process.exit(1);
  }

  for (const c of checks) console.log(`  ✓ ${c.label}${c.detail ? " (" + c.detail + ")" : ""}`);
}

async function main(): Promise<void> {
  const html = await read(SRC);
  validate(html);
  await writeAtomic(DIST, html);
  const stat = await fs.stat(DIST);
  console.log(`✓ build complete → ${path.relative(process.cwd(), DIST)} (${(stat.size / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
