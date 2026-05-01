<div align="center" id="top">
  <br />
  <img src="./docs/assets/dash-design-infra-architecture.png" width="720" alt="DASH Design Infra architecture" />
  <h1 align="center">DASH Design Infra</h1>
  <p align="center">
    <strong>Design infrastructure for agents that need to ship visual artifacts, not screenshots of good intentions.</strong>
    <br />
    Tokens, editorial defaults, p5.js motion grammar, fixed-canvas checks, and print export on one Bun path.
  </p>

  <p align="center">
    <a href="./README.md">English</a> · <a href="./README-zh.md">中文</a> · <a href="./AGENTS.md">Agent Guide</a> · <a href="./docs/WORKFLOW_INDEX.md">Workflow Index</a> · <a href="./docs/PUBLIC_CSO_AUDIT.md">CSO Audit</a>
  </p>

  <p align="center">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0f172a.svg?style=for-the-badge" />
    <img alt="Runtime: Bun" src="https://img.shields.io/badge/runtime-Bun-111827.svg?style=for-the-badge" />
    <img alt="Language: TypeScript" src="https://img.shields.io/badge/language-TypeScript-2563eb.svg?style=for-the-badge" />
    <img alt="Public boundary: audited" src="https://img.shields.io/badge/public_boundary-audited-14532d.svg?style=for-the-badge" />
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Fearvox/dash-design-infra/ci.yml?branch=main&label=CI&style=for-the-badge" />
  </p>

  <p align="center">
    <a href="#quick-start">Quick Start</a> ·
    <a href="#why-this-exists">Why</a> ·
    <a href="#use-cases">Use Cases</a> ·
    <a href="./docs/CREATOR_OS.md">Creator OS</a> ·
    <a href="./docs/CREATOR_EVOLUTION_ENGINE.md">Evolution Engine</a> ·
    <a href="#packages">Packages</a> ·
    <a href="#optimization-loop">Loop</a> ·
    <a href="#public-trust-boundary">Trust Boundary</a>
  </p>
  <br />
</div>

---

## Why This Exists

Agent-built visual work fails in the same boring ways.

It looks fine in chat, then clips in the browser. It exports a PDF with broken spacing. It uses six different spacing systems. The motion sketch is cool, but nobody can reuse it. The final video works on one laptop and dies when someone else tries to compress it.

`dash-design-infra` is the layer underneath the artifact:

- design tokens that keep color, type, spacing, and page geometry in one place;
- document defaults that make one-pagers and reports feel intentionally typeset;
- p5.js motion presets that turn experiments into named grammar;
- browser measurement so fixed-canvas work fails before the client sees it;
- print/PDF export that uses the same HTML path;
- public-safe workflow docs for motion and video delivery.

This is not a theme pack. It is the boring machinery that makes designed output survive contact with reality.

<p align="right"><a href="#top">back to top</a></p>

## Quick Start

```bash
bun install
bun x playwright install chromium

bun tokens:build
bun metrics:build
bun typecheck
bun docs:links
bun security:scan
bun hackathon:score
```

Check the public fixed-canvas path:

```bash
bun measure:check -- examples/one-pager.html
bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191
```

Use the motion helpers:

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

Agents should start with [`AGENTS.md`](./AGENTS.md). Humans can start here.

<p align="right"><a href="#top">back to top</a></p>

## Use Cases

If you are an agent deciding which path to run, start with the [`Workflow Index`](./docs/WORKFLOW_INDEX.md). It maps each artifact job to an entry file, package layer, command path, QA gate, and public boundary.

