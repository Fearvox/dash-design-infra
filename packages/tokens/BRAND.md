# DASH — Brand Identity Specification

**Version 3.0** · April 2026
Dash · Custom Digital Systems · A Zonic Design Studio
business@zonicdesign.art

**Supersedes:** `DASH-Brand/DASH-Design-Spec.md` (v2.0 · March 2026).
v2.0 remains the source of truth for logo geometry; this document
re-expresses it against the `design-infra/` monorepo so every brand
rule resolves to a concrete package artifact.

---

## 0. How this spec is wired

DASH's brand identity now splits into two layers:

| Layer | Scope | Source | Immutability |
|-------|-------|--------|--------------|
| **Brand** | Logo, wordmark, logo-color pairings | `DASH-Brand/svg/*` + `color.botanical.*` tokens | **Locked.** Hex-exact. Do not alter without a new brand version. |
| **Surface** | Page paper, ink, accent, typography, space, grid | `@dash/tokens` + `@dash/scale` + `@dash/layout` + `@dash/print` | **Evolves** with the research-vault system. |

The **brand layer** is the logo and what it sits *on*.
The **surface layer** is everything else on the page.
Surface changes do not require a brand version bump; brand changes do.

Package map:

| Concern | Package | Entry |
|---------|---------|-------|
| Colors (all) | `@dash/tokens` | `src/tokens.json` |
| Type ladder | `@dash/scale` | `src/config.ts`, `src/gen.ts` |
| Character-level metrics | `@dash/metrics` | `src/extract.ts` (capsize) |
| Measure / cpl / widows | `@dash/measure` | `src/cli.ts` |
| Composition constraints | `@dash/layout` | kiwi constraint solver |
| Paged output | `@dash/print` | paged.js → playwright |
| Logo assets (binary) | `DASH-Brand/svg/` | SVG source files |

---

## 1. Brand Overview

**DASH** is a custom digital systems studio. The name reflects speed,
precision, and the typographic em-dash (—) that anchors the symbol mark.

- Full name: **Dash** (title case in running prose)
- Logo wordmark: **DASH** (all-caps, logo context only)
- Tagline: **Custom Digital Systems**
- Parent: **A Zonic Design Studio**
- Contact: **business@zonicdesign.art**

Correct: Dash, DASH (logo context). Incorrect: dash, DaSh, Syn Dash,
SynDash.

---

## 2. Logo System

Three variants. Pick by context and available space.

| Variant | Asset | Use |
|---------|-------|-----|
| Full (symbol + wordmark) | `dash-full-{light,dark}-bg.svg` | Primary mark. Locked unit. |
| Symbol only | `dash-symbol{,-dark,-green,-neon}.svg` | Favicons, app icons, watermarks — once full mark is established in context. |
| Wordmark only | `dash-wordmark.svg` | Tight horizontal spaces where the symbol would render under 14px. |

### 2.1 Geometry (identical to v2.0 — locked)

**Symbol** — `viewBox="0 0 32 20"`, aspect 1.6:1, `stroke-width=2.5`,
`stroke-linecap=round`.
- Horizontal (dash): `x1=1 y1=10 x2=31 y2=10`
- Diagonal (slash): `x1=11 y1=18 x2=21 y2=2`

**Wordmark** — Plus Jakarta Sans, weight 800, `letter-spacing=-0.06em`,
uppercase. If Plus Jakarta Sans is unavailable, fall back to Geist Sans.

**Assembly** — `inline-flex`, `align-items: center`, gap `0.12em`
between symbol and wordmark. All dimensions relative to `--logo-size`.

### 2.2 Reference sizes

| Role | `--logo-size` | Notes |
|------|---------------|-------|
| Display (hero/splash) | 64px | |
| Heading (page title) | 36px | |
| Nav (sidebar/navbar) | 20px | |
| **Stamp (doc header/footer)** | **14px** | **Minimum for full mark.** |
| Micro (watermark) | 10px | **Symbol only.** |

Below 14px, drop to wordmark-only. Below 10px, drop the mark entirely.

### 2.3 Clear space

Minimum = **1×** on all sides, where x = symbol height
(`0.45em` of current `--logo-size`). No text, graphics, or other visual
elements may enter this zone.

---

## 3. Color — Brand Palette (locked)

These seven values are the **immutable** brand palette. They are the
exact hex values used inside the SVG logo files. They live in
`@dash/tokens` under `color.botanical.*` (plus two helpers under
`color.paper.warm`) and must not be re-expressed as oklch drift.

