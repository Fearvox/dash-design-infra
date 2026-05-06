# Creator Mutation Candidate Ledger

This is the first operational Darwin slice after the Creator Evolution Engine.

The observed gap: the repo had a self-evolution doctrine, but no small machine-checked way for an agent to compare mutations before retaining a winner. Without that ledger, “Darwin” can collapse back into taste, dashboards, or one-off artifacts.

## Output

- Candidate population: [`examples/creator-mutation-candidates.json`](../../examples/creator-mutation-candidates.json)
- Validation command: `bun creator:mutation-check`

## Contract

Every autonomous Darwin slice should be able to name:

| Field | Meaning |
|---|---|
| `observation` | the creator friction or repo gap being addressed |
| `population` | the family of candidates being compared |
| `selection_pressure` | why this matters to creators |
| `candidates[]` | 3-5 single-axis mutations |
| `retained_routes[]` | older winners kept out of the active candidate population |
| `axis` | exactly one dimension changed: surface, adapter, proof, schema, command, routing |
| `phenotype` | the visible or executable expression of the candidate |
| `fitness` | creator utility, memory retention, artifact proof, boundary safety, minimal core |
| `winner` | selected candidate id |
| `retention` | example, script, package primitive, or skill/runbook |
| `regression` | commands that prove existing surfaces did not break |

## Selection rule

Keep the smallest mutation that improves creator usefulness without weakening proof or public boundary.

Do not promote package code from one win. One selected candidate becomes an example or script. Repeated cross-surface wins can become package primitives later.

## Anti-dashboard pressure

A candidate ledger is not a dashboard. It only counts if it changes selection pressure:

- it names competing mutations;
- it scores creator usefulness;
- it selects one retained winner;
- it blocks unclear “we evolved” claims;
- it points to regression commands.

If a future board or dashboard cannot do those things, reject it.

## Current retained winner

`creator-browser-demo-route` wins the current slice because it bridges capsule memory into a self-contained clickable browser phenotype without importing a frontend framework, backend, analytics, hosting config, screenshots, or public deploy automation into the core repo.

The earlier `poster-surface-route`, `adapter-prompt-dna-route`, `creator-motion-storyboard-route`, `creator-social-card-route`, `creator-p5-sketch-route`, `creator-remotion-scene-route`, `creator-manim-scene-route`, and `creator-touchdesigner-tox-route` remain retained. The ledger gate keeps them in `retained_routes[]` so the active candidate list stays focused on 3-5 current mutations without losing regression memory.

Current retained sequence:

| Route | Status | Why it stays |
|---|---|---|
| `poster-surface-route` | retained surface | converts a capsule into a measured, printable artifact |
| `adapter-prompt-dna-route` | retained adapter | preserves model-ready prompt DNA with a synthetic preview artifact |
| `creator-motion-storyboard-route` | retained surface | bridges capsule memory into motion/video direction before raw media |
| `creator-social-card-route` | retained surface | creates a crop-safe post preview before platform upload |
| `creator-p5-sketch-route` | retained adapter | generates deterministic `dash-flow-field` frame probes before p5 runtime work |
| `creator-remotion-scene-route` | retained adapter | generates an ignored TSX composition stub before external Remotion runtime work |
| `creator-manim-scene-route` | retained adapter | generates an ignored Python Scene stub before external Manim runtime work |
| `creator-touchdesigner-tox-route` | retained adapter | generates ignored topology/safety artifacts before local TouchDesigner/twozero work |
| `creator-browser-demo-route` | selected surface | creates a local interactive browser demo before backend, hosting, or deploy work |

## 中文摘要

这不是 dashboard。它是 Darwin loop 的候选账本：先观察 creator 摩擦，再列出 3-5 个单轴 mutation，给每个候选打 creator usefulness / memory / proof / boundary / minimal-core 分，选择一个最小赢家，并用 regression gates 保证没有破坏已有 workflow。
