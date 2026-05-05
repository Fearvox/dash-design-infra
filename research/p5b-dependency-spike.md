# Phase 5b 前置调研 — p5.strands / filterRenderer / lygia

> 产出格式对齐 Review Gate：每条 PASS/FLAG/BLOCK。Artifact for spec gate review — canonical copy in `design-infra/research/`.

---

## 1. p5.strands — Shader Transpiler Engine

| 维度 | 评估 |
|:--|:--|
| **综合风险** | 🟢 **PASS** — p5.js v2.x 内建，零外部依赖 |
| **可进 `@dash/p5-motion` core** | ❌ 否 — core 只允许 types / metadata / pure functions；不能 import p5 或实例化 runtime shader builder |
| **可进 p5js-lab** | ✅ 是 — shader prototype / rendering adapter 在 lab 层 |

### 1.1 本质

p5.strands 是 p5.js v2.x 的**内置 shader IR 编译管线**，不是第三方库。14 个源文件（`src/strands/`）实现 JavaScript → GLSL/WGSL 的完整编译链条：IR builder → DAG → CFG → codegen。

### 1.2 API Surface（完整）

| 构建器 | 用途 | 对应 p5.js 上下文 |
|--------|------|-------------------|
| `buildColorShader(cb)` | 默认无光照着色器 | `shader()` 基础模式 |
| `buildMaterialShader(cb)` | 有光照着色器 | `lights()` 激活后自动 |
| `buildNormalShader(cb)` | 法线可视化 | `normalMaterial()` |
| `buildStrokeShader(cb)` | 3D 描边着色 | `stroke()` + WEBGL |
| `buildFilterShader(cb)` | 后处理 filter | `filter(BLUR)` 等 |

**Hooks/Blocks（着色器修改入口）：**

| Hook | 阶段 | 暴露变量 |
|------|------|---------|
| `worldInputs` | Vertex | `position`, `normal`, `texCoord`, `color` |
| `cameraInputs` | Vertex（相机空间） | `position`, `normal`, `color` |
| `getFinalColor` / `finalColor` | Fragment | 最终像素颜色 |
| `filterColor` | Filter shader | `texCoord`, `canvasSize`, `texelSize`, `canvasContent` |

**修改器模式**：
```js
const myShader = baseMaterialShader().modify(({ worldInputs, finalColor }) => {
  worldInputs
    .begin()
    .position.add([0, sin(frameCount * 0.01) * 10, 0])
    .end();
});
shader(myShader);
```

### 1.3 WebGL / WebGPU 支持矩阵

| Backend | 状态 | 备注 |
|---------|:----:|------|
| WebGL | ✅ 生产可用 | 默认 backend，零配置 |
| WebGPU | ✅ 可用（v2.2.2+） | 需引入 `p5.webgpu.js` + `async createCanvas(w, h, WEBGPU)` |

- **所有 p5.strands shader 已兼容双后端**（v2.2.2 里程碑）
- `millis()` 直接在 strands 内可用（不再需要 `uniformFloat()` wrapper）
- `noise()` 实现通过 renderer 注入 shader snippet，backend-agnostic

### 1.4 Shader Compile-Fail 行为

| 场景 | 行为 | 来源 |
|------|------|------|
| GLSL 编译失败 | `throw new Error("Whoops! ..." + err.message)` | `p5.Shader.js:init()` |
| WebGPU shader 编译失败 | 同样 throw，无特殊处理 | 同上 try/catch 模式 |
| **Fallback** | ❌ **无** — 直接 crash，无 blank canvas / Canvas2D 降级 | 代码确认 |

**关键发现**：p5.strands 生成的 shader 如果编译失败，**整个 sketch crash**，没有 graceful degradation。这对 DASH 预设是 BLOCK 级风险——如果某用户的浏览器不支持 WebGPU 或驱动有 bug，preset 直接白屏。

### 1.5 三重错误处理体系

| 层级 | 机制 | 示例 |
|:--:|------|------|
| L1 | `p5._friendlyError()` | 在 `modify()` 外调用 strands 函数 |
| L2 | `FES.userError('type error')` | hook 返回类型不匹配 |
| L3 | `throw Error()` | 内部 IR 构建失败 |

### 1.6 内置 Uniform 自动传递

`width`, `height`, `deltaTime`, `frameCount`, `millis()`, `mouseX/Y`, `pmouseX/Y` — 全部自动注入为 uniform，无需手动声明。

### 1.7 Instancing

```js
const geom = buildGeometry(createSphere);
model(geom, 10000); // 10k GPU instances, 每个有唯一 ID
```

### 1.8 DASH 集成结论

