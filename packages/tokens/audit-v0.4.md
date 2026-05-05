# DASH Design System Audit — toward v0.4
**Date**: 2026-04-19
**Scope**: `@dash/tokens@0.1.0` + `colors_and_type.css v0.2.0` + Synergy Map v2/v4 CSS + `dash-grid-spec v0.3`
**Method**: `/design:design-system audit` — cross-ref current tokens vs skill's taxonomy (tokens + components + patterns) and usage in production HTML.

---

## Summary

**Components reviewed:** 14 surfaced in CSS classes · 3 documented in spec · **0 have structured component docs**
**Token categories:** 8 present · **7 missing or implicit**
**Score: 56 / 100** — strong philosophical spine (spec v0.3, Ruder/MB references), but the *physical* system layer (docs, state tokens, a11y, z-index, measure layer) is missing. Clean to close in one focused v0.4 pass.

> The spec disciplines *what not to do* (§ 6 反模式) but doesn't structurally enumerate *what exists*. Every audit gap below is either "implicit and used but not declared" or "declined-by-choice but not marked as declined."

---

## 1 · Token Coverage

| Category | Defined in tokens.json | Hardcoded / Ad-hoc instances | Status | v0.4 action |
|---|---|---|---|---|
| **Color — paper palette** | 5 | 0 | ✅ clean | — |
| **Color — ink** | 3 | 0 | ✅ | — |
| **Color — accent** | 5 | 0 | ✅ | — |
| **Color — botanical** | 5 | 0 | ✅ | — |
| **Color — badge (model)** | 5 | 0 | ✅ | Add comment: *reserved, run-matrix only* |
| **Color — rule (dividers)** | 2 | `var(--paper-shadow)` used raw in Synergy CSS 8× | 🟡 token unused | Audit: either adopt `color.rule.*` or remove |
| **Color — status (semantic)** | ❌ none (only `danger`) | `success/warning/info` appear **nowhere** | 🔴 **decline-by-choice or define** | Add explicit note: *DASH reserves color for identity/accent; no status semantics. Danger is the sole exception.* |
| **Font family** | 2 (sans, mono) | 0 | ✅ | Spec adds CN mixed (`思源黑体`, `汉仪旗黑`) — token missing |
| **Font size** | 5 (display/deck/body/meta/micro) | 3 `clamp()` fluid sizes in CSS (h1/h2/metric/quote) | 🟡 tokens fixed-px, CSS fluid | Resolve: either tokens emit clamps (via @dash/scale V4) or CSS stops using clamp |
| **Font weight** | ❌ none | 400/500/600/700 used raw 12× | 🔴 missing | Add `weight.regular/medium/semibold/bold` = 400/500/600/700 |
| **Line height** | 4 (tight/base/loose/display) | raw `1.1 / 1.3 / 1.6 / 1.7` used in CSS | 🟡 both systems coexist | Unify: ratio-lh for flow text, px-lh for display |
| **Letter spacing** | ❌ none | `0.04em / -0.025em / -0.02em` raw in 6 places | 🔴 missing | Add `tracking.tight/normal/wide/kicker` |
| **Baseline** | 8px | — | ✅ | — |
| **Space** | 10 steps 4–80 | 0 | ✅ | — |
| **Radius** | 4 (sm/md/lg/pill) | 0 | ✅ | — |
| **Borders / rules** | `--border-1/2/subtle` in CSS | **Not in tokens.json** | 🔴 | Promote to `tokens.border.*` |
| **Shadow / elevation** | ❌ none | **By design** — spec § 6 bans drop-shadows | ⚪ decline | Add explicit `elevation: none` declaration + docs link to § 6 |
| **Opacity scale** | ❌ none | 0.7 / 0.5 / 0.6 (borders) + 0.25 / 0.45 / 0.95 (SVG) + 0.18 / 0.10 (rules) used 14× | 🔴 | Add `opacity.disabled/subtle/rule-soft/rule-default/hover-veil` (5 stops) |
| **Z-index** | ❌ none | **Not used yet** but needed for `grid-overlay` / tweaks panel / modals | 🔴 | Add `z.base/overlay/tweaks/modal/toast` = 0/10/50/100/1000 |
| **Focus ring** | ❌ none | Not set — **a11y gap** | 🔴 | Add `focus.ring` = `2px solid sunGold` + offset 2px |
| **Motion — easing** | 2 | 0 | ✅ | — |
| **Motion — duration** | 4 (fast/base/reveal/max) | 0 | ✅ | — |
| **Page canvas** | 1 (1684×1191) | — | ✅ | — |
| **Grid systems** | 1 (12-col / 24gap) | spec § 1.4 defines 8 / 20 / 32 — none declared | 🔴 | Add `grid.system.eight/twenty/thirtyTwo` with cells+gap |
| **Measure overlay** | ❌ none | v3-audit § 5 flagged missing | 🔴 | Add `measure.baseline/column/accent` color + line-width tokens |
| **Print bleed / trim** | ❌ none | Not yet used | 🟡 deferred | Leave for `@dash/print` to own |
| **Breakpoint** | ❌ none | N/A (fixed canvas) | ⚪ decline | Mark as *canvas-only*; no breakpoints in the core token set |

