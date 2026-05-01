<div align="center" id="top">
  <h1 align="center">DASH Design Infra</h1>
  <p align="center">
    给 agent 做页面、报告、海报和 PDF 用的一套设计基础设施。
    <br />
    <strong>Kami 文档审美、p5.js 动态语法、固定画布校验、HTML 到 PDF，走同一条 Bun 路径。</strong>
  </p>

  <p align="center">
    <a href="./README.md">English</a> · <a href="./README-zh.md">中文</a>
  </p>

  <p align="center">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0f172a.svg?style=for-the-badge" />
    <img alt="Runtime: Bun" src="https://img.shields.io/badge/runtime-Bun-111827.svg?style=for-the-badge" />
    <img alt="Language: TypeScript" src="https://img.shields.io/badge/language-TypeScript-2563eb.svg?style=for-the-badge" />
    <img alt="Fixed canvas" src="https://img.shields.io/badge/layout-fixed_canvas-14532d.svg?style=for-the-badge" />
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Fearvox/dash-design-infra/ci.yml?branch=main&label=CI&style=for-the-badge" />
  </p>

  <p align="center">
    <a href="#快速开始">快速开始</a> ·
    <a href="#这是什么">这是什么</a> ·
    <a href="#能做什么">能做什么</a> ·
    <a href="#架构">架构</a> ·
    <a href="#包说明">包说明</a> ·
    <a href="#hall-of-fame">Hall of Fame</a>
  </p>
</div>

---

## 目录

