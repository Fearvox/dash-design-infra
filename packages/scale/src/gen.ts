/**
 * @dash/scale/gen — regenerates type & space scale.
 *
 * Type scale is computed in-house (split ratios, can't use utopia-core's
 * single-ratio calculateTypeScale). Space scale goes through utopia-core's
 * calculateSpaceScale for its rem/px clamp emission (config.ts block comment
 * explains why minSize is px, not rem).
 *
 * Usage:
 *   bun run src/gen.ts             # prints all three scales to stdout
 *   bun run src/gen.ts --compare   # side-by-side: pure-φ vs split-ratio vs hand-tuned
 *   bun run src/gen.ts --write     # writes the tuned scale back to @dash/tokens
 */

import { calculateSpaceScale } from 'utopia-core';
import { fileURLToPath } from 'node:url';
import {
  typeScale,
  typeScaleV1Pure,
  typeScaleV4Tuned,
  spaceScale,
  snapLineHeight,
  snapFontSize,
  BASELINE,
  PHI,
  MAJOR_THIRD,
  PERFECT_FIFTH,
} from './config.js';

export interface TypeStep {
  step: number;      // -2, -1, 0, 1, 2, 3
  label: string;     // 'micro', 'meta', 'body', 'lead', 'deck', 'display'
  raw: number;       // unsnapped px — anchor × ratio^step
  px: number;        // snapped to half-baseline
  lineHeight: number; // snapped to baseline (8)
  css: string;       // clamp() emission — fixed canvas so collapses
}

type TokenSizeName = 'micro' | 'meta' | 'body' | 'deck' | 'display';

/**
 * Compute a type-scale step list from split ratios.
 *
 * step < 0 → anchor / negativeRatio^|step|
 * step = 0 → anchor
 * step > 0 → anchor × positiveRatio^step
 */
export function computeTypeScale(config: {
  anchor: number;
  positiveRatio: number;
  negativeRatio: number;
  positiveSteps: number;
  negativeSteps: number;
  labels: readonly string[];
}): TypeStep[] {
  const { anchor, positiveRatio, negativeRatio, positiveSteps, negativeSteps, labels } = config;
  const out: TypeStep[] = [];

  for (let step = -negativeSteps; step <= positiveSteps; step++) {
    const raw = step === 0
      ? anchor
      : step > 0
        ? anchor * Math.pow(positiveRatio, step)
        : anchor / Math.pow(negativeRatio, -step);

    const px = snapFontSize(raw);
    // Line-height rule: tight for display (1.1), relaxed for body (1.5),
    // clamped to 8px grid.
    const lhRaw = step >= 2 ? px * 1.1 : step >= 1 ? px * 1.25 : step === 0 ? px * 1.5 : px * 1.4;
    const lineHeight = snapLineHeight(lhRaw);

    const labelIdx = step + negativeSteps;
    const label = labels[labelIdx] ?? `step-${step}`;

    out.push({
      step,
      label,
      raw,
      px,
      lineHeight,
      css: `clamp(${px}px, ${px}px + 0vw, ${px}px)`, // collapses, fixed canvas
    });
  }

  return out;
}

export function generateTypeScale() {
  return computeTypeScale({
    anchor: typeScaleV4Tuned.anchor,
    positiveRatio: typeScaleV4Tuned.positiveRatio,
    negativeRatio: typeScaleV4Tuned.negativeRatio,
    positiveSteps: typeScaleV4Tuned.positiveSteps,
    negativeSteps: typeScaleV4Tuned.negativeSteps,
    labels: typeScaleV4Tuned.labels,
  });
}

export function generateSpaceScale() {
  return calculateSpaceScale({
    minWidth: spaceScale.minWidth,
    maxWidth: spaceScale.maxWidth,
    minSize: spaceScale.minSize,
    maxSize: spaceScale.maxSize,
    positiveSteps: [...spaceScale.positiveSteps],
  });
}

