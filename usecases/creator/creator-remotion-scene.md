# Creator Remotion Scene Adapter

## Problem it solves

Creators often want a short product explainer, launch motion piece, or editorial video beat map, but the first move should not be “open a Remotion project and improvise.” That drops capsule memory and makes it too easy to commit rendered media or private source material.

This route turns the creator capsule into a checked Remotion composition contract before any external renderer work starts.

## Output

- Capsule-derived scene contract: [`examples/creator-remotion-scene.json`](../../examples/creator-remotion-scene.json)
- Fixed-canvas proof card: [`examples/creator-remotion-scene.html`](../../examples/creator-remotion-scene.html)
- Generated ignored TSX stub: `.artifacts/creator-remotion-scene.tsx`
- Generated ignored summary: `.artifacts/creator-remotion-scene-summary.json`
- Validation command: `bun creator:remotion-scene-check`

## Mutation selected

`creator-remotion-scene-route` wins this slice because it gives creators a real timeline-code handoff without adding Remotion, React rendering, or codec dependencies to the DASH core. The phenotype is executable enough to copy into an external Remotion project, while this repo retains only JSON, HTML proof, and a Bun gate.

The active candidates in the Darwin ledger stay focused on frontier adapters:

- Remotion wins now because it turns capsule memory into a generated sequence-based TSX composition stub.
- Manim remains a good next adapter for explainer/math-style motion.
- TouchDesigner/twozero still needs a live local safety contract before retention.
- Browser-demo routes need deploy and rollback proof to avoid becoming static boards.
- PDF zines duplicate existing print paths unless a distinct remix need appears.

## Remotion adapter contract

The contract must name:

1. source capsule;
2. composition id;
3. React component name;
4. external render command;
5. exact sequence starts and durations;
6. frame probes;
7. visual grammar per sequence;
8. motion/voiceover intent per sequence;
9. remix handles;
10. blocked moves;
11. public boundary;
12. proof commands.

The generated TSX is intentionally a stub. It gives the creator a clean `Composition`, `Sequence`, and `AbsoluteFill` structure, not a final rendered movie.

```bash
bun creator:remotion-scene-check
npx remotion render .artifacts/creator-remotion-scene.tsx CreatorCapsuleComposition out/creator-capsule-remotion.mp4
```

The second command is an external creator-workspace command. It is documented so the handoff is real, but CI does not install Remotion or commit rendered output.

## QA checks

```bash
bun creator:remotion-scene-check
bun measure:check -- examples/creator-remotion-scene.html
bun print:render -- examples/creator-remotion-scene.html /tmp/dash-creator-remotion-scene.pdf --canvas=1684x1191
bun docs:links
bun security:scan
bun hackathon:score
```

For visual QA, open `examples/creator-remotion-scene.html` in browser automation and confirm:

- the full `.page` fits a 1684x1191 canvas;
- no raw media tags are embedded;
- the Remotion runtime is clearly external;
- the route is a sequence/code handoff, not a dashboard.

## Failure modes

- **Fake renderer workflow**: the route only talks about Remotion and never emits a TSX composition stub. Blocked by `creator:remotion-scene-check`.
- **Core bloat**: adding Remotion or React rendering dependencies to `package.json` from one adapter win. Blocked by the runtime boundary.
- **Private leakage**: committing rendered video, local absolute paths, provider logs, private prompts, account screenshots, cookies, or secrets. Blocked by the public boundary and security scan.
- **Static-board drift**: treating the HTML proof card as the final product. The proof card must point to a generated TSX handoff.
- **Timeline ambiguity**: missing sequence starts/durations or frame probes. Blocked by the scene contract.

## Public boundary

Allowed:

- synthetic capsule fields;
- repo-relative `.artifacts` output names;
- public-safe visual grammar;
- external render command text;
- fixed-canvas proof card.

Blocked:

- private prompts or client copy;
- raw generated image, video, audio, rendered exports, and renderer caches;
- local absolute paths or provider logs;
- API keys, cookies, tokens, secrets, or account screenshots;
- unreviewed third-party assets or proprietary fonts.

## Remix rule

A creator may change sequence order, frame durations, component names, palette mapping, title copy, voiceover intent, and external render quality. The route breaks if they remove source capsule memory, proof commands, blocked inputs, frame probes, or the external-runtime boundary.

## 中文摘要

这个 mutation 把 creator capsule 转成 Remotion 场景合约：先生成 JSON、固定画布 proof card、以及 `.artifacts` 里的 TSX Composition/Sequence stub，再由创作者在外部 Remotion 项目渲染。DASH 不引入 Remotion/React 渲染依赖，不提交视频，不保存私有素材。它是 capsule 到 renderer 的安全交接，不是 dashboard。
