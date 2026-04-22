/**
 * DASH scale configuration.
 *
 * DASH ships on a FIXED canvas (1684×1191, A-series √2:1 reverse-beat). Our
 * type/space doesn't need to fluidly reflow — the page is always the same
 * size. So: minSize === maxSize in both scales, and utopia's clamp()
 * collapses to a fixed value at every viewport.
 *
 * If we ever ship a reflowable web variant, we can spread the min/max apart
 * and get real fluid behavior "for free" without changing consumer CSS.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * Space scale encoding — utopia treats minSize as PIXELS
 * ───────────────────────────────────────────────────────────────────────────
 * Despite the "fluid type" framing, utopia-core's calculateSpaceScale takes
 * minSize/maxSize as PIXEL values. It does `Math.round(minSize × multiplier)`
 * to produce each step's px size, then divides by 16 to emit `clamp()` in
 * rem (and keeps the px-native version as `clampPx`).
 *
 * The footgun: if you pass `minSize: 0.5` thinking "0.5 rem = 8 px", it gets
 * treated as 0.5 px and Math.round() crushes small multipliers to 0.
 *
 * Correct encoding for our 8px baseline:
 *
 *     minSize = maxSize = BASELINE   (= 8, in px)
 *     positiveSteps = [0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8, 10]   (multipliers)
 *
 *     → output: 4, 8, 12, 16, 20, 24, 32, 48, 64, 80 px
 *     → every size collapses to `clamp(Npx, Npx + 0vw, Npx)` (fixed canvas)
 *
 * The `oneUpPairs` utopia also emits (transitions between adjacent sizes)
 * are fluid in principle but for our fixed canvas they're noise — we just
 * use `sizes`.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * Type scale — split ratios (positive φ, negative Major Third)
 * ───────────────────────────────────────────────────────────────────────────
 * Pure φ (1.618) in both directions overshoots at the extremes:
 *   - positive φ^3 = 14 × 4.236 ≈ 59.3 px display   (too large vs our 46)
 *   - negative φ^-2 = 14 × 0.382 ≈ 5.35 px micro    (too small vs our 9.5)
 *
 * So we split. Utopia-core only has one ratio, so we don't use its type-scale
 * function — we compute the scale ourselves in gen.ts from these constants.
 *
 * Going up we want big drama (headline, deck) → use φ.
 * Going down we want gentle step-off (meta, micro) → use Major Third (1.25).
 * Rationale: legibility on print at body-14 anchors needs meta to stay ≥ 11px
 * and micro ≥ 9px for captions/footnotes.
 *
 *   anchor: 14 px
 *   positive ratio: φ = 1.618    → steps: 14 × 1.618^1, ^2, ^3
 *                                       = 22.65, 36.65, 59.29 px
 *   negative ratio: 1.25         → steps: 14 / 1.25^1, ^2
 *                                       = 11.2, 8.96 px
 *
 * This is "seed" — actual emitted pixel sizes get snapped to a choice
 * (round-to-integer, or round-to-half-baseline) in gen.ts.
 */

export const BASELINE = 8; // px — the grid quantum
export const PHI = 1.618;

/** Major Third — gentler ratio for the downscale side */
export const MAJOR_THIRD = 1.25;

/** Perfect Fourth — alternative downscale if MT feels too compressed */
export const PERFECT_FOURTH = 1.333;

/** Perfect Fifth — best-match upscale to hand-tuned 46px display at step 3 */
export const PERFECT_FIFTH = 1.5;

/** Canvas min/max — fixed A-series landscape reverse-beat */
export const CANVAS = {
  minWidth: 1280, // preview / smaller deck surface
  maxWidth: 1684, // print canvas width
} as const;

/**
 * Type scale config — split ratios.
 *
 * We don't use utopia-core's calculateTypeScale for emission because it only
 * accepts a single ratio. Instead we keep utopia-compatible min/max fields
 * here for reference / future fluid variant, and gen.ts computes the scale
 * directly from anchor × ratio^step.
 *
 * Body anchor is 14px; 3 positive steps (body → deck → display) and 2
 * negative steps (body → meta → micro).
 */
export const typeScale = {
  anchor: 14,
  positiveRatio: PHI,              // display drama
  negativeRatio: MAJOR_THIRD,      // legible downscale
  positiveSteps: 3,
  negativeSteps: 2,
  minWidth: CANVAS.minWidth,
  maxWidth: CANVAS.maxWidth,
  prefix: 'size',
  /** Step labels: index 0 = anchor; positive increases, negative decreases */
  labels: ['micro', 'meta', 'body', 'lead', 'deck', 'display'] as const,
} as const;

/**
 * Reference scale — pure φ both directions, for comparison against split.
 */
export const typeScaleV1Pure = {
  ...typeScale,
  negativeRatio: PHI,
} as const;

/**
 * Tuned variant — Perfect Fifth up, Major Third down.
 * This is the geometric scale that best matches the hand-tuned reference
 * ladder (9.5 / 11 / 14 / 22 / 46) while still being principled:
 *
 *   body × 1.5^1 = 21  (matches hand 22)
 *   body × 1.5^2 = 32  (new tier — hand-tuned collapsed this)
 *   body × 1.5^3 = 47  (matches hand 46)
 *
 * Tradeoff vs V2 (pure-φ up): display is calmer (47 vs 59) but the scale still
 * expands through a real "deck" tier, so we gain a step we didn't have before.
 */
export const typeScaleV4Tuned = {
  ...typeScale,
  positiveRatio: PERFECT_FIFTH,
  negativeRatio: MAJOR_THIRD,
} as const;

/**
 * Space scale — multiples of baseline (8px).
 *
 * 10 positive steps mapping to the current --space-1 … --space-10.
 * See the block comment at the top of this file for the rem-encoding reason
 * why minSize is 0.5 (not 8) and positiveSteps are [0.5, 1, ..., 10] (not
 * [4, 8, ..., 80]). The pixel output is what matters: 4, 8, 12, 16, 20, 24,
 * 32, 48, 64, 80.
 */
export const spaceScale = {
  minSize: BASELINE, // 8 px
  maxSize: BASELINE, // fixed — canvas doesn't reflow
  positiveSteps: [0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8, 10],
  // Output px sizes: [4, 8, 12, 16, 20, 24, 32, 48, 64, 80]
  negativeSteps: [],
  minWidth: CANVAS.minWidth,
  maxWidth: CANVAS.maxWidth,
  prefix: 'space',
} as const;

/**
 * Line-height snap — any px value rounds to the nearest 8px multiple.
 * Non-multiples are a typography bug (see @dash/metrics for character-level
 * enforcement via capsize).
 */
export function snapLineHeight(px: number): number {
  return Math.round(px / BASELINE) * BASELINE;
}

/**
 * Round a font-size to integer px. Do NOT snap font-size to the 8px baseline —
 * that only applies to line-height. Font-size 14 is valid; snapping it to 16
 * corrupts the anchor. (Early draft did this and produced body=16 from anchor=14.)
 */
export function snapFontSize(px: number): number {
  return Math.round(px);
}