/** Hand-tuned scale from the original fixed-canvas reference page */
export const HAND_TUNED = [
  { step: -2, label: 'micro',   px: 9.5, note: 'caption, footnote' },
  { step: -1, label: 'meta',    px: 11,  note: 'kicker, meta, th-caps' },
  { step:  0, label: 'body',    px: 14,  note: 'body text' },
  { step:  1, label: 'lead',    px: 22,  note: 'h2 / hd-sub' },
  { step:  2, label: 'deck',    px: 22,  note: '(currently same as lead)' },
  { step:  3, label: 'display', px: 46,  note: 'h1 / hd-title' },
];

function renderTypeTable(rows: TypeStep[], title: string) {
  console.log(`\n${title}`);
  console.log('─'.repeat(title.length));
  console.log('step  label     raw       px    lh   (clamp)');
  for (const r of rows) {
    const raw = r.raw.toFixed(2).padStart(6);
    const px = String(r.px).padStart(5);
    const lh = String(r.lineHeight).padStart(3);
    console.log(`${String(r.step).padStart(3)}   ${r.label.padEnd(9)} ${raw}px  ${px}px  ${lh}px`);
  }
}

function renderCompareTable3(v1: TypeStep[], v2: TypeStep[], v4: TypeStep[]) {
  console.log('\nside-by-side (anchor = 14px)');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('step  label     hand-tuned   V1 pure-φ   V2 φ↑/MT↓   V4 P5↑/MT↓   |  Δ(V4-hand)');
  for (let i = 0; i < v1.length; i++) {
    const a = v1[i];
    const b = v2[i];
    const c = v4[i];
    if (!a || !b || !c) continue;
    const ref = HAND_TUNED.find(h => h.step === a.step);
    const refPx = ref ? `${ref.px}px`.padStart(8) : '   —    ';
    const delta = ref ? (c.px - ref.px).toFixed(1).padStart(5) : '  —  ';
    console.log(
      `${String(a.step).padStart(3)}   ${a.label.padEnd(9)} ${refPx}    ${String(a.px).padStart(5)}px     ${String(b.px).padStart(5)}px      ${String(c.px).padStart(5)}px     |  ${delta}`
    );
  }
}

// CLI entry
if (import.meta.main) {
  const compare = Bun.argv.includes('--compare');
  const write = Bun.argv.includes('--write');

  // V1 = pure φ both directions
  const v1 = computeTypeScale({
    anchor: typeScaleV1Pure.anchor,
    positiveRatio: typeScaleV1Pure.positiveRatio,
    negativeRatio: typeScaleV1Pure.negativeRatio,
    positiveSteps: typeScaleV1Pure.positiveSteps,
    negativeSteps: typeScaleV1Pure.negativeSteps,
    labels: typeScaleV1Pure.labels,
  });

  // V2 = split (positive φ, negative Major Third)
  const v2 = computeTypeScale({
    anchor: typeScale.anchor,
    positiveRatio: typeScale.positiveRatio,
    negativeRatio: typeScale.negativeRatio,
    positiveSteps: typeScale.positiveSteps,
    negativeSteps: typeScale.negativeSteps,
    labels: typeScale.labels,
  });

  // V4 = Perfect Fifth up, Major Third down — best hand-tuned match
  const v4 = computeTypeScale({
    anchor: typeScaleV4Tuned.anchor,
    positiveRatio: typeScaleV4Tuned.positiveRatio,
    negativeRatio: typeScaleV4Tuned.negativeRatio,
    positiveSteps: typeScaleV4Tuned.positiveSteps,
    negativeSteps: typeScaleV4Tuned.negativeSteps,
    labels: typeScaleV4Tuned.labels,
  });

  if (compare) {
    renderTypeTable(v1, 'V1 · pure φ (1.618 up, 1.618 down)');
    renderTypeTable(v2, 'V2 · split (φ up, Major Third 1.25 down)');
    renderTypeTable(v4, 'V4 · tuned (Perfect Fifth 1.5 up, Major Third 1.25 down)');
    renderCompareTable3(v1, v2, v4);
    console.log('\nHand-tuned reference page:');
    for (const h of HAND_TUNED) {
      console.log(`  ${String(h.step).padStart(3)}  ${h.label.padEnd(9)}  ${String(h.px).padStart(5)}px   ${h.note}`);
    }
    console.log('\nRecommendation: V4 (Perfect Fifth + Major Third).');
    console.log(' - Negative side: 9/11 matches hand-tuned 9.5/11 almost exactly');
    console.log(' - Positive side: 21/32/47 matches hand-tuned 22/—/46 and ADDS a');
    console.log('   real deck tier at 32 (hand-tuned had collapsed it).');
    console.log('\nPick a winner and wire into @dash/tokens:');
    console.log('  bun run src/gen.ts --write');
  } else if (write) {
    await writeToTokens();
    console.log('\nSuccessfully wrote V4 tuned scale to @dash/tokens/src/tokens.json');
    console.log('Running tokens:build...');
    const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
    const buildResult = Bun.spawnSync(['bun', 'run', '--filter=@dash/tokens', 'build'], { cwd: repoRoot });
    if (buildResult.exitCode === 0) {
      console.log('Tokens rebuilt successfully. New scale is now live.');
    } else {
      console.error('Build failed:', buildResult.stderr.toString());
      process.exit(1);
    }
    process.exit(0);
  } else {
    const space = generateSpaceScale();
    const output = {
      baseline: BASELINE,
      type: { v1_pure_phi: v1, v2_split: v2, hand_tuned: HAND_TUNED, v4_tuned: generateTypeScale() },
      space,
    };
    console.log(JSON.stringify(output, null, 2));
    console.log('\n--- dry run ---');
    console.log('Re-run with --compare for side-by-side tables');
    console.log('Re-run with --write to update tokens.json (now implemented)');
  }
}

