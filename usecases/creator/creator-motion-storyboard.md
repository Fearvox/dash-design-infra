# Creator Motion Storyboard Route

## Mutation selected

`creator-motion-storyboard-route` is the next retained creator mutation after the poster surface and prompt DNA adapter. It turns one creator capsule into a six-frame motion brief before any video renderer, model output, or private source media is allowed into the loop.

This is intentionally not a renderer. It is a public-safe bridge from capsule memory to future contact-sheet QA.

## Route contract

- entry JSON: `examples/creator-motion-storyboard.json`
- proof artifact: `examples/creator-motion-storyboard.html`
- command: `bun creator:motion-storyboard-check`
- canvas: 1684×1191 fixed canvas
- frame count: 6
- future adapter edge: video/contact-sheet tooling, not core packages yet

## Contact-sheet bridge

The route names frame timing, composition, and motion language in a static fixed-canvas proof. A future video renderer must first emit an ignored contact sheet and pass a browser/visual QA loop before any motion output is considered retained.

## Public boundary

Allowed:

- synthetic capsule memory;
- frame timing and visual grammar;
- public-safe storyboard copy;
- verification commands and proof artifacts.

Blocked:

- raw generated video;
- private prompts;
- local absolute source paths;
- API keys, cookies, account screenshots;
- client copy or unreleased brand assets;
- model output committed to git.

## Remix rule

Change seed, aspect ratio, duration, model family, and surface target only as handles around the capsule. Do not mutate the underlying memory unless the capsule itself is updated and rechecked.

## Verification

```bash
bun creator:motion-storyboard-check
bun measure:check -- examples/creator-motion-storyboard.html
bun print:render -- examples/creator-motion-storyboard.html /tmp/dash-creator-motion-storyboard.pdf --canvas=1684x1191
bun security:scan
bun hackathon:score
```

## 中文摘要

这个 route 把 creator capsule 变成六帧 motion storyboard。它不是视频渲染器，而是视频前的公开安全合约：先固定画布、时间线、边界和验证命令，再谈模型或渲染器。禁止 raw video、私有 prompt、本地路径、账号截图和客户素材进入 git。
