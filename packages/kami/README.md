# @dash/kami

Kami-inspired editorial document aesthetic preset for DASH.

This is a preset layer, not a fork or vendored copy of Kami. It captures the parts that fit DASH's document work: warm paper, one ink-blue accent, serif hierarchy, print-safe tags, low-shadow surfaces, and a small component grammar for one-pagers, reports, resumes, portfolios, and slides.

Inspired by:

- [Kami](https://kami.tw93.fun/)
- [tw93/kami](https://github.com/tw93/kami)

## Why It Lives Here

`@dash/kami` sits above `@dash/tokens` and below concrete documents. It gives agents a stable aesthetic mode while the runtime packages keep their sharper jobs:

- `@dash/tokens` keeps core DASH values.
- `@dash/kami` maps a Kami-like editorial preset onto document surfaces.
- `@dash/layout` can solve page boxes using this preset.
- `@dash/print` can render the HTML to PDF.
- `@dash/measure` can verify the canvas still fits.

## Use

Programmatic preset:

```ts
import { kamiPreset, kamiCssVariables } from '@dash/kami';

console.log(kamiPreset.colors.canvas); // #F5F4ED
console.log(kamiCssVariables());
```

CSS preset:

```css
@import '@dash/kami/css';
```

```html
<main data-dash-aesthetic="kami" class="dash-kami-page">
  ...
</main>
```

## Rules

- Canvas is parchment `#F5F4ED`, never pure white.
- Ink blue `#1B365D` is the only chromatic accent.
- Warm neutrals beat cool gray defaults.
- Serif carries hierarchy and reading tone.
- Use real 400/500 weights; avoid synthetic bold.
- Shadows are ring or whisper only.
- Tag backgrounds use solid hex colors, not `rgba()`.

## Font Boundary

No font files are vendored in this package. Consumers must supply licensed fonts. In particular, TsangerJinKai02 may require a commercial license depending on use.
