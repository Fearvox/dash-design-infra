# Creator P5 Sketch Route

This mutation routes a Creator Frontier Capsule into a deterministic p5.js motion sketch contract. It is for creators who need an organic generative visual direction they can preview, prove, and remix before any external p5 runtime or renderer saves media.

It is not a dashboard and not a raw media artifact. The output is a public-safe fixed-canvas preview board plus a generated frame-probe JSON file under ignored `.artifacts/`.

## Output

- Surface contract: [`examples/creator-p5-sketch.json`](../../examples/creator-p5-sketch.json)
- Preview board: [`examples/creator-p5-sketch.html`](../../examples/creator-p5-sketch.html)
- Validation command: `bun creator:p5-sketch-check`

## Mutation selected

| Field | Value |
|---|---|
| Candidate | `creator-p5-sketch-route` |
| Axis | `tool adapter` |
| Phenotype | capsule → `dash-flow-field` p5 contract + fixed-canvas preview + generated frame probes |
| Retention | example + script gate + CI route |
| Not promoted | new package primitive; the existing `@dash/p5-motion` helpers are enough for this slice |

## Why p5 now

The retained creator routes already cover poster, prompt DNA, motion storyboard, contact-sheet QA, social card, and repo-local skill packaging. The missing frontier job is a real creative-coding bridge: a creator wants to turn capsule memory into a generative sketch without losing the seed, proof path, or public boundary.

This route wins the current slice because it:

- uses the existing `@dash/p5-motion` flow-field primitive instead of adding a new renderer;
- creates a visible preview board and a machine-generated frame-probe file;
- names the exact p5 handoff boundary: DASH owns contracts, the consumer owns the p5 runtime and final media export;
- keeps raw generated images/video/audio out of git;
- gives future Remotion, Manim, TouchDesigner, and browser-demo adapters a concrete adapter contract to compete against.

## P5 adapter contract

1. Start from `examples/creator-frontier-capsule.json`.
2. Preserve intent, memory, grammar, blocked inputs, tool path, proof, and remix rule.
3. Select `flowFieldPresets.dashFlowField` as the grammar anchor.
4. Use a synthetic seed and deterministic frame probes before opening a p5 runtime.
5. Keep the fixed preview board at `1684x1191`; keep the sketch viewport contract at `800x1067`.
6. Save generated probe data only under ignored `.artifacts/`.

## Commands

```bash
bun creator:p5-sketch-check
bun p5:motion-check
bun measure:check -- examples/creator-p5-sketch.html
bun print:render -- examples/creator-p5-sketch.html /tmp/dash-creator-p5-sketch.pdf --canvas=1684x1191
bun security:scan
bun hackathon:score
```

## QA checks

- `bun creator:p5-sketch-check` validates the JSON contract, preview board, docs, package script, CI hook, mutation ledger, and public boundary.
- The same check imports `generateFlowField`, `traceFlowLine`, `flowColorForVelocity`, `createMotionTimeline`, and `validateMotionBudget` from `@dash/p5-motion`, then writes `.artifacts/creator-p5-sketch-frame.json`.
- `bun measure:check -- examples/creator-p5-sketch.html` proves the fixed preview board fits in Chromium.
- `bun print:render -- examples/creator-p5-sketch.html /tmp/dash-creator-p5-sketch.pdf --canvas=1684x1191` proves PDF export works.
- Browser visual QA confirms the adapter reads as a creator handoff, not as a generic dashboard.

## Failure modes

- The preview becomes a pretty static board but does not generate frame probes.
- The route imports p5 directly into the core package instead of keeping runtime ownership at the consumer edge.
- The example commits raw generated media, private prompts, local paths, provider logs, or account screenshots.
- The sketch loses capsule memory and becomes an unresumable texture.
- The adapter promotes a package primitive after one example instead of waiting for repeated wins.

## Public boundary

Allowed:

- synthetic p5 seed;
- public-safe capsule fields;
- DASH preset names and deterministic geometry helpers;
- generated HTML/CSS/SVG preview board;
- ignored `.artifacts` probe JSON.

Blocked:

- private creator source media;
- raw generated image, video, or audio output;
- local absolute source paths;
- API keys, cookies, tokens, passwords, provider logs;
- account screenshots, client analytics, private benchmark evidence.

## Remix rule

Change the seed, streamline density, timeline phase timing, accent color ramp, and caption memory line freely. Preserve the source capsule pointer, `dash-flow-field` preset anchor, blocked inputs, proof path, and no-raw-media rule.

## 中文摘要

这个 mutation 把 creator capsule 接到 p5.js：先用 `@dash/p5-motion` 生成确定性的 flow-field frame probes，再看固定画布 preview board，最后才交给外部 p5 runtime 渲染。它不是 dashboard，也不提交 raw media；保留为 example + script gate + CI route，不升级成新的 package primitive。