### Missing-tokens summary
**Must add in v0.4** (🔴): font.weight, font.tracking, border, opacity, z-index, focus.ring, color.rule-adoption, grid.system variants, measure overlay, CN font family, declaration of "no status semantics."

**Explicit decline** (⚪ → documented non-tokens): elevation/shadow, breakpoint.

---

## 2 · Component Completeness

From `colors_and_type.css` (type surfaces) + Synergy Map v2/v4 CSS (layout surfaces) + spec § 4 (Panopticon). None have structured docs.

| Component | Appears in | Variants | States | Docs | Score |
|---|---|---|---|---|---|
| Kicker | colors_and_type + SM | 1 | default | ❌ | 3/10 |
| Headline (h1/h2/h3) | colors_and_type | 3 sizes | default | ❌ | 3/10 |
| Body / body-lg | colors_and_type | 2 | default | ❌ | 3/10 |
| Mono / metric | colors_and_type | 2 (accent variant) | default | ❌ | 3/10 |
| Th-caps | colors_and_type | 1 | default | ❌ | 2/10 |
| Gold-word (underlined accent) | colors_and_type | 1 | default only | ❌ — **§ 3.2 rule not programmatic** | 4/10 |
| Quote | colors_and_type | 1 | default | ❌ | 2/10 |
| Pill / badge | radius.pill + color.badge.* | implied 5 | ❌ | ❌ | 1/10 |
| Run-ID chip | SM v2 `.r-name` | 1 | default + "under load" variant | ❌ | 2/10 |
| Panopticon anchor | spec § 4 + SM | 1 (20-grid 2×3) | static | ✅ spec text only | 5/10 |
| Rail (narrow col) | SM v2 `.rail` | 1 | default | ❌ | 1/10 |
| Row (finding) | SM v2 `.r-*` | 3 states (normal / u / danger) | ❌ | ❌ | 2/10 |
| Meta strip | SM v2 `.kicker`+ts | 1 | default | ❌ | 1/10 |
| Placeholder prompt | SM v2 `.ph-prompt` | 1 | default | ❌ | 1/10 |
| Grid overlay | v3-audit § 5 (missing) | toggle on/off | ❌ | 🔴 **not yet built** | 0/10 |
| TOC entry | N/A yet | — | — | ❌ | 0/10 |

### Patterns (compositions not single components)
| Pattern | Where | Docs |
|---|---|---|
| Synergy Map 3-row (header / body-3col / footer) | SM v2/v4 | ✅ spec § 1.2 + § 4.3 |
| Cover page (hero + sidebar + panopticon) | **NEW in this audit** (packages/print/demos/cover-page.html) | 🟡 partial |
| arXiv hero (2:1 wide band + vertical reverse-beat) | Spec § 8.3 | ✅ |
| Handoff bundle (multi-page, format-rhythm varied) | Spec § 7.3, § 8.3 | ✅ mentioned, not built |

---

## 3 · Naming Consistency

| Issue | Instances | Recommendation |
|---|---|---|
| `accent.palmShadow` (token) vs `--palm-shadow` (CSS) vs "森林绿" (spec) | 3 names for the same green | Canonicalize as `accent.palm-shadow` in CSS, `accent.palmShadow` in JSON, *forest* / *森林绿* in prose |
| `accent.sunGold` vs `--sun-gold` vs "金 DASH Gold" | 3 names | Same pattern — `sunGold` / `--sun-gold` / *gold* / *金* |
| `color.paper.warm` has value `#ddd6c7` but is described as "DASH wordmark on dark" — belongs under botanical palette | misclassified | Move to `botanical.paperWarm` |
| `font.size.deck = 22` but hand-tuned and v2 CSS treat deck = h2 = 22 (same as lead) | collapsed tier | Keep `deck` as its own slot and let split-ratio scale populate it (V4 gives 32px) |
| Space tokens `space.1..10` are numbers; CSS vars `--space-1..10` match | ✅ consistent | Keep |
| `hoverGlow` nested under `accent` but it's a state, not an accent color | category drift | Move to future `state.hover.*` group |

---

## 4 · Spec-to-Tokens Drift (dash-grid-spec v0.3 vs tokens.json)