| 决定 | 理由 |
|:--|:--|
| **不进 `@dash/p5-motion` core** ❌ | core 只允许 types / metadata / pure functions；p5.strands shader builder 是 runtime p5 import，不属于 core |
| **进 p5js-lab** ✅ | shader prototype / rendering adapter 在 lab 层，可以 import p5 + 实例化 strands |
| **core 可加 metadata** ✅ | `supportedBackends`, `fallbackPolicy`, shader preset descriptor 放进 core 的类型层 |
| **需要 fallback** ⚠️ | 必须 wrap compile 路径，失败时降级到 Canvas2D preset |
| **WebGPU 矩阵** ⚠️ | preset 需声明 `supportedBackends: ['webgl'] \| ['webgl', 'webgpu']` |

---

## 2. p5.filterRenderer — 后处理渲染器

| 维度 | 评估 |
|:--|:--|
| **综合风险** | 🟡 **FLAG** — 可实验但不能进 core |
| **可进 `@dash/p5-motion` core** | ❌ 否 — 全局注入 + 无 TS + 低维护 |

### 2.1 功能

- **Gaussian Blur**（高质量双 pass）+ **Single-Pass Blur**（粗糙但快）
- **Contact Shadows / Ambient Occlusion**（接触阴影）
- 模式：`renderer.draw(callback)` — callback 内写标准 p5.js 绘制代码

### 2.2 API Surface

```js
const blur = createGaussianBlurRenderer();
blur.setIntensity(0.1);
blur.setDof(50);
blur.setSamples(20);
blur.draw(() => {
  // p5.js 绘制代码
  box(100);
});
blur.focusHere(); // 设置焦点
```

3 个渲染器：`GaussianBlurRenderer`, `BlurRenderer`, `ContactShadowRenderer`

### 2.3 Dependency Spike

| 维度 | 评估 | 风险 |
|:--|:--|:--|
| **License** | MIT ✅ | PASS |
| **维护状态** | GitHub latest release v0.0.13 (2023-06-29)；README CDN references package `@0.0.18` | ⚠️ FLAG — 近 3 年无 release；CDN 包号与 release tag 不一致 |
| **TS 类型** | ❌ 无 `.d.ts`，无 TS 声明 | ⚠️ FLAG — 需自写 ambient types |
| **导入方式** | `<script>` 标签全局注入 | ❌ BLOCK for core — 非 ES module |
| **Runtime 依赖** | p5.js WebGL mode | ✅ 可接受 |
| **Bundle cost** | 极小（单 JS 文件） | ✅ PASS |
| **p5-free contract** | ❌ 附加到 `window.createGaussianBlurRenderer` 等 | ❌ 污染全局 |

### 2.4 DASH 集成结论

| 决定 | 理由 |
|:--|:--|
| **不进 core** ❌ | 全局注入 + 无 TS + 低维护 + 非 ES module |
| **可进 lab** ✅ | sketch 层实验 `createGaussianBlurRenderer().draw(...)` 模式 |
| **替代方案** | p5.strands `buildFilterShader()` 可实现等效后处理，且不引入外部 dep |

---

## 3. lygia — 跨语言 Shader 函数库

| 维度 | 评估 |
|:--|:--|
| **综合风险** | 🟡 **FLAG** — 强大但 license 限制 + bundle 大 |
| **可进 `@dash/p5-motion` core** | ❌ 否 — 许可证 + 体积 + #include 模式 |

### 3.1 功能

"Shader stdlib" — 200+ 可复用 GLSL/HLSL/WGSL/Metal 函数，分 13 个类别：
`math/` `space/` `color/` `animation/` `generative/` `sdf/` `draw/` `sample/` `filter/` `distort/` `lighting/` `geometry/` `morphological/`

### 3.2 集成模式

```glsl
// shader 内引用
#include "lygia/math/decimate.glsl"
#include "lygia/draw/circle.glsl"
#include "lygia/generative/random.glsl"
```

- **文件系统**：clone repo → `#include` 路径
- **Bundler**：vite/esbuild/webpack 插件 resolve includes
- **CDN**：`resolveLygia()` 运行时字符串替换

### 3.3 Dependency Spike

| 维度 | 评估 | 风险 |
|:--|:--|:--|
| **License** | Prosperity（非商用）+ Patron（赞助者） | 🔴 **BLOCK** for core — 非自由许可证 |
| **维护状态** | ✅ 非常活跃 | v1.4.1 (2026-02-07)，1800 commits，3.3k ★ |
| **TS 类型** | 9.5%（仅工具链） | N/A — shader 代码无类型 |
| **Bundle cost** | 9MB+ 全量 → prune 后可变 | ⚠️ 需 prune.py trim |
| **Runtime 导入** | `#include` 路径解析 | ✅ 构建时 resolve，非运行时 |
| **p5.js 依赖** | ❌ 无 — 纯 shader 库 | ✅ 兼容 p5.js（有 lygia_p5_examples） |
| **p5-free contract** | ✅ 不污染 | 纯 shader 层，不在 JS namespace |

