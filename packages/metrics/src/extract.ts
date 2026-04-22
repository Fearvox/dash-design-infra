/**
 * Extract font metrics from your woff2 files using @capsizecss/unpack.
 * Writes results to src/metrics-data.ts (overwriting the seeded values).
 *
 * Usage:
 *   bun run src/extract.ts --geist=./fonts/Geist-Variable.woff2 --geist-mono=./fonts/GeistMono-Variable.woff2
 *
 * You can also provide:
 *   DASH_GEIST_FONT=/abs/path/to/Geist-Variable.woff2
 *   DASH_GEIST_MONO_FONT=/abs/path/to/GeistMono-Variable.woff2
 */

const DEFAULT_FONT_PATHS = {
  geist: './fonts/Geist-Variable.woff2',
  geistMono: './fonts/GeistMono-Variable.woff2',
} as const;

function readFlag(name: string): string | undefined {
  const prefix = `--${name}=`;
  return Bun.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function getFontPaths() {
  return {
    geist: readFlag('geist') ?? process.env.DASH_GEIST_FONT ?? DEFAULT_FONT_PATHS.geist,
    geistMono: readFlag('geist-mono') ?? process.env.DASH_GEIST_MONO_FONT ?? DEFAULT_FONT_PATHS.geistMono,
  };
}

async function extract() {
  const fontPaths = getFontPaths();

  // @capsizecss/unpack is a separate peer — we don't install it by default.
  // If we need dynamic extraction we add it. For now this is a scaffold
  // showing the flow; the seed values in metrics-data.ts are the defaults
  // from @capsizecss/metrics.

  console.log('@dash/metrics extract — scaffold only.');
  console.log('');
  console.log('Plan:');
  console.log('  1. bun add @capsizecss/unpack');
  console.log('  2. For each font at FONT_PATHS:');
  console.log('     - read the woff2 bytes');
  console.log('     - pass to fromFile() from @capsizecss/unpack');
  console.log('     - collect { capHeight, ascent, descent, lineGap, unitsPerEm, xHeight, xAvgCharWidth }');
  console.log('  3. Serialize to src/metrics-data.ts overwriting current values');
  console.log('');
  console.log('Usage examples:');
  console.log('  bun extract -- --geist=./fonts/Geist-Variable.woff2 --geist-mono=./fonts/GeistMono-Variable.woff2');
  console.log('  DASH_GEIST_FONT=/abs/path/Geist-Variable.woff2 DASH_GEIST_MONO_FONT=/abs/path/GeistMono-Variable.woff2 bun extract');
  console.log('');
  console.log('Current font paths:');
  for (const [key, path] of Object.entries(fontPaths)) {
    console.log(`  ${key}: ${path}`);
  }
  console.log('');
  console.log('Defer implementing this until we see character-level drift in consumers.');
  console.log('Seeded values from @capsizecss/metrics are accurate for Geist variable.');
}

if (import.meta.main) {
  await extract();
}
