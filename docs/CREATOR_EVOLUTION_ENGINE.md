# Creator Evolution Engine

This is the Darwin layer Nolan meant: not a dashboard, not a pretty board, and not a static gallery.

DASH should self-evolve creator workflows. The repo stays minimal because every new primitive must survive selection pressure before it becomes package code.

```text
observe -> propose mutations -> render candidates -> evaluate -> select -> retain -> regress
```

## Core idea

A creator workflow is treated like an organism:

| Darwin term | DASH meaning |
|---|---|
| population | competing workflow/tool-adapter candidates |
| mutation | one narrow change to schema, prompt DNA, adapter, layout, proof, or command |
| phenotype | the actual rendered artifact or runnable workflow |
| fitness | creator-usefulness score backed by commands and visual QA |
| selection | keep the candidate that improves usefulness without growing the core |
| retention | promote repeated winners into docs/scripts/packages |
| regression | prove the winner did not break existing surfaces |

The key is pressure. A mutation does not count because it sounds clever. It counts only if it helps creators make, verify, or remix something better.

## Evolution loop

1. **Observe**
   - Inspect a real creator job, failed render, friction point, or repeated agent move.
   - Store only the public-safe pattern, not private source material.

2. **Generate mutations**
   - Create 3-5 small candidates.
   - Change exactly one dimension per candidate: surface, grammar, proof, adapter, command, or schema.
   - Do not add a package until repeated examples prove the primitive.

3. **Render phenotypes**
   - Every candidate needs a visible artifact or executable workflow.
   - Acceptable phenotypes: HTML board, p5 sketch, contact sheet, PDF, Remotion/Manim render, TouchDesigner screenshot/tox note, skill prompt pack.

4. **Evaluate fitness**
   - Score with creator-facing criteria, not vanity metrics:
     - Does it reduce time-to-first-artifact?
     - Does it preserve creative memory?
     - Does it make remix safer?
     - Does it provide proof before publish?
     - Does it avoid private leakage?
     - Does it keep the core smaller than the edge?

5. **Select**
   - Keep the smallest candidate that improves the creator job.
   - Reject dashboard-only output unless the dashboard directly changes creator behavior.

6. **Retain**
   - If a pattern wins once, keep it as an example or usecase.
   - If it wins repeatedly, add a script.
   - If scripts repeat across surfaces, promote a package primitive.
   - If an agent move repeats, promote a skill.

7. **Regress**
   - Run score gates and visual/browser proof.
   - A new frontier adapter must not break document, canvas, p5, video, creator capsule, or public-boundary gates.

## Minimal file contract

A self-evolution contribution needs only this:

```text
examples/creator-evolution-loop.json
  one public-safe evolution runbook

scripts/creator-evolution-check.ts
  machine gate for the runbook and doctrine

docs/CREATOR_EVOLUTION_ENGINE.md
  the operating model
```

Everything else is optional until the loop proves it deserves more structure. The first retained operational layer is the mutation candidate ledger: `examples/creator-mutation-candidates.json` plus `bun creator:mutation-check`.

## Retained mutations