| Name | Hex | Token (`@dash/tokens`) | Role |
|------|-----|------------------------|------|
| Deep Green | `#10291F` | `color.botanical.ink` | Dark bg, headings on light, wordmark on light bg |
| Mid Green | `#35584C` | `color.botanical.mid` | Symbol on light bg, accents |
| Warm Sand | `#ddd6c7` | `color.paper.warm` | Wordmark on dark bg |
| Cream | `#f8f5ef` | — (see § 4 mapping) | Light background (brand-reference) |
| Neon Yellow | `#F0EE9B` | `color.botanical.neonGold` | Symbol on dark bg — **sparingly** |
| Ink | `#1a1a18` | — (see § 4 mapping) | Body text on light (brand-reference) |
| Muted Sage | `#7f8882` | — (see § 4 mapping) | Secondary text (brand-reference) |

### 3.1 Logo pairings (rules)

**Dark background:**
- Background: Deep Green `#10291F`
- Symbol: Neon Yellow `#F0EE9B`
- Wordmark: Warm Sand `#ddd6c7`
- File: `dash-full-dark-bg.svg`

**Light background:**
- Background: Cream `#f8f5ef` (or any surface paper from § 4)
- Symbol: Mid Green `#35584C`
- Wordmark: Deep Green `#10291F`
- File: `dash-full-light-bg.svg`

**Never:**
- Neon yellow symbol on light background
- Green symbol on dark background
- Symbol and wordmark in mismatched colors (e.g. neon symbol + deep-green wordmark)
- Any effect on the mark (shadow, glow, gradient, stroke)

---

## 4. Color — Surface Palette (evolves)

The surface palette is the research-vault page environment: paper, ink,
accent. Values are oklch for perceptual uniformity. They are
`@dash/tokens` canonical and may change with a tokens version bump.

| Scope | Tokens | Pins to brand palette |
|-------|--------|------------------------|
| Paper | `color.paper.base/grain/shadow/card` | Optically matches Cream `#f8f5ef`. |
| Ink | `color.ink.primary/secondary/muted` | Optically matches Ink `#1a1a18` and Muted Sage `#7f8882`. |
| Accent | `color.accent.palmShadow/palmLight/sunGold/dangerRed/hoverGlow` | `palmShadow` pairs with Mid Green; `sunGold` is the underline-on-verifiable-claim color. |
| Semantic badges | `color.badge.minimax/opus/grok/gemini/gpt` | Research-vault model tags. |
| Rules / dividers | `color.rule.default/soft` | 1px 18%-opacity ink. |

### 4.1 Divergence note

DASH-Brand v2.0 declared a single palette (Cream / Ink / Deep Green).
The research-vault surface uses forest green `oklch(0.35 0.08 160)` and
sun gold `oklch(0.82 0.12 85)` as accents — these do **not** pin to
v2.0's Mid Green / Neon Yellow. The justification:

- The **logo** must match printed brand assets exactly → hex-locked.
- The **page accent** must survive paged.js → oklch → print profile
  round-tripping without drifting into "off-brand" territory →
  perceptually-anchored oklch.
- `palmShadow` is close enough to Mid Green (`#35584C`) that the logo
  reads as "of" the page, not "pasted onto" it. `sunGold` is a
  new research-vault color introduced for the underline system; it is
  **not** a logo color.

If a future brand version unifies these, update `@dash/tokens` and
bump this spec to v4.

---

## 5. Typography

Typography is now owned by `@dash/scale` — the V4 scale (Perfect Fifth
up, Major Third down, anchored at 14px body) supersedes the v2.0
single-weight-list spec. See `packages/scale/src/config.ts` for the
mathematical definition.

### 5.1 Fonts (unchanged from v2.0)

| Role | Family | Weights | Token |
|------|--------|---------|-------|
| Primary sans | **Plus Jakarta Sans** (preferred) / Geist (fallback) | 400, 500, 600, 800 | `font.family.sans` |
| Mono (technical) | **Geist Mono** | 400 | `font.family.mono` |

Weight usage:
- 400 — body, descriptions
- 500 — labels, metadata, sidebar `.lead`
- 600 — section labels, kickers, display titles
- 800 — **wordmark only** (do not use for UI headings)

### 5.2 Scale — V4 (`@dash/scale`)

