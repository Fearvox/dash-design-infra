# dash-design-infra

Fixed-canvas editorial design infrastructure on Bun.

Design tokens, type scale, baseline metrics, overflow gates, constraint layout, and HTML-to-PDF output for one-pagers, decks, and print-facing surfaces that need to stay visually exact.

[English](./README.md) · [中文](./README-zh.md)

![License: MIT](https://img.shields.io/badge/license-MIT-0f172a.svg)
![Bun](https://img.shields.io/badge/runtime-Bun-111827.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-2563eb.svg)
![Fixed Canvas](https://img.shields.io/badge/layout-fixed--canvas-14532d.svg)
![CI](https://img.shields.io/github/actions/workflow/status/Fearvox/dash-design-infra/ci.yml?branch=main&label=CI)

[Quick start](#quick-start) · [Architecture](#architecture) · [Packages](#packages) · [Workflow](#typical-workflow) · [Contributing](./CONTRIBUTING.md)

---

## What this is

`dash-design-infra` is a Bun workspace for deterministic editorial surfaces.

It treats a design system as an engineering pipeline instead of a loose pile of CSS:

| Layer | What it owns | Why it exists |
|---|---|---|
| `@dash/tokens` | color, type, spacing, page geometry, motion | one source of truth |
| `@dash/scale` | size ratios and line-height rules | repeatable scale generation |
| `@dash/metrics` | font metrics and cap-line alignment | real baseline precision |
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
         ▲                 ▲                ▲                 ▲
         │                 │                │                 │
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ metrics  │     │ measure  │     │  layout  │     │  print   │
  │(capsize) │     │(CI gate) │     │(kiwi.js) │     │(paged.js)│
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
```

`@dash/tokens` is the source of truth. `@dash/scale` proposes or regenerates size systems. The rest of the workspace either enforce or consume that system.

---

## Packages

| Package | Responsibility | Core dependency |
|---|---|---|
| `@dash/tokens` | Emit CSS vars, ESM exports, and flat JSON from DTCG tokens | `style-dictionary` |
| `@dash/scale` | Generate type and space scales for fixed-canvas surfaces | `utopia-core` |
| `@dash/metrics` | Produce capsize helpers for baseline-correct text | `@capsizecss/core` |
| `@dash/measure` | Assert content fits a page without overflow | `playwright` |
| `@dash/layout` | Solve hard layout constraints | `@lume/kiwi` |
| `@dash/print` | Render HTML to PDF with paged media support | `pagedjs`, `playwright` |

Each package has its own README under [`packages/`](./packages).

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
│   ├── measure/
│   ├── metrics/
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
- browser overflow checks
- constraint-solver scaffolding
- paged.js PDF export
- CI for install, build, and typecheck

What is intentionally still rough:
- `@dash/scale --write` is not implemented yet
- example pages are not bundled in this public repo
- print vendor assets are still expected to be managed by the consumer

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

High-level rule: keep changes small, reversible, and validated on a real page path whenever possible.

---

## License

MIT. See [LICENSE](./LICENSE).
