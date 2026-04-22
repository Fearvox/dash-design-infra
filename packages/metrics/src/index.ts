/**
 * @dash/metrics — capsize wrappers for DASH's fonts.
 *
 * What capsize does:
 *   A CSS line-height is a text-block height, but the *glyph* sits inside
 *   that block at an offset determined by the font's ascender/descender/
 *   cap-height/x-height metrics. Even with `line-height: 16px` your cap
 *   line may be 2.3px above the baseline — which is why small text
 *   "floats between the 8px hash marks" in our grid overlay.
 *
 *   Capsize reads the font metrics and computes the exact
 *   `padding-top + padding-bottom + line-height` triad that pins the
 *   cap-line (or baseline, your choice) to the pixel grid.
 *
 * Usage:
 *   import { capsize, dashFonts } from '@dash/metrics';
 *   const styles = capsize({ fontMetrics: dashFonts.geist, fontSize: 14, leading: 24 });
 *   // → { fontSize, lineHeight, paddingTop, paddingBottom, ::before, ::after }
 */

import { createStyleObject, createStyleString } from '@capsizecss/core';

import { geistMetrics, geistMonoMetrics } from './metrics-data.js';

export const dashFonts = {
  geist: geistMetrics,
  geistMono: geistMonoMetrics,
} as const;

export type DashFontKey = keyof typeof dashFonts;

export interface CapsizeInput {
  font: DashFontKey;
  /** desired glyph size in px (e.g. 14 for body) */
  fontSize: number;
  /** desired distance between baselines — MUST be a multiple of 8 */
  leading: number;
}

/**
 * Returns the capsize style object for the given DASH font + size + leading.
 * Throws if `leading` is not a multiple of 8 (DASH baseline enforcement).
 */
export function capsize(input: CapsizeInput) {
  if (input.leading % 8 !== 0) {
    throw new Error(
      `@dash/metrics: leading ${input.leading}px is not a multiple of 8. Use snapLineHeight() from @dash/scale or pick a valid value.`
    );
  }

  return createStyleObject({
    fontMetrics: dashFonts[input.font],
    fontSize: input.fontSize,
    leading: input.leading,
  });
}

/**
 * CSS-string variant — drop directly into a <style> tag.
 */
export function capsizeCss(input: CapsizeInput): string {
  if (input.leading % 8 !== 0) {
    throw new Error(`@dash/metrics: leading ${input.leading}px not a multiple of 8.`);
  }

  return createStyleString(`capsize-${input.font}-${input.fontSize}-${input.leading}`, {
    fontMetrics: dashFonts[input.font],
    fontSize: input.fontSize,
    leading: input.leading,
  });
}

export { geistMetrics, geistMonoMetrics };
