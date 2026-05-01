# Workflow Index

This is the routing table for agents using DASH Design Infra. Start here when the task is not “inspect the repo”, but “make a visual artifact that survives output.”

Each workflow has five required parts:

1. entry file;
2. package layer;
3. command path;
4. QA gate;
5. public boundary.

If a workflow cannot name those five things, it is not ready to ship.

## Workflow Matrix

| Job | Start here | Package layer | Run | QA gate | Public boundary |
|---|---|---|---|---|---|
| One-page brief / report | [`examples/one-pager.html`](../examples/one-pager.html) | `@dash/tokens`, `@dash/kami`, `@dash/measure`, `@dash/print` | `bun measure:check -- examples/one-pager.html` then `bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191` | Browser overflow check + PDF render completes | Sanitized copy only; no client/private text |
| Editorial deck-like artifact | [`packages/kami`](../packages/kami) | `@dash/kami`, `@dash/scale`, `@dash/metrics`, `@dash/print` | Compose HTML with Kami classes, then render through `@dash/print` | Typecheck + print output review | No proprietary fonts or vendor assets unless consumer project owns them |
| Fixed-canvas HTML | [`packages/measure`](../packages/measure) | `@dash/measure`, `@dash/layout`, `@dash/tokens` | `bun measure:check -- <file.html>` | Fails on overflow against real Chromium geometry | Do not depend on one private screen or local absolute paths |
| Kinetic poster | [`usecases/p5js/electric-archive.md`](../usecases/p5js/electric-archive.md) | `@dash/p5-motion` | Use `createTileGrid`, `layoutTileFrame`, `createMotionTimeline` | Deterministic timeline state + public preview | Cropped previews only; raw lab sketches stay out |
| Evidence weather map | [`usecases/p5js/weather-report.md`](../usecases/p5js/weather-report.md) | `@dash/p5-motion`, `@dash/tokens` | Build pressure/front/radar layers from the preset grammar | Layer list and frame contract are named | No real private benchmark or customer evidence |
| Dense generative video | [`usecases/video/windburn-render-workflow.md`](../usecases/video/windburn-render-workflow.md) | workflow docs + external renderer | Chunk render, contact-sheet review, bitrate-controlled compression | Contact sheet + target delivery size | No source video/audio, local render paths, or final private media |
| Visual research board | [`usecases/visual-research/refero-visual-research.md`](../usecases/visual-research/refero-visual-research.md) | `@dash/tokens`, `@dash/measure`, `@dash/print` | `bun measure:check -- examples/refero-research-board.html` then `bun print:render -- examples/refero-research-board.html /tmp/dash-refero-board.pdf --canvas=1684x1191` | Browser proofshot + fixed-canvas overflow check | Public observations and synthetic cards only; no copied reference screenshots |
| Skill ratchet board | [`usecases/visual-research/darwin-skill-ratchet.md`](../usecases/visual-research/darwin-skill-ratchet.md) | `@dash/tokens`, `@dash/measure`, `@dash/print` | `bun measure:check -- examples/darwin-ratchet-board.html` then `bun print:render -- examples/darwin-ratchet-board.html /tmp/dash-darwin-ratchet-board.pdf --canvas=1684x1191` | Source vetting + browser measure + PDF render + public-boundary scan | MIT attribution and synthetic cards only; no copied skill assets, private prompts, or local paths |
| Creator frontier capsule | [`usecases/creator/creator-frontier-capsule.md`](../usecases/creator/creator-frontier-capsule.md) | `@dash/tokens`, `@dash/measure`, `@dash/print` | `bun creator:capsule-check` then `bun measure:check -- examples/creator-frontier-capsule.html` and `bun print:render -- examples/creator-frontier-capsule.html /tmp/dash-creator-frontier-capsule.pdf --canvas=1684x1191` | Capsule schema check + browser measure + PDF render + public-boundary scan | Synthetic creator memory only; no private source media, client copy, local paths, or account screenshots |
| Public repo hardening | [`docs/PUBLIC_CSO_AUDIT.md`](./PUBLIC_CSO_AUDIT.md) | repo scripts | `bun docs:links && bun security:scan && bun hackathon:score` | All gates green locally and in CI | No secrets, private paths, raw media, or private project text |
| Hackathon SDD loop | [`docs/HACKATHON_SDD_LOOP.md`](./HACKATHON_SDD_LOOP.md) | repo scripts + CI | review → apply → score → PR → CI → merge | `bun hackathon:score` returns `MAXXED` | Score must prove public usefulness, not just activity |

## Agent Routing Rules

### If the user asks for a static document

Use the document path:

```bash
bun tokens:build
bun metrics:build
bun measure:check -- examples/one-pager.html
bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191
```

Then adapt the HTML, not the verification path.

### If the user asks for p5.js / motion / poster work

Use `@dash/p5-motion` first. Do not start from raw private sketches. Pick a grammar:

- Electric Archive for memory, retrieval, signal, handoff, blue-field archive stories.
- Memory Weather Report for risk, benchmark pressure, evidence density, trend/forecast stories.

A good motion workflow names:

- canvas size;
- layer model;
- deterministic seed or timeline phase;
- frame QA method;
- public preview boundary.

### If the user asks for video

Use workflow discipline before adding more visuals:

1. render in chunks;
2. make a contact sheet;
3. inspect density, flicker, compression risk;
4. compress to target delivery surface;
5. keep source media out of git.

### If the user asks to adapt an external skill or prompt workflow

Use the skill-ratchet path:

```bash
bun measure:check -- examples/darwin-ratchet-board.html
bun print:render -- examples/darwin-ratchet-board.html /tmp/dash-darwin-ratchet-board.pdf --canvas=1684x1191
bun security:scan
```

Do not install unknown skills blindly. Vet the source, extract the reusable loop, create synthetic public artifacts, then keep only score-backed improvements.

### If the user asks for creator-facing visual work

Use the creator capsule path before picking a renderer:

```bash
bun creator:capsule-check
bun measure:check -- examples/creator-frontier-capsule.html
bun print:render -- examples/creator-frontier-capsule.html /tmp/dash-creator-frontier-capsule.pdf --canvas=1684x1191
```

The useful unit is `idea -> capsule -> artifact -> proof -> remix trail`. Keep the core minimal and put frontier tools at the adapter edge.

### If the user asks to “make the repo better”

Use the hackathon SDD loop:

```bash
bun docs:links
bun security:scan
bun hackathon:score
```

Then fix the highest-scoring gap. Do not start a broad rewrite.

## Next Workflow Slots

These are intentionally unshipped until they have commands and public boundaries:

| Slot | Required before shipping |
|---|---|
| TouchDesigner / twozero MCP workflow | running local TD contract, exported public `.tox` or screenshot path, port/security note |
| Browser demo / Vercel surface | deploy command, public URL, screenshot QA, rollback path |
| Skills.sh / Hermes skill package | `SKILL.md`, install path, trigger description, example task, verification gate; use the Darwin ratchet before publishing |
| Visual contact-sheet QA | script that samples frames and writes an ignored artifact |

## 中文摘要

这里是 agent 的路线图：先判断要做 creator capsule、document、fixed-canvas、p5 motion、video、外部 skill 棘轮，还是 repo hardening；每条路都必须有入口文件、包层、命令、QA 和公开边界。没有这五项，就不要假装 workflow 已经完成。
