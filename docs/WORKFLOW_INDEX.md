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
| Flow-field visual texture | [`docs/preset-spec-dash-flow-field.md`](./preset-spec-dash-flow-field.md) and [`packages/p5-motion/demo`](../packages/p5-motion/demo) | `@dash/p5-motion` v2 contract | `bun p5:motion-check` then adapt `generateFlowField`, `traceFlowLine`, and `flowColorForVelocity` | Flow-field contract validates and deterministic helpers typecheck | Public generated texture only; no private reference videos or raw lab dumps |
| Kinetic type grammar | [`docs/preset-spec-dash-kinetic-type.md`](./preset-spec-dash-kinetic-type.md) | `@dash/p5-motion` v2 contract | `bun p5:motion-check` then use `layoutKineticType` and `animateKineticGlyphs` | Motion budget and glyph layout contract validate | Synthetic/public text only; no client copy |
| Data weather adapter | [`docs/preset-spec-dash-data-weather.md`](./preset-spec-dash-data-weather.md) | `@dash/p5-motion` v2 contract | `bun p5:motion-check` then use `validateWeatherData` and `weatherToVisualParams` | Data fallback states and color mapping validate | Public or synthetic weather-like data only; no private benchmark evidence |
| Layer composer | [`docs/p5js-frontier-research.md`](./p5js-frontier-research.md) | `@dash/p5-motion/composer` | `bun p5:motion-check` then compose `compositeSpecs` | Blend mode, z-order, and preset references validate | Composition metadata only; renderer/source media stays external |
| Dense generative video | [`usecases/video/windburn-render-workflow.md`](../usecases/video/windburn-render-workflow.md) | workflow docs + external renderer | Chunk render, contact-sheet review, bitrate-controlled compression | Contact sheet + target delivery size | No source video/audio, local render paths, or final private media |
| Visual research board | [`usecases/visual-research/refero-visual-research.md`](../usecases/visual-research/refero-visual-research.md) | `@dash/tokens`, `@dash/measure`, `@dash/print` | `bun measure:check -- examples/refero-research-board.html` then `bun print:render -- examples/refero-research-board.html /tmp/dash-refero-board.pdf --canvas=1684x1191` | Browser proofshot + fixed-canvas overflow check | Public observations and synthetic cards only; no copied reference screenshots |
| Skill ratchet board | [`usecases/visual-research/darwin-skill-ratchet.md`](../usecases/visual-research/darwin-skill-ratchet.md) | `@dash/tokens`, `@dash/measure`, `@dash/print` | `bun measure:check -- examples/darwin-ratchet-board.html` then `bun print:render -- examples/darwin-ratchet-board.html /tmp/dash-darwin-ratchet-board.pdf --canvas=1684x1191` | Source vetting + browser measure + PDF render + public-boundary scan | MIT attribution and synthetic cards only; no copied skill assets, private prompts, or local paths |
| Creator frontier capsule | [`usecases/creator/creator-frontier-capsule.md`](../usecases/creator/creator-frontier-capsule.md) | `@dash/tokens`, `@dash/measure`, `@dash/print` | `bun creator:capsule-check` then `bun measure:check -- examples/creator-frontier-capsule.html` and `bun print:render -- examples/creator-frontier-capsule.html /tmp/dash-creator-frontier-capsule.pdf --canvas=1684x1191` | Capsule schema check + browser measure + PDF render + public-boundary scan | Synthetic creator memory only; no private source media, client copy, local paths, or account screenshots |
| Creator evolution engine | [`docs/CREATOR_EVOLUTION_ENGINE.md`](./CREATOR_EVOLUTION_ENGINE.md) | docs + scripts until repeated winners justify packages | `bun creator:evolution-check && bun creator:mutation-check && bun creator:capsule-check && bun hackathon:score` | Darwin loop + candidate ledger + existing regression gates | No dashboard-only output; retain only creator-useful mutations with public-safe proof |
| Creator mutation ledger | [`usecases/creator/creator-mutation-candidates.md`](../usecases/creator/creator-mutation-candidates.md) | examples + scripts only | `bun creator:mutation-check` | 3-5 single-axis candidates, exactly one selected winner, regression commands named | Public-safe observations only; no private source material or raw generated media |
| Creator poster surface | [`usecases/creator/creator-poster-surface.md`](../usecases/creator/creator-poster-surface.md) | `@dash/measure`, `@dash/print`, examples + scripts | `bun creator:poster-check` then `bun measure:check -- examples/creator-poster-surface.html` and `bun print:render -- examples/creator-poster-surface.html /tmp/dash-creator-poster-surface.pdf --canvas=1684x1191` | Poster contract + browser measure + PDF render + public-boundary scan | Synthetic capsule copy only; no private source media, raw generated media, local paths, or account screenshots |
| Creator motion storyboard | [`usecases/creator/creator-motion-storyboard.md`](../usecases/creator/creator-motion-storyboard.md) | examples + scripts; future video/contact-sheet remains adapter edge | `bun creator:motion-storyboard-check` then `bun measure:check -- examples/creator-motion-storyboard.html` and `bun print:render -- examples/creator-motion-storyboard.html /tmp/dash-creator-motion-storyboard.pdf --canvas=1684x1191` | Six-frame storyboard contract + browser measure + public-boundary scan | No raw generated video, private prompts, local paths, account screenshots, or client copy |
| Creator prompt DNA adapter | [`usecases/creator/creator-prompt-dna-adapter.md`](../usecases/creator/creator-prompt-dna-adapter.md) | examples + scripts; frontier models remain external adapters | `bun creator:prompt-dna-check` then `bun measure:check -- examples/creator-prompt-dna-adapter.html` and `bun print:render -- examples/creator-prompt-dna-adapter.html /tmp/dash-creator-prompt-dna-adapter.pdf --canvas=1684x1191` | Prompt DNA contract + proof card + public-boundary scan | No private prompts, raw generated media, client copy, local paths, or account screenshots |
| Creator contact-sheet QA | [`usecases/creator/creator-contact-sheet-qa.md`](../usecases/creator/creator-contact-sheet-qa.md) | scripts + ignored `.artifacts` output | `bun creator:contact-sheet-check` then `bun measure:check -- .artifacts/creator-motion-contact-sheet.html` | Regenerated contact sheet fits fixed canvas and embeds no raw media | `.artifacts` ignored; no raw generated video, private prompts, local paths, or client copy |
| Creator social card | [`usecases/creator/creator-social-card.md`](../usecases/creator/creator-social-card.md) | examples + scripts; platform posting remains external | `bun creator:social-card-check` then `bun measure:check -- examples/creator-social-card.html --canvas=1200x630` and `bun print:render -- examples/creator-social-card.html /tmp/dash-creator-social-card.pdf --canvas=1200x630` | Crop-safe 1200x630 social contract + browser visual QA + browser/print proof + public-boundary scan | Synthetic hook only; no raw media, private prompts, local paths, account screenshots, or client analytics |
| Creator PDF zine | [`usecases/creator/creator-pdf-zine.md`](../usecases/creator/creator-pdf-zine.md) | examples + scripts; booklet/imposition tooling remains external | `bun creator:pdf-zine-check` then `bun measure:check -- examples/creator-pdf-zine.html --canvas=1684x1191` and `bun print:render -- examples/creator-pdf-zine.html /tmp/dash-creator-pdf-zine.pdf --canvas=1684x1191` | Six-panel single-sheet PDF contract + browser/print proof + public-boundary scan | Synthetic process notes only; no raw media, private prompts, local paths, account screenshots, provider logs, or client analytics |
| Creator p5 sketch | [`usecases/creator/creator-p5-sketch.md`](../usecases/creator/creator-p5-sketch.md) | `@dash/p5-motion`, examples + scripts; p5 runtime stays external | `bun creator:p5-sketch-check` then `bun p5:motion-check`, `bun measure:check -- examples/creator-p5-sketch.html`, and `bun print:render -- examples/creator-p5-sketch.html /tmp/dash-creator-p5-sketch.pdf --canvas=1684x1191` | Deterministic dash-flow-field frame probes + fixed-canvas preview + browser/print proof + standardized vision QA template + real browser_console evidence + generated `.artifacts/creator-p5-sketch-qa.md` (robust needle alignment per hermes-gsd-evolution) | Synthetic seed only; no raw generated media, private prompts, local paths, provider logs, or account screenshots |
| Creator Remotion scene | [`usecases/creator/creator-remotion-scene.md`](../usecases/creator/creator-remotion-scene.md) | examples + scripts; Remotion runtime stays external | `bun creator:remotion-scene-check` then `bun measure:check -- examples/creator-remotion-scene.html` and `bun print:render -- examples/creator-remotion-scene.html /tmp/dash-creator-remotion-scene.pdf --canvas=1684x1191` | Generated ignored TSX composition stub + fixed-canvas proof card + browser/print proof | Synthetic capsule only; no rendered video, raw media, private prompts, local paths, provider logs, account screenshots, cookies, or secrets |
| Creator Manim scene | [`usecases/creator/creator-manim-scene.md`](../usecases/creator/creator-manim-scene.md) | examples + scripts; Manim Community Edition stays external | `bun creator:manim-scene-check` then `bun measure:check -- examples/creator-manim-scene.html` and `bun print:render -- examples/creator-manim-scene.html /tmp/dash-creator-manim-scene.pdf --canvas=1684x1191` | Generated ignored Python scene stub + fixed-canvas proof card + browser/print proof + standardized vision QA template + real browser_console DOM verification + generated `.artifacts/creator-manim-scene-qa.md` (robust needle alignment per hermes-gsd-evolution) | Synthetic capsule only; no rendered MP4, raw media, private prompts, local paths, provider logs, account screenshots, cookies, or secrets |
| Creator TouchDesigner TOX | [`usecases/creator/creator-touchdesigner-tox.md`](../usecases/creator/creator-touchdesigner-tox.md) | examples + scripts; TouchDesigner/twozero MCP stays local-operator external | `bun creator:touchdesigner-tox-check` then `bun measure:check -- examples/creator-touchdesigner-tox.html` and `bun print:render -- examples/creator-touchdesigner-tox.html /tmp/dash-creator-touchdesigner-tox.pdf --canvas=1684x1191` | Generated ignored topology/safety artifacts + fixed-canvas proof card + browser/print proof + standardized vision QA template + real browser_console DOM verification + generated `.artifacts/creator-touchdesigner-tox-qa.md` (robust needle alignment per hermes-gsd-evolution) | Synthetic capsule only; no `.tox/.toe`, screenshots, raw media, private prompts, local paths, provider logs, account screenshots, cookies, tokens, secrets, or unverified local ports |
| Creator browser demo | [`usecases/creator/creator-browser-demo.md`](../usecases/creator/creator-browser-demo.md) | examples + scripts; no app framework/backend/deploy automation in core | `bun creator:browser-demo-check` then `bun measure:check -- examples/creator-browser-demo.html` and `bun print:render -- examples/creator-browser-demo.html /tmp/dash-creator-browser-demo.pdf --canvas=1684x1191` | Self-contained clickable HTML phenotype + generated ignored smoke notes + browser interaction smoke | Synthetic capsule only; no backend, external network, analytics, hosting config, public deploy, screenshots, raw media, private prompts, local paths, cookies, tokens, secrets, or account UI |
| Creator skill package | [`skill-packages/creator-workflow/SKILL.md`](../skill-packages/creator-workflow/SKILL.md) and [`usecases/creator/creator-skill-package.md`](../usecases/creator/creator-skill-package.md) | repo-local skill artifact + existing creator scripts | `bun creator:skill-package-check` then `bun docs:links` and `bun security:scan` | SKILL.md frontmatter, trigger, install boundary, example task, CI hook, and public boundary are checked | no external publish; no live sync; no raw media, private prompts, local paths, or credentials |
| Creator regression orchestrator | [`scripts/creator-regression-check.ts`](../scripts/creator-regression-check.ts) | scripts only | `bun creator:regression` | All 16 surface + autonomy + mutation + capsule + evolution + hackathon checks pass in a single pass with per-surface PASS/FAIL, timing, and aggregate verdict | Public-safe script; no new surface artifacts |
| Creator Darwin autonomy | [`scripts/creator-darwin-autonomy-check.ts`](../scripts/creator-darwin-autonomy-check.ts) | scripts only | `bun creator:darwin-autonomy-check` | Validates repo anchor (correct repo + remote), git cleanliness (reports uncommitted changes), MCP connectivity (research_vault), and baseline gates (creator:mutation-check) before autonomous Darwin cron slices execute | Public-safe script; no secrets, local paths, or private repo details |
|| Creator multi-surface proof | [`scripts/creator-multi-surface-proof.ts`](../scripts/creator-multi-surface-proof.ts) | scripts only | `bun creator:multi-surface-proof` | All 11 retained surface HTML artifacts pass measure:check + print:render in a single pass with per-surface PASS/FAIL and timing | Public-safe script; no new surface artifacts |
|| Creator Playwright health | [`scripts/creator-playwright-health-check.ts`](../scripts/creator-playwright-health-check.ts) | scripts only | `bun creator:playwright-health-check` | Validates Playwright Chromium binary health (cache-dir, chromium-dir, binary, measure:check smoke); prevents silent 0/11 failures from binary version drift in autonomous Darwin cron runs | Public-safe script; no new surface artifacts |
|| Creator docs-surface parity | [`scripts/creator-docs-surface-parity.ts`](../scripts/creator-docs-surface-parity.ts) | scripts only | `bun creator:docs-surface-parity` | Cross-references WORKFLOW_INDEX.md, CREATOR_EVOLUTION_ENGINE.md, mutation-candidates.json, examples/*.html, multi-surface-proof SURFACES, and package.json scripts — catches drift across all surfaces in one pass | Public-safe script; no new surface artifacts |
||| Creator cron slice health | [`scripts/creator-cron-slice-health.ts`](../scripts/creator-cron-slice-health.ts) | scripts only | `bun creator:cron-slice-health` | Queries GitHub for most recent merged Darwin PR, verifies CI on merge commit, reports slice completion evidence — validates autonomous cron slice completed cleanly | Public-safe script; no new surface artifacts |
||| Creator agent context health | [`scripts/creator-agent-context-health.ts`](../scripts/creator-agent-context-health.ts) | scripts only | `bun creator:agent-context-health` | Validates AGENTS.md, WORKFLOW_INDEX.md, CREATOR_EVOLUTION_ENGINE.md, and mutation-candidates.json are present, parseable, and structurally sound — ensures autonomous agents can start work without missing or corrupted docs | Public-safe script; no new surface artifacts |
||| Creator surface health | [`scripts/creator-surface-health.ts`](../scripts/creator-surface-health.ts) | scripts only | `bun creator:surface-health` | Dynamically discovers all `examples/creator-*.html` surfaces, maps to individual `creator:*check` scripts, runs every gate, reports per-surface PASS/FAIL with timing — catches broken individual surfaces and missing check scripts | Public-safe script; no new surface artifacts |
|| Creator script health | [`scripts/creator-script-health.ts`](../scripts/creator-script-health.ts) | scripts only | `bun creator:script-health` | Validates every creator:* script in package.json has a corresponding source file that exists — catches stale script entries pointing to deleted or renamed files before they cause silent failures in autonomous Darwin runs | Public-safe script; no new surface artifacts |
|| Creator orphan script | [`scripts/creator-orphan-script.ts`](../scripts/creator-orphan-script.ts) | scripts only | `bun creator:orphan-script` | Discovers all `scripts/creator-*.ts` files and cross-references against package.json `creator:*` entries — catches orphan source files that exist on filesystem but have no package.json entry. Inverse of creator-script-health: together enforce perfect 1:1 correspondence | Public-safe script; no new surface artifacts |
||| Creator workflow gate health | [`scripts/creator-workflow-gate-health.ts`](../scripts/creator-workflow-gate-health.ts) | scripts only | `bun creator:workflow-gate-health` | Cross-references all `bun <script>` references in WORKFLOW_INDEX.md against package.json scripts, validates existence and execution (arg-requiring and long-running scripts handled via skip sets) — catches doc drift where WORKFLOW_INDEX describes gates that are absent or broken | Public-safe script; no new surface artifacts |
||| Creator example check coverage | [`scripts/creator-example-check-coverage.ts`](../scripts/creator-example-check-coverage.ts) | scripts only | `bun creator:example-check-coverage` | Discovers all `examples/creator-*.html` surfaces, maps to expected `creator:*check` scripts (known mapping table for 3 non-standard exceptions, auto-derivation for standard surfaces), verifies each script exists in package.json — catches surfaces added without machine gates and orphan check scripts without surfaces. 11/11 surfaces covered | Public-safe script; no new surface artifacts |
||| Creator post-check coverage | [`scripts/creator-post-check-coverage.ts`](../scripts/creator-post-check-coverage.ts) | scripts only | `bun creator:post-check-coverage` | Discovers all `examples/creator-*.html` surfaces, maps to expected `.artifacts/creator-*-qa.md` evidence files (known mapping for non-standard naming), verifies QA files exist with real browser evidence markers — catches surfaces where QA drift leaves stale or missing evidence files. 11/11 surfaces audited, 0 gaps (creator-prompt-dna-qa-route closed the last gap) | Public-safe script; no new surface artifacts |
||| Creator prompt-dna QA | [`scripts/creator-prompt-dna-check.ts`](../scripts/creator-prompt-dna-check.ts) | surface check | `bun creator:prompt-dna-check` | Generates standardized `.artifacts/creator-prompt-dna-adapter-qa.md` with VISION_QUESTION_TEMPLATE + real browser_console DOM verification + robust needle alignment + vision QA provider fallback — closing the last QA evidence gap across all 11 creator surfaces | Public-safe script; generated QA artifact |
||| Creator regression-duration | [`scripts/creator-regression-duration.ts`](../scripts/creator-regression-duration.ts) | scripts only | `bun creator:regression-duration` | Reads timing manifest (`examples/creator-regression-timing.json`) written by the regression orchestrator, compares per-check durations against stored running-average baselines, flags any check exceeding 2x baseline threshold — catches slow performance regressions in Darwin checks before they accumulate. First run auto-creates baseline | Public-safe script; no new surface artifacts |
||| Creator measure-print cache | [`scripts/creator-measure-print-cache.ts`](../scripts/creator-measure-print-cache.ts) | scripts only | `bun creator:measure-print-cache` (cached) or `bun creator:measure-print-cache -- --no-cache` (fresh) | SHA-256 content-hash caching for measure:check + print:render across all 11 surfaces — 4ms cached vs 26.6s fresh (6600x speedup). `--no-cache` forces fresh runs. Cache at `.cache/measure-print/` (gitignored). Wired into regression orchestrator after regression-duration.
||| Creator cache integrity | [`scripts/creator-cache-integrity.ts`](../scripts/creator-cache-integrity.ts) | scripts only | `bun creator:cache-integrity` | SHA-256 cross-check of every cached measure-print entry against current source content — catches stale cache when surfaces are modified. 11/11 valid, 0 stale, 0 orphan, 0 corrupt. Handles missing cache dir (exit 2). Wired into regression orchestrator after measure-print-cache.
||| Creator surface consistency | [`scripts/creator-surface-consistency.ts`](../scripts/creator-surface-consistency.ts) | scripts only | `bun creator:surface-consistency` | Visual grammar audit across all 11 creator surfaces: extracts CSS custom properties from `:root` blocks, identifies visual families (warm-paper, dark-industrial, creative-hybrid), cross-references token names/values, reports naming inconsistencies and value drift. Exit 0 for informational audit, exit 1 if any surface lacks a CSS token layer. Revealed: 0 shared tokens, 12 diverged, 1 no-token-layer surface. Wired into regression orchestrator after cache-integrity. First diagnostic slice for NorthStar aesthetic coherence.
||| Creator family DNA check | [`scripts/creator-family-dna-check.ts`](../scripts/creator-family-dna-check.ts), [`examples/creator-family-dna.html`](../examples/creator-family-dna.html) | HTML artifact + script | `bun creator:family-dna-check` | Validates the visual grammar family DNA reference: 3 family sections (warm-paper, dark-industrial, creative-hybrid) with token swatches and consensus values, 4-principle capsule grammar card, machine-readable data attributes, proof rail. 20/20 PASS. Wired into regression orchestrator after surface-consistency. Human-readable companion to creator:surface-consistency — the target it measures convergence against.
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
- Flow Field for organic DASH-branded visual texture.
- Kinetic Type for editorial title cards and typography as motion material.
- Data Weather for live/synthetic data mapped into visual parameters.
- Layer Composer when multiple presets need blend modes, z-ordering, and phase offsets.

A good motion workflow names:

- canvas size;
- layer model;
- deterministic seed or timeline phase;
- frame QA method;
- public preview boundary.

For v2 preset work, also run:

```bash
bun p5:motion-check
```

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

The useful unit is `idea -> capsule -> artifact -> proof -> remix trail`. If the target surface is a poster, use `bun creator:poster-check` and `examples/creator-poster-surface.html` before inventing a new renderer. If the target path is an image/video model, use `bun creator:prompt-dna-check` and `examples/creator-prompt-dna-adapter.html` before saving any generated media. If the target is motion/video direction, use `bun creator:motion-storyboard-check` and `examples/creator-motion-storyboard.html` before any renderer or contact sheet. If the target is a social post image, use `bun creator:social-card-check` and `examples/creator-social-card.html` before platform upload. If the target is a printable process zine, use `bun creator:pdf-zine-check` and `examples/creator-pdf-zine.html` before adding booklet tooling, print imposition, or private workshop notes. If the target is a p5.js creative-coding sketch, use `bun creator:p5-sketch-check` and `examples/creator-p5-sketch.html` before opening a p5 runtime or saving rendered media. If the target is a Remotion sequence/composition, use `bun creator:remotion-scene-check` and `examples/creator-remotion-scene.html` before installing renderer dependencies or exporting video. If the target is a Manim explainer scene, use `bun creator:manim-scene-check` and `examples/creator-manim-scene.html` before installing Manim dependencies or exporting MP4. If the target is a TouchDesigner/twozero live-network handoff, use `bun creator:touchdesigner-tox-check` and `examples/creator-touchdesigner-tox.html` before opening ports, connecting to TD, capturing screenshots, or exporting `.tox/.toe`. If the target is a browser-native demo, use `bun creator:browser-demo-check` and `examples/creator-browser-demo.html` before adding a frontend framework, backend, analytics, hosting config, screenshots, or public deploy. Keep the core minimal and put frontier tools at the adapter edge.

### If the user asks for Darwin-style self-evolution

Use the creator evolution path:

```bash
bun creator:playwright-health-check
bun creator:evolution-check
bun creator:mutation-check
bun creator:capsule-check
bun creator:docs-surface-parity
bun creator:remotion-scene-check
bun creator:manim-scene-check
bun creator:touchdesigner-tox-check
bun creator:browser-demo-check
bun creator:pdf-zine-check
bun docs:links
bun security:scan
bun hackathon:score
```

This means mutation, evaluation, selection, retention, and regression. Use the candidate ledger when comparing mutations. Do not reduce it to a dashboard. A dashboard is valid only when it controls the next creative mutation.

### If the user asks for a creator skill package

Use the repo-local package route:

```bash
bun creator:skill-package-check
bun docs:links
bun security:scan
```

The package artifact is [`skill-packages/creator-workflow/SKILL.md`](../skill-packages/creator-workflow/SKILL.md). It may be inspected or copied into a local skill loader for review, but it is not a public release and must not be synced to live agents without a separate reviewed release issue.

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

|| Slot | Required before shipping |
|---|----|
| Browser demo external deploy / Vercel surface | deploy command, public URL, screenshot QA, rollback path; start from the shipped local browser demo route first |
| External skill publish/release | review-approved registry target, live install smoke, versioning, rollback, and public release note |
| Visual contact-sheet QA | shipped as `bun creator:contact-sheet-check`; writes ignored `.artifacts/creator-motion-contact-sheet.html` |

**Fixed-Canvas Browser QA Enforcement (browser-qa Darwin mutation)**

Default browser automation viewports often hide right-side or bottom controls on 1684×1191 or 1200×630 canvases, leading to false-positive "working" interaction reports. 

Mutation selected: Add explicit exact-viewport contract to all fixed-canvas routes.

- Always enforce `setViewportSize({ width: 1684, height: 1191 })` (or matching social canvas) in browser smoke.
- Verify: `innerWidth === canvasWidth`, no horizontal overflow, every `data-step` button receives click and updates `data-active-step` + `aria-pressed`.
- Capture: console errors, network (must be 0 external), CDP metrics, screenshot path.
- This prevents the mobile-crop and offscreen-control pitfalls noted in browser-qa skill.

Update all creator/*-check.ts and measure commands to include this when browser tools are used. Phenotype survives in updated WORKFLOW_INDEX and browser-demo HTML meta/viewport handling.

This advances week-3 fitness-evaluator mutation without growing core.

## 中文摘要

这里是 agent 的路线图：先判断要做 creator capsule、自进化 Darwin loop、document、fixed-canvas、p5 motion、video、外部 skill 棘轮，还是 repo hardening；每条路都必须有入口文件、包层、命令、QA 和公开边界。Darwin loop 指 mutation/evaluation/selection/retention/regression，不是 dashboard。没有这些，就不要假装 workflow 已经完成。
