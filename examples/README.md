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

## Creator Social Card

`creator-social-card.{json,html}` turns the same creator capsule into a crop-safe
1200x630 social/link-preview image. It is a public-safe posting surface, not raw
generated media or a platform screenshot.

```bash
bun creator:social-card-check
bun measure:check -- examples/creator-social-card.html --canvas=1200x630
bun print:render -- examples/creator-social-card.html /tmp/dash-creator-social-card.pdf --canvas=1200x630
```

## Creator P5 Sketch

`creator-p5-sketch.{json,html}` turns the creator capsule into a deterministic
`dash-flow-field` p5 sketch adapter. The check generates ignored frame-probe JSON
before any external p5 runtime or rendered media is used.

```bash
bun creator:p5-sketch-check
bun p5:motion-check
bun measure:check -- examples/creator-p5-sketch.html
bun print:render -- examples/creator-p5-sketch.html /tmp/dash-creator-p5-sketch.pdf --canvas=1684x1191
```

## Creator Manim Scene

`creator-manim-scene.{json,html}` turns the creator capsule into a checked Manim
scene adapter. The check generates an ignored Python scene stub before any
external Manim render or MP4 output is allowed.

```bash
bun creator:manim-scene-check
bun measure:check -- examples/creator-manim-scene.html
bun print:render -- examples/creator-manim-scene.html /tmp/dash-creator-manim-scene.pdf --canvas=1684x1191
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
Creator Social Card 示例用于 1200x630 社交预览图，先证明 crop-safe 和 public boundary，再发布。
Creator P5 Sketch 示例把 capsule 接到 `dash-flow-field` p5 contract，先生成 frame probes，再交给外部 runtime。
Creator Manim Scene 示例把 capsule 接到外部 Manim scene stub，先生成 proof card 和 Python handoff，不提交 MP4。