async function writeToTokens(): Promise<void> {
  const tokensPath = fileURLToPath(new URL('../../tokens/src/tokens.json', import.meta.url));
  const source = await Bun.file(tokensPath).text();
  const sizeUpdates = generatedTypeValues(generateTypeScale());
  const updated = updateFontSizeValues(source, sizeUpdates);

  await Bun.write(tokensPath, updated);

  console.log('Updated font sizes to V4:');
  console.log('  micro: ' + sizeUpdates.micro);
  console.log('  meta: ' + sizeUpdates.meta);
  console.log('  body: ' + sizeUpdates.body);
  console.log('  deck: ' + sizeUpdates.deck + ' (new distinct tier)');
  console.log('  display: ' + sizeUpdates.display);
  console.log('\nSpace ladder unchanged (already matches scale).');
}

function generatedTypeValues(scale: TypeStep[]): Record<TokenSizeName, string> {
  return {
    micro: `${requireStep(scale, 'micro').px}px`,
    meta: `${requireStep(scale, 'meta').px}px`,
    body: `${requireStep(scale, 'body').px}px`,
    deck: `${requireStep(scale, 'deck').px}px`,
    display: `${requireStep(scale, 'display').px}px`,
  };
}

function requireStep(scale: TypeStep[], label: TokenSizeName): TypeStep {
  const step = scale.find((item) => item.label === label);
  if (!step) throw new Error(`@dash/scale: generated scale is missing "${label}".`);
  return step;
}

function updateFontSizeValues(source: string, updates: Record<TokenSizeName, string>): string {
  const sizeSectionPattern = /("size"\s*:\s*\{[\s\S]*?\n\s*\},\s*\n\s*"lineHeight")/m;
  const match = source.match(sizeSectionPattern);
  if (!match) {
    throw new Error('@dash/scale: could not find font.size section in @dash/tokens/src/tokens.json.');
  }

  let section = match[1]!;
  for (const [key, value] of Object.entries(updates) as [TokenSizeName, string][]) {
    const valuePattern = new RegExp(`("${key}"\\s*:\\s*\\{[\\s\\S]*?"\\$value"\\s*:\\s*)"[^"]+"`);
    if (!valuePattern.test(section)) {
      throw new Error(`@dash/scale: could not find font.size.${key}.$value in tokens.json.`);
    }
    section = section.replace(valuePattern, (_full, prefix: string) => `${prefix}"${value}"`);
  }

  const updated = source.replace(match[1]!, section);
  const parsed = JSON.parse(updated) as {
    font?: { size?: Record<string, { $value?: string }> };
  };

  for (const [key, value] of Object.entries(updates)) {
    if (parsed.font?.size?.[key]?.$value !== value) {
      throw new Error(`@dash/scale: failed to verify written font.size.${key} value.`);
    }
  }

  return updated;
}