| Step | Label | px | line-height | Use |
|------|-------|----|----|-----|
| +3 | display | 47 | 56 (7 × 8) | Hero, splash, page title |
| +2 | deck    | 32 | 40 (5 × 8) | Section head, primary finding |
| +1 | lead    | 21 | 32 (4 × 8) | H2, sidebar lead |
| 0  | **body**| **14** | **24 (3 × 8)** | **Anchor. Body text, prompts.** |
| -1 | meta    | 11 | 16 (2 × 8) | Kickers, labels, owner, th-caps |
| -2 | micro   | 9  | 16 (2 × 8) | Caption, footnote, run-id |

Regenerate or alter via `bun run --filter=@dash/scale gen:compare`.
Emitted as `font.size.*` and `font.lineHeight.*` in `@dash/tokens`.

### 5.3 Tracking (wordmark contrast)

The DASH wordmark uses tight negative tracking (`-0.06em`) to create
visual density. Body and UI copy use normal tracking (`0em`). Kickers
and th-caps use positive tracking (`+0.04em` to `+0.08em`).

---

## 6. Space & Grid

### 6.1 Baseline

**8px grid.** Every vertical rhythm value must be a multiple of 8.
Enforced by `snapLineHeight` in `@dash/scale` and audited by
`@dash/measure`.

### 6.2 Space ladder (`@dash/tokens` `space.*`)

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 80` → `--space-1` … `--space-10`.

### 6.3 Canvas (`@dash/tokens` `page.*`)

Reverse-beat A-series landscape:
- Width: **1684px** (digital) · 297mm (print)
- Height: **1191px** (digital) · 210mm (print)
- Ratio: √2 : 1 (A-series)
- Padding: 96px side, 80px top/bottom (cover demo) — see
  `packages/print/demos/cover-page.html`.

### 6.4 Grid (current: 8-col)

The cover page uses an **8-column × 2-row** grid with `column-gap: 24px`
and `row-gap: 0`. Grid is owned by `@dash/layout` (kiwi constraint
solver). Ruder tri-beat placement is the preferred rhythm:

| Region | Cols |
|--------|------|
| Hero / narrative | 1–4 |
| Panopticon anchor | 5–6 |
| Sidebar / meta | 7–8 |

**Panopticon rule:** never absolute-positioned. It must live in a grid
cell or a kiwi-solved region so it cannot escape into adjacent content.

### 6.5 Grid system (spec § 4 reference)

Larger composition work uses the **8 / 20 / 32** rule (dash-grid-spec
v0.3 § 4): 8-unit gutters, 20-unit modules, 32-unit max line-length
multiplier. This supersedes the informal "12-column default" used
in the earliest prototypes.

---

## 7. Placement Guide

Unchanged from v2.0 except the sizes now resolve to scale steps and
tokens:

| Context | Variant | Size | Position | Scale step |
|---------|---------|------|----------|------------|
| Document header (kicker strip) | Full | 14px | Top-left, aligned to `--pad-x` | body |
| Hero / splash | Full | 22–96px | Center | lead–display |
| Footer stamp | Full | 12px | Bottom-right | between micro/meta |
| Favicon / app icon | Symbol only | — | Center of square container | — |
| Nav / sidebar | Full | 16px | Left-aligned with margin | between body/lead |
| Inline text reference | Wordmark only | 20px | Center | ≈ lead |

The cover demo (`packages/print/demos/cover-page.html`) inlines
`dash-full-light-bg.svg` at 14px in the kicker strip — this is the
canonical "document header" placement.

---

## 8. Contrast & pairings

Paper / ink contrast must meet **WCAG AA** for body text and AAA for
micro. Enforced by the contrast matrix in dash-grid-spec v0.3 § 5.
Quick reference:

| Foreground | Background | Ratio | AA body | AAA micro |
|------------|------------|-------|---------|-----------|
| `ink.primary` | `paper.base` | ≥ 7 : 1 | ✅ | ✅ |
| `ink.secondary` | `paper.base` | ≥ 4.5 : 1 | ✅ | ⚠️ |
| `ink.muted` | `paper.base` | ≥ 3 : 1 | ⚠️ (large only) | ❌ |
| `accent.palmShadow` | `paper.base` | ≥ 4.5 : 1 | ✅ | ⚠️ |
| `accent.sunGold` | `paper.base` | < 3 : 1 | ❌ | ❌ — underline-only, never text |

`sunGold` is **structurally** ineligible for text; its only legitimate
use is the 3px underline on verifiable claims.

---

## 9. Do's / Don'ts

**Do:**
- Use SVGs from `DASH-Brand/svg/` without modification (re-exporting via
  Figma to match design-system-rules is acceptable if the geometry is
  identical).
- Inline the SVG source into paged.js output (paged.js has no
  cross-origin fetch during the print pipeline).
- Reference `color.botanical.*` tokens for logo fill; do not re-code the
  hex into component CSS.
- Maintain 1× clear space.
- Use the correct color variant for the background (§ 3.1).
- Keep the mark at ≥ 14px for the full variant.

**Don't:**
- Rotate, skew, distort, or outline the logo.
- Change symbol stroke width or line positions.
- Add shadow, glow, gradient, or any effect to the mark.
- Rearrange symbol ↔ wordmark order.
- Use the mark smaller than 14px for the full variant or 10px for the
  symbol.
- Place the logo on a low-contrast or busy background.
- Recreate the logo in a different font (including "close enough" ones
  like Poppins 800 or Manrope 800).
- Use **Neon Yellow** anywhere except the dark-bg symbol variant. It is
  not a general accent color.
- Use **Deep Green** `#10291F` as the page accent — that's
  `accent.palmShadow` in oklch. The hex is logo-only.

