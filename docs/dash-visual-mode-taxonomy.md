# DASH Visual Mode Taxonomy

**Date:** 2026-05-01
**Author:** @Designer
**Scope:** classify visual production modes for DASH brand, each mode defines palette binding, composition rules, motion grammar, and type behavior

---

## Mode Overview

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   EVIDENCE  ←→  EDITORIAL  ←→  KINETIC          │
│      ↑            ↑             ↑               │
│      └───── DIAGRAM ────────────┘               │
│      ┌──────────┼──────────────────┐            │
│      ↓          ↓                  ↓            │
│   DASHBOARD  ATMOSPHERIC       (future)         │
│                                                 │
└─────────────────────────────────────────────────┘
```

Six modes, each with defined visual contracts. A preset binds to one primary mode.

---

## 1. evidence

> Forensic, archival, documentary. Cold data with visual gravity.

| Attribute | Value |
|-----------|-------|
| **Primary palette** | Cream bg + Ink body + Deep Green headings |
| **Accent** | Neon Yellow (sparing, only on findings) |
| **Glass** | Frost (milky translucent, not smoked) |
| **Type hierarchy** | Plus Jakarta Sans headings → Geist Mono data |
| **Grid** | 8-column strict, no bleed |
| **Motion** | None to breathe. Data must feel still and recorded. |
| **Texture** | Paper grain, scan lines, archival marks |
| **Inspiration** | National Geographic infographics, MIT Tech Review data pages, forensic reports |
| **Use when** | Presenting benchmark data, agent audit trails, research findings, memory retrieval evidence |

**Example presets:** (to be built)
- `evidence-benchmark-grid`
- `evidence-audit-timeline`

---

## 2. editorial

> Magazine, poster, one-pager, deck. Composed, hierarchical, designed.

| Attribute | Value |
|-----------|-------|
| **Primary palette** | Split field (cream/white + deep color block) |
| **Accent** | Cobalt `#0018ff` or Deep Green depending on mood |
| **Glass** | Soft Frost cards (2-3 anchoring the composition) |
| **Type hierarchy** | Display → heading → body → label in Geist Sans + Geist Mono pair |
| **Grid** | √2 canvas, asymmetric balance |
| **Motion** | Breathe + pulse. One moving layer at a time. |
| **Texture** | Subtle noise, frosted glass, scan bands |
| **Inspiration** | Eye Magazine, Bloomberg Businessweek, Ray Gun, IDEA |
| **Use when** | Kinetic posters, social media hero images, deck title slides, one-pagers |

**Example presets:**
- `electric-archive` ✅ existing
- `blue-apple-collage-loop` ✅ existing
- `frontier-poster-scan` ✅ existing
- `editorial-type-kinetic` (proposed)
- `editorial-grid-morph` (proposed)

---

## 3. kinetic

> Motion-first. Video, social clip, animated diagram. Time is the primary axis.

| Attribute | Value |
|-----------|-------|
| **Primary palette** | Dark bg (Deep Green or dark blue) + neon accent |
| **Accent** | Neon Yellow or Cyan, high saturation |
| **Glass** | Clear or none — glass cards are too static for kinetic |
| **Type hierarchy** | Large single-phrase type, fast in/out |
| **Grid** | Fluid, canvas adapts to motion |
| **Motion** | Flow + pulse + drift. Multiple simultaneous layers allowed. |
| **Texture** | Particles, trails, field lines, shader effects |
| **Inspiration** | TouchDesigner reels, Max Cooper music videos, Field.io, Bureau Cool |
| **Use when** | Promo clips, social media motion assets, event visuals, loading screens |

**Example presets:**
- `kinetic-particle-trail` (proposed)
- `kinetic-audio-reactive` (proposed)
- `kinetic-flow-field` (proposed)

---

## 4. atmospheric

> Ambient, mood, background. Installation or wallpaper-grade.

