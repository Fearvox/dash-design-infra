/**
 * Font metrics for the bundled Geist reference fonts.
 *
 * These values should match the actual font files you are using for:
 *   Geist-Variable.woff2
 *   GeistMono-Variable.woff2
 *
 * Run `bun extract` (src/extract.ts) to regenerate these from the font files.
 * The values below are placeholders extracted from the @capsizecss/metrics
 * package, which ships baseline metrics for common fonts. When we run
 * extract against your actual woff2 files, these may differ slightly
 * (especially if you have a custom subset).
 *
 * Schema:
 *   familyName       — font family string
 *   category         — serif | sans-serif | monospace | display | handwriting
 *   fullName         — full PostScript name
 *   postscriptName   — PS name
 *   capHeight        — height of capital letters in font units
 *   ascent           — ascender height in font units
 *   descent          — descender depth (negative) in font units
 *   lineGap          — extra leading built into the font
 *   unitsPerEm       — font unit denominator (usually 1000 or 2048)
 *   xHeight          — lowercase x-height
 *   xAvgCharWidth    — average character advance width
 *
 * capsize uses these to compute exact padding-top/bottom so the cap-line
 * (or baseline) sits at a pixel-perfect position.
 */

// Geist Variable — seeded from @capsizecss/metrics/geist defaults.
// TODO: regenerate from actual vendored woff2 via src/extract.ts.
export const geistMetrics = {
  familyName: 'Geist',
  category: 'sans-serif',
  fullName: 'Geist Variable',
  postscriptName: 'Geist-Variable',
  capHeight: 700,
  ascent: 1005,
  descent: -220,
  lineGap: 0,
  unitsPerEm: 1000,
  xHeight: 510,
  xAvgCharWidth: 516,
} as const;

// Geist Mono Variable
export const geistMonoMetrics = {
  familyName: 'Geist Mono',
  category: 'monospace',
  fullName: 'Geist Mono Variable',
  postscriptName: 'GeistMono-Variable',
  capHeight: 700,
  ascent: 1005,
  descent: -220,
  lineGap: 0,
  unitsPerEm: 1000,
  xHeight: 510,
  xAvgCharWidth: 600,
} as const;
