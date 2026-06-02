/**
 * Creator Surface Consistency Check
 * 
 * Visual grammar audit across all 11 creator surfaces.
 * Extracts CSS custom properties from `:root` blocks,
 * identifies visual families, and reports:
 * - Which surfaces share/divert tokens
 * - Naming inconsistencies (same concept, different name)  
 * - Missing token layers (hardcoded values)
 * - Drift within visual families
 *
 * This is an informational audit, not a pass/fail gate.
 * Exit 0: report generated
 * Exit 1: critical gap (surface has no CSS layer at all)
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const EXAMPLES_DIR = join(new URL(".", import.meta.url).pathname, "..", "examples");
const CREATOR_GLOB = /^creator-.+\.html$/;

interface SurfaceTokens {
  file: string;
  tokens: Record<string, string>;
}

interface TokenDrift {
  token: string;
  values: { file: string; value: string }[];
}

// --- Parse ---

function parseRootBlock(html: string): Record<string, string> {
  const match = html.match(/:root\s*\{([^}]+)\}/s);
  if (!match) return {};

  const block = match[1];
  const tokens: Record<string, string> = {};

  // Split on ; but handle rgba() with semicolons contextually
  // Simpler: split on ";--" then restore prefix
  const parts = block.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Extract --name: value
    const propMatch = trimmed.match(/(--[a-z][a-z0-9-]*)\s*:\s*(.+?)\s*$/);
    if (propMatch) {
      tokens[propMatch[1]] = propMatch[2];
    }
  }

  return tokens;
}

function extractHardcodedColors(html: string): string[] {
  // Extract hex colors, rgb/rgba from style block that aren't inside var()
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) return [];

  const css = styleMatch[1];
  const colors: string[] = [];

  // Hex colors
  const hexMatches = css.matchAll(/#[0-9a-fA-F]{6}\b/g);
  for (const m of hexMatches) colors.push(m[0]);

  return [...new Set(colors)];
}

function extractHardcodedSpacing(html: string): { gap: number[]; padding: number[]; margin: number[] } {
  // Extract hardcoded px values for gap, padding, margin (not inside var())
  // Matches: gap: 22px; | padding: 16px; | margin: 8px; etc.
  // Excludes: var(--token) references, calc(), line-height
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) return { gap: [], padding: [], margin: [] };

  const css = styleMatch[1];

  // Extract gap values (not inside var())
  const gapMatches: number[] = [];
  const gapRegex = /gap:\s*(\d+)px/g;
  let m;
  while ((m = gapRegex.exec(css)) !== null) {
    gapMatches.push(parseInt(m[1]));
  }

  // Extract padding values
  const padMatches: number[] = [];
  const padRegex = /padding:\s*(\d+)px(?![\w-])/g;
  while ((m = padRegex.exec(css)) !== null) {
    padMatches.push(parseInt(m[1]));
  }

  // Extract margin values (only non-negative, exclude auto)
  const marginMatches: number[] = [];
  const marginRegex = /margin:\s*(\d+)px(?![\w-])/g;
  while ((m = marginRegex.exec(css)) !== null) {
    marginMatches.push(parseInt(m[1]));
  }

  return {
    gap: [...new Set(gapMatches)].sort((a, b) => a - b),
    padding: [...new Set(padMatches)].sort((a, b) => a - b),
    margin: [...new Set(marginMatches)].sort((a, b) => a - b),
  };
}

// --- Visual Family Classification ---

type Family = "warm-paper" | "dark-industrial" | "creative-hybrid" | "unknown";

function classify(tokens: Record<string, string>): Family {
  const hasPaper = !!tokens["--paper"];
  const hasBg = !!tokens["--bg"];
  const hasNight = !!tokens["--night"];

  const bg = tokens["--bg"] || tokens["--night"] || "";
  const paper = tokens["--paper"] || "";

  // Dark industrial: has --bg and it's dark, OR has --night
  if (hasNight) return "creative-hybrid";
  if (hasBg && bg.startsWith("#0") || bg.startsWith("#111")) return "dark-industrial";

  // Warm paper: has --paper in the cream/beige range
  if (hasPaper && paper.match(/#[ef][0-9a-f]{5}/)) return "warm-paper";

  // Creative hybrid: has --paper but with creative accent palette
  if (hasPaper && tokens["--cobalt"]) return "creative-hybrid";

  return "unknown";
}

// --- Main ---

console.log("creator-surface-consistency: visual grammar audit across creator surfaces…\n");

const files = readdirSync(EXAMPLES_DIR)
  .filter((f) => CREATOR_GLOB.test(f))
  .sort();

const surfaces: SurfaceTokens[] = [];
const noTokenLayer: string[] = [];
const hardcodedColors: { file: string; colors: string[] }[] = [];
const hardcodedSpacing: { file: string; gap: number[]; padding: number[]; margin: number[] }[] = [];

for (const file of files) {
  const html = readFileSync(join(EXAMPLES_DIR, file), "utf-8");
  const tokens = parseRootBlock(html);
  const spacing = extractHardcodedSpacing(html);

  if (Object.keys(tokens).length === 0) {
    noTokenLayer.push(file);
    hardcodedColors.push({ file, colors: extractHardcodedColors(html) });
    hardcodedSpacing.push({ file, ...spacing });
  } else {
    surfaces.push({ file, tokens });
    hardcodedSpacing.push({ file, ...spacing });
  }
}

// --- Report: Surface Overview ---

console.log("═".repeat(72));
console.log("SURFACE VISUAL GRAMMAR OVERVIEW");
console.log("═".repeat(72));
console.log();

for (const s of surfaces) {
  const family = classify(s.tokens);
  const count = Object.keys(s.tokens).length;
  console.log(`  ${s.file}`);
  console.log(`    Family: ${family}  ·  ${count} CSS custom properties`);
  
  const keys = Object.keys(s.tokens).sort();
  for (const k of keys.slice(0, 4)) {
    console.log(`      ${k}: ${s.tokens[k]}`);
  }
  if (keys.length > 4) {
    console.log(`      … and ${keys.length - 4} more`);
  }
  console.log();
}

if (noTokenLayer.length > 0) {
  console.log("═".repeat(72));
  console.log("SURFACES WITH NO CSS CUSTOM PROPERTY LAYER");
  console.log("═".repeat(72));
  console.log();
  for (const file of noTokenLayer) {
    const entry = hardcodedColors.find((h) => h.file === file);
    console.log(`  ${file}: ${entry?.colors.length || 0} hardcoded color values`);
  }
  console.log();
}

// --- Report: Spacing Grammar Audit ---
console.log("═".repeat(72));
console.log("SPACING GRAMMAR AUDIT");
console.log("═".repeat(72));
console.log();
console.log("  Hardcoded gap/padding/margin values across surfaces:");
console.log("  (No token-based spacing layer yet — all raw px)");
console.log();

for (const entry of hardcodedSpacing) {
  if (entry.gap.length > 0 || entry.padding.length > 0 || entry.margin.length > 0) {
    const gapStr = entry.gap.length > 0 ? `gap:[${entry.gap.join(",")}]` : "";
    const padStr = entry.padding.length > 0 ? `pad:[${entry.padding.join(",")}]` : "";
    const marStr = entry.margin.length > 0 ? `mar:[${entry.margin.join(",")}]` : "";
    const parts = [gapStr, padStr, marStr].filter(Boolean);
    console.log(`  ${entry.file.replace("creator-", "").replace(".html", "")}: ${parts.join(" | ")}`);
  }
}
console.log();
console.log("  Note: all 11 surfaces use hardcoded px values — no --gap-* spacing tokens.");
console.log("  Opportunity: introduce --gap-xs/sm/md/lg/xl token layer for warm-paper family.");
console.log();

// --- Report: Shared vs Divergent Tokens ---

console.log("═".repeat(72));
console.log("TOKEN CROSS-REFERENCE");
console.log("═".repeat(72));
console.log();

// Group by token name - find tokens used in 2+ surfaces
const tokenMap = new Map<string, { file: string; value: string }[]>();

for (const s of surfaces) {
  for (const [key, value] of Object.entries(s.tokens)) {
    if (!tokenMap.has(key)) tokenMap.set(key, []);
    tokenMap.get(key)!.push({ file: s.file, value });
  }
}

const sharedTokens: string[] = [];
const divergedTokens: TokenDrift[] = [];
const uniqueTokens: { token: string; file: string; value: string }[] = [];

for (const [token, entries] of tokenMap) {
  if (entries.length >= 2) {
    const values = new Set(entries.map((e) => e.value));
    if (values.size === 1) {
      sharedTokens.push(token);
    } else {
      divergedTokens.push({ token, values: entries });
    }
  } else {
    uniqueTokens.push({ token, ...entries[0] });
  }
}

console.log(`Shared tokens (same name, same value in 2+ surfaces): ${sharedTokens.length}`);
for (const t of sharedTokens.sort()) {
  const entries = tokenMap.get(t)!;
  const value = entries[0].value;
  const files = entries.map((e) => e.file).join(", ");
  console.log(`  ${t}: ${value} → ${files}`);
}
console.log();

console.log(`Diverged tokens (same name, different value): ${divergedTokens.length}`);
for (const d of divergedTokens.sort((a, b) => a.token.localeCompare(b.token))) {
  console.log(`  ${d.token}:`);
  for (const v of d.values) {
    console.log(`    ${v.value} → ${v.file}`);
  }
}
console.log();

console.log(`Unique tokens (only in one surface): ${uniqueTokens.length}`);
for (const u of uniqueTokens.sort((a, b) => a.token.localeCompare(b.token)).slice(0, 15)) {
  console.log(`  ${u.token}: ${u.value} → ${u.file}`);
}
if (uniqueTokens.length > 15) {
  console.log(`  … and ${uniqueTokens.length - 15} more`);
}
console.log();

// --- Report: Family Cohesion ---

console.log("═".repeat(72));
console.log("FAMILY COHESION ANALYSIS");
console.log("═".repeat(72));
console.log();

const families = new Map<Family, SurfaceTokens[]>();
for (const s of surfaces) {
  const f = classify(s.tokens);
  if (!families.has(f)) families.set(f, []);
  families.get(f)!.push(s);
}

for (const [family, members] of families) {
  if (members.length < 2) continue;
  console.log(`${family} (${members.length} surfaces): ${members.map((m) => m.file).join(", ")}`);

  // Find tokens used by all members of this family
  const allKeys = members.map((m) => new Set(Object.keys(m.tokens)));
  const commonKeys = allKeys.reduce((acc, s) => new Set([...acc].filter((k) => s.has(k))));
  
  if (commonKeys.size > 0) {
    console.log(`  Family-common tokens (${commonKeys.size}):`);
    for (const k of [...commonKeys].sort()) {
      const values = members.map((m) => `${m.tokens[k]} (${m.file.replace("creator-", "").replace(".html", "")})`);
      const uniqueValues = new Set(members.map((m) => m.tokens[k]));
      if (uniqueValues.size > 1) {
        console.log(`    ${k}: DIVERGED → ${values.join(", ")}`);
      } else {
        console.log(`    ${k}: ${values[0]}`);
      }
    }
  }

  // Find naming inconsistencies: tokens that exist in some surfaces but not others
  // within the same family, where the concept seems equivalent
  const allTokenNames = new Set<string>();
  for (const m of members) {
    for (const k of Object.keys(m.tokens)) allTokenNames.add(k);
  }

  const missingTokens: { token: string; presentIn: string[]; absentIn: string[] }[] = [];
  for (const token of allTokenNames) {
    const hasIt = members.filter((m) => token in m.tokens);
    const lacksIt = members.filter((m) => !(token in m.tokens));
    if (hasIt.length > 0 && lacksIt.length > 0) {
      missingTokens.push({
        token,
        presentIn: hasIt.map((m) => m.file),
        absentIn: lacksIt.map((m) => m.file),
      });
    }
  }

  if (missingTokens.length > 0) {
    console.log(`  Naming gap (exists in some surfaces, missing in others):`);
    for (const mt of missingTokens.slice(0, 10)) {
      console.log(`    ${mt.token}: present in ${mt.presentIn.join(", ")} · absent in ${mt.absentIn.join(", ")}`);
    }
  }
  console.log();
}

// --- Report: Naming Inconsistencies ---

console.log("═".repeat(72));
console.log("NAMING INCONSISTENCIES (same concept, different name)");
console.log("═".repeat(72));
console.log();

// Known semantic mappings
const semanticGroups: { concept: string; patterns: RegExp[] }[] = [
  { concept: "background / page color", patterns: [/^--bg$/, /^--paper$/, /^--paper-2$/, /^--paper-hot$/, /^--panel$/, /^--night$/] },
  { concept: "text / ink color", patterns: [/^--ink$/, /^--text$/] },
  { concept: "muted / secondary text", patterns: [/^--muted$/] },
  { concept: "rule / line / divider", patterns: [/^--line/, /^--rule/] },
  { concept: "primary accent / signal", patterns: [/^--accent$/, /^--signal$/, /^--blue$/] },
  { concept: "secondary accent", patterns: [/^--amber$/, /^--orange$/, /^--accent$/] },
  { concept: "tertiary accent / green", patterns: [/^--green$/] },
  { concept: "error / danger", patterns: [/^--danger$/, /^--red$/, /^--rose$/] },
];

const surfacesWithNaming: Map<string, string[]> = new Map();
for (const s of surfaces) {
  surfacesWithNaming.set(s.file, Object.keys(s.tokens));
}

for (const group of semanticGroups) {
  const surfacesInGroup: { file: string; used: string[] }[] = [];
  for (const s of surfaces) {
    const used = Object.keys(s.tokens).filter((k) => group.patterns.some((p) => p.test(k)));
    if (used.length > 0) surfacesInGroup.push({ file: s.file, used });
  }

  if (surfacesInGroup.length >= 2) {
    const allNames = new Set(surfacesInGroup.flatMap((s) => s.used));
    if (allNames.size > 1) {
      console.log(`  "${group.concept}" → uses ${allNames.size} different token names:`);
      for (const s of surfacesInGroup) {
        console.log(`    ${s.file}: ${s.used.join(", ")}`);
      }
    }
  }
}
console.log();

// --- Convergence Tracking ---

console.log("═".repeat(72));
console.log("VALUE-LEVEL CONVERGENCE");
console.log("═".repeat(72));
console.log();

console.log(`Per-diverged-token distinct value counts:`);
interface TokenConvergence {
  token: string;
  distinct_values: number;
  values: { value: string; surfaces: string[] }[];
}
const convergenceDetails: TokenConvergence[] = [];

for (const d of divergedTokens.sort((a, b) => a.token.localeCompare(b.token))) {
  const distinctMap = new Map<string, string[]>();
  for (const v of d.values) {
    if (!distinctMap.has(v.value)) distinctMap.set(v.value, []);
    distinctMap.get(v.value)!.push(v.file);
  }
  const valueEntries: { value: string; surfaces: string[] }[] = [];
  for (const [value, files] of distinctMap) {
    valueEntries.push({ value, surfaces: files.sort() });
  }
  valueEntries.sort((a, b) => b.surfaces.length - a.surfaces.length);

  convergenceDetails.push({ token: d.token, distinct_values: valueEntries.length, values: valueEntries });

  const plural = valueEntries.length > 1 ? "s" : "";
  console.log(`  ${d.token}: ${valueEntries.length} distinct value${plural} across ${d.values.length} surfaces`);
  for (const ve of valueEntries) {
    console.log(`    "${ve.value}" → ${ve.surfaces.join(", ")}`);
  }
}
console.log();

// --- Mechanical Drift Detector ---

/**
 * Mechanical drift = same semantic value, different formatting.
 * Detects whitespace (`, ` vs `,`), leading zero (`0.06` vs `.06`),
 * and case differences. Zero visual risk to align.
 */
