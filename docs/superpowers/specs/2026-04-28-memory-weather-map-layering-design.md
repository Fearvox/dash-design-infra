# Memory Weather Map Layering Design

Date: 2026-04-28

## Decision

Use the `A70 / B30` direction:

- `A` is the structural base: a clear white/blue weather-map poster with frosted forecast cards.
- `B` is only the atmosphere layer: muted radar glow, depth, and a small smoked-glass area.
- Preserve the existing `Electric Archive` variant and refine only the independent `weather.html` variant.

## Problem

The current Weather Map sketch has strong ingredients but weak hierarchy. Type, radar bands, fronts, dots, isobars, wind vectors, sampled video texture, and metadata all sit in a similar visual plane. The result reads as busy before it reads as designed.

## Target Feel

The poster should still feel complex, computational, and alive, but the viewer should perceive it in a clear order:

1. A calm paper-map base.
2. Slow weather mass underneath.
3. Frosted forecast cards that organize the composition.
4. Sparse sharp data glyphs.
5. Selective radar glow and motion accents.

## Layer Model

### L0 Paper Map

- Keep the white/blue split field.
- Lower grid contrast.
- Keep large text readable and mostly outside the densest weather mass.
- This layer should feel stable and print-like.

### L1 Weather Mass

- Use sampled XHS frames, radar bands, and cloud blobs as the atmospheric layer.
- Blur and lower alpha so this layer becomes texture, not foreground information.
- Favor two or three large weather masses instead of many equal-strength patches.

### L2 Soft Frost Cards

- Use two or three frosted glass cards as the main hierarchy tool.
- Primary card: upper-right low-pressure memory core.
- Secondary card: lower-left or mid-left forecast/evidence note.
- Optional small tag card: bottom metadata or legend.
- Glass should be soft, milky, and translucent, not opaque dashboard panels.

### L3 Sharp Data Glyphs

- Cut station dots/front glyph count by roughly half.
- Reserve high saturation and sharp edges for the most important symbols.
- Keep fronts in one or two deliberate paths instead of scattered marks.
- Wind arrows should be faint background texture, not equal competitors.

### L4 Smoked Radar Accent

- Add a small smoked-radar feel only on the right side or around the low-pressure core.
- Use dark translucent glass, cyan edge glow, or screen-blended blue haze sparingly.
- This should make the poster feel frontier/TouchDesigner without turning the whole page dark.

## Motion Rules

- Only one layer should move quickly at a time.
- Cloud/weather mass moves slowly.
- Isobars breathe at medium speed.
- Sharp glyphs pulse or snap briefly.
- Glass cards should be mostly stable, with only subtle shimmer or parallax.

## Controls

Keep current controls but reinterpret them:

- `Weather intensity`: affects cloud mass opacity, radar band strength, and glow amount.
- `Wind shear`: affects isobar wobble, cloud drift, and vector drift.
- `Night chart`: can become a stronger smoked-radar preview, but default should stay light.

## Implementation Scope

Change only the independent Weather Map entry:

- `src/weather.ts`
- narrow `.weather-map` CSS rules in `src/styles.css` if needed
- README entry if the behavior changes materially

Do not change:

- `src/main.ts`
- `index.html`
- the Electric Archive visual direction
- monorepo `packages/`

## Acceptance Criteria

- First read: title/type and two or three glass cards are visible before weather noise.
- Second read: weather masses, isobars, and radar texture create depth under the cards.
- Third read: fronts, stations, and metadata provide detailed complexity.
- The poster still feels like a complex dynamic weather/evidence system, not a simple dashboard.
- `bun run typecheck` passes.
- `/weather.html?still=1` renders without console errors.
- `/` still renders Electric Archive unchanged.
