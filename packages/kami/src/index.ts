/**
 * @dash/kami - editorial document aesthetic preset.
 *
 * Kami is tracked here as a preset layer, not as a vendored runtime. It sits
 * above @dash/tokens and gives agents a stable rule set for calm, printable
 * documents: warm paper, one ink-blue accent, serif hierarchy, and no hard
 * shadows.
 *
 * Inspired by Kami from @tw93:
 *   https://kami.tw93.fun/
 *   https://github.com/tw93/kami
 */

export const kamiPreset = {
  name: 'Kami',
  observedAt: '2026-04-28',
  source: {
    site: 'https://kami.tw93.fun/',
    repository: 'https://github.com/tw93/kami',
    author: '@tw93',
  },
  intent:
    'Use for composed document surfaces: one-pagers, long docs, letters, resumes, portfolios, and slides.',
  placement:
    'Preset layer above @dash/tokens. It can feed @dash/layout, @dash/print, and @dash/measure without owning their runtimes.',
  colors: {
    canvas: '#F5F4ED',
    ivory: '#FAF9F5',
    warmSand: '#E8E6DC',
    deepDark: '#141413',
    inkBlue: '#1B365D',
    inkLight: '#2D5A8A',
    darkSurface: '#30302E',
    error: '#B53333',
    nearBlack: '#141413',
    darkWarm: '#3D3D3A',
    olive: '#504E49',
    stone: '#6B6A64',
    tagWeak: '#EEF2F7',
    tagStandard: '#E4ECF5',
    tagStrong: '#D0DCE9',
  },
  typography: {
    fontFamilies: {
      serif: ['Charter', 'TsangerJinKai02', 'YuMincho', 'serif'],
      mono: ['JetBrains Mono', 'Geist Mono', 'ui-monospace', 'monospace'],
    },
    weights: {
      body: 400,
      heading: 500,
      label: 600,
    },
    printScalePt: {
      display: '36-48',
      h1: '18-22',
      h2: '14-16',
      h3: '12-13',
      body: '9.5-10',
      caption: '8.5-9',
      label: '7.5-8',
    },
    lineHeightBands: {
      title: '1.10-1.30',
      dense: '1.40-1.45',
      reading: '1.50-1.55',
    },
  },
  spacing: {
    baseUnitPt: 4,
    rhythm: {
      xs: '2-3pt',
      sm: '4-5pt',
      md: '8-10pt',
      lg: '16-20pt',
      xl: '24-32pt',
      '2xl': '40-60pt',
      '3xl': '80-120pt',
    },
  },
  radiusPt: {
    tight: 4,
    code: 6,
    card: 8,
    container: 12,
    featureCard: 16,
    largeContainer: 24,
    hero: 32,
  },
  depth: {
    ring: '0 0 0 1pt var(--kami-ring-warm)',
    whisper: '0 4pt 24pt rgba(0, 0, 0, 0.05)',
    strongest: 'alternate light parchment and deep-dark sections',
  },
  components: {
    button: '8pt radius, ring shadow, primary ink-blue fill or warm-sand secondary',
    tag: 'solid hex tint only; avoid rgba tag fills for print engines',
    quote: '2pt ink-blue left rule with olive text',
    metric: 'serif number, small label, tabular numerals',
    sectionTitle: 'serif 500, size-led hierarchy, no decoration needed',
    dashList: 'dash marker instead of bullet for editorial tone',
    codeBlock: 'ivory background, 0.5pt warm border, 6pt radius, mono font',
    featuredCard: 'whisper shadow with generous radius',
  },
  documentTypes: ['one-pager', 'long-doc', 'letter', 'portfolio', 'resume', 'slides'],
  rules: [
    'Page background is parchment, never pure white.',
    'Use ink blue as the only chromatic accent.',
    'Keep grays warm; avoid cool blue-gray defaults.',
    'Serif carries hierarchy and reading tone.',
    'Use real 400/500 weights; avoid synthetic bold.',
    'Prefer ring or whisper shadows over hard drop shadows.',
    'Use solid tag tints instead of rgba.',
    'Keep accent coverage sparse.',
  ],
  antiPatterns: [
    'pure-white page background',
    'cool gray UI defaults',
    'multiple bright accent colors',
    'heavy synthetic bold',
    'hard drop shadows',
    'rgba tag backgrounds in print output',
  ],
  fontNote:
    'No font files are vendored here. TsangerJinKai02 may require a commercial license; consumers must supply licensed fonts.',
} as const;

export type KamiPreset = typeof kamiPreset;
export type KamiColorName = keyof typeof kamiPreset.colors;
export type KamiDocumentType = (typeof kamiPreset.documentTypes)[number];

export function kamiCssVariables(prefix = '--kami'): Record<string, string> {
  return {
    [`${prefix}-color-canvas`]: kamiPreset.colors.canvas,
    [`${prefix}-color-ivory`]: kamiPreset.colors.ivory,
    [`${prefix}-color-warm-sand`]: kamiPreset.colors.warmSand,
    [`${prefix}-color-deep-dark`]: kamiPreset.colors.deepDark,
    [`${prefix}-color-ink-blue`]: kamiPreset.colors.inkBlue,
    [`${prefix}-color-ink-light`]: kamiPreset.colors.inkLight,
    [`${prefix}-color-dark-surface`]: kamiPreset.colors.darkSurface,
    [`${prefix}-color-error`]: kamiPreset.colors.error,
    [`${prefix}-color-near-black`]: kamiPreset.colors.nearBlack,
    [`${prefix}-color-dark-warm`]: kamiPreset.colors.darkWarm,
    [`${prefix}-color-olive`]: kamiPreset.colors.olive,
    [`${prefix}-color-stone`]: kamiPreset.colors.stone,
    [`${prefix}-color-tag-weak`]: kamiPreset.colors.tagWeak,
    [`${prefix}-color-tag-standard`]: kamiPreset.colors.tagStandard,
    [`${prefix}-color-tag-strong`]: kamiPreset.colors.tagStrong,
    [`${prefix}-font-serif`]: kamiPreset.typography.fontFamilies.serif.join(', '),
    [`${prefix}-font-mono`]: kamiPreset.typography.fontFamilies.mono.join(', '),
    [`${prefix}-ring-warm`]: 'rgba(20, 20, 19, 0.12)',
    [`${prefix}-shadow-whisper`]: kamiPreset.depth.whisper,
  };
}

export function isKamiDocumentType(value: string): value is KamiDocumentType {
  return (kamiPreset.documentTypes as readonly string[]).includes(value);
}
