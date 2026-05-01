# Creator Poster Surface Route

This is the first actual creator surface mutation retained after the candidate ledger.

It routes the existing Creator Frontier Capsule into a single publishable fixed-canvas poster. The point is not to add a new renderer. The point is to prove that one capsule can become a concrete surface while preserving memory, proof, public boundary, and remix rules.

## Output

- Surface contract: [`examples/creator-poster-surface.json`](../../examples/creator-poster-surface.json)
- Poster artifact: [`examples/creator-poster-surface.html`](../../examples/creator-poster-surface.html)
- Validation command: `bun creator:poster-check`

## Mutation selected

| Field | Value |
|---|---|
| Candidate | `poster-surface-route` |
| Axis | `surface` |
| Phenotype | fixed-canvas HTML poster + PDF proof path |
| Retention | example + script gate |
| Not promoted | package primitive; one surface win is not enough |

## Why poster first

Poster wins the first surface route because it is the smallest high-proof creator artifact:

- one capsule becomes one publishable visual;
- existing `measure` and `print` gates verify it;
- the artifact is easy to inspect in browser;
- no raw media or model output enters the repo;
- it keeps frontier tools at the adapter edge.

## Commands

```bash
bun creator:poster-check
bun measure:check -- examples/creator-poster-surface.html
bun print:render -- examples/creator-poster-surface.html /tmp/dash-creator-poster-surface.pdf --canvas=1684x1191
bun security:scan
bun hackathon:score
```

## Public boundary

Allowed:

- synthetic creator copy;
- public-safe capsule fields;
- DASH visual grammar;
- generated HTML/CSS artifact.

Blocked:

- private client text;
- raw creator media;
- local absolute source paths;
- API keys, cookies, account screenshots;
- unreviewed generated model output.

## Remix rule

Change poster headline, accent color, and delivery surface freely. Preserve creator intent, memory rail, blocked inputs, proof path, and remix rule.

## 中文摘要

这是第一个真正的 creator surface mutation：把 capsule 变成 poster。它不是 dashboard，也不是新框架；它是一个可测量、可 PDF proof、可浏览器 QA 的公开安全产物。保留为 example + script gate，不升级成 package primitive。
