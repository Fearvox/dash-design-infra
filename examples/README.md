# Examples

Small public examples for validating the design-infra pipeline.

## One-Pager

```bash
bun measure:check -- examples/one-pager.html
bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191
```

The page is intentionally sanitized: it demonstrates tokens, capsize metrics,
fixed-canvas measurement, and PDF rendering without private project content.

## 示例

这里放公开安全的设计基础设施示例，不放内部项目内容。

```bash
bun measure:check -- examples/one-pager.html
bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191
```
