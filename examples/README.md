# Examples

Small public examples for validating the design-infra pipeline.

## One-Pager

```bash
bun measure:check -- examples/one-pager.html
bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191
```

The page is intentionally sanitized: it demonstrates tokens, capsize metrics,
fixed-canvas measurement, and PDF rendering without private project content.

## Creator Poster Surface

```bash
bun creator:poster-check
bun measure:check -- examples/creator-poster-surface.html
bun print:render -- examples/creator-poster-surface.html /tmp/dash-creator-poster-surface.pdf --canvas=1684x1191
```

The poster route turns the public creator capsule into a single fixed-canvas
artifact while preserving intent, memory, proof path, public boundary, and remix
rule.

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