function normalizeForComparison(value: string): string {
  return value.replace(/\s+/g, "").replace(/0\./g, ".").toLowerCase();
}

interface MechanicalDrift {
  token: string;
  consensus: string;
  consensus_count: number;
  drifted: { file: string; value: string; normalized_match: string }[];
}

const mechanicalDrifts: MechanicalDrift[] = [];

for (const cd of convergenceDetails) {
  if (cd.values.length < 2) continue;
  // Find majority consensus (highest surface count)
  const consensus = cd.values[0];
  const consensusNorm = normalizeForComparison(consensus.value);
  if (consensus.surfaces.length < 2) continue; // not a real consensus

  const drifted = cd.values
    .slice(1)
    .filter((ve) => normalizeForComparison(ve.value) === consensusNorm)
    .flatMap((ve) =>
      ve.surfaces.map((file) => ({
        file,
        value: ve.value,
        normalized_match: ve.value,
      }))
    );

  if (drifted.length > 0) {
    mechanicalDrifts.push({
      token: cd.token,
      consensus: consensus.value,
      consensus_count: consensus.surfaces.length,
      drifted,
    });
  }
}

console.log("═".repeat(72));
console.log("MECHANICAL DRIFT (same semantic value, different formatting)");
console.log("═".repeat(72));
console.log();
console.log("  Zero-risk alignment: whitespace/leading-zero/case differences in token values");
console.log("  that are functionally identical to the majority consensus.");
console.log();

