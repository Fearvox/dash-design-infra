# dash-design-infra

Fixed-canvas editorial design infrastructure on Bun.

Design tokens, type scale, baseline metrics, Kami-inspired document presets, p5.js motion grammar, overflow gates, constraint layout, and HTML-to-PDF output for one-pagers, decks, kinetic studies, and print-facing surfaces that need to stay visually exact.

[English](./README.md) · [中文](./README-zh.md)

![License: MIT](https://img.shields.io/badge/license-MIT-0f172a.svg)
![Bun](https://img.shields.io/badge/runtime-Bun-111827.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-2563eb.svg)
![Fixed Canvas](https://img.shields.io/badge/layout-fixed--canvas-14532d.svg)
![CI](https://img.shields.io/github/actions/workflow/status/Fearvox/dash-design-infra/ci.yml?branch=main&label=CI)

[Quick start](#quick-start) · [Architecture](#architecture) · [Packages](#packages) · [What Kami And P5 Add](#what-kami-and-p5-add) · [Hall of Fame](#hall-of-fame) · [Contributing](./CONTRIBUTING.md)

---

## What this is

`dash-design-infra` is a Bun workspace for deterministic editorial surfaces.

It treats a design system as an engineering pipeline instead of a loose pile of CSS:

| Layer | What it owns | Why it exists |
|---|---|---|
| `@dash/tokens` | color, type, spacing, page geometry, motion | one source of truth |
| `@dash/scale` | size ratios and line-height rules | repeatable scale generation |
| `@dash/metrics` | font metrics and cap-line alignment | real baseline precision |
| `@dash/kami` | editorial document aesthetic presets | warm, printable, agent-friendly pages |
| `@dash/p5-motion` | p5.js motion grammar and sketch helpers | kinetic prototypes from stable design data |
| `@dash/measure` | browser-side overflow checks | catch clipping before export |
| `@dash/layout` | hard layout constraints | express rules CSS cannot guarantee |
| `@dash/print` | HTML to PDF rendering | keep web and print on one path |

This repo is for teams that want a page to survive all the way from token edit to PDF export without “close enough” drift.

---

## Why this repo exists

- Design tokens alone are not enough for fixed-canvas work. You also need scale rules, metric alignment, overflow enforcement, and print output.
- Browser truth matters. Layout checks run in Playwright instead of guessing from static heuristics.
- Print should not be a separate universe. The same HTML should remain the source for both screen preview and PDF export.
- Hard rules deserve hard tools. Constraint solving is available for layouts where grid/flex is not expressive enough.
- Motion and taste need boundaries too. Kami and p5.js enter as distilled presets and sketch grammar, not as unbounded experiments copied from a private lab.

---

## Quick start

```bash
bun install
bun x playwright install chromium

bun tokens:build
bun metrics:build
bun typecheck
```

Try the main flows:

```bash
# Generate scale candidates
bun scale:gen

# Check a page fits the fixed canvas
bun measure:check -- ./pages/page.html

# Render HTML to PDF
bun print:render -- ./pages/page.html ./out.pdf
```

Try the new preset layers:

```ts
import { kamiPreset } from '@dash/kami';
import { createTileGrid, layoutTileFrame } from '@dash/p5-motion';

const pageColor = kamiPreset.colors.canvas;
const tiles = layoutTileFrame(createTileGrid(720, 960, 3, 3), 0.42);
```

---

## Architecture

```text
        ┌──────────────┐
        │  @dash/scale │──┐
        └──────────────┘  │
                          ▼
                  ┌──────────────┐
                  │ @dash/tokens │
                  └──────────────┘
          ▲                ▲
          │                │
  ┌──────────────┐  ┌──────────────┐
  │ @dash/metrics│  │  @dash/kami  │
  │  (capsize)   │  │  (preset)    │
  └──────────────┘  └──────────────┘
          ▲                ▲
          │                │
  ┌──────────────┐  ┌──────────────┐
  │@dash/measure │  │@dash/p5-motion│
  │ (CI gate)    │  │ (sketch API) │
  └──────────────┘  └──────────────┘
          ▲                ▲
          │                │
  ┌──────────────┐  ┌──────────────┐
  │ @dash/layout │  │ @dash/print  │
  │  (kiwi.js)   │  │  (paged.js)  │
  └──────────────┘  └──────────────┘
```

`@dash/tokens` is the source of truth. `@dash/scale` proposes or regenerates size systems. `@dash/kami` and `@dash/p5-motion` add taste and motion as reusable presets. The rest of the workspace either enforce, consume, or export that system.

---

## Packages

| Package | Responsibility | Core dependency |
|---|---|---|
| `@dash/tokens` | Emit CSS vars, ESM exports, and flat JSON from DTCG tokens | `style-dictionary` |
| `@dash/scale` | Generate type and space scales for fixed-canvas surfaces | `utopia-core` |
| `@dash/metrics` | Produce capsize helpers for baseline-correct text | `@capsizecss/core` |
| `@dash/kami` | Provide a Kami-inspired editorial document preset | none |
| `@dash/p5-motion` | Provide p5.js motion contracts and deterministic sketch helpers | peer `p5` |
| `@dash/measure` | Assert content fits a page without overflow | `playwright` |
| `@dash/layout` | Solve hard layout constraints | `@lume/kiwi` |
| `@dash/print` | Render HTML to PDF with paged media support | `pagedjs`, `playwright` |

Each package has its own README under [`packages/`](./packages).

---

## What Kami And P5 Add

`@dash/kami` gives the repo a document taste layer. It is useful when an agent needs to produce a one-pager, long report, letter, resume, portfolio, or slide deck that feels calm and finished: parchment canvas, ink-blue restraint, serif hierarchy, print-safe tags, and low-shadow editorial surfaces. It is inspired by [Kami](https://kami.tw93.fun/) by [@tw93](https://github.com/tw93), but this repo does not vendor Kami code or fonts.

`@dash/p5-motion` gives the repo a browser motion layer. It distills the private p5.js lab into public-safe primitives: tile grids, deterministic drift, reassembly loops, scan fields, weather-map pressure systems, and visual grammar for kinetic posters. It is for prototyping motion from DASH tokens and specs before deciding whether a piece belongs in a production renderer.

Together they let DASH cover three surfaces without changing the source of truth:

| Surface | Use this | Outcome |
|---|---|---|
| Static document | `@dash/kami` + `@dash/print` | polished PDF or deck-like HTML |
| Kinetic browser study | `@dash/p5-motion` | p5.js sketch with repeatable motion grammar |
| Fixed-canvas artifact | `@dash/tokens` + `@dash/measure` + `@dash/layout` | validated page that does not clip |

---

## Typical workflow

1. Update semantic values in `packages/tokens/src/tokens.json`.
2. Rebuild generated artifacts with `bun tokens:build`.
3. If typography changes, regenerate capsize helpers with `bun metrics:build`.
4. Validate real pages with `bun measure:check -- <html>`.
5. Export print output with `bun print:render -- <html> <pdf>`.

The intended operating model is simple: define once, validate on the real path, then export from the same HTML.

---

## Directory layout

```text
.
├── .github/workflows/ci.yml
├── packages/
│   ├── layout/
│   ├── kami/
│   ├── measure/
│   ├── metrics/
│   ├── p5-motion/
│   ├── print/
│   ├── scale/
│   └── tokens/
├── CONTRIBUTING.md
├── README.md
├── README-zh.md
└── package.json
```

---

## Status

What is ready:
- token build pipeline
- capsize CSS generation
- Kami-inspired editorial preset
- p5.js motion grammar utilities
- browser overflow checks
- constraint-solver scaffolding
- paged.js PDF export
- CI for install, build, and typecheck

What is intentionally still rough:
- `@dash/scale --write` is not implemented yet
- example pages are intentionally minimal and sanitized
- p5.js lab sources stay private until distilled into stable APIs
- print vendor assets are still expected to be managed by the consumer

---

## Hall of Fame

Special thanks to [@tw93](https://github.com/tw93). [Kami](https://github.com/tw93/kami) strongly shaped the document-aesthetic layer here, and tools like [Kaku](https://github.com/tw93/Kaku) and [Mole](https://github.com/tw93/Mole) have been part of the broader working environment that made this repo more useful in practice.

This section is attribution and gratitude, not a claim that upstream authors are responsible for this repository's code.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

High-level rule: keep changes small, reversible, and validated on a real page path whenever possible.

---

## License

MIT. See [LICENSE](./LICENSE).
