/**
 * @dash/layout/solvers/canvas-editorial — fixed-canvas editorial layout solver.
 *
 * Solves the classic editorial constraint set: a fixed canvas (e.g. 1684×1191),
 * three vertical sections (header, body, footer) that must stack without clipping.
 *
 * Constraint model:
 *   headerH ≥ min    (required)
 *   headerH ≈ pref   (strong)
 *   bodyH    ≥ min    (required)
 *   bodyH    ≈ pref   (weak — absorbs slack)
 *   footerH  ≥ min    (required)
 *   footerH  ≈ pref   (strong)
 *   header.y + headerH + gap + bodyH + gap + footer.y + footerH ≤ pageH  (required — never clip)
 *
 * When content is too large, the body absorbs the contraction (weakest preferrence).
 * When canvas has slack, the body grows to fill it.
 */

import {
  Solver,
  Strength,
  Operator,
  Constraint,
  Expression,
  makeBox,
  readBox,
} from '../index.js';

export interface EditorialSection {
  minHeight: number;
  preferredHeight: number;
}

export interface EditorialConfig {
  canvas?: {
    width: number;
    height: number;
  };
  padding?: {
    top?: number;
    bottom?: number;
    horizontal?: number;
  };
  sections?: {
    header?: EditorialSection;
    body?: EditorialSection;
    footer?: EditorialSection;
  };
  gap?: number;
  /** Snap all computed heights to this grid (e.g. 8px baseline). Default: 0 (no snap). */
  baselineGrid?: number;
}

export interface SolvedBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditorialResult {
  header: SolvedBox;
  body: SolvedBox;
  footer: SolvedBox;
  canvas: { width: number; height: number };
  slack: number;
  /** True when body height was compressed below preferred — content is tight. */
  constrained: boolean;
}

interface ResolvedConfig {
  canvas: { width: number; height: number };
  padding: { top: number; bottom: number; horizontal: number };
  sections: {
    header: EditorialSection;
    body: EditorialSection;
    footer: EditorialSection;
  };
  gap: number;
}

const DEFAULTS: ResolvedConfig = {
  canvas: { width: 1684, height: 1191 },
  padding: { top: 48, bottom: 66, horizontal: 66 },
  sections: {
    header: { minHeight: 96, preferredHeight: 120 },
    body: { minHeight: 200, preferredHeight: 900 },
    footer: { minHeight: 72, preferredHeight: 80 },
  },
  gap: 48,
};

function snap(v: number, grid: number): number {
  if (grid <= 0) return v;
  return Math.round(v / grid) * grid;
}

export function solveCanvasEditorial(config: EditorialConfig = {}): EditorialResult {
  const baselineGrid = config.baselineGrid ?? 0;
  const gap = config.gap ?? DEFAULTS.gap;
  const pad = {
    top: config.padding?.top ?? DEFAULTS.padding.top,
    bottom: config.padding?.bottom ?? DEFAULTS.padding.bottom,
    horizontal: config.padding?.horizontal ?? DEFAULTS.padding.horizontal,
  };
  const canvas = {
    width: config.canvas?.width ?? DEFAULTS.canvas.width,
    height: config.canvas?.height ?? DEFAULTS.canvas.height,
  };
  const sections = {
    header: {
      minHeight: config.sections?.header?.minHeight ?? DEFAULTS.sections.header.minHeight,
      preferredHeight: config.sections?.header?.preferredHeight ?? DEFAULTS.sections.header.preferredHeight,
    },
    body: {
      minHeight: config.sections?.body?.minHeight ?? DEFAULTS.sections.body.minHeight,
      preferredHeight: config.sections?.body?.preferredHeight ?? DEFAULTS.sections.body.preferredHeight,
    },
    footer: {
      minHeight: config.sections?.footer?.minHeight ?? DEFAULTS.sections.footer.minHeight,
      preferredHeight: config.sections?.footer?.preferredHeight ?? DEFAULTS.sections.footer.preferredHeight,
    },
  };

  const s = new Solver();

  const header = makeBox('header');
  const body = makeBox('body');
  const footer = makeBox('footer');

  const contentW = canvas.width - (pad.horizontal ?? 0) * 2;
  const effectivePadTop = pad.top ?? 0;
  const effectivePadBottom = pad.bottom ?? 0;
  const contentH = canvas.height - effectivePadTop - effectivePadBottom;

  // ── X / width ──────────────────────────────────────────────
  for (const box of [header, body, footer]) {
    s.createConstraint(box.width, Operator.Eq, contentW);
    s.createConstraint(box.x, Operator.Eq, pad.horizontal ?? 0);
  }

  // ── Y stacking ─────────────────────────────────────────────
  s.createConstraint(header.y, Operator.Eq, effectivePadTop);
  s.addConstraint(
    new Constraint(new Expression(body.y), Operator.Eq, new Expression(header.y, header.height, gap))
  );
  s.addConstraint(
    new Constraint(new Expression(footer.y), Operator.Eq, new Expression(body.y, body.height, gap))
  );

  // ── Height rules ───────────────────────────────────────────
  s.createConstraint(header.height, Operator.Ge, sections.header.minHeight, Strength.required);
  s.createConstraint(header.height, Operator.Eq, sections.header.preferredHeight, Strength.strong);

  s.createConstraint(body.height, Operator.Ge, sections.body.minHeight, Strength.required);
  s.createConstraint(body.height, Operator.Eq, sections.body.preferredHeight, Strength.weak);

  s.createConstraint(footer.height, Operator.Ge, sections.footer.minHeight, Strength.required);
  s.createConstraint(footer.height, Operator.Eq, sections.footer.preferredHeight, Strength.strong);

  // ── Never-clip rule ────────────────────────────────────────
  s.addConstraint(
    new Constraint(
      new Expression(footer.y, footer.height),
      Operator.Le,
      canvas.height - effectivePadBottom,
      Strength.required
    )
  );

  // ── Total height must fit (belt-and-suspenders) ────────────
  s.addConstraint(
    new Constraint(
      new Expression(header.height, body.height, footer.height, gap, gap),
      Operator.Le,
      contentH,
      Strength.required
    )
  );

  s.updateVariables();

  const headerBox = readBox(header);
  const bodyBox = readBox(body);
  const footerBox = readBox(footer);

  if (baselineGrid > 0) {
    headerBox.height = snap(headerBox.height, baselineGrid);
    bodyBox.height = snap(bodyBox.height, baselineGrid);
    footerBox.height = snap(footerBox.height, baselineGrid);
  }

  const footerBottom = footerBox.y + footerBox.height;
  const canvasBottom = canvas.height - effectivePadBottom;
  const slack = canvasBottom - footerBottom;

  return {
    header: headerBox,
    body: bodyBox,
    footer: footerBox,
    canvas,
    slack: Math.max(0, slack),
    constrained: bodyBox.height < sections.body.preferredHeight,
  };
}
