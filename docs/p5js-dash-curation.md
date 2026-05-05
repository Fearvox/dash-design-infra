# DASH p5.js Frontier Curation

**Date:** 2026-05-01
**Author:** @Designer
**Input:** Researcher's p5js-frontier-research.md
**Output:** curated preset pipeline — which frontier techniques pass DASH editorial aesthetic gate

---

## Curation Philosophy

> "不是所有生成艺术技法都适合 DASH。DASH 是 editorial/evidence/poster 系统，不是 gen-art playground。每种技法必须回答：它对读者说了什么？"

Three filters applied to every frontier technique:

1. **Editorial Filter**: Does this technique serve information hierarchy, or just visual spectacle?
2. **DASH Palette Filter**: Can this technique work within DASH's bounded 7-color palette?
3. **Repeatability Filter**: Can this be turned into a preset that produces consistent results from parameters?

---

## Technique → Visual Mode Mapping

| Technique | Primary Mode | Secondary Mode | Curation Notes |
|-----------|:-----------:|:--------------:|----------------|
| Flow Field | `editorial` | `atmospheric` | Perfect editorial texture layer. Not foreground. |
| Kinetic Type | `editorial` | `evidence` | DASH's killer differentiator. Type IS content. |
| Data-Driven | `evidence` | `dashboard` | Evidence-grade visualizations, not dashboards. |
| Particle Systems | `kinetic` | `atmospheric` | Danger: "screensaver zone". Need tight thematic control. |
| Poster Print | `editorial` | `evidence` | Post-processing that makes digital look like paper. |
| Layer Composer | `editorial` | ALL | Infrastructure, not user-facing. Underpins all modes. |
| Reaction-Diffusion | `atmospheric` | — | Organic texture generator. Pre-compute, don't animate. |
| WebGL Shader | `kinetic` | `editorial` | Phase 7. Post-processing (bloom/grade) first, then creative. |
| L-System/Fractal | — | — | LOW PASS. Too "nature" for DASH editorial. Exception: ornament generator. |

---

## Priority Pipeline (Phase 5)

### 🔴 P0 — Build Now

| # | Preset | Visual Mode | Technique | Why P0 |
|---|--------|:-----------:|------------|--------|
| 1 | `dashFlowField` | `editorial` | Flow field + DASH palette | Highest visual ROI. 5 lines of noise → organic editorial texture. Replaces boring CSS gradients. |
| 2 | `dashKineticType` | `editorial` | Type animation + baseline grid | DASH's identity. Zach Lieberman × Blue Apple. Type is DASH's primary material. |
| 3 | `dashLayerComposer` | (infrastructure) | Multi-Graphics compositing | Unlocks all complex presets. Weather Map L0-L5 needs this. |

### 🟡 P1 — Build Next

| # | Preset | Visual Mode | Technique | Why P1 |
|---|--------|:-----------:|------------|--------|
| 4 | `dashDataWeather` | `evidence` | JSON → visual params | Evidence-driven editorial. Memory Weather Map is the prototype. |
| 5 | `dashPosterPrint` | `editorial` | Post-processing chain | Makes digital look like paper. Risograph × DASH. |

### 🟢 P2 — Phase 6+

| # | Preset | Visual Mode | Technique |
|---|--------|:-----------:|------------|
| 6 | `dashParticleField` | `kinetic` | Connected particles + DASH palette |
| 7 | `dashOrnamentGen` | `diagram` | L-system editorial ornament |
| 8 | `dashShaderGrade` | `kinetic` | GLSL post-processing (bloom/chromatic/vignette) |

---

## Design Insights from Artists

### Casey Reas → "Design Process, Not Output"
Every DASH preset must declare a **parameter space**, not a single output. The preset contract defines the grammar; the user provides the sentence.

### Saskia Freeke → "Constraint is Catalyst"
DASH's bounded palette (7 colors) is not a limitation — it's the creative constraint. 3000+ daily geometrics from one setup. Our presets should aim for the same: one preset, infinite variation within DASH bounds.

### Tyler Hobbs → "Flow Field as Composition, Not Texture"
Critical distinction. Flow fields in DASH should be compositional structure (field lines = visual grid), not just "add noise to background." The field direction, density, and scale create implicit reading paths — editorial designers call this "flow."

### Zach Lieberman → "Code Can Be Soft"
DASH Kami aesthetic (warm, tactile, editorial) maps to Lieberman's "poetic computation." Kinetic type should have touch — easing curves, organic drift, not mechanical slide-in.

### Manolo Gamboa Naon → "Color is Structure"
DASH's 7-color palette isn't decoration. Colors should carry information: Deep Green = authority, Cobalt = computation, Neon Yellow = finding/insight, Cream = ground/silence.

---

## Parameter Space Design Principles

Every DASH preset parameter space must satisfy:

1. **Bounded, not infinite** — sliders 0-1, not "any number". Matches UI controls.
2. **Meaningful at extremes** — 0 and 1 should both produce valid, distinct visuals. No "broken at 0" params.
3. **3-axis sweet spot** — max 3 primary parameters per preset. More than 3 = combinatorially uncuratable.
4. **Seedable** — every preset accepts a seed for reproducible deterministic output.
5. **DASH palette bound** — all colors resolve to DASH Brand palette values.

---

## Next: Concrete Preset Specs

The following preset specs will be written:
1. `dashFlowField` — using P5MotionPresetV2 template
2. `dashKineticType` — using P5MotionPresetV2 template
3. `dashLayerComposer` — infrastructure spec (not a preset, an engine)

Format: each spec follows `docs/p5-motion-preset-spec-template.md` v2 contract.
