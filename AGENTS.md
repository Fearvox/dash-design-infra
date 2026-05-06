# DASH Design Infra Agent Guide

This repo is for agents that need to create visual artifacts that survive real output paths: browser measurement, fixed canvas constraints, motion sketches, and print/PDF export.

Start here before editing.

## What This Repo Provides

- `@dash/tokens`: shared colors, spacing, type, page geometry, and motion values.
- `@dash/scale`: generated type and spacing scales.
- `@dash/metrics`: baseline-safe text metrics.
- `@dash/kami`: warm editorial document defaults.
- `@dash/p5-motion`: reusable p5.js motion grammar.
- `bun creator:touchdesigner-tox-check` validates Creator TouchDesigner TOX handoffs without opening local ports.
- `@dash/measure`: browser-based overflow checks.
- `@dash/layout`: constraint layout helpers.
- `@dash/print`: HTML-to-PDF rendering path.
- `usecases/`: public-safe workflow notes and motion grammar docs.
- `docs/WORKFLOW_INDEX.md`: routing table for document, p5, video, hardening, and hackathon-loop workflows.

## Default Commands

```bash
bun install
bun tokens:build
bun metrics:build
bun typecheck
bun p5:motion-check
bun docs:links
bun audit --audit-level high
bun security:scan
bun creator:prompt-dna-check
bun creator:social-card-check
bun creator:p5-sketch-check
bun creator:remotion-scene-check
bun creator:manim-scene-check
bun creator:touchdesigner-tox-check
bun creator:skill-package-check
bun hackathon:score
```

For fixed-canvas HTML checks:

```bash
bun measure:check -- examples/one-pager.html
bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191
```

## Public Boundary

Do not commit:

- private client text;
- local machine paths;
- raw source videos or audio;
- internal lab dumps;
- generated media files unless they are deliberately small public previews;
- secrets or API keys.

Usecase docs should keep reusable production discipline, not private source material.

## How To Add A Workflow

A good workflow doc includes:

1. What problem it solves.
2. What output it produces.
3. The layer model or production contract.
4. Commands or pseudocode that another agent can run.
5. QA checks.
6. Failure modes.
7. Public boundary.
8. A short Chinese summary if the workflow is important.

Use `usecases/video/windburn-render-workflow.md` as the current model for high-density motion/video work.

## Quality Bar

No goblins.

That means:

- no vague docs that sound useful but cannot be executed;
- no broken links;
- no examples that only work on one private machine;
- no default-looking visual systems;
- no claims without verification output.

For public-facing changes, also update or check [`docs/PUBLIC_CSO_AUDIT.md`](./docs/PUBLIC_CSO_AUDIT.md) and [`SECURITY.md`](./SECURITY.md).

For hackathon loop work, follow [`docs/HACKATHON_SDD_LOOP.md`](./docs/HACKATHON_SDD_LOOP.md). ClawSweeper-derived operating patterns are mapped in [`docs/CLAW_SWEEPER_REFERENCE.md`](./docs/CLAW_SWEEPER_REFERENCE.md). For artifact routing, start with [`docs/WORKFLOW_INDEX.md`](./docs/WORKFLOW_INDEX.md).

For external skill/prompt references, use [`usecases/visual-research/darwin-skill-ratchet.md`](./usecases/visual-research/darwin-skill-ratchet.md): vet the source first, extract reusable grammar, create synthetic public artifacts, measure them, and keep only verified improvements.

For creator-facing visual work, start with [`docs/CREATOR_OS.md`](./docs/CREATOR_OS.md) and [`usecases/creator/creator-frontier-capsule.md`](./usecases/creator/creator-frontier-capsule.md). The default unit is `idea -> capsule -> artifact -> proof -> remix trail`; keep frontier tools as adapters around a minimal core.

For Darwin-style requests, use [`docs/CREATOR_EVOLUTION_ENGINE.md`](./docs/CREATOR_EVOLUTION_ENGINE.md). Darwin means self-evolution: observe, mutate, render, evaluate, select, retain, regress. Use `bun creator:mutation-check` when comparing candidate mutations. For the retained poster surface route, use `bun creator:poster-check` and `examples/creator-poster-surface.html`. For prompt DNA model adapters, use `bun creator:prompt-dna-check` and `examples/creator-prompt-dna-adapter.html`; keep raw generated media out of git. For crop-safe social previews, use `bun creator:social-card-check` and `examples/creator-social-card.html` before platform posting. It does not mean "make a dashboard" unless the dashboard directly controls the next mutation.

For repo-local creator skill packaging, use [`skill-packages/creator-workflow/SKILL.md`](./skill-packages/creator-workflow/SKILL.md) and `bun creator:skill-package-check`. Do not publish or sync the skill package externally unless a separate reviewed release issue authorizes that path.

For p5.js generative work, use [`docs/p5-motion-preset-spec-template.md`](./docs/p5-motion-preset-spec-template.md), [`docs/p5js-frontier-research.md`](./docs/p5js-frontier-research.md), and `bun p5:motion-check`. The public contract now covers timeline grammar, flow fields, kinetic type, data-weather mapping, and layer composition; raw reference media still stays out of git. For creator capsule → p5 sketch adapters, start with [`usecases/creator/creator-p5-sketch.md`](./usecases/creator/creator-p5-sketch.md) and `bun creator:p5-sketch-check`; keep the p5 runtime and rendered media outside the core repo until a public-safe export path is separately reviewed. For Creator Remotion Scene adapters, start with [`usecases/creator/creator-remotion-scene.md`](./usecases/creator/creator-remotion-scene.md), `examples/creator-remotion-scene.html`, and `bun creator:remotion-scene-check`; keep Remotion/React rendering, codecs, and rendered video outside the core repo. For Creator Manim Scene adapters, start with [`usecases/creator/creator-manim-scene.md`](./usecases/creator/creator-manim-scene.md), `examples/creator-manim-scene.html`, and `bun creator:manim-scene-check`; keep Manim Community Edition, renderer caches, and rendered MP4 output outside the core repo. For Creator TouchDesigner TOX adapters, start with [`usecases/creator/creator-touchdesigner-tox.md`](./usecases/creator/creator-touchdesigner-tox.md), `examples/creator-touchdesigner-tox.html`, and `bun creator:touchdesigner-tox-check`; keep TouchDesigner/twozero execution local-operator-only, do not open ports in CI, and keep `.tox/.toe`, screenshots, raw media, and local paths out of git.

If you change code, run typecheck. If you change docs, inspect links and paths. If you add a workflow, include QA.
