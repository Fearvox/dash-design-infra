# dash-design-infra

Public, sanitized mirror of the DASH design infrastructure.

This workspace packages the reusable parts of a fixed-canvas editorial system:

```text
tokens   → style-dictionary — design tokens to CSS / JS / flat JSON
scale    → utopia-core — type + space scale generation
metrics  → capsize — glyph-level baseline alignment
measure  → playwright — overflow and clipping checks
layout   → kiwi.js — constraint-based page layout
print    → paged.js — HTML to print-ready PDF
```

## What is included

- Reusable workspace packages under `packages/`
- Token source files and generated token artifacts
- Build scripts, typecheck config, and package-level docs
- Public-facing examples of the design-system architecture

## What is intentionally omitted

- Client decks, proposal PDFs, videos, and business collateral
- Private local filesystem references
- Project-specific working files that only made sense in the original environment

## Dependency graph

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

`@dash/tokens` is the source of truth. `@dash/scale` proposes or regenerates size systems. The other packages consume or validate that system.

## Quick start

```bash
bun install
bun tokens:build
bun metrics:build
bun typecheck
```

For the browser-based packages:

```bash
bun x playwright install chromium
```

## Root scripts

| Script | What it does |
|---|---|
| `bun tokens:build` | Compile tokens to CSS vars, ESM, and flat JSON |
| `bun scale:gen` | Print the generated type and space scales |
| `bun metrics:build` | Generate reusable capsize CSS helpers |
| `bun metrics:extract` | Print the scaffold flow for extracting metrics from your own font files |
| `bun measure:check -- <html>` | Assert a page fits its fixed canvas budget |
| `bun print:render -- <html> <pdf>` | Render HTML to PDF through paged.js + Chromium |
| `bun typecheck` | Typecheck all workspaces |
| `bun clean` | Remove build outputs and installed dependencies |

## Operating model

- `tokens` owns semantic values: color, type, spacing, page geometry, motion
- `scale` owns ratio experiments and line-height snapping rules
- `metrics` owns character-level alignment for the chosen fonts
- `measure` catches overflow regressions in a real browser
- `layout` expresses hard layout constraints that CSS alone cannot guarantee
- `print` keeps HTML as the single source of truth for PDF output

## License

MIT. See [LICENSE](./LICENSE).
