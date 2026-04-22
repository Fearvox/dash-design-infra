/**
 * @dash/layout — constraint-solver-based layout using Cassowary (via @lume/kiwi).
 *
 * A fixed-canvas editorial layout fights a tension between:
 *   - Fixed canvas (1684×1191, immutable)
 *   - Variable body content (3 rows × left/right, size depends on copy)
 *   - Hard "footer always visible" rule
 *   - Hard "header always visible" rule
 *   - Baseline-grid snap preference
 *
 * CSS grid can't express all these as *constraints* — it lays out once and
 * whoever overflows is whoever overflows. Cassowary lets us say:
 *
 *   const headerH = new Variable(); // unknown
 *   const bodyH = new Variable();
 *   const footerH = new Variable();
 *
 *   s.addConstraint( headerH + bodyH + footerH + gap*2 <= pageH );    // REQUIRED
 *   s.addConstraint( headerH >= 96, Strength.strong );
 *   s.addConstraint( footerH >= 64, Strength.required );   // hard
 *   s.addConstraint( bodyH == preferredBodyH, Strength.weak );  // give if needed
 *
 * Solver finds a layout that satisfies all REQUIRED constraints and gets as
 * close to the weak ones as possible.
 *
 * This package is scaffolding for that approach. Concrete DASH layout
 * solvers live in src/solvers/<layout-name>.ts.
 */

import * as kiwi from '@lume/kiwi';

export const { Variable, Expression, Constraint, Operator, Solver, Strength } = kiwi;
export type { Variable as KiwiVariable, Expression as KiwiExpression, Constraint as KiwiConstraint, Solver as KiwiSolver } from '@lume/kiwi';

export interface LayoutBox {
  x: kiwi.Variable;
  y: kiwi.Variable;
  width: kiwi.Variable;
  height: kiwi.Variable;
}

export function makeBox(name: string): LayoutBox {
  return {
    x: new Variable(`${name}.x`),
    y: new Variable(`${name}.y`),
    width: new Variable(`${name}.width`),
    height: new Variable(`${name}.height`),
  };
}

export function readBox(b: LayoutBox) {
  return {
    x: b.x.value(),
    y: b.y.value(),
    width: b.width.value(),
    height: b.height.value(),
  };
}