| You need to make | Start with | What survives |
|---|---|---|
| Creator-facing frontier visual | [`Creator Frontier Capsule`](./usecases/creator/creator-frontier-capsule.md) | A compact creative memory unit: intent, grammar, surface, proof, and remix rule |
| Creator poster surface | [`Creator Poster Surface Route`](./usecases/creator/creator-poster-surface.md) | A capsule routed into a measured fixed-canvas poster with PDF proof path |
| One-page brief or report | [`examples/one-pager.html`](./examples/one-pager.html) | HTML that measures correctly and exports without surprise clipping |
| Editorial deck-like artifact | [`@dash/kami`](./packages/kami) | Warm page defaults, stable hierarchy, print-safe tags |
| Kinetic poster | [`@dash/p5-motion`](./packages/p5-motion) | Named p5.js motion grammar instead of one-off sketch soup |
| Archive/evidence visual | [`Electric Archive`](./usecases/p5js/electric-archive.md) | Split archive/signal surface for memory, retrieval, and handoff stories |
| Weather-style evidence report | [`Memory Weather Report`](./usecases/p5js/weather-report.md) | Pressure maps, fronts, radar texture, and forecast cards for complex signals |
| Dense rendered motion piece | [`Windburn Render Workflow`](./usecases/video/windburn-render-workflow.md) | Chunked render, contact-sheet QA, bitrate-controlled WeChat delivery |
| Visual research board | [`Refero Visual Research`](./usecases/visual-research/refero-visual-research.md) | Real-interface study converted into a synthetic, measurable pattern board |
| Skill / prompt optimization loop | [`Darwin Skill Ratchet`](./usecases/visual-research/darwin-skill-ratchet.md) | External skill ideas vetted, abstracted, measured, and kept only if they improve the public workflow |
| Hard-constrained page | [`@dash/layout`](./packages/layout) + [`@dash/measure`](./packages/measure) | Layout rules that can be solved, then checked in a real browser |

<p align="right"><a href="#top">back to top</a></p>

## Architecture

The source of truth flows downward.

```text
Tokens / scale / metrics
        │
        ├── Kami document taste ───────> reports, one-pagers, deck-like pages
        │
        ├── p5 motion grammar ─────────> posters, archive fields, weather maps
        │
        └── layout + measure + print ──> fixed-canvas checks and PDF output
```

The public docs and usecases explain the work. The packages provide the reusable pieces. The verification commands prove the output path.

<p align="right"><a href="#top">back to top</a></p>

## Packages

| Package | Job | Core dependency |
|---|---|---|
| [`@dash/tokens`](./packages/tokens) | Colors, type, spacing, page geometry, and motion values | `style-dictionary` |
| [`@dash/scale`](./packages/scale) | Type and spacing scale generation, including `--write` | `utopia-core` |
| [`@dash/metrics`](./packages/metrics) | Baseline-safe text metrics | `@capsizecss/core` |
| [`@dash/kami`](./packages/kami) | Editorial defaults for reports, letters, resumes, portfolios, and decks | none |
| [`@dash/p5-motion`](./packages/p5-motion) | p5.js motion presets and deterministic helpers | peer `p5` |
| [`@dash/measure`](./packages/measure) | Browser overflow checks for fixed-canvas HTML | `playwright` |
| [`@dash/layout`](./packages/layout) | Constraint layout helpers for hard geometry | `@lume/kiwi` |
| [`@dash/print`](./packages/print) | HTML-to-PDF rendering with paged-media support | `pagedjs`, `playwright` |

<p align="right"><a href="#top">back to top</a></p>

## Optimization Loop

The hackathon loop is now explicit: review one surface, apply one narrow fix, score it, push it through CI, merge only when green, then repeat. The operating model is documented in [`docs/HACKATHON_SDD_LOOP.md`](./docs/HACKATHON_SDD_LOOP.md), with the ClawSweeper reference map in [`docs/CLAW_SWEEPER_REFERENCE.md`](./docs/CLAW_SWEEPER_REFERENCE.md). External skill ideas now use the [`Darwin Skill Ratchet`](./usecases/visual-research/darwin-skill-ratchet.md): vet first, extract the pattern, render a synthetic board, measure it, and keep only score-backed improvements. Creator-facing work starts with [`Creator OS`](./docs/CREATOR_OS.md) and a [`Creator Frontier Capsule`](./usecases/creator/creator-frontier-capsule.md): idea → capsule → artifact → proof → remix trail. Darwin-style work uses the [`Creator Evolution Engine`](./docs/CREATOR_EVOLUTION_ENGINE.md): observe → mutate → render → evaluate → select → retain → regress. This is self-evolution machinery, not a dashboard.

