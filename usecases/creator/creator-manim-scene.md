# Creator Manim Scene Adapter

## Problem it solves

Creators often need a short explainer, math-style animation, or abstract system walkthrough, but the first move should not be “open Manim and improvise.” That loses capsule memory and risks committing raw rendered media.

This route turns the creator capsule into a checked Manim scene contract before any renderer work starts.

## Output

- Capsule-derived scene contract: [`examples/creator-manim-scene.json`](../../examples/creator-manim-scene.json)
- Fixed-canvas proof card: [`examples/creator-manim-scene.html`](../../examples/creator-manim-scene.html)
- Generated ignored Python stub: `.artifacts/creator-manim-scene.py`
- Validation command: `bun creator:manim-scene-check`

## Mutation selected

`creator-manim-scene-route` wins this slice because it gives creators a real renderer handoff without adding Manim to the DASH core. The phenotype is executable enough to copy into an external Manim workspace, but the repo still retains only JSON, HTML proof, and a Bun gate.

The other candidates in the current Darwin ledger were useful but less atomic:

- Remotion shot lists need a React/runtime package boundary before they are safe.
- TouchDesigner/twozero needs a live local contract and security note.
- Browser demo routes need deploy and rollback proof.
- PDF zines duplicate existing print paths unless a new remix need appears.

## Manim adapter contract

The contract must name:

1. source capsule;
2. scene class name;
3. external render command;
4. beat timeline;
5. visual grammar per beat;
6. motion intent per beat;
7. remix handles;
8. blocked moves;
9. public boundary;
10. proof commands.

The generated Python is intentionally a stub. It gives the creator a clean `Scene` class and beat structure, not a final rendered movie.

```bash
bun creator:manim-scene-check
manim -ql .artifacts/creator-manim-scene.py CreatorCapsuleScene
```

The second command is an external creator-workspace command. It is documented so the handoff is real, but CI does not install Manim or commit the MP4 output.

## QA checks

```bash
bun creator:manim-scene-check
bun measure:check -- examples/creator-manim-scene.html
bun print:render -- examples/creator-manim-scene.html /tmp/dash-creator-manim-scene.pdf --canvas=1684x1191
bun security:scan
bun hackathon:score
```

For visual QA, open `examples/creator-manim-scene.html` in browser automation and confirm:

- the full `.page` fits a 1684x1191 canvas;
- no raw media tags are embedded;
- the Manim runtime is clearly external;
- the route is a scene handoff, not a dashboard.

## Failure modes

- **Fake renderer workflow**: the route only talks about Manim and never emits a scene stub. Blocked by `creator:manim-scene-check`.
- **Core bloat**: adding Manim dependencies to `package.json` from one adapter win. Blocked by the runtime boundary.
- **Private leakage**: committing rendered video, local absolute paths, provider logs, private prompts, account screenshots, cookies, or secrets. Blocked by the public boundary and security scan.
- **Static-board drift**: treating the HTML proof card as the final product. The proof card must point to a generated Python scene handoff.

## Public boundary

Allowed:

- synthetic capsule fields;
- repo-relative `.artifacts` output names;
- public-safe visual grammar;
- external render command text;
- fixed-canvas proof card.

Blocked:

- private prompts or client copy;
- raw generated video and renderer caches;
- local absolute paths or provider logs;
- API keys, cookies, tokens, secrets, or account screenshots;
- unreviewed third-party assets or proprietary fonts.

## Remix rule

A creator may change the beat order, title copy, palette mapping, motion timing, and external Manim render quality. The route breaks if they remove source capsule memory, proof commands, blocked inputs, or the external-runtime boundary.

## 中文摘要

这个 mutation 把 creator capsule 转成 Manim 场景合约：先生成 JSON、固定画布 proof card、以及 `.artifacts` 里的 Python Scene stub，再由创作者在外部 Manim 环境渲染。DASH 不引入 Manim 依赖，不提交 MP4，不保存私有素材。它是 capsule 到 renderer 的安全交接，不是 dashboard。