| Attribute | Value |
|-----------|-------|
| **Primary palette** | Monochromatic or duotone, low contrast |
| **Accent** | Single color at low opacity |
| **Glass** | Smoked, heavy blur |
| **Type hierarchy** | Minimal or none |
| **Grid** | None — organic composition |
| **Motion** | Breathe only. Very slow (30-60s cycle). |
| **Texture** | Blurred weather masses, noise fields, slow particle drift |
| **Inspiration** | Ryoji Ikeda, Refik Anadol data sculptures, teamLab |
| **Use when** | Dashboard backgrounds, waiting states, ambient installation, video call backgrounds |

**Example presets:**
- `atmospheric-noise-terrain` (proposed)
- `atmospheric-reaction-diffusion` (proposed)

---

## 5. dashboard

> Data display. Monitoring, real-time, status. Information-first.

| Attribute | Value |
|-----------|-------|
| **Primary palette** | Dark bg + high-contrast data elements |
| **Accent** | Neon Yellow (alert), Cobalt (normal), Cyan (info) |
| **Glass** | Smoked dark glass panels |
| **Type hierarchy** | Geist Mono primary, Plus Jakarta Sans labels |
| **Grid** | Modular dashboard grid, fixed panels |
| **Motion** | Pulse only (data updates). No decorative motion. |
| **Texture** | None — data surface must be clean |
| **Inspiration** | Grafana, Datadog dashboards, cyberpunk HUD, NASA mission control |
| **Use when** | Agent monitoring panels, system health dashboards, benchmark live displays |

**Example presets:**
- `dashboard-agent-health` (proposed — pair with DevOps slock-monitor)
- `dashboard-benchmark-live` (proposed)

---

## 6. diagram

> Explanatory. Flow, architecture, system map. Teaching tool.

| Attribute | Value |
|-----------|-------|
| **Primary palette** | Cream bg + ink structure + color-coded nodes |
| **Accent** | Per-category color coding (max 6 colors) |
| **Glass** | Frost cards for grouped concepts |
| **Type hierarchy** | Plus Jakarta Sans headings + Geist Mono labels |
| **Grid** | Hierarchical or force-directed layout |
| **Motion** | Pulse on reveal, static otherwise |
| **Texture** | None — clarity over atmosphere |
| **Inspiration** | Excalidraw, Mermaid.js, Stately.ai, architecture decision records |
| **Use when** | System architecture docs, flow diagrams, dependency graphs, process maps |

**Example presets:**
- `diagram-system-architecture` (proposed)
- `diagram-dependency-graph` (proposed)

---

## Mode Decision Matrix

| If you want... | Use mode | Primary palette | Motion |
|---------------|----------|-----------------|--------|
| Authoritative data presentation | `evidence` | Cream + Ink | None/breathe |
| Composed visual storytelling | `editorial` | Split field + Cobalt | Breathe + pulse |
| Motion-first video/clip | `kinetic` | Dark + Neon | Flow + pulse |
| Ambient background/installation | `atmospheric` | Duotone low contrast | Breathe only |
| Real-time monitoring | `dashboard` | Dark + high contrast | Pulse only |
| System explanation | `diagram` | Cream + color-coded | Static + pulse on reveal |

---

## Palette Binding Rules

Each visual mode has a primary DASH palette binding. A preset MAY use a secondary palette but MUST declare it.

```
evidence     → cream + ink + deep-green
editorial    → split-field (cream block + color block) + cobalt
kinetic      → deep-green dark bg + neon-yellow
atmospheric  → deep-green + cobalt duotone
dashboard    → dark-blue + neon-yellow + cyan
diagram      → cream + ink + color-coded
```

---

## Glass System

Three glass types used across modes:

| Glass | CSS | Use |
|-------|-----|-----|
| **Frost** | `rgba(248,245,239,0.12)` + `backdrop-blur(24px)` | evidence, editorial, diagram |
| **Smoked** | `rgba(16,41,31,0.55)` + `backdrop-blur(32px)` | editorial (dark), dashboard, atmospheric |
| **Clear** | No glass — raw canvas | kinetic |

---

## Next Steps

1. ✅ Template + taxonomy drafted
2. ⏳ @Le-Assistant review & approve
3. ⏳ @Coder implements `P5MotionPresetV2` TypeScript interface
4. ⏳ @Researcher maps "highest realm" techniques → visual modes
5. ⏳ New presets built per mode, prioritized by OxVox
