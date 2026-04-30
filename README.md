<div align="center" id="top">
  <h1 align="center">DASH Design Infra</h1>
  <p align="center">
    A small public toolkit for making agent-built pages look intentional, measure correctly, and export cleanly.
    <br />
    <strong>Kami document taste, p5.js motion grammar, fixed-canvas checks, and HTML-to-PDF on one Bun path.</strong>
  </p>

  <p align="center">
    <a href="./README.md">English</a> · <a href="./README-zh.md">中文</a>
  </p>

  <p align="center">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0f172a.svg?style=for-the-badge" />
    <img alt="Runtime: Bun" src="https://img.shields.io/badge/runtime-Bun-111827.svg?style=for-the-badge" />
    <img alt="Language: TypeScript" src="https://img.shields.io/badge/language-TypeScript-2563eb.svg?style=for-the-badge" />
    <img alt="Fixed canvas" src="https://img.shields.io/badge/layout-fixed_canvas-14532d.svg?style=for-the-badge" />
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Fearvox/dash-design-infra/ci.yml?branch=main&label=CI&style=for-the-badge" />
  </p>

  <p align="center">
    <a href="#quick-start">Quick Start</a> ·
    <a href="#what-this-is">What This Is</a> ·
    <a href="#use-cases">Use Cases</a> ·
    <a href="#architecture">Architecture</a> ·
    <a href="#packages">Packages</a> ·
    <a href="#hall-of-fame">Hall of Fame</a>
  </p>
</div>

---

## Contents