The local scoreboard proxy is:

```bash
bun hackathon:score
```

It is blunt on purpose: if a loop cannot improve public clarity, verification, installability, or boundary safety, it should not consume the next 30 minutes.

<p align="right"><a href="#top">back to top</a></p>

## Public Trust Boundary

This repo is public-facing, so the boundary is explicit.

| Surface | Status |
|---|---|
| Private local paths | scanned, blocked by policy |
| Raw source video/audio | intentionally excluded |
| Private client text | intentionally excluded |
| Secrets and env files | ignored, scanned, not committed |
| Generated media | excluded unless deliberately small public preview |
| Dependency audit | `bun audit --audit-level high`, currently clean |
| Markdown link check | `bun docs:links`, currently clean |
| Public-boundary scan | `bun security:scan`, currently clean |
| Creator capsule check | `bun creator:capsule-check`, currently clean |
| Creator evolution check | `bun creator:evolution-check`, currently clean |
| Creator mutation check | `bun creator:mutation-check`, currently clean |
| Creator poster check | `bun creator:poster-check`, currently clean |
| Hackathon score | `bun hackathon:score`, currently maxed |
| Type safety | `bun typecheck`, currently green |

Read the current public-facing security posture in [`docs/PUBLIC_CSO_AUDIT.md`](./docs/PUBLIC_CSO_AUDIT.md). Report security issues through [`SECURITY.md`](./SECURITY.md).

<p align="right"><a href="#top">back to top</a></p>

## Agent Entry Point

[`AGENTS.md`](./AGENTS.md) is the contract for future agents:

- what the repo provides;
- default verification commands;
- what must never be committed;
- how to add a public workflow;
- the quality bar for docs and examples.

The hackathon operating target lives in [`docs/HACKATHON_GOAL.md`](./docs/HACKATHON_GOAL.md).

<p align="right"><a href="#top">back to top</a></p>

## Directory Layout

```text
.
├── AGENTS.md
├── docs/
│   ├── HACKATHON_GOAL.md
│   ├── PUBLIC_CSO_AUDIT.md
│   └── assets/
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
│   ├── p5js/
│   └── video/
├── README.md
├── README-zh.md
└── package.json
```

<p align="right"><a href="#top">back to top</a></p>

## Status

Ready now:

- token build pipeline;
- `@dash/scale` generation and `--write`;
- capsize CSS generation;
- Kami-inspired editorial preset;
- p5.js motion presets, including Electric Archive and Memory Weather Report;
- video workflow notes for chunked render QA and delivery compression;
- browser overflow checks;
- constraint-solver layout helpers;
- paged.js PDF export;
- public example and usecase docs;
- CI for install, token build, metrics build, typecheck, dependency audit, docs link check, public-boundary scan, and hackathon score.

Still intentionally private or external:

- raw p5.js lab sources;
- source reference videos and frames;
- private project writing and client material;
- print vendor assets managed by consuming projects.

<p align="right"><a href="#top">back to top</a></p>

## Hall of Fame

Special thanks to [@tw93](https://github.com/tw93). [Kami](https://github.com/tw93/kami) shaped the document-aesthetic layer here, and tools like [Kaku](https://github.com/tw93/Kaku) and [Mole](https://github.com/tw93/Mole) have been part of the working environment that made this repo more useful in practice.

This is gratitude and attribution, not a claim that upstream authors are responsible for this repository's code.

<p align="right"><a href="#top">back to top</a></p>

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

High-level rule: keep changes small, reversible, public-safe, and verified on a real path.

## License

MIT. See [LICENSE](./LICENSE).
