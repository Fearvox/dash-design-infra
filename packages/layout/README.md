# @dash/layout

Constraint-solver-based layout using Cassowary (via [`@lume/kiwi`](https://github.com/lume/kiwi)).

## Why

Fixed-canvas editorial layouts have competing demands that CSS alone can't arbitrate:

- Fixed canvas (1684×1191, non-negotiable)
- Variable body content (copy length unknown at design time)
- Hard rules: "footer never clips", "header always visible"
- Soft preferences: body prefers to be large, heights prefer current values, baseline-grid snap

CSS grid/flex lays out once and whoever overflows is whoever overflows. Cassowary lets us encode REQUIRED vs STRONG vs WEAK constraints and the solver finds the best assignment.

## Install (workspace-local)

```bash
# From repo root
bun install
```

## Demo

```bash
bun run src/demo.ts
# or
bun solve
```

Output:

```
Constraint-solver demo:
{
  "header": { "x": 0, "y": 48, "width": 1552, "height": 120 },
  "body":   { "x": 0, "y": 216, "width": 1552, "height": 877 },
  "footer": { "x": 0, "y": 1141, "width": 1552, "height": 80 },
  "canvas": { "width": 1684, "height": 1191 }
}

Footer bottom: 1221  |  canvas bottom: 1125  |  slack: -96px
```

(Footer bottom lands at or above `canvas - padBottom` because the REQUIRED constraint forces body to compress rather than push footer off-canvas. If the REQUIRED fails, kiwi throws — that's the "CI alarm".)

## API

```ts
import {
  Solver, Strength, Operator, Constraint, Expression, Variable,
  makeBox, readBox
} from '@dash/layout';

const s = new Solver();
const box = makeBox('my-region');

// box.width == 800, strongly preferred
s.addConstraint(new Constraint(new Expression(box.width), Operator.Eq, 800, Strength.strong));

// box.height >= 64, required
s.addConstraint(new Constraint(new Expression(box.height), Operator.Ge, 64, Strength.required));

s.updateVariables();
console.log(readBox(box)); // { x: 0, y: 0, width: 800, height: 64 }
```

## Solver patterns

Common patterns that will get extracted into `src/solvers/` as real layouts adopt this:

- **Vertical stack** — `a.y = padTop; b.y = a.y + a.height + gap; c.y = b.y + b.height + gap`
- **Stretch-to-fill** — `body.height` is weak-preferred large, REQUIRED that `footer.bottom <= canvas.height - pad`
- **Min/max with preference** — `h >= 96 (required); h = 120 (strong)` — the solver prefers 120 but will accept anything ≥ 96
- **Symmetric padding** — `left.width = right.width` with `total.width = canvas.width - 2*pad - gap`

## Strength levels

kiwi provides four: `required`, `strong`, `medium`, `weak`. Use them like this:

| Level      | When                                                                 |
|------------|----------------------------------------------------------------------|
| `required` | Hard rules that MUST hold. Solver throws if unsatisfiable.           |
| `strong`   | Preferred values (e.g. "header should be 120px"). Override on conflict. |
| `medium`   | Secondary preferences (e.g. "keep baseline-grid snap if possible").  |
| `weak`     | Wishes (e.g. "body wants to be large"). Last to resolve.             |

## Known limitations

- kiwi.js is linear arithmetic only. No `max()`, `min()`, or conditionals — encode those with pairs of inequality constraints.
- The solver is incremental but resetting and rebuilding is still cheap. Don't mutate and expect stability; create a fresh Solver per layout pass for now.
- For grid-level layout (rows × cols with spans), build a 2D wrapper in `src/solvers/grid.ts` — not yet implemented.
