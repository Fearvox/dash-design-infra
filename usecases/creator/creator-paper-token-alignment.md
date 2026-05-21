# creator-paper-token-alignment

Token alignment for `--paper` across the warm-paper family (4 surfaces consensus `#f2eadb`).

- **Surfaces**: pdf-zine, poster-surface, social-card, motion-storyboard
- **Consensus**: `#f2eadb` — warm off-white texture
- **Non-aligned**: browser-demo, p5-sketch, manim-scene, touchdesigner-tox, frontier-capsule

## Alignment state

| Surface | `--paper` value |
|---|---|
| pdf-zine | `#f2eadb` ✅ |
| motion-storyboard | `#f2eadb` ✅ |
| prompt-dna | `#f2eadb` ✅ |
| family-dna | `#f2eadb` ✅ |
| poster-surface | `#f1eadc` (1 hex digit off) |
| social-card | `#f3eadb` (1 hex digit off) |
| browser-demo | `#f4ead6` (creative divergence) |
| p5-sketch | `#f6f0e5` (creative-hybrid intent) |
| manim-scene | `#f8f1df` (creative-hybrid intent) |
| touchdesigner-tox | `#f8f1df` (creative-hybrid intent) |
| frontier-capsule | `#f3efe7` (unknown family) |

## Verification

```bash
bun creator:pdf-zine-check
bun creator:poster-check
bun creator:social-card-check
bun creator:motion-storyboard-check
```