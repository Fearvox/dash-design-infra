# DASH Design Infra Agent Guide

This repo is for agents that need to create visual artifacts that survive real output paths: browser measurement, fixed canvas constraints, motion sketches, and print/PDF export.

Start here before editing.

## What This Repo Provides

- `@dash/tokens`: shared colors, spacing, type, page geometry, and motion values.
- `@dash/scale`: generated type and spacing scales.
- `@dash/metrics`: baseline-safe text metrics.
- `@dash/kami`: warm editorial document defaults.
- `@dash/p5-motion`: reusable p5.js motion grammar.
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
bun docs:links
bun audit --audit-level high
bun security:scan
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

If you change code, run typecheck. If you change docs, inspect links and paths. If you add a workflow, include QA.
