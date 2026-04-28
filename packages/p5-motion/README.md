# @dash/p5-motion

p5.js motion grammar and sketch utilities for DASH kinetic posters, animated diagrams, and generative visual references.

This package does not import p5 at build time. It gives consumers deterministic geometry helpers, preset contracts, and a common language for turning visual references into repeatable sketches. The actual p5 runtime stays in the consuming app or lab.

## What It Can Do

- Turn a still editorial surface into a kinetic poster.
- Split images into crop tiles and animate controlled reassembly loops.
- Build scan bands, noise fields, and layered poster washes.
- Keep motion tied to DASH tokens instead of one-off canvas code.
- Preserve reference analyses as reusable sketch presets instead of screenshots.

## Included Presets

- `blueAppleCollageLoop` - image crop grid, anchored text, and calm reassembly motion.
- `frontierPosterScan` - static poster plus noise, typography, and scan layers.

## Use

```ts
import {
  createTileGrid,
  frameProgress,
  layoutTileFrame,
  p5MotionPresets,
} from '@dash/p5-motion';

const tiles = createTileGrid(720, 960, 3, 3);
const progress = frameProgress(42, 180);
const frame = layoutTileFrame(tiles, progress);

console.log(p5MotionPresets.blueAppleCollageLoop.layers);
console.log(frame[0]);
```

## Runtime Boundary

`p5` is a peer dependency because the sketch host owns rendering, export, and browser lifecycle. DASH owns the repeatable motion grammar.
