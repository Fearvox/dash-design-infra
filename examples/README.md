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

## Creator PDF Zine

`creator-pdf-zine.{json,html}` turns the creator capsule into a six-panel,
one-sheet 1684x1191 process zine. It is a printable handoff surface, not a
booklet engine, private workshop note, or raw generated media.

```bash
bun creator:pdf-zine-check
bun measure:check -- examples/creator-pdf-zine.html --canvas=1684x1191
bun print:render -- examples/creator-pdf-zine.html /tmp/dash-creator-pdf-zine.pdf --canvas=1684x1191
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

## Creator Remotion Scene

`creator-remotion-scene.{json,html}` turns the creator capsule into a checked
Remotion composition handoff. The check generates an ignored TSX stub before any
external Remotion runtime or rendered video is used.

```bash
bun creator:remotion-scene-check
bun measure:check -- examples/creator-remotion-scene.html
bun print:render -- examples/creator-remotion-scene.html /tmp/dash-creator-remotion-scene.pdf --canvas=1684x1191
```

## Creator Manim Scene

`creator-manim-scene.{json,html}` turns the creator capsule into a checked
Manim explainer-scene handoff. The check generates an ignored Python Scene stub
before any external Manim runtime or rendered MP4 is used.

```bash
bun creator:manim-scene-check
bun measure:check -- examples/creator-manim-scene.html
bun print:render -- examples/creator-manim-scene.html /tmp/dash-creator-manim-scene.pdf --canvas=1684x1191
```

## Creator TouchDesigner TOX

`creator-touchdesigner-tox.{json,html}` turns the creator capsule into a checked
TouchDesigner/twozero network handoff. The check generates ignored topology and
safety artifacts before any local TD process, screenshot, `.tox`, or raw media is used.

```bash
bun creator:touchdesigner-tox-check
bun measure:check -- examples/creator-touchdesigner-tox.html
bun print:render -- examples/creator-touchdesigner-tox.html /tmp/dash-creator-touchdesigner-tox.pdf --canvas=1684x1191
```

## Creator Browser Demo

`creator-browser-demo.{json,html}` turns the creator capsule into a checked,
self-contained browser demo handoff. The check generates ignored smoke notes
before any backend, network call, analytics, screenshot, hosting config, or public deploy is used.

```bash
bun creator:browser-demo-check
bun measure:check -- examples/creator-browser-demo.html
bun print:render -- examples/creator-browser-demo.html /tmp/dash-creator-browser-demo.pdf --canvas=1684x1191
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
Creator PDF Zine 示例把 capsule 接到一张 1684x1191 六面板 process zine，先测量和导出 PDF，再考虑更重的印刷工具。
Creator P5 Sketch 示例把 capsule 接到 `dash-flow-field` p5 contract，先生成 frame probes，再交给外部 runtime。
Creator Remotion Scene 示例把 capsule 接到 Remotion composition contract，先生成 `.artifacts` TSX stub，再交给外部 runtime。
Creator Manim Scene 示例把 capsule 接到 Manim explainer scene contract，先生成 `.artifacts` Python Scene stub，再交给外部 runtime。
Creator TouchDesigner TOX 示例把 capsule 接到 TouchDesigner/twozero network contract，先生成 `.artifacts` topology/safety artifacts，再由本地操作者外部执行。
Creator Browser Demo 示例把 capsule 接到 self-contained browser demo contract，先本地点击并生成 smoke notes，再考虑外部静态部署。
