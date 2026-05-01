# Creator OS Direction

DASH Design Infra exists for creators, not for infrastructure theater.

A creator does not need ten more abstract frameworks. They need a small surface that helps them remember what they are making, convert it into the right artifact, prove it rendered correctly, and remix it later without losing the original intent.

## Product thesis

The repo should become a minimal creator operating layer for frontier visual work:

```text
idea -> capsule -> artifact -> proof -> remix trail
```

The capsule is the smallest useful unit. It is not a full project management system. It is a memory card for a creative work: what it is for, what it should feel like, what inputs are allowed, what output surface it targets, what tools may generate it, and how proof is collected.

## Who this helps

| Creator | Real job | DASH job |
|---|---|---|
| Founder / operator | explain a product, market, or decision visually | turn messy intent into a publishable board/report/deck |
| Visual artist | explore a visual system without losing the seed | preserve prompt DNA, palette, motion grammar, and proof path |
| Content creator | ship a thumbnail, short, poster, or thread visual | route to surface-specific formats and QA before posting |
| Researcher | make evidence legible | choose report, weather map, archive board, or ratchet card |
| Agent builder | package a creative workflow | keep install, trigger, verification, and rollback compact |

## Anti-goals

- No bloated CMS.
- No all-in-one app shell before there are real creator wins.
- No private prompt dumps.
- No asset warehouse.
- No generic gallery that only looks good in README screenshots.
- No tool-specific lock-in. TouchDesigner, p5.js, Remotion, Manim, HTML, image/video models, and future tools should enter through the same capsule boundary.

## Minimal architecture

```text
docs/CREATOR_OS.md
  defines creator-first product direction

usecases/creator/*.md
  explains reusable creator workflows

examples/*.html + examples/*.json
  public-safe concrete capsules and rendered boards

scripts/*check.ts
  validates that a creator-facing workflow is real, not vibes

packages/*
  only when repeated examples prove a primitive deserves code
```

The repo should stay boring at the core: tokens, layout, motion grammar, measure, print, public-boundary scan. Frontier visual tools sit at the edge as adapters, not as the core.

## Creator Capsule Contract

Every creator-facing workflow should be reducible to this shape:

| Field | Meaning |
|---|---|
| `creator` | who this is for, as a role or working mode |
| `intent` | the job the artifact must do |
| `memory` | what should survive across remixes |
| `surface` | output format: poster, board, deck, short, PDF, tox, sketch, etc. |
| `grammar` | visual/motion language, not copied assets |
| `inputs` | allowed source material and blocked private material |
| `tool_path` | generation/rendering route |
| `proof` | measure, print, browser, contact sheet, score, or platform QA |
| `remix_rule` | what can change without breaking the artifact |

If those fields are missing, the creator will not be able to resume the work a week later.

## Month-one operating plan

The month after the hackathon sprint should optimize for creator usefulness, not repo size.

| Week | Goal | Proof |
|---|---|---|
| 1 | Creator capsules: brief, poster, deck, short/video, visual-system routes | each has one public-safe example and one command |
| 2 | Frontier adapters: TouchDesigner/twozero, p5, Remotion, Manim, browser demo | adapter docs name install boundary, render command, QA |
| 3 | Remix memory: capsule JSON, prompt DNA, palette/motion tokens, result cards | examples can be regenerated from compact inputs |
| 4 | Shipping surfaces: social image, PDF, short video, web board, repo skill | every surface has proof and public boundary |

## Quality bar

A contribution is useful when a creator can answer:

1. What do I make with this?
2. What do I give it?
3. What comes out?
4. How do I know it did not break?
5. How do I remix it later?

If the answer is not obvious, cut the abstraction until it is.

## 中文摘要

DASH 的方向不是继续堆“视觉基础设施”这个词，而是做 creator 真能用的最小工作层：把一个创意保存成 capsule，再生成 artifact，再用浏览器 / PDF / contact sheet / score 证明它能交付，最后留下 remix trail。核心要小，边缘要能接所有 frontier visual tools。