---

## 10. Application examples

### 10.1 Research-vault cover page (canonical)

See `packages/print/demos/cover-page.html`.

- Background: `paper.base` (surface palette, optically matches Cream)
- Kicker (document header): DASH full-light-bg SVG at 14px, top-left
- Hero narrative: cols 1–4, display 47px, V4 scale
- Panopticon geometric anchor: cols 5–6, grid-placed (never absolute)
- Sidebar: cols 7–8, lead→body→meta ladder
- Gold underline: on verifiable claims only, `accent.sunGold`, 3px

### 10.2 Business card (v2.0 spec, unchanged)

- Front: symbol centered on Deep Green; "DASH · a Zonic Design studio" bottom-aligned in Warm Sand
- Back: full-light-bg logo at 18px + tagline "Custom Digital Systems"

### 10.3 Document header (v2.0 spec, unchanged)

- Full-light-bg logo at 14px, left-aligned
- Reference number right-aligned in Geist Mono
- Separated by a 1px border line (`color.rule.default`)

---

## 11. File Reference

| File | Purpose | Ownership |
|------|---------|-----------|
| `DASH-Brand/svg/dash-symbol.svg` | Symbol, currentColor | Brand layer — locked |
| `DASH-Brand/svg/dash-symbol-neon.svg` | Symbol, Neon Yellow `#F0EE9B` | Brand layer — locked |
| `DASH-Brand/svg/dash-symbol-green.svg` | Symbol, Mid Green `#35584C` | Brand layer — locked |
| `DASH-Brand/svg/dash-symbol-dark.svg` | Symbol, Deep Green `#10291F` | Brand layer — locked |
| `DASH-Brand/svg/dash-full-dark-bg.svg` | Full, dark-bg pairing | Brand layer — locked |
| `DASH-Brand/svg/dash-full-light-bg.svg` | Full, light-bg pairing | Brand layer — locked |
| `DASH-Brand/svg/dash-wordmark.svg` | Wordmark only | Brand layer — locked |
| `DASH-Brand/svg/dash-favicon.svg` | Favicon (pre-composed) | Brand layer — locked |
| `packages/tokens/src/tokens.json` | DTCG tokens (all color/type/space) | Surface layer — versioned |
| `packages/scale/src/config.ts` | V4 type scale definition | Surface layer — versioned |
| `packages/layout/` | Composition constraints | Surface layer — versioned |
| `packages/print/demos/cover-page.html` | Canonical reference page | Surface layer — versioned |
| `packages/print/src/cli.ts` | paged.js → PDF pipeline | Surface layer — versioned |

---

## 12. Change log

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2024 | Initial brand (internal, pre-DASH-Brand repo). |
| 2.0 | 2026-03 | DASH-Brand repo published. Seven-color palette, logo geometry locked, file reference table. |
| **3.0** | **2026-04-19** | **This document.** Split brand ↔ surface layers; map to `design-infra/` monorepo; introduce V4 type scale, oklch surface palette, Ruder tri-beat grid, Panopticon grid-placement rule; reconcile DASH-Brand and dash-grid-spec divergence. v2.0 retained as logo source-of-truth. |

---

*Dash · Custom Digital Systems · A Zonic Design Studio*
*business@zonicdesign.art*
