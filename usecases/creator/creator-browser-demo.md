# Creator Browser Demo Adapter

## Problem it solves

Creators often need a lightweight browser prototype before deciding whether an idea deserves a full app, external deploy, or heavier renderer. The bad default is to build an app shell first, wire analytics or hosting too early, and lose the capsule memory that made the idea worth shipping.

This route turns one creator capsule into a local, self-contained, clickable browser phenotype before any backend, framework, hosting config, screenshot, or public URL enters the workflow.

## Output

- Capsule-derived browser contract: [`examples/creator-browser-demo.json`](../../examples/creator-browser-demo.json)
- Fixed-canvas interactive proof card: [`examples/creator-browser-demo.html`](../../examples/creator-browser-demo.html)
- Generated ignored smoke summary: `.artifacts/creator-browser-demo-smoke.json`
- Generated ignored QA note: `.artifacts/creator-browser-demo-qa.md`
- Validation command: `bun creator:browser-demo-check`

## Mutation selected

`creator-browser-demo-route` wins this slice because it turns the existing creator capsule into an actually clickable browser artifact without adding React, a router, backend code, hosting configuration, analytics, or public deploy automation to the DASH core.

The phenotype is not a dashboard. It has four local controls that mutate the browser state, update copy, update `data-active-step`, and expose an interaction smoke path future agents can repeat before any external host is considered.

## Browser demo adapter contract

The contract must name:

1. source capsule;
2. self-contained browser runtime boundary;
3. optional deploy boundary and rollback expectation;
4. exact controls;
5. exact states;
6. mutation/proof copy per state;
7. blocked moves;
8. public boundary;
9. proof commands;
10. generated smoke artifacts.

The HTML is intentionally framework-free. It gives the creator a local browser prototype and proof rail, not a production web app.

```bash
bun creator:browser-demo-check
open examples/creator-browser-demo.html
```

The second command is a local operator step. CI validates the contract and source; visual QA can then click the controls in browser automation.

## QA checks

```bash
bun creator:browser-demo-check
bun measure:check -- examples/creator-browser-demo.html
bun print:render -- examples/creator-browser-demo.html /tmp/dash-creator-browser-demo.pdf --canvas=1684x1191
bun docs:links
bun security:scan
bun hackathon:score
```

For visual and interaction QA, open `examples/creator-browser-demo.html` in browser automation and confirm:

- the full `.page` fits a 1684x1191 canvas;
- no raw media tags, external network calls, analytics, backend bridge, or public deploy action is present;
- each of the four controls changes the active copy and `aria-pressed` state;
- the proof rail names measure, print, smoke, and boundary checks;
- the route clearly says it is not dashboard-only output.

## Failure modes

- **Static-board drift**: the HTML looks good but has no interaction path. Blocked by `creator:browser-demo-check` and browser interaction smoke.
- **Core bloat**: adding a framework, router, backend, database, analytics, or hosting dependency from one browser route. Blocked by the runtime boundary.
- **Premature public deploy**: changing Vercel or other hosting config before local proof. Blocked by the optional deploy boundary.
- **Private leakage**: embedding private prompts, client copy, local paths, account screenshots, raw media, cookies, tokens, secrets, or provider logs. Blocked by public boundary and security scan.
- **Fake proof**: claiming browser QA while only reading source. Blocked by the route requiring browser visual QA and interaction smoke.

## Public boundary

Allowed:

- synthetic capsule fields;
- self-contained HTML, CSS, and local JavaScript state;
- repo-relative `.artifacts` smoke output names;
- public-safe copy and visual grammar;
- fixed-canvas proof card and PDF proof.

Blocked:

- private prompts or client copy;
- raw generated image, video, audio, rendered exports, and account screenshots;
- local absolute paths or provider execution logs;
- cookies, tokens, secrets, credentials, and API material;
- external network calls, analytics, backend bridges, databases, event streams, and CDNs;
- automatic public deploys or hosting config mutation from this repo slice.

## Remix rule

A creator may change the copy, palette, step order, interaction labels, local animation, and optional later static-host handoff. The route breaks if they remove source capsule memory, blocked inputs, browser smoke, measure/print proof, rollback notes, or the no-network/no-backend runtime boundary.

## 中文摘要

这个 mutation 把 creator capsule 变成可点击的本地浏览器 demo：一个 JSON 合约、一个固定画布 HTML、以及 `.artifacts` 里的 smoke 记录。它先证明交互、尺寸、PDF、安全边界，再考虑外部静态部署。DASH 不引入前端框架、不接后端、不自动发布、不保存截图或私有素材。它是 capsule 到 browser phenotype 的安全交接，不是 dashboard。
