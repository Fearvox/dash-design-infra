# Creator TouchDesigner TOX Adapter

## Problem it solves

Creators often want the tactile, live-network feel of TouchDesigner, but the dangerous first move is to connect an agent to a local TD process or commit a screenshot/.tox export before the creative boundary is clear.

This route turns the creator capsule into a checked TouchDesigner/twozero handoff before any live local runtime work starts.

## Output

- Capsule-derived TD network contract: [`examples/creator-touchdesigner-tox.json`](../../examples/creator-touchdesigner-tox.json)
- Fixed-canvas proof card: [`examples/creator-touchdesigner-tox.html`](../../examples/creator-touchdesigner-tox.html)
- Generated ignored topology note: `.artifacts/creator-touchdesigner-network.md`
- Generated ignored twozero safety contract: `.artifacts/creator-touchdesigner-twozero-contract.json`
- Validation command: `bun creator:touchdesigner-tox-check`

## Mutation selected

`creator-touchdesigner-tox-route` wins this slice because it gives creators a real live-tool handoff without pretending CI can safely drive TouchDesigner. The phenotype is a topology note and twozero safety contract that a local operator can use after starting TD, while DASH retains only JSON, HTML proof, and a Bun gate.

The older Manim scene route moved into retained winners. The remaining current candidates stay active for future selection pressure:

- Browser demo routes need deploy and rollback proof.
- PDF zines duplicate existing print paths unless a distinct remix job appears.
- External skill release needs a reviewed registry target before public sync.

## TouchDesigner/twozero adapter contract

The contract must name:

1. source capsule;
2. project/network name;
3. external TouchDesigner runtime boundary;
4. twozero MCP allowed and blocked operations;
5. safe smoke command that captures nothing;
6. TD node topology;
7. remix handles;
8. blocked moves;
9. public boundary;
10. proof commands.

The generated topology note is intentionally not a `.tox`. It gives the creator a clean node list and safety boundary, not a committed proprietary export.

```bash
bun creator:touchdesigner-tox-check
twozero status --expect-local-operator --no-capture
```

The second command is an external local-operator command. CI documents it but does not open a port, connect to TD, capture screenshots, or commit exported `.tox/.toe` files.

## QA checks

```bash
bun creator:touchdesigner-tox-check
bun measure:check -- examples/creator-touchdesigner-tox.html
bun print:render -- examples/creator-touchdesigner-tox.html /tmp/dash-creator-touchdesigner-tox.pdf --canvas=1684x1191
bun security:scan
bun hackathon:score
```

For visual QA, open `examples/creator-touchdesigner-tox.html` in browser automation and confirm:

- the full `.page` fits a 1684x1191 canvas;
- no raw media tags are embedded;
- the twozero boundary clearly says local operator only;
- the route is a network handoff, not a dashboard.

## Failure modes

- **Fake live-tool workflow**: the route says TouchDesigner but never emits topology or safety artifacts. Blocked by `creator:touchdesigner-tox-check`.
- **Unsafe automation**: opening ports, connecting to an unverified TD process, or capturing account UI in CI. Blocked by the twozero boundary.
- **Core bloat**: adding TouchDesigner/twozero dependencies to `package.json` from one adapter win. Blocked by the runtime boundary.
- **Private leakage**: committing `.tox/.toe`, screenshots, raw renders, local absolute paths, provider logs, private prompts, account screenshots, cookies, tokens, or secrets. Blocked by the public boundary and security scan.
- **Static-board drift**: treating the HTML proof card as the final product. The proof card must point to generated topology and local-operator handoff artifacts.

## Public boundary

Allowed:

- synthetic capsule fields;
- repo-relative `.artifacts` topology and contract names;
- public-safe node names and visual grammar;
- external local-operator smoke command text;
- fixed-canvas proof card.

Blocked:

- private prompts or client copy;
- raw generated video, raw source media, screenshots, `.tox/.toe` exports, and renderer caches;
- local absolute paths or provider logs;
- API keys, cookies, tokens, secrets, account screenshots, or unverified local ports;
- unreviewed third-party assets or proprietary fonts.

## Remix rule

A creator may change node names, noise seed, palette mapping, pulse timing, proof stamp copy, and external export quality. The route breaks if they remove source capsule memory, proof commands, blocked inputs, or the local-operator-only twozero boundary.

## 中文摘要

这个 mutation 把 creator capsule 转成 TouchDesigner/twozero 网络交接合约：先生成 JSON、固定画布 proof card、`.artifacts` 里的 topology note 和 safety contract，再由本地操作者在外部 TD 环境执行。DASH 不打开端口，不连接 live TD，不提交 `.tox/.toe`、截图、raw media 或私有路径。它是 capsule 到 live visual network 的安全交接，不是 dashboard。