- [这是什么](#这是什么)
- [能做什么](#能做什么)
- [快速开始](#快速开始)
- [架构](#架构)
- [包说明](#包说明)
- [Kami 和 P5 带来了什么](#kami-和-p5-带来了什么)
- [公开示例](#公开示例)
- [Agent 入口](#agent-入口)
- [当前状态](#当前状态)
- [Hall of Fame](#hall-of-fame)

---

## 这是什么

`dash-design-infra` 解决的是一个很具体的问题：agent 生成的页面，不能只在聊天窗口里看起来还行；它要能在浏览器里量得准，导出 PDF 时也不崩。

所以这里不是一套漂亮 CSS，也不是 landing page 模板。它放的是做真实页面会反复用到的基础层：token、字号比例、字形基线、Kami 风格文档预设、p5.js 动态视觉 preset、溢出检测、约束布局、PDF 输出。

这个仓库是公开蒸馏版。私有实验、原始素材和内部项目文本不进来；能进来的，都是已经可以命名、复用、测试、解释的东西。

<p align="right"><a href="#top">回到顶部</a></p>

## 能做什么

| 你想做 | 用什么 | 得到什么 | 从这里开始 |
|---|---|---|---|
| 一页纸 brief 或报告 | `@dash/tokens`, `@dash/kami`, `@dash/measure`, `@dash/print` | 看起来像认真排过版的 HTML，导出 PDF 不突然裁切 | [`examples/one-pager.html`](./examples/one-pager.html) |
| 像 deck 一样的页面产物 | `@dash/kami`, `@dash/scale`, `@dash/print` | 安静、清楚、可打印的编辑型页面 | [`packages/kami`](./packages/kami) |
| 动态海报 | `@dash/p5-motion` | 可复用的 p5.js motion grammar，不用每次从空白 canvas 重写 | [`usecases/p5js`](./usecases/p5js) |
| 档案/证据视觉 | Electric Archive preset | 白色档案面和钴蓝信号面组成的扫描海报 | [`Electric Archive`](./usecases/p5js/electric-archive.md) |
| 天气图式报告 | Memory Weather Report preset | 用气压、锋面、雷达纹理和 forecast card 表达复杂信号 | [`Weather Report`](./usecases/p5js/weather-report.md) |
| 生成式动态视频 | Windburn workflow | 分块渲染、contact sheet QA、微信体积压缩 | [`Windburn Render Workflow`](./usecases/video/windburn-render-workflow.md) |
| 有硬约束的页面 | `@dash/layout`, `@dash/measure` | 先解布局规则，再到真实浏览器里检查是否溢出 | [`packages/layout`](./packages/layout) |

<p align="right"><a href="#top">回到顶部</a></p>

## 快速开始

```bash
bun install
bun x playwright install chromium

bun tokens:build
bun metrics:build
bun typecheck
```

跑一下公开页面链路：

```bash
bun measure:check -- examples/one-pager.html
bun print:render -- examples/one-pager.html /tmp/dash-one-pager.pdf --canvas=1684x1191
```

试一下动态视觉 helper：

```ts
import { createMotionTimeline, createTileGrid, layoutTileFrame, p5MotionPresets } from '@dash/p5-motion';

const tiles = createTileGrid(720, 960, 3, 3);
const frame = layoutTileFrame(tiles, 0.42);
const timeline = createMotionTimeline(p5MotionPresets.electricArchive.timeline);
const state = timeline.atFrame(42);

console.log(p5MotionPresets.memoryWeatherReport.layers);
console.log(frame[0]);
console.log(state.phases.scanExposure.eased);
```

<p align="right"><a href="#top">回到顶部</a></p>

## 架构

<p align="center">
  <img src="./docs/assets/dash-design-infra-architecture.png" width="620" alt="DASH Design Infra architecture diagram" />
</p>

<p align="center">
  <sub>图源在 <a href="./docs/assets/dash-design-infra-architecture.svg">docs/assets/dash-design-infra-architecture.svg</a>，用 <a href="https://github.com/yizhiyanhua-ai/fireworks-tech-graph">fireworks-tech-graph</a> style 6 生成。</sub>
</p>

一句话版：README、示例和 usecase 先把意图讲清楚；tokens、scale、metrics 定义设计事实源；Kami 和 p5-motion 把它变成文档审美与动态语法；measure、layout、print 负责在真实路径上检查和输出。

<p align="right"><a href="#top">回到顶部</a></p>

## 包说明

| 包 | 人话解释 | 核心依赖 |
|---|---|---|
| `@dash/tokens` | 统一管理颜色、字号、间距、页面尺寸和动效值 | `style-dictionary` |
| `@dash/scale` | 生成字号和间距比例；需要写回时可以用 `--write` | `utopia-core` |
| `@dash/metrics` | 让文字真的落在基线上，不只是“看起来差不多” | `@capsizecss/core` |
| `@dash/kami` | 给报告、信件、简历、作品集和 deck 一个温润的编辑型默认审美 | 无 |
| `@dash/p5-motion` | 把视觉参考提炼成 p5.js 动态 preset 和确定性 helper | peer `p5` |
| `@dash/measure` | 打开真实 HTML，页面超出固定画布就失败 | `playwright` |
| `@dash/layout` | 处理 CSS 很难单独表达的硬布局规则 | `@lume/kiwi` |
| `@dash/print` | 沿着同一份 HTML 输出 PDF | `pagedjs`, `playwright` |

每个包自己的说明都在 [`packages/`](./packages) 下面。

<p align="right"><a href="#top">回到顶部</a></p>

## Kami 和 P5 带来了什么

`@dash/kami` 是文档审美层。agent 要写一页纸、长报告、正式信、简历、作品集或 deck 时，它给出一组不会乱飘的默认选择：温暖纸面、墨蓝强调色、serif 层级、打印安全 tag、低阴影编辑型表面。它受 [@tw93](https://github.com/tw93) 的 [Kami](https://kami.tw93.fun/) 启发，但本仓库不 vendor Kami 代码或字体。

`@dash/p5-motion` 是动态视觉层。它把我们的 p5.js lab 蒸馏成公开安全的 preset：tile grid、确定性漂移、重组循环、扫描场、档案海报、天气图式证据系统。它适合先把视觉做成可复用语法，再决定要不要进入生产渲染器。

两者合起来，让这个仓库可以覆盖三类输出，而且不用改事实源：

| 输出 | 常用组合 | 结果 |
|---|---|---|
| 静态文档 | `@dash/kami` + `@dash/print` | 完整 PDF 或 deck-like HTML |
| 动态实验 | `@dash/p5-motion` | 有稳定 motion grammar 的 p5.js sketch |
| 固定画布产物 | `@dash/tokens` + `@dash/measure` + `@dash/layout` | 不裁切、可验证的页面 |

<p align="right"><a href="#top">回到顶部</a></p>

## 公开示例

- [`examples/one-pager.html`](./examples/one-pager.html) 是 measurement 和 print 检查用的小页面。
- [`usecases/p5js/electric-archive.md`](./usecases/p5js/electric-archive.md) 展示 Electric Archive 海报语法。
- [`usecases/p5js/weather-report.md`](./usecases/p5js/weather-report.md) 展示 Memory Weather Report 语法。
- [`usecases/video/windburn-render-workflow.md`](./usecases/video/windburn-render-workflow.md) 展示高密度生成式视频的渲染、校验和压缩工作流。

示例是刻意脱敏过的。它们展示设计基础设施，不带私有项目文本、原始 lab 文件或内部路径。

<p align="right"><a href="#top">回到顶部</a></p>

## Agent 入口

Agent 应该先读 [`AGENTS.md`](./AGENTS.md)。里面写清楚了仓库契约、默认验证命令、公开边界，以及一个合格 workflow 文档应该长什么样。

这一周的 hackathon 推进目标记录在 [`docs/HACKATHON_GOAL.md`](./docs/HACKATHON_GOAL.md)：公开可安装、workflow 覆盖更深、验证链路更硬、可以进入 skills.sh / Hermes Agent 生态。

<p align="right"><a href="#top">回到顶部</a></p>

## 目录结构

```text
.
├── docs/assets/
├── examples/
├── packages/
│   ├── kami/
│   ├── layout/
│   ├── measure/
│   ├── metrics/
│   ├── p5-motion/
│   ├── print/
│   ├── scale/
│   └── tokens/
├── usecases/
│   ├── p5js/
│   └── video/
├── README.md
├── README-zh.md
├── AGENTS.md
└── package.json
```

<p align="right"><a href="#top">回到顶部</a></p>

## 当前状态

已经可用：

- token 构建链路
- `@dash/scale` 生成与 `--write`
- capsize CSS 生成
- Kami 启发的编辑型文档 preset
- p5.js 动态 preset，包括 Electric Archive 和 Memory Weather Report
- 视频工作流说明，包括分块渲染 QA 和交付压缩
- 浏览器内溢出校验
- 约束求解布局 helper
- paged.js PDF 输出
- 公开 example 和 usecase 文档
- 安装、token build、metrics build、typecheck 的 CI

刻意留在仓库外：

- 原始 p5.js lab 源码
- 参考视频与抽帧素材
- 私有项目写作和客户材料
- 由使用方管理的打印 vendor 资源

<p align="right"><a href="#top">回到顶部</a></p>

## Hall of Fame

特别感谢 [@tw93](https://github.com/tw93)。[Kami](https://github.com/tw93/kami) 对这里的文档审美层影响很大；[Kaku](https://github.com/tw93/Kaku) 和 [Mole](https://github.com/tw93/Mole) 这类工具也实实在在参与了我们的日常工作流，让这个 repo 的方向更清楚。

这里是感谢与 attribution，不代表上游作者对本仓库代码负责。

<p align="right"><a href="#top">回到顶部</a></p>

## 贡献

见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

一句话原则：改动尽量小，尽量可回退，尽量在真实页面路径上验证。

## 许可证

MIT。见 [LICENSE](./LICENSE)。
