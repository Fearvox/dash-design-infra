# @dash/p5-motion

p5.js motion grammar for DASH kinetic posters, animated reports, and generative visual references.

This package does not import p5 at build time. The consuming app owns the renderer and browser lifecycle. DASH owns the reusable motion language: named presets, deterministic geometry helpers, and the vocabulary that lets a sketch become something repeatable.

## What It Can Do

- Turn a still editorial surface into a kinetic poster.
- Split images into crop tiles and animate controlled reassembly loops.
- Build scan bands, noise fields, archive planes, weather maps, and layered poster washes.
- Keep motion tied to DASH tokens instead of one-off canvas code.
- Preserve useful lab experiments as public-safe presets instead of private screenshots.

## Included Presets

| Preset | Source | Good for |
|---|---|---|
| `electricArchive` | [`Electric Archive`](../../usecases/p5js/electric-archive.md) | memory, retrieval, archive, handoff evidence, cobalt scan fields |
| `memoryWeatherReport` | [`Memory Weather Report`](../../usecases/p5js/weather-report.md) | pressure systems, risk forecast, system health, evidence density |
| `blueAppleCollageLoop` | `references/xhs-blue-apple/ANALYSIS.md` | image crop grids, anchored text, calm reassembly motion |
| `frontierPosterScan` | `references/xhs-frontier-poster/ANALYSIS.md` | static poster hierarchy, noise fields, typography, scan layers |

## Use

```ts
import {
  createMotionTimeline,
  createTileGrid,
  frameProgress,
  layoutTileFrame,
  p5MotionPresets,
} from '@dash/p5-motion';

const tiles = createTileGrid(720, 960, 3, 3);
const progress = frameProgress(42, 180);
const frame = layoutTileFrame(tiles, progress);
const timeline = createMotionTimeline(p5MotionPresets.electricArchive.timeline);
const state = timeline.atFrame(42);

console.log(p5MotionPresets.electricArchive.layers);
console.log(p5MotionPresets.memoryWeatherReport.useWhen);
console.log(frame[0]);
console.log(state.phases.scanExposure.eased);
```

## Timeline Grammar

`createMotionTimeline()` turns preset phase metadata into deterministic frame state without owning the p5 runtime. The timeline stays a plain object contract: the sketch host decides how to render, while `@dash/p5-motion` translates named phases into repeatable progress and easing values.

```ts
const timeline = createMotionTimeline(p5MotionPresets.electricArchive.timeline);
const state = timeline.atFrame(42);

console.log(state.phases.scanExposure.active);
console.log(state.phases.scanExposure.eased);
```

Use `atFrame()` when you want looping exports with deterministic frame wrap. Use `atProgress()` when you want direct scrubbing that clamps to `0..1` instead of wrapping.

## Runtime Boundary

`p5` is a peer dependency because the sketch host owns rendering, export, events, and browser state. This package stays small on purpose: it gives the host stable geometry and motion contracts, not a hidden runtime.