if (mechanicalDrifts.length === 0) {
  console.log("  No mechanical drift detected — all diverged tokens have real value differences.");
} else {
  console.log(`  Found ${mechanicalDrifts.length} token${mechanicalDrifts.length === 1 ? "" : "s"} with mechanical drift:`);
  for (const md of mechanicalDrifts) {
    console.log(`    ${md.token} (consensus: "${md.consensus}" on ${md.consensus_count} surfaces):`);
    for (const d of md.drifted) {
      console.log(`      ${d.file}: "${d.value}" → align to "${md.consensus}"`);
    }
  }
}
console.log();

// --- Convergence Delta (from prior run) ---

const CONVERGENCE_PATH = join(EXAMPLES_DIR, "..", "examples", "creator-surface-convergence.json");
let priorDivergedCount = divergedTokens.length;
let priorTimestamp = "";
let totalDivergedDelta = 0;
let perTokenDelta: { token: string; prior_distinct: number; current_distinct: number; delta: number }[] = [];

if (existsSync(CONVERGENCE_PATH)) {
  try {
    const priorRaw = readFileSync(CONVERGENCE_PATH, "utf-8");
    const prior = JSON.parse(priorRaw);
    priorDivergedCount = prior.diverged_tokens ?? divergedTokens.length;
    priorTimestamp = prior.timestamp ?? "";
    totalDivergedDelta = divergedTokens.length - priorDivergedCount;

    // Per-token delta: compare current distinct value count against prior
    const priorMap = new Map<string, number>();
    if (Array.isArray(prior.diverged_details)) {
      for (const pd of prior.diverged_details) {
        priorMap.set(pd.token, pd.distinct_values ?? 1);
      }
    }

    for (const cd of convergenceDetails) {
      const priorDistinct = priorMap.get(cd.token);
      if (priorDistinct !== undefined) {
        perTokenDelta.push({
          token: cd.token,
          prior_distinct: priorDistinct,
          current_distinct: cd.distinct_values,
          delta: cd.distinct_values - priorDistinct,
        });
      } else {
        perTokenDelta.push({
          token: cd.token,
          prior_distinct: -1,
          current_distinct: cd.distinct_values,
          delta: -1, // new diverged token
        });
      }
    }

    console.log(`Prior run: ${priorTimestamp}`);
    console.log(`Prior diverged count: ${priorDivergedCount}  →  Current: ${divergedTokens.length}  (delta: ${totalDivergedDelta >= 0 ? "+" : ""}${totalDivergedDelta})`);
    console.log();

    if (perTokenDelta.length > 0) {
      console.log("Per-token convergence deltas:");
      for (const d of perTokenDelta.sort((a, b) => a.delta - b.delta)) {
        const icon = d.delta < 0 ? "✓ converging" : d.delta > 0 ? "✗ diverging" : "— stalled";
        const priorInfo = d.prior_distinct >= 0 ? `${d.prior_distinct}→${d.current_distinct}` : "new";
        console.log(`  ${d.token}: ${priorInfo} distinct values ${icon}`);
      }
      console.log();
    }

    const trend = totalDivergedDelta < 0 ? "converging" : totalDivergedDelta > 0 ? "diverging" : "stall";
    console.log(`Overall trend: ${trend.toUpperCase()}`);
    console.log();
  } catch {
    console.log("(prior convergence data corrupt or unreadable — treating as baseline)");
    console.log();
  }
} else {
  console.log("First run — no prior convergence data (baseline established)");
  console.log();
}

