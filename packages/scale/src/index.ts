/**
 * @dash/scale — programmatic access to the DASH fixed-canvas scale.
 *
 * For one-off use in consumers:
 *
 *   import { type, space, snapLineHeight } from '@dash/scale';
 *   type.display.max  // → "46px"
 *   space[6].css      // → "clamp(1.5rem, …, 1.5rem)"
 *   snapLineHeight(18.6) // → 16
 *
 * For writing back into @dash/tokens, see ./gen.ts
 */

export { snapLineHeight, BASELINE, PHI, CANVAS } from './config.js';
export { generateTypeScale, generateSpaceScale } from './gen.js';
