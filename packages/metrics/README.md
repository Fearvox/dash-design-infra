# @dash/metrics

Capsize-based font-level line-box math. Solves the "small text doesn't actually snap to 8px baseline" problem.

## The problem

A CSS `line-height: 16px` produces a 16px **block**. The glyph inside that block sits at an offset determined by the font's metrics (ascender / descender / cap-height / x-height). That offset can easily be 2–3px off from the baseline grid — which is why small text can still look visually off-grid even after every `line-height` is snapped to a multiple of 8.

## What capsize does

Capsize reads the font's metrics, then computes the exact combination of:

- `font-size`
- `line-height`
- `padding-top` / `padding-bottom` (via `::before` / `::after` with negative margin)

…that pins the **cap-line** to the pixel grid, not just the block edges.

## Build

```bash
bun run src/build-css.ts
```

Writes `build/metrics.css` with utility classes:

```css
.capsize-body      /* 14px body, baseline-pinned */
.capsize-meta      /* 11px meta, baseline-pinned */
.capsize-micro     /* 10px micro, baseline-pinned */
.capsize-mono-body /* 14px Geist Mono body */
/* ...etc */
```

## Use

```html
<p class="capsize-body">Body text, pixel-perfect cap-line.</p>
```

Or programmatically:

```ts
import { capsize, dashFonts } from '@dash/metrics';

const style = capsize({ font: 'geist', fontSize: 14, leading: 24 });
// → object you spread into inline styles or CSS-in-JS
```

## Font metrics

Seeded from `@capsizecss/metrics` (defaults for Geist Variable). If we observe character-level drift in consumers, regenerate from our vendored woff2 via:

```bash
bun add @capsizecss/unpack
bun extract
```

(Scaffold in `src/extract.ts`.)

## Enforcement

`leading` must be a multiple of 8. Capsize functions throw otherwise. This forces callers to think about baseline rhythm instead of papering over it.