- [`poster-surface-route`](../usecases/creator/creator-poster-surface.md): first actual creator surface mutation; converts the creator capsule into a measured/printable poster proof while preserving intent, memory, boundary, proof, and remix rule.
- [`adapter-prompt-dna-route`](../usecases/creator/creator-prompt-dna-adapter.md): first frontier model adapter mutation; preserves prompt DNA and preview policy without committing raw generated media.
- [`creator-motion-storyboard-route`](../usecases/creator/creator-motion-storyboard.md): bridge from capsule memory to video direction; keeps motion as a six-frame fixed-canvas contract until contact-sheet QA exists.
- [`creator-social-card-route`](../usecases/creator/creator-social-card.md): post-ready social/export mutation; turns capsule memory into a crop-safe 1200x630 card with measure, print, browser QA, and no raw media.
- [`creator-p5-sketch-route`](../usecases/creator/creator-p5-sketch.md): creative-coding adapter mutation; turns capsule memory into deterministic `dash-flow-field` frame probes and a fixed preview before any p5 runtime or raw rendered media.
- [`creator-remotion-scene-route`](../usecases/creator/creator-remotion-scene.md): timeline-code adapter mutation; turns capsule memory into a generated ignored Remotion TSX composition stub plus fixed-canvas proof before any Remotion runtime or rendered video.
- [`creator-manim-scene-route`](../usecases/creator/creator-manim-scene.md): explainer-scene adapter mutation; turns capsule memory into a generated ignored Manim Python scene stub plus fixed-canvas proof before any renderer dependency or MP4 output.
- [`creator-touchdesigner-tox-route`](../usecases/creator/creator-touchdesigner-tox.md): live-visual-network adapter mutation; turns capsule memory into generated ignored TouchDesigner topology/twozero safety artifacts plus fixed-canvas proof before any local port, screenshot, `.tox/.toe`, raw media, or live TD connection.
- [`creator-browser-demo-route`](../usecases/creator/creator-browser-demo.md): browser-native prototype mutation; turns capsule memory into a self-contained clickable local HTML phenotype with interaction smoke, fixed-canvas proof, and deploy rollback boundary before any backend, analytics, screenshot, hosting config, or public URL.
- [`creator-pdf-zine-route`](../usecases/creator/creator-pdf-zine.md): printable process-surface mutation; turns capsule memory into a six-panel one-sheet HTML/PDF zine with measure, print, browser QA, and no raw media or private workshop notes.
- [`creator-vision-qa-standardization`](../scripts/creator-touchdesigner-tox-check.ts): cross-surface proof mutation (PRs #30-#42); extends every retained creator route with standardized browser DOM/vision QA evidence (provider-fallback pattern, needle-aligned .artifacts QA, real browser_console DOM verification) so autonomous Darwin runs produce verifiable visual proof across all 10 surfaces without requiring multimodal vision API support.
- [`creator-regression-orchestrator-route`](../scripts/creator-regression-check.ts): unified regression gateway mutation (PR #44); adds `bun creator:regression` that runs all 16 surface + autonomy + mutation + capsule + evolution + hackathon checks in one pass with per-surface PASS/FAIL, timing, and aggregate verdict — making autonomous Darwin loop evaluation faster and more reliable.
- [`creator-darwin-autonomy-route`](../scripts/creator-darwin-autonomy-check.ts): Darwin autonomy pre-flight mutation; adds `bun creator:darwin-autonomy-check` that validates repo anchor (correct repo + remote), git cleanliness (reports uncommitted changes), MCP connectivity (research_vault), and baseline gates (creator:mutation-check) before autonomous cron slices execute — directly addressing wrong-repo-anchor, dirty-worktree, and MCP-gap failure modes documented in hermes-gsd-evolution pitfalls.
- [`creator-multi-surface-proof-route`](../scripts/creator-multi-surface-proof.ts): unified artifact-measurement gateway mutation (PR #45); adds `bun creator:multi-surface-proof` that validates all 11 retained surface HTML artifacts against measure:check + print:render in one pass with per-surface PASS/FAIL and timing — catching overflow/render drift across surfaces before visual QA.
- [`creator-playwright-health-route`](../scripts/creator-playwright-health-check.ts): Playwright Chromium binary health pre-flight mutation; adds `bun creator:playwright-health-check` that validates ms-playwright cache directory, chromium_headless_shell binary, and a real measure:check smoke test before any autonomous Darwin slice runs — preventing silent 0/11 measure+print failures from binary version drift (documented in hermes-gsd-evolution pitfalls). Wired as the first check in the regression orchestrator.

## Candidate ledger

Before retaining a Darwin slice, use [`examples/creator-mutation-candidates.json`](../examples/creator-mutation-candidates.json) as the public-safe candidate ledger. It forces the run to name the observation, population, selection pressure, 3-5 single-axis candidates, one selected winner, retention level, and regression commands. Validate it with `bun creator:mutation-check`.

## Fitness rubric

| Criterion | Question | Fail state |
|---|---|---|
| Creator utility | Does it help a creator make something real faster or better? | It only explains the repo |
| Mutation clarity | Is exactly one change being tested? | Multiple uncontrolled changes |
| Artifact proof | Is there a rendered or runnable phenotype? | Only words or a dashboard screenshot |
| Memory retention | Does the idea survive future remixes? | The output cannot be resumed |
| Boundary safety | Are private inputs blocked? | Raw media, local paths, secrets, account screenshots |
| Minimal core | Does it keep frontier tools at adapter edge? | New framework before repeated wins |

## 30-day self-evolution plan

| Week | Evolution pressure | Retention target |
|---|---|---|
| 1 | Mutate creator capsule surfaces: board, poster, deck, short, PDF | one example per winning surface |
| 2 | Mutate frontier adapters: p5, Remotion, Manim, TouchDesigner, image/video models | adapter docs with proof gates |
| 3 | Mutate fitness evaluators: visual QA, contact sheets, prompt DNA checks, public-boundary checks | scripts for repeated checks only |
| 4 | Mutate agent behavior: when to choose tool, when to reject dashboard, when to promote primitive | skill/runbook updates with regression proof |

## Anti-dashboard rule

A dashboard is allowed only if it is a control surface that changes the next creative mutation.

Bad:
- a static scoreboard that says the repo is healthy;
- a gallery of pretty outputs with no mutation path;
- charts that measure activity instead of creator usefulness.

Good:
- a candidate comparison board that selects a winning workflow;
- a contact sheet that rejects bad render mutations;
- a scorecard that blocks bloated primitives from entering the core;
- a runbook that makes the next mutation cheaper and safer.

## 中文摘要

这里的 Darwin 不是“做个 dashboard”。它是自进化机制：观察 creator 的真实摩擦，生成小突变，渲染候选，按 creator usefulness 评分，选择赢家，只保留能证明有效的最小 primitive。核心保持小，frontier tools 作为 adapter 在边缘竞争。