| Spec section | What it says | Tokens match? |
|---|---|---|
| § 1.1 basic unit 8pt | baseline=8 ✅ | ✅ |
| § 1.1 document unit 4mm ≈ 11.34pt | no `print` token group | 🔴 add `print.unit = 4mm` |
| § 1.2 canvas 297×210 mm | tokens have 1684×1191px (digital) | 🟡 digital ≠ print spec — add both |
| § 1.2 外边距 20/20/24/24mm | token `page.padding = 66px` is single value | 🔴 add `page.margin.{top, right, bottom, left}` |
| § 1.2 栏数 3/6/12 | token has only `page.gridColumns = 12` | 🔴 add variants |
| § 1.4 8/20/32 grid systems | not in tokens | 🔴 **primary gap** |
| § 1.3 基线步 14pt + 子步 7pt | digital uses 8px baseline | 🟡 print-spec divergence — document |
| § 2 type scale 28/16/12/10/8/7.5pt (print) | tokens have 46/22/14/11/9.5px (digital) | 🟡 two systems, not cross-referenced |
| § 2 CN mixed (汉仪旗黑 / 思源黑体) | `font.family.sans` has no CN | 🔴 add `font.family.cnDisplay` + `font.family.cnBody` |
| § 3.1 fixed 5-color palette | tokens have 25 colors (many implicit reserved) | 🟡 over-broad — clarify scope |
| § 3.2 gold underline = causal anchor rule | no enforcement | 🔴 no runtime guard → add `@dash/measure` lint rule |
| § 3.4 contrast matrix (15 pairs) | no tokens | ⚪ pattern-level, not token-level |
| § 4.3 Panopticon sizing | radius + color exist, geometry not tokenized | 🟡 add `panopticon.ring-ratio` = "3:2:1" constant |
| § 5 measure layer | not in tokens | 🔴 add `measure.*` tokens |

---

## 5 · Priority Actions (v0.4)

### 🥇 Low-cost, high-leverage (do first — 1 session)
1. **Add `font.weight` + `font.tracking` tokens** — unblocks every component doc (3 font-weight values currently raw in 12 places).
2. **Add `opacity` scale** — 5 stops already implied in CSS, just codify.
3. **Add `focus.ring` token** — a11y-gate for every future interactive component.
4. **Add `z.index` ladder** — grid-overlay and tweaks panel need it in v4.
5. **Declare non-tokens**: `elevation: none`, `breakpoint: none` with spec cross-reference.

### 🥈 Medium-cost, high-leverage (v0.4 release target)
6. **Promote border tokens** from CSS (`--border-1/2/subtle`) to `tokens.border.*`.
7. **Add grid-system variants** (8 / 20 / 32) with cells + gutter per spec § 1.4.
8. **Add measure-overlay tokens** (color + line-width + z-index) — unblocks v3-audit § 5 action.
9. **Add CN font family tokens** — unblocks Round 4 (Schmid EN/CN).
10. **Write structured docs** for Kicker / Headline / Body / Mono / Gold-word / Pill / Panopticon (7 core components — one Markdown file each).

### 🥉 Larger-cost, deferred (v0.5+)
11. Resolve clamp()-vs-fixed-px drift: either @dash/scale emits clamps consumed by colors_and_type.css, or strip the clamp()s in CSS.
12. Canonicalize state tokens (hover / disabled / active) as a new `state.*` group.
13. Publish a runtime lint rule in `@dash/measure` that enforces gold-underline = causal-claim (spec § 3.2).
14. Reconcile print vs digital units (mm/pt/px dual stack).

---

## 6 · What v0.4 Looks Like (rough shape of the diff)

```diff
  @dash/tokens/src/tokens.json
+  "font": { ..., "weight": {…4…}, "tracking": {…4…}, "family": { ..., "cnDisplay": …, "cnBody": … } }
+  "opacity": {…5…}
+  "border": {…promoted from CSS…}
+  "focus": { "ring": "…", "offset": "2px" }
+  "z": {…5…}
+  "grid": { "system": { "eight": {…}, "twenty": {…}, "thirtyTwo": {…} } }
+  "measure": { "baseline": "…", "column": "…", "accent": "…" }
+  "meta": { "elevation": "none", "breakpoint": "none-canvas-only" }
```

Plus `packages/tokens/docs/components/*.md` for the 7 core components.

---

## 7 · Open Questions

1. **Should `@dash/scale` emit size tokens into `@dash/tokens`?** Current: scale is standalone, CSS re-declares. Proposal: `scale --write` merges `type.size.*` / `type.lineHeight.*` into tokens.json (pending merge strategy).
2. **CN font rule**: spec § 2 says *主标题 汉仪旗黑 或 思源黑体*. In tokens, "or" becomes two variants — do we expose both, or pick one and document the fallback?
3. **Decline vs adopt for "status semantic colors"**: my recommendation is declare *"DASH does not encode status via color; ink-primary + italics + position encode state"* — but this needs a sign-off before removing the question mark in future audits.
4. **Panopticon geometry**: should `3:2:1` ring ratio be a token (constant) or a component prop?
5. **Handoff bundle pattern**: not built yet — design? write it after Round 4?

---

**Next owner**: this doc. Once Vox reviews, cut v0.4 tokens patch + 7 component docs. Expected size: ~60 token additions · 7 Markdown docs · ~400 lines total.

**Not a rewrite** — a layer below what already exists.
