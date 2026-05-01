# Examples

Small public examples for validating the design-infra pipeline.

## One-Pager

```bash
bun measure:check -- examples/one-pager.html
bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191
```

The page is intentionally sanitized: it demonstrates tokens, capsize metrics,
fixed-canvas measurement, and PDF rendering without private project content.

## Creator Storyboard

`creator-motion-storyboard.{json,html}` is the public-safe bridge from a creator
capsule to motion/video direction. It is a fixed-canvas storyboard contract, not
raw generated media.

```bash
bun creator:motion-storyboard-check
bun measure:check -- examples/creator-motion-storyboard.html
bun print:render -- examples/creator-motion-storyboard.html /tmp/dash-creator-motion-storyboard.pdf --canvas=1684x1191
```

## Motion Usecases

p5.js visual examples live in [`../usecases/p5js`](../usecases/p5js). They are
cropped, public-safe previews of reusable motion grammar, not raw private lab
dumps.

## 示例

这里放公开安全的设计基础设施示例，不放内部项目内容。

```bash
bun measure:check -- examples/one-pager.html
bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191
```

p5.js 视觉用例在 [`../usecases/p5js`](../usecases/p5js)。

Creator motion storyboard 示例用固定画布表达视频前的 motion brief，不提交 raw video 或私有素材。
