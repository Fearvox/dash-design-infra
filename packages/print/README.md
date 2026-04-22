# @dash/print

HTML-to-PDF via [paged.js](https://pagedjs.org/) polyfill + Playwright. Lets us keep the web as the single source of truth and treat PDFs as an output target, not a separate pipeline.

## Why paged.js (not just Chromium print)

Chrome's built-in `page.pdf()` respects `@page { size; margin }` and some basic break rules, but skips most of CSS Paged Media Module Level 3:

- No running headers/footers (`@top-center`, `@bottom-right`, etc.)
- No named pages (`@page cover { ... }`)
- No cross-references (`target-counter`, `target-text`)
- No footnotes (`float: footnote`)
- Limited break control

paged.js polyfills these in a browser context, then Chromium just captures the result. We pay ~500ms per document for book-grade typesetting.

## Install

```bash
bun install
bun x playwright install chromium   # once
```

## CLI

```bash
# Default — use @page CSS from the HTML
bun run src/cli.ts input.html out.pdf

# Override page size (Chromium fallback; @page in CSS still wins if present)
bun run src/cli.ts input.html out.pdf --format=A4
bun run src/cli.ts input.html out.pdf --canvas=1684x1191

# Extra wait for web fonts
bun run src/cli.ts input.html out.pdf --wait=500
```

From repo root:

```bash
bun print:render -- ./pages/page.html ./out.pdf
```

## API

```ts
import { renderToPDF, writeShellHTML } from '@dash/print';

const res = await renderToPDF({
  input: '/abs/path/page.html',
  output: '/abs/path/out.pdf',
  format: { width: 1684, height: 1191 },
  printBackground: true,
  waitMs: 500,
});

console.log(res.ok, res.pageCount);
```

## CSS patterns paged.js unlocks

```css
@page { size: 1684px 1191px; margin: 0; }

@page :first {
  background: var(--paper-0);
}

@page :left {
  @bottom-left { content: string(chapter-title); }
  @bottom-right { content: counter(page); }
}

@page :right {
  @top-right { content: string(book-title); }
}

h1 { string-set: chapter-title content(); }
h1 { break-before: page; }

.pull-quote { float: right; }
.footnote { float: footnote; }

.toc li a::after {
  content: target-counter(attr(href), page);
  text-align: right;
}
```

Chromium print can't do any of these. paged.js handles them.

## Vs. `weasyprint` / `prince`

- **WeasyPrint** is excellent and free but uses its own CSS engine — what you see in Chrome is not what you get in the PDF. Fine for print-only work, painful when the same HTML is also a live preview.
- **Prince** is the gold standard but commercial and closed. Same "separate engine" tradeoff.
- **paged.js + Chromium** keeps one engine (the one we already use for screen), which matters when the same page is both a live preview and a print artifact.

## Known limitations

- paged.js is ~200KB and re-lays content on load. Fine for CI renders, not for user-facing live docs.
- Some paged.js features (footnotes, complex cross-refs) require CSS idioms Chromium alone doesn't support — so a screen preview may differ from the PDF for those specific features. Test each new pattern on both targets.
- Currently pulls paged.js from unpkg. Vendor a copy into `vendor/` before relying on this for offline CI.
