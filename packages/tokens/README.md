# @dash/tokens

Single source of truth for the DASH design system. Colors, type scale, spacing, baseline, page geometry, motion.

## Source format

`src/tokens.json` follows the [Design Tokens Community Group](https://design-tokens.github.io/community-group/format/) (DTCG) format — the W3C draft spec. Each token is `{ "$value": ..., "$type": ..., "$description": ... }`.

Style Dictionary 4.x supports this natively. No preprocessor needed.

## Build

```bash
bun build
```

Generates in `build/`:
- `tokens.css` — CSS custom properties at `:root` (replaces `colors_and_type.css` once all consumers migrate)
- `tokens.js` — ESM with named exports for JS/TS consumers
- `tokens.d.ts` — TypeScript type declarations
- `tokens.flat.json` — flat key-value for Figma sync / plain JSON consumers

## Watch

```bash
bun watch
```

## Migration path from a legacy CSS token file

Current state: a hand-edited CSS file exists alongside `src/tokens.json`.

Target state: `tokens.json` is the only hand-edited file. `tokens.css` is generated. All consumers `@import` the generated file.

Rollout:
1. Compare generated `tokens.css` against the current consumer styles in a staging page.
2. Once parity is confirmed, remove the hand-edited CSS.
3. Lock the flow so `tokens.json` remains the only hand-edited source of truth.

## Adding a token

1. Add to `src/tokens.json` in the right category
2. `bun build`
3. Commit both `src/tokens.json` and `build/*` (build artifacts are versioned — infra assumes no build server yet)
4. If the token is new semantic category, update downstream consumers in the same PR

## Conventions

- Colors: prefer `oklch()` for palette; hex allowed for brand exact-match (logo, neon, botanical).
- Dimensions: always `px` at this level. Fluid `clamp()` is the job of `@dash/scale`, not here.
- Line-heights: must be multiples of `baseline` (8px). Non-baseline values are a bug.
- References: use `"{color.ink.primary}"` to alias across the tree.
