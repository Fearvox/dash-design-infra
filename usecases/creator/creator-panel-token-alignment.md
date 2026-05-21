# creator-panel-token-alignment

Token alignment for `--panel` across the warm-paper family (6 surfaces now use `var(--panel)` consistently).

- **Surfaces**: pdf-zine, poster-surface, social-card, motion-storyboard, prompt-dna, family-dna
- **Consensus**: `rgba(244,234,214,0.06)` — warm off-white panel tint
- **Before**: 3 warm-paper surfaces defined `--panel` in `:root` but never used it in body CSS, using hardcoded equivalents instead
- **After**: All 6 warm-paper surfaces consistently reference `var(--panel)`

## Changes

| Surface | Before | After |
|---|---|---|
| pdf-zine `.panel` | `rgba(255,249,235,.72)` | `var(--panel)` |
| pdf-zine `.panel.feature` | `rgba(255,249,235,.82)` | `var(--panel-hot,var(--panel))` |
| poster `.poster-frame` | `rgba(255,248,235,.56)` | `var(--panel)` |
| social-card `.proof-rail` | `rgba(255,248,234,.72)` | `var(--panel)` |
| social-card `.proof` | `rgba(255,248,234,.66)` | `var(--panel)` |

## Verification

```bash
bun creator:pdf-zine-check    # PASS
bun creator:poster-check      # PASS
bun creator:social-card-check  # PASS
bun creator:multi-surface-proof  # 12/12 measure+print PASS
bun creator:cache-integrity    # 11/11 valid
```