# Creator PDF Zine Route

This mutation routes the Creator Frontier Capsule into a one-sheet printable PDF zine. It is for creators who need a small process handout: something they can print, fold, annotate, or give to a collaborator without losing the original idea, proof path, public boundary, or remix rule.

It is not a dashboard, not a CMS, and not a booklet engine. The output is a public-safe fixed-canvas HTML sheet that can be measured, exported to PDF, visually inspected, and remixed before any heavier print tooling enters the repo.

## Output

- Surface contract: [`examples/creator-pdf-zine.json`](../../examples/creator-pdf-zine.json)
- Zine artifact: [`examples/creator-pdf-zine.html`](../../examples/creator-pdf-zine.html)
- Validation command: `bun creator:pdf-zine-check`

## Mutation selected

| Field | Value |
|---|---|
| Candidate | `creator-pdf-zine-route` |
| Axis | `surface` |
| Phenotype | 1684x1191 one-sheet process zine + PDF proof path |
| Retention | example + script gate + CI route |
| Not promoted | package primitive or booklet engine; one printable remix surface is not enough |

## Why PDF zine now

The retained creator routes already cover posters, prompt DNA, motion storyboards, contact-sheet QA, social cards, creative-coding probes, timeline/explainer scene stubs, TouchDesigner handoffs, browser demos, and a repo-local skill package. The missing creator job is a printable process object: a small handoff that keeps the capsule alive when a collaborator is away from the browser.

This route wins the current slice because it:

- turns one capsule into a real printable artifact, not another explanation;
- makes remix memory portable on a desk, wall, or workshop table;
- reuses the existing fixed-canvas measure and print paths;
- keeps raw media, local source paths, private notes, and screenshots out of git;
- gives future print/export surfaces a small contract to compete against.

## Commands

```bash
bun creator:pdf-zine-check
bun measure:check -- examples/creator-pdf-zine.html --canvas=1684x1191
bun print:render -- examples/creator-pdf-zine.html /tmp/dash-creator-pdf-zine.pdf --canvas=1684x1191
bun docs:links
bun security:scan
bun hackathon:score
```

## PDF zine contract

1. Start from `examples/creator-frontier-capsule.json`.
2. Preserve intent, memory, grammar, blocked inputs, proof path, and remix rule.
3. Render a `.page` at exactly `1684x1191`.
4. Use one sheet with six named panels: idea, capsule, proof, boundary, remix, handoff.
5. Export proof through `measure:check`, `print:render`, and browser visual QA before sharing.
6. Keep booklet generators, print imposition tools, raw media, and private source material outside the core repo until repeated printable surfaces prove the primitive.

## QA checks

- `bun creator:pdf-zine-check` validates JSON, HTML, docs, package script, CI hook, routing docs, public boundary, and no raw media embeds.
- `bun measure:check -- examples/creator-pdf-zine.html --canvas=1684x1191` proves the fixed sheet fits in Chromium.
- `bun print:render -- examples/creator-pdf-zine.html /tmp/dash-creator-pdf-zine.pdf --canvas=1684x1191` proves the single-sheet PDF path works.
- Browser visual QA confirms the artifact reads like a process zine rather than a poster clone or static dashboard.

## Failure modes

- The sheet becomes a decorative poster and stops preserving process memory.
- Panel copy is too small to read after export.
- A future agent adds booklet tooling before multiple zine/process surfaces prove the need.
- The workflow commits raw generated media, account screenshots, client copy, or local source paths.
- Print proof is skipped because the HTML looks acceptable in a browser.

## Public boundary

Allowed:

- synthetic creator process notes;
- public-safe capsule fields;
- DASH typography, fixed-canvas, and print grammar;
- generated HTML/CSS zine artifact;
- single-sheet PDF proof path.

Blocked:

- private client text;
- raw creator media or generated media;
- local absolute source paths;
- API keys, cookies, tokens, passwords, or secrets;
- account screenshots, provider logs, or client analytics.

## Remix rule

Change panel copy, accent color, panel order, and collaborator notes freely. Preserve the source capsule pointer, six-panel structure, blocked-input list, proof commands, and no-raw-media rule.

## 中文摘要

这个 mutation 把 creator capsule 变成一张可打印的 PDF zine：六个面板保留 idea、capsule memory、proof、boundary、remix 和 handoff。它不是 dashboard，也不是 booklet engine；先用 HTML 固定画布、浏览器测量、PDF 导出和安全边界证明，再考虑更重的印刷工具。