- [What This Is](#what-this-is)
- [Use Cases](#use-cases)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Packages](#packages)
- [What Kami And P5 Add](#what-kami-and-p5-add)
- [Public Examples](#public-examples)
- [Status](#status)
- [Hall of Fame](#hall-of-fame)

---

## What This Is

`dash-design-infra` is the layer we use when a page has to look designed, survive a browser check, and still export as a clean PDF.

It is not a theme pack. It is the practical stuff around a designed surface: tokens, type scale, baseline metrics, Kami-inspired document defaults, p5.js motion presets, overflow checks, layout constraints, and print rendering.

The repo is public because these pieces are useful outside our own work. The private experiments stay out. The parts that made it into this repo are the ones we can name, reuse, test, and explain.

<p align="right"><a href="#top">back to top</a></p>

## Use Cases

| You want to make | Use | What you get | Start here |
|---|---|---|---|
| A one-page brief or report | `@dash/tokens`, `@dash/kami`, `@dash/measure`, `@dash/print` | HTML that reads well and exports to PDF without surprise clipping | [`examples/one-pager.html`](./examples/one-pager.html) |
| A deck-like artifact | `@dash/kami`, `@dash/scale`, `@dash/print` | Calm editorial pages with stable spacing and print-safe hierarchy | [`packages/kami`](./packages/kami) |
| A kinetic poster | `@dash/p5-motion` | p5.js motion grammar that can be reused instead of rewritten per sketch | [`usecases/p5js`](./usecases/p5js) |
| An archive/evidence visual | Electric Archive preset | A split white/cobalt scan surface for memory, retrieval, and handoff stories | [`Electric Archive`](./usecases/p5js/electric-archive.md) |
| A weather-style evidence report | Memory Weather Report preset | Pressure maps, fronts, radar texture, and forecast cards for complex signals | [`Weather Report`](./usecases/p5js/weather-report.md) |
| A page with hard constraints | `@dash/layout`, `@dash/measure` | Layout rules that can be solved and then checked in a real browser | [`packages/layout`](./packages/layout) |

<p align="right"><a href="#top">back to top</a></p>

## Quick Start

```bash
bun install
bun x playwright install chromium

bun tokens:build
bun metrics:build
bun typecheck
```

Try the public page path:

```bash
bun measure:check -- examples/one-pager.html
bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191
```

Try the motion helpers:

```ts
import { createMotionTimeline, createTileGrid, layoutTileFrame, p5MotionPresets } from '@dash/p5-motion';

const tiles = createTileGrid(720, 960, 3, 3);
const frame = layoutTileFrame(tiles, 0.42);
const timeline = createMotionTimeline(p5MotionPresets.electricArchive.timeline);
const state = timeline.atFrame(42);

console.log(p5MotionPresets.memoryWeatherReport.layers);
console.log(frame[0]);
console.log(state.phases.scanExposure.eased);
```

<p align="right"><a href="#top">back to top</a></p>

## Architecture

<p align="center">
  <img src="./docs/assets/dash-design-infra-architecture.png" width="620" alt="DASH Design Infra architecture diagram" />
</p>

<p align="center">
  <sub>Diagram source lives in <a href="./docs/assets/dash-design-infra-architecture.svg">docs/assets/dash-design-infra-architecture.svg</a> and was generated with <a href="https://github.com/yizhiyanhua-ai/fireworks-tech-graph">fireworks-tech-graph</a> style 6.</sub>
</p>

The short version: public docs and examples describe the work; tokens, scale, and metrics define the design source; Kami and p5-motion turn that source into document and motion language; measure, layout, and print prove the result on the real path.

<p align="right"><a href="#top">back to top</a></p>

## Packages

| Package | Plain-English job | Core dependency |
|---|---|---|
| `@dash/tokens` | Keep colors, type, spacing, page geometry, and motion values in one place | `style-dictionary` |
| `@dash/scale` | Generate type and spacing scales, including `--write` when the generated values should update token output | `utopia-core` |
| `@dash/metrics` | Make text sit on the baseline instead of merely looking close | `@capsizecss/core` |
| `@dash/kami` | Give reports, letters, resumes, portfolios, and decks a warm editorial default | none |
| `@dash/p5-motion` | Turn visual references into named p5.js motion presets and deterministic helpers | peer `p5` |
| `@dash/measure` | Open HTML in a browser and fail when content overflows the canvas | `playwright` |
| `@dash/layout` | Solve hard layout rules that are awkward to express with CSS alone | `@lume/kiwi` |
| `@dash/print` | Render the same HTML path to PDF with paged-media support | `pagedjs`, `playwright` |

Each package has its own README under [`packages/`](./packages).

<p align="right"><a href="#top">back to top</a></p>

## What Kami And P5 Add

`@dash/kami` gives the repo a document taste layer. When an agent needs to produce a one-pager, report, letter, resume, portfolio, or deck, Kami gives it a calmer default: warm canvas, ink-blue restraint, serif hierarchy, printable tags, and low-shadow editorial surfaces. It is inspired by [Kami](https://kami.tw93.fun/) by [@tw93](https://github.com/tw93), but this repo does not vendor Kami code or fonts.

`@dash/p5-motion` gives the repo a motion layer. It distills our p5.js lab into public-safe presets: tile grids, deterministic drift, reassembly loops, scan fields, archive posters, and weather-map evidence systems. It is for prototyping motion from shared design language before deciding whether a sketch should become production code.

Together they let the repo cover three different outputs without changing the source of truth:

| Output | Typical stack | Result |
|---|---|---|
| Static document | `@dash/kami` + `@dash/print` | A finished PDF or deck-like HTML page |
| Motion study | `@dash/p5-motion` | A p5.js sketch with reusable motion grammar |
| Fixed-canvas artifact | `@dash/tokens` + `@dash/measure` + `@dash/layout` | A checked page that does not clip |

<p align="right"><a href="#top">back to top</a></p>

## Public Examples

- [`examples/one-pager.html`](./examples/one-pager.html) is the small HTML page used for measurement and print checks.
- [`usecases/p5js/electric-archive.md`](./usecases/p5js/electric-archive.md) shows the Electric Archive poster grammar.
- [`usecases/p5js/weather-report.md`](./usecases/p5js/weather-report.md) shows the Memory Weather Report grammar.

The examples are intentionally sanitized. They show the design infrastructure without shipping private client text, raw lab files, or internal paths.

<p align="right"><a href="#top">back to top</a></p>

## Directory Layout

```text
.
├── docs/assets/
├── examples/
├── packages/
│   ├── kami/
│   ├── layout/
│   ├── measure/
│   ├── metrics/
│   ├── p5-motion/
│   ├── print/
│   ├── scale/
│   └── tokens/
├── usecases/
│   └── p5js/
├── README.md
├── README-zh.md
└── package.json
```

<p align="right"><a href="#top">back to top</a></p>

## Status

Ready now:

- token build pipeline
- `@dash/scale` generation and `--write`
- capsize CSS generation
- Kami-inspired editorial preset
- p5.js motion presets, including Electric Archive and Memory Weather Report
- browser overflow checks
- constraint-solver layout helpers
- paged.js PDF export
- public example and usecase docs
- CI for install, token build, metrics build, and typecheck

Still intentionally private or external:

- raw p5.js lab sources
- source reference videos and frames
- private project writing and client material
- print vendor assets managed by consuming projects

<p align="right"><a href="#top">back to top</a></p>

## Hall of Fame

Special thanks to [@tw93](https://github.com/tw93). [Kami](https://github.com/tw93/kami) shaped the document-aesthetic layer here, and tools like [Kaku](https://github.com/tw93/Kaku) and [Mole](https://github.com/tw93/Mole) have been part of the working environment that made this repo more useful in practice.

This section is gratitude and attribution, not a claim that upstream authors are responsible for this repository's code.

<p align="right"><a href="#top">back to top</a></p>

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

High-level rule: keep changes small, reversible, and verified on a real page path whenever possible.

## License

MIT. See [LICENSE](./LICENSE).