// --- Write Convergence JSON ---

const convergenceReport = {
  timestamp: new Date().toISOString(),
  total_surfaces: surfaces.length + noTokenLayer.length,
  with_token_layer: surfaces.length,
  without_token_layer: noTokenLayer.length,
  shared_tokens: sharedTokens.length,
  diverged_tokens: divergedTokens.length,
  unique_tokens: uniqueTokens.length,
  families: families.size,
  diverged_details: convergenceDetails,
  convergence_delta: {
    prior_diverged_count: priorDivergedCount,
    current_diverged_count: divergedTokens.length,
    delta: totalDivergedDelta,
    trend: totalDivergedDelta < 0 ? "converging" : totalDivergedDelta > 0 ? "diverging" : "stall",
    prior_timestamp: priorTimestamp || null,
    per_token_deltas: perTokenDelta,
  },
  spacing_audit: {
    note: "All 11 surfaces use hardcoded px gap/padding/margin values — no token-based spacing layer",
    surfaces: hardcodedSpacing
      .filter((s) => s.gap.length > 0 || s.padding.length > 0 || s.margin.length > 0)
      .map((s) => ({
        file: s.file,
        gap_values: s.gap,
        padding_values: s.padding,
        margin_values: s.margin,
        gap_count: s.gap.length,
      })),
  },
  mechanical_drift: {
    note: "Same semantic value, different formatting (whitespace/leading-zero/case). Zero visual risk to align.",
    count: mechanicalDrifts.length,
    details: mechanicalDrifts.map((md) => ({
      token: md.token,
      consensus: md.consensus,
      consensus_count: md.consensus_count,
      drifted: md.drifted.map((d) => ({ file: d.file, value: d.value })),
    })),
  },
};

