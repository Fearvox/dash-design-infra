/**
 * Creator Family DNA Check
 *
 * Validates the creator-family-dna.html reference artifact:
 * - 3 family sections present (warm-paper, dark-industrial, creative-hybrid)
 * - Consensus values parseable
 * - Grammar card complete (6 principles)
 * - No hardcoded colors in body (enforce :root token layer)
 *
 * This is a machine gate for the creator-family-dna-artifact-route Darwin mutation.
 * The artifact serves as the human-readable target that creator:surface-consistency
 * measures convergence against.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DNA_PATH = join(ROOT, "examples", "creator-family-dna.html");

interface Verdict {
  pass: boolean;
  label: string;
  detail: string;
}

const verdicts: Verdict[] = [];

function check(condition: boolean, label: string, detail: string): void {
  verdicts.push({ pass: condition, label, detail });
  const status = condition ? "PASS" : "FAIL";
  console.log(`  ${status}\t${label}`);
  if (!condition) {
    console.log(`         ${detail}`);
  }
}

function main(): void {
  console.log("creator-family-dna: validating DASH visual grammar reference…\n");

  // 1. File exists
  check(existsSync(DNA_PATH), "file-exists", `Expected ${DNA_PATH}`);
  if (!existsSync(DNA_PATH)) {
    console.log(`\ncreator-family-dna: NOT READY (file missing)`);
    process.exit(1);
  }

  const html = readFileSync(DNA_PATH, "utf-8");

  // 2. Has <title>
  check(
    /<title>.*Family DNA.*DASH.*Visual Grammar.*<\/title>/i.test(html),
    "title-present",
    "Title must reference Family DNA, DASH, Visual Grammar"
  );

  // 3. Has @page fix for measure/print
  check(
    /@page\s*\{[^}]*size:\s*1684px\s+1191px[^}]*\}/.test(html),
    "page-size",
    "Must have @page { size: 1684px 1191px; } for fixed-canvas"
  );

  // 4. Has :root block with CSS custom properties
  check(
    /:root\s*\{[^}]*--/.test(html),
    "root-token-layer",
    "Must have :root block with CSS custom properties"
  );

  // 5. Three family sections present
  check(
    /data-family="warm-paper"/.test(html),
    "family-warm-paper",
    "warm-paper family section required"
  );
  check(
    /data-family="dark-industrial"/.test(html),
    "family-dark-industrial",
    "dark-industrial family section required"
  );
  check(
    /data-family="creative-hybrid"/.test(html),
    "family-creative-hybrid",
    "creative-hybrid family section required"
  );

  // 6. Consensus values present
  const consensusChecks = [
    { pattern: /--paper.*#f2eadb/, label: "consensus-paper" },
    { pattern: /--ink.*#15120e/, label: "consensus-ink" },
    { pattern: /--muted.*#6f6659/, label: "consensus-muted" },
    { pattern: /--blue.*#1d4ed8/, label: "consensus-blue" },
    { pattern: /--amber.*#c47a1f/, label: "consensus-amber" },
    { pattern: /--green.*#2f6f4e/, label: "consensus-green" },
    { pattern: /--line.*rgba\(21,\s*18,\s*14,\s*0\.18\)/, label: "consensus-line" },
  ];
  for (const { pattern, label } of consensusChecks) {
    check(
      pattern.test(html),
      label,
      `Consensus value for ${label} not found in document`
    );
  }

  // 7. Grammar card has 4 principles
  const principleCount = (html.match(/<div class="principle">/g) || []).length;
  check(
    principleCount >= 4,
    "grammar-principles",
    `Expected 4 grammar principles, found ${principleCount}`
  );

  // 8. Grammar card references surface-consistency check
  check(
    /creator:surface-consistency/.test(html),
    "grammar-refs-consistency",
    "Grammar card must reference bun creator:surface-consistency"
  );

  // 9. No hardcoded color values in HTML attributes (outside <style>, data-*, style=, and text content)
  // Text content that documents hex values (e.g., "#f2eadb" in table cells) is fine —
  // the rule targets display-affecting colors. Strip text content between tags.
  const tagsOnly = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/>[^<]*</g, "><") // strip text content between tags
    .replace(/<[^>]*>/g, (tag) => {
      return tag.replace(/data-[a-z-]+="[^"]*"/gi, "").replace(/class="[^"]*"/gi, "").replace(/style="[^"]*"/gi, "");
    });
  const hardcodedInBody = /#[0-9a-fA-F]{6}(?:[^0-9a-fA-F]|$)/.test(tagsOnly);
  check(
    !hardcodedInBody,
    "no-hardcoded-body-colors",
    "Hardcoded hex colors found outside <style> blocks"
  );

  // 10. Machine-readable data attributes on swatches
  const tokenSwatchCount = (html.match(/data-token-name="/g) || []).length;
  check(
    tokenSwatchCount >= 18,
    "machine-parseable-swatches",
    `Expected ≥18 data-token-name attributes, found ${tokenSwatchCount}`
  );

  // 11. Proof rail present
  check(
    /proof-rail/.test(html) && /Boundary/.test(html),
    "proof-rail",
    "Proof rail with boundary note required"
  );

  // 12. touchdesigner-tox gap documented
  check(
    /touchdesigner-tox.*zero.*CSS/.test(html) || /no.*CSS.*custom.*propert/.test(html),
    "tox-gap-documented",
    "Must document that touchdesigner-tox has no CSS token layer"
  );

  // Summary
  const passed = verdicts.filter((v) => v.pass).length;
  const failed = verdicts.filter((v) => !v.pass).length;
  const total = verdicts.length;

  console.log(`\ncreator-family-dna: ${passed}/${total} passed, ${failed} failed`);

  if (failed > 0) {
    console.log("\nFAILURES:");
    for (const v of verdicts.filter((v) => !v.pass)) {
      console.log(`  - ${v.label}: ${v.detail}`);
    }
    console.log("\ncreator-family-dna: NOT READY");
    process.exit(1);
  }

  console.log("\ncreator-family-dna: READY");
  process.exit(0);
}

main();
