# dash-design-infra

基于 Bun 的固定画布编辑设计基础设施。

它把设计 token、字号比例、字形基线校正、溢出检测、约束布局和 HTML 到 PDF 输出串成一条完整工程链，适合单页、deck、研究型页面和需要稳定落版的打印表面。

[English](./README.md) · [中文](./README-zh.md)

![License: MIT](https://img.shields.io/badge/license-MIT-0f172a.svg)
![Bun](https://img.shields.io/badge/runtime-Bun-111827.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-2563eb.svg)
![Fixed Canvas](https://img.shields.io/badge/layout-fixed--canvas-14532d.svg)
![CI](https://img.shields.io/github/actions/workflow/status/Fearvox/dash-design-infra/ci.yml?branch=main&label=CI)

[快速开始](#快速开始) · [架构](#架构) · [包说明](#包说明) · [工作流](#典型工作流) · [贡献指南](./CONTRIBUTING.md)

---

## 这是什么

`dash-design-infra` 是一个面向固定画布设计系统的 Bun workspace。

它不是“几份 CSS + 若干变量”，而是一套可验证的页面工程管线：

| 层 | 负责什么 | 为什么存在 |
|---|---|---|
| `@dash/tokens` | 颜色、字号、间距、页面几何、动效 | 单一事实源 |
| `@dash/scale` | 比例规则和行高规则 | 可重复生成版式尺度 |
| `@dash/metrics` | 字体度量与 cap-line 对齐 | 真正落到基线 |
| `@dash/measure` | 浏览器内溢出检测 | 在导出前抓住裁切问题 |
| `@dash/layout` | 硬约束布局求解 | 表达 CSS 很难保证的规则 |
| `@dash/print` | HTML 到 PDF 输出 | 保持 screen 与 print 同一路径 |

如果你的页面不能接受“差不多”，这个仓库就是为这种工作方式准备的。

---

## 为什么做这个仓库

- 只有 token 不够。固定画布场景还需要比例、字形基线、溢出校验和打印输出。
- 真实浏览器才算真相。布局检测在 Playwright 里跑，而不是靠静态猜测。
- 打印不该是第二宇宙。同一份 HTML 应该既能预览，也能导出 PDF。
- 硬规则要有硬工具。复杂页面可以上约束求解，而不只是盯着 grid/flex 祈祷。

---

## 快速开始

```bash
bun install
bun x playwright install chromium

bun tokens:build
bun metrics:build
bun typecheck
```

几个核心流程：

```bash
# 生成字号与间距尺度
bun scale:gen

# 检查页面是否超出固定画布
bun measure:check -- ./pages/page.html

# 把 HTML 渲染成 PDF
bun print:render -- ./pages/page.html ./out.pdf
```

---

## 架构

```text
        ┌──────────────┐
        │  @dash/scale │──┐
        └──────────────┘  │
                          ▼
                  ┌──────────────┐
                  │ @dash/tokens │
                  └──────────────┘
         ▲                 ▲                ▲                 ▲
         │                 │                │                 │
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ metrics  │     │ measure  │     │  layout  │     │  print   │
  │(capsize) │     │(CI gate) │     │(kiwi.js) │     │(paged.js)│
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
```

`@dash/tokens` 是事实源；`@dash/scale` 负责比例生成；其余包负责消费、验证或输出这套系统。

---

## 包说明

| 包 | 作用 | 核心依赖 |
|---|---|---|
| `@dash/tokens` | 从 DTCG token 生成 CSS vars、ESM 导出与平铺 JSON | `style-dictionary` |
| `@dash/scale` | 生成固定画布下的字号和间距尺度 | `utopia-core` |
| `@dash/metrics` | 生成 capsize 基线对齐辅助样式 | `@capsizecss/core` |
| `@dash/measure` | 校验页面是否溢出或被裁切 | `playwright` |
| `@dash/layout` | 用约束求解处理硬布局规则 | `@lume/kiwi` |
| `@dash/print` | 用 paged media 支持把 HTML 导出为 PDF | `pagedjs`, `playwright` |

每个包自己的说明都在 [`packages/`](./packages) 下面。

---

## 典型工作流

1. 修改 `packages/tokens/src/tokens.json` 里的语义值。
2. 运行 `bun tokens:build` 生成产物。
3. 如果动了排版，运行 `bun metrics:build` 更新 capsize 样式。
4. 用 `bun measure:check -- <html>` 在真实页面上做溢出校验。
5. 用 `bun print:render -- <html> <pdf>` 输出 PDF。

这套仓库的核心思路是：定义一次，在真实路径验证，然后沿着同一份 HTML 输出。

---

## 目录结构

```text
.
├── .github/workflows/ci.yml
├── packages/
│   ├── layout/
│   ├── measure/
│   ├── metrics/
│   ├── print/
│   ├── scale/
│   └── tokens/
├── CONTRIBUTING.md
├── README.md
├── README-zh.md
└── package.json
```

---

## 当前状态

已经可用：
- token 构建链路
- capsize CSS 生成
- 浏览器内溢出校验
- 约束求解骨架
- paged.js PDF 输出
- 安装、构建、typecheck 的 CI

刻意保留为后续迭代：
- `@dash/scale --write` 还没实现
- 公开仓没有附带完整示例页面
- 打印相关 vendor 资源仍由使用方自己管理

---

## 贡献

见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

一句话原则：改动尽量小，尽量可回退，尽量在真实页面路径上验证。

---

## 许可证

MIT。见 [LICENSE](./LICENSE)。