try {
  writeFileSync(CONVERGENCE_PATH, JSON.stringify(convergenceReport, null, 2), "utf-8");
  console.log(`Convergence report written: ${CONVERGENCE_PATH}`);
} catch (e) {
  console.log(`Could not write convergence report: ${e}`);
}
console.log();

// --- Verdict ---

console.log("═".repeat(72));
console.log("VERDICT");
console.log("═".repeat(72));
console.log();

const hasCriticalGap = noTokenLayer.length > 0;
const totalSurfaces = surfaces.length + noTokenLayer.length;
const divergedCount = divergedTokens.length;

console.log(`  Total surfaces: ${totalSurfaces}`);
console.log(`  With CSS token layer: ${surfaces.length}`);
console.log(`  Without CSS token layer: ${noTokenLayer.length}`);
console.log(`  Shared tokens (identical): ${sharedTokens.length}`);
console.log(`  Diverged tokens (drifted): ${divergedCount}`);
console.log(`  Unique tokens (surface-only): ${uniqueTokens.length}`);
console.log(`  Visual families: ${families.size}`);
console.log();
console.log(`  Assessment: ${divergedCount > 0 || hasCriticalGap ? "COHERENCE GAPS EXIST" : "CLEAN"}`);
console.log(`  Exit code: ${hasCriticalGap ? 1 : 0}`);
console.log();
console.log("  Next steps:");
if (hasCriticalGap) console.log(`    - Give ${noTokenLayer.join(", ")} a CSS custom property token layer`);
if (divergedCount > 0) console.log(`    - Align ${divergedCount} diverged tokens toward shared @dash/tokens values`);
console.log(`    - Normalize naming conventions across families`);
console.log(`    - Consider per-family default token imports from @dash/tokens`);

process.exit(hasCriticalGap ? 1 : 0);