### 3.4 DASH 集成结论

| 决定 | 理由 |
|:--|:--|
| **不进 core** ❌ | Prosperity License 非 MIT/APL2 兼容 + 9MB 全量体积 |
| **不进 lab** ⚠️ | License 限制 — 即使 lab sketch 也需确认商用场景 |
| **替代方案** | p5.strands 内建的 `noise()`/`sin()`/`mix()`/`pow()` 覆盖常用函数；如需高级 SDF 或 generative 函数，走 clean-room reimplementation from first principles（不复制 lygia 源码 snippet）。如确实需要引入 lygia 函数，需先过 legal review |

---

## 4. 对比矩阵

| 维度 | p5.strands | filterRenderer | lygia |
|:--|:--|:--|:--|
| 风险等级 | 🟢 PASS | 🟡 FLAG | 🟡 FLAG |
| 进 core | ❌ 否（p5 runtime import） | ❌ 否 | ❌ 否 |
| 进 lab | ✅ 是 | ✅ 是 | ⚠️ 许可证限制 |
| License | LGPL (p5.js) | MIT | Prosperity + Patron |
| 维护 | ✅ 核心团队 | ❌ 2023 停更 | ✅ 活跃 |
| TS 类型 | ✅ 有 | ❌ 无 | N/A |
| Bundle cost | 0（内置） | 极小 | 大（9MB+） |
| ES module | ✅ 是 | ❌ script 标签 | N/A（shader） |
| Fallback | ❌ 直接 crash | ❌ 无 | N/A |
| p5-free contract | ✅ | ❌ 全局污染 | ✅ |

---

## 5. 最终建议

### 立即可行
1. **p5.strands 原型 preset** — 用 `buildFilterShader()` 做后处理（替代 filterRenderer），享受 p5-free contract + TS 类型 + 零外部依赖
2. **强制 fallback 层** — preset contract 加 `fallbackRenderer: 'canvas2d' | 'webgl-basic'` 字段，compile fail 时不 crash

### 不推荐
3. **filterRenderer** — 全局注入 + 停更 3 年 + 无 TS。p5.strands 的 `buildFilterShader()` 已覆盖其后处理能力
4. **lygia** — Prosperity License 对商用是硬阻。如需类似 shader 函数，走 clean-room reimplementation from first principles，不复制源码 snippet

### 下批 P5 Preset Review Checklist 追加项

基于本次调研，在已有 4 项 gate 基础上追加：

5. **Shader fallback** — compile fail 必须 produce 可见 Canvas2D/WebGL-basic output，不允许 blank canvas
6. **Backend 声明** — preset 需声明 `supportedBackends: ['webgl'] | ['webgl', 'webgpu']`
7. **Visual evidence 分路径** — shader output + fallback output 两张 independent capture

---

## Sources / References

- p5.js v2.2.2 release — WebGPU + p5.strands 双 backend 目标，`millis()` 支持：<https://github.com/processing/p5.js/releases/tag/v2.2.2>
- p5.js v2.2.3 release — decorator API + p5.strands/WebGL fixes：<https://github.com/processing/p5.js/releases/tag/v2.2.3>
- p5.js v2.2.3 strands source (`src/strands/strands_api.js`)：<https://github.com/processing/p5.js/tree/v2.2.3/src/strands>
- p5.strands intro tutorial：<https://beta.p5js.org/tutorials/intro-to-p5-strands/>
- p5.Shader.js compile-fail behavior（`throw "Whoops!..."`）：`p5/dist/webgl/p5.Shader.js:428-436`
  - 本地核验：`design-infra/.tmp/p5js-lab/node_modules/p5/dist/webgl/p5.Shader.js`
- p5 WebGPU renderer device-unavailable throw：`p5/dist/webgpu/p5.RendererWebGPU.js:124-132`
  - 本地核验同上 path
- p5.js package metadata — v2.2.3, ESM, license LGPL-2.1：`design-infra/.tmp/p5js-lab/node_modules/p5/package.json`
- filterRenderer repo + license (MIT)：<https://github.com/davepagurek/p5.filterRenderer>
- lygia repo + license (Prosperity + Patron)：<https://github.com/patriciogonzalezvivo/lygia>
- lygia LICENSE.md：<https://raw.githubusercontent.com/patriciogonzalezvivo/lygia/main/LICENSE.md>
- MDN WebGPU API：<https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API>
- GitHub creative-coding topic page：<https://github.com/topics/creative-coding>
