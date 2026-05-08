# Creator Social Card Route

This mutation routes the Creator Frontier Capsule into a crop-safe 1200x630 social preview card. It is for creators who need a launch-thread cover, newsletter hero, LinkedIn image, or link-preview visual that can be checked before posting.

It is not a dashboard and not a media warehouse. The output is a public-safe HTML artifact that can be measured, exported, visually inspected, and remixed without committing platform screenshots or raw generated media.

## Output

- Surface contract: [`examples/creator-social-card.json`](../../examples/creator-social-card.json)
- Social card artifact: [`examples/creator-social-card.html`](../../examples/creator-social-card.html)
- Validation command: `bun creator:social-card-check`

## Mutation selected

| Field | Value |
|-------|-------|
| Candidate | `creator-social-card-route` |
| Axis | `surface` |
| Phenotype | 1200x630 fixed-canvas HTML social card + PDF proof path |
| Retention | example + script gate + CI route + standardized vision QA |
| Not promoted | package primitive; one social/export surface is not enough |

## Why social card now

The prior retained routes make a poster, prompt DNA card, motion storyboard, contact sheet, and repo-local skill package. The missing creator job is posting: a creator often needs one image that survives platform crops before the full artifact is ready.

This route wins the current slice because it:

- turns one capsule into a real publishable surface;
- adds a crop-safe 1200x630 phenotype instead of another explanation;
- uses existing browser measurement and print export paths;
- keeps private source media, account screenshots, and generated model output out of git;
- gives future social/export adapters a small contract to compete against;
- now includes standardized vision QA to extend the Darwin pattern across all creator surfaces (per hermes-gsd-evolution).

## Commands

```bash
bun creator:social-card-check
bun measure:check -- examples/creator-social-card.html --canvas=1200x630
bun print:render -- examples/creator-social-card.html /tmp/dash-creator-social-card.pdf --canvas=1200x630
bun security:scan
bun hackathon:score
```

## Production contract

1. Start from `examples/creator-frontier-capsule.json`.
2. Keep the hook, capsule memory, blocked inputs, proof path, and remix rule visible.
3. Render a `.page` at exactly `1200x630`.
4. Keep important text inside a center-safe crop zone.
5. Export proof through `measure:check`, `print:render`, browser visual QA with standardized template, and .artifacts QA note before posting.

## QA checks

- `bun creator:social-card-check` validates JSON, HTML, docs, package script, CI hook, public boundary, no raw media embeds, standardized VISION_QUESTION_TEMPLATE, and generates .artifacts/creator-social-card-qa.md with browser visual QA evidence from the Darwin vision template.
- `bun measure:check -- examples/creator-social-card.html --canvas=1200x630` proves the fixed canvas fits in Chromium.
- `bun print:render -- examples/creator-social-card.html /tmp/dash-creator-social-card.pdf --canvas=1200x630` proves export works.
- Browser visual QA (with high-yield template for crop safety, hierarchy, and industrial-brutalist social fit) confirms the card reads as portable social proof. The QA note embeds real browser_vision summary to prevent drift in autonomous runs.

## Failure modes

- The hook sits too close to an edge and platform crops remove it.
- The artifact becomes a generic quote card instead of preserving capsule memory.
- The workflow commits screenshots, raw model output, client copy, or local source paths.
- The card looks good visually but skips measurement/export proof or vision QA.

## Public boundary

Allowed:

- synthetic creator hook;
- public-safe capsule fields;
- DASH typography and layout grammar;
- generated HTML/CSS artifact.

Blocked:

- private client text;
- raw creator media;
- local absolute source paths;
- API keys, cookies, tokens, passwords;
- platform account screenshots or client analytics.

## Remix rule

Change the hook, accent color, platform target, and supporting line freely. Preserve the source capsule pointer, safe-crop zone, blocked inputs, proof path, no-raw-media rule, and vision QA template.

## 中文摘要

这个 mutation 把 creator capsule 变成 1200x630 的社交预览图：能发 thread、newsletter、LinkedIn，也能先过浏览器测量、PDF 导出、vision QA模板和安全边界检查。它不是 dashboard，不提交 raw media；保留为 example + script gate + CI route + vision QA，不升级成 package primitive。现在扩展了所有 creator surfaces 的 vision QA 模式，防止 autonomous Darwin 漂移。
