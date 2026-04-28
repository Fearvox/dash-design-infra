# dash-design-infra

基于 Bun 的固定画布编辑设计基础设施。

它把设计 token、字号比例、字形基线校正、Kami 风格文档预设、p5.js 动态视觉语法、溢出检测、约束布局和 HTML 到 PDF 输出串成一条完整工程链，适合单页、deck、研究型页面、动态视觉实验和需要稳定落版的打印表面。

[English](./README.md) · [中文](./README-zh.md)

![License: MIT](https://img.shields.io/badge/license-MIT-0f172a.svg)
![Bun](https://img.shields.io/badge/runtime-Bun-111827.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-2563eb.svg)
![Fixed Canvas](https://img.shields.io/badge/layout-fixed--canvas-14532d.svg)
![CI](https://img.shields.io/github/actions/workflow/status/Fearvox/dash-design-infra/ci.yml?branch=main&label=CI)

[快速开始](#快速开始) · [架构](#架构) · [包说明](#包说明) · [Kami-和-P5-带来了什么](#kami-和-p5-带来了什么) · [Hall of Fame](#hall-of-fame) · [贡献指南](./CONTRIBUTING.md)

---

## 这是什么

`dash-design-infra` 是一个面向固定画布设计系统的 Bun workspace。

它不是“几份 CSS + 若干变量”，而是一套可验证的页面工程管线：

| 层 | 负责什么 | 为什么存在 |
|---|---|---|
| `@dash/tokens` | 颜色、字号、间距、页面几何、动效 | 单一事实源 |
| `@dash/scale` | 比例规则和行高规则 | 可重复生成版式尺度 |
| `@dash/metrics` | 字体度量与 cap-line 对齐 | 真正落到基线 |
| `@dash/kami` | 编辑型文档审美预设 | 温润、可打印、适合 agent 输出 |
| `@dash/p5-motion` | p5.js 动态语法和 sketch helper | 从稳定设计数据生成动态原型 |
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
- 动态和审美也需要边界。Kami 与 p5.js 进入公开仓时是被提炼后的 preset / grammar，不是把自用实验室原样搬进来。

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

试一下新的预设层：

```ts
import { kamiPreset } from '@dash/kami';
import { createTileGrid, layoutTileFrame } from '@dash/p5-motion';

const pageColor = kamiPreset.colors.canvas;
const tiles = layoutTileFrame(createTileGrid(720, 960, 3, 3), 0.42);
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
          ▲                ▲
          │                │
  ┌──────────────┐  ┌──────────────┐
  │ @dash/metrics│  │  @dash/kami  │
  │  (capsize)   │  │  (preset)    │
  └──────────────┘  └──────────────┘
          ▲                ▲
          │                │
  ┌──────────────┐  ┌──────────────┐
  │@dash/measure │  │@dash/p5-motion│
  │ (CI gate)    │  │ (sketch API) │
  └──────────────┘  └──────────────┘
          ▲                ▲
          │                │
  ┌──────────────┐  ┌──────────────┐
  │ @dash/layout │  │ @dash/print  │
  │  (kiwi.js)   │  │  (paged.js)  │
  └──────────────┘  └──────────────┘
```

`@dash/tokens` 是事实源；`@dash/scale` 负责比例生成；`@dash/kami` 和 `@dash/p5-motion` 把审美与动态视觉变成可复用预设；其余包负责消费、验证或输出这套系统。

---

## 包说明

| 包 | 作用 | 核心依赖 |
|---|---|---|
| `@dash/tokens` | 从 DTCG token 生成 CSS vars、ESM 导出与平铺 JSON | `style-dictionary` |
| `@dash/scale` | 生成固定画布下的字号和间距尺度 | `utopia-core` |
| `@dash/metrics` | 生成 capsize 基线对齐辅助样式 | `@capsizecss/core` |
| `@dash/kami` | 提供 Kami 启发的编辑型文档审美预设 | 无 |
| `@dash/p5-motion` | 提供 p5.js 动态视觉契约和确定性 sketch helper | peer `p5` |
| `@dash/measure` | 校验页面是否溢出或被裁切 | `playwright` |
| `@dash/layout` | 用约束求解处理硬布局规则 | `@lume/kiwi` |
| `@dash/print` | 用 paged media 支持把 HTML 导出为 PDF | `pagedjs`, `playwright` |

每个包自己的说明都在 [`packages/`](./packages) 下面。

---

## Kami 和 P5 带来了什么

`@dash/kami` 给仓库增加了文档审美层。当 agent 要输出一页纸、长报告、正式信、简历、作品集或 slide deck 时，它提供一组稳定规则：羊皮纸底、墨蓝单一强调色、serif 层级、打印安全 tag、低阴影编辑型表面。它受 [@tw93](https://github.com/tw93) 的 [Kami](https://kami.tw93.fun/) 启发，但本仓库不 vendor Kami 代码或字体。

`@dash/p5-motion` 给仓库增加了浏览器动态层。它把自用 p5.js lab 提炼成公开安全的 primitive：tile grid、确定性漂移、重组循环、扫描场、天气图压力系统，以及 kinetic poster 的视觉语法。它适合先用 DASH token 和 spec 做动态原型，再决定某个视觉是否值得进入生产渲染器。

两者合在一起，让 DASH 在不改变事实源的前提下覆盖三类表面：

| 表面 | 使用 | 结果 |
|---|---|---|
| 静态文档 | `@dash/kami` + `@dash/print` | polished PDF 或 deck-like HTML |
| 浏览器动态实验 | `@dash/p5-motion` | 有可复用 motion grammar 的 p5.js sketch |
| 固定画布产物 | `@dash/tokens` + `@dash/measure` + `@dash/layout` | 不裁切、可验证的页面 |

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
│   ├── kami/
│   ├── measure/
│   ├── metrics/
│   ├── p5-motion/
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
- Kami 启发的编辑型文档预设
- p5.js 动态视觉语法工具
- 浏览器内溢出校验
- 约束求解骨架
- paged.js PDF 输出
- 安装、构建、typecheck 的 CI

刻意保留为后续迭代：
- `@dash/scale --write` 还没实现
- 示例页面刻意保持最小且已脱敏
- p5.js lab 源文件留在自用区，只有提炼后的稳定 API 进入公开仓
- 打印相关 vendor 资源仍由使用方自己管理

---

## Hall of Fame

特别感谢 [@tw93](https://github.com/tw93)。[Kami](https://github.com/tw93/kami) 对这里的文档审美层影响很大；[Kaku](https://github.com/tw93/Kaku) 和 [Mole](https://github.com/tw93/Mole) 这类工具也实实在在参与了我们日常工作流，让这个 repo 的方向更清楚。

这里是 attribution 和感谢，不代表上游作者对本仓库代码负责。

---

## 贡献

见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

一句话原则：改动尽量小，尽量可回退，尽量在真实页面路径上验证。

---

## 许可证

MIT。见 [LICENSE](./LICENSE)。
