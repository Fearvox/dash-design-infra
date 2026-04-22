# @dash/measure

Canvas budget checker — the CI gate that catches "footer got clipped" before it happens.

## What

Loads an HTML file in a headless Chromium, measures the actual rendered size of the `.page` element and its content, and asserts no overflow against the fixed canvas budget.

## Why not `pretext`

`chenglou/pretext` is designed for React SSR: predict text size **in pure JS** before mounting. Excellent for avoiding React layout shift. But our actual overflow bugs are **layout-dependent** — grid row collapses, flex stretch, `overflow: hidden` clipping on fixed-size parents. Pretext can't see those.

Playwright gives us browser ground truth. We can still add pretext later for pure-TS-side character-level estimation (e.g. sanity-check a token scale change before re-rendering everything).

## Install (workspace-local after root `bun install`)

Playwright needs browsers:

```bash
bun x playwright install chromium
```

## CLI

```bash
bun run src/cli.ts path/to/page.html
# or from repo root:
bun measure:check -- path/to/page.html

# custom canvas / selector:
bun run src/cli.ts ./page.html --canvas=1684x1191 --selector=.page --tolerance=2
```

Exit code `0` = fits, `1` = overflow, `2` = bad args.

## API

```ts
import { checkBudget } from '@dash/measure';

const result = await checkBudget({
  file: '/abs/path/to/page.html',
  canvasSelector: '.page',
  canvasWidth: 1684,
  canvasHeight: 1191,
  tolerance: 0,
});

if (!result.ok) console.error(result.message);
```

## In CI

Add to pre-commit or GitHub Actions:

```yaml
- name: Canvas budget check
  run: bun measure:check -- pages/*.html
```

## Known limitations

- Runs Chromium only. Safari has its own flex quirks we should eventually cross-check with webkit.
- Tolerance is in px. For "snap-grid" violations (text not on 8px baseline), use `@dash/metrics` instead — that's a character-level concern.
