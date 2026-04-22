/**
 * Demo: fixed-canvas editorial layout expressed as constraints.
 *
 * Bun run src/demo.ts — prints the computed box sizes.
 *
 * This is illustrative. Real consumers will define their own
 * constraint sets; shared patterns get extracted into src/solvers/.
 */

import { Solver, Strength, Operator, Constraint, Expression, makeBox, readBox } from './index.js';

function solveEditorialLayout() {
  const s = new Solver();

  // Canvas constants
  const pageW = 1684;
  const pageH = 1191;
  const padTop = 48; // 66 × 0.72
  const padBottom = 66;
  const gap = 48;

  const header = makeBox('header');
  const body = makeBox('body');
  const footer = makeBox('footer');

  // X/width — span canvas minus horizontal padding (66 each side = 132 total)
  const contentW = pageW - 132;
  for (const box of [header, body, footer]) {
    s.createConstraint(box.width, Operator.Eq, contentW);
    s.createConstraint(box.x, Operator.Eq, 66);
  }

  // Y stacking: header.y = padTop, body.y = header.y + header.height + gap, footer.y = body.y + body.height + gap
  s.createConstraint(header.y, Operator.Eq, padTop);
  s.addConstraint(
    new Constraint(new Expression(body.y), Operator.Eq, new Expression(header.y, header.height, gap))
  );
  s.addConstraint(
    new Constraint(new Expression(footer.y), Operator.Eq, new Expression(body.y, body.height, gap))
  );

  // Height rules
  // Header: at least 96 (required), prefers 120 (strong)
  s.createConstraint(header.height, Operator.Ge, 96, Strength.required);
  s.createConstraint(header.height, Operator.Eq, 120, Strength.strong);

  // Footer: at least 72 (required), prefers 80 (strong)
  s.createConstraint(footer.height, Operator.Ge, 72, Strength.required);
  s.createConstraint(footer.height, Operator.Eq, 80, Strength.strong);

  // Body: at least 200 tall (required)
  s.createConstraint(body.height, Operator.Ge, 200, Strength.required);

  // Hard rule: footer.bottom must be <= pageH - padBottom (REQUIRED — "footer never clips")
  s.addConstraint(
    new Constraint(
      new Expression(footer.y, footer.height),
      Operator.Le,
      pageH - padBottom,
      Strength.required
    )
  );

  // Body prefers to be large (weak) — absorbs remaining space
  s.createConstraint(body.height, Operator.Eq, 900, Strength.weak);

  s.updateVariables();

  return {
    header: readBox(header),
    body: readBox(body),
    footer: readBox(footer),
    canvas: { width: pageW, height: pageH },
  };
}

if (import.meta.main) {
  const result = solveEditorialLayout();
  console.log('Constraint-solver demo:');
  console.log(JSON.stringify(result, null, 2));
  const footerBottom = result.footer.y + result.footer.height;
  const canvasBottom = result.canvas.height - 66; // padBottom
  console.log(`\nFooter bottom: ${footerBottom}  |  canvas bottom: ${canvasBottom}  |  slack: ${canvasBottom - footerBottom}px`);
}
