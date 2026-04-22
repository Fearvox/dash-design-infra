/**
 * @dash/measure — canvas budget checker.
 *
 * Loads an HTML file in a headless browser, measures the actual rendered
 * layout of the `.page` element (or any configurable selector), and asserts
 * that the body content fits inside the fixed canvas without overflow.
 *
 * This is the CI gate for fixed-canvas pages. Run in pre-commit / pre-push to
 * catch copy edits that accidentally push content past the page bounds.
 *
 * Relationship to "pretext":
 *   We originally considered chenglou/pretext for build-time text measurement.
 *   Pretext is excellent for React-side SSR text-size prediction, but our
 *   actual bug surface is layout-dependent (grid-template-rows, overflow:hidden,
 *   flex collapses). A headless browser gives us ground truth; pretext would
 *   give us character-level estimates. Use playwright for the gate; add
 *   pretext later if we need character-level estimates for pure TS callers
 *   without a browser.
 */

import { chromium, type Browser, type Page } from 'playwright';

export interface BudgetCheck {
  /** file:// URL or absolute path to HTML */
  file: string;
  /** CSS selector for the canvas element */
  canvasSelector?: string;
  /** expected canvas width in px */
  canvasWidth: number;
  /** expected canvas height in px */
  canvasHeight: number;
  /** optional selector for the scrollable/overflow content */
  contentSelector?: string;
  /** px tolerance (defaults to 0) */
  tolerance?: number;
}

export interface BudgetResult {
  ok: boolean;
  canvas: { width: number; height: number };
  content: { width: number; height: number; scrollWidth: number; scrollHeight: number };
  overflowX: number;
  overflowY: number;
  clippedSelectors: string[];
  message: string;
}

export async function checkBudget(opts: BudgetCheck): Promise<BudgetResult> {
  const {
    file,
    canvasSelector = '.page',
    canvasWidth,
    canvasHeight,
    contentSelector,
    tolerance = 0,
  } = opts;

  const url = file.startsWith('file://') || file.startsWith('http')
    ? file
    : `file://${file}`;

  let browser: Browser | undefined;
  try {
    browser = await chromium.launch();
    const page: Page = await browser.newPage({
      viewport: { width: canvasWidth + 200, height: canvasHeight + 200 },
      deviceScaleFactor: 1,
    });

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector(canvasSelector, { timeout: 5000 });

    const metrics = await page.evaluate(
      ({ sel, contentSel }: { sel: string; contentSel?: string }) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const content = contentSel ? document.querySelector(contentSel) as HTMLElement : el;
        const contentRect = content?.getBoundingClientRect() ?? rect;

        // Find descendants whose bounding rect exceeds the canvas rect
        const all = el.querySelectorAll('*');
        const clipped: string[] = [];
        for (const node of Array.from(all)) {
          const r = node.getBoundingClientRect();
          if (r.right > rect.right + 1 || r.bottom > rect.bottom + 1) {
            clipped.push(
              (node as HTMLElement).tagName.toLowerCase() +
                ((node as HTMLElement).className ? '.' + (node as HTMLElement).className.replace(/\s+/g, '.') : '')
            );
          }
        }

        return {
          canvas: { width: rect.width, height: rect.height },
          content: {
            width: contentRect.width,
            height: contentRect.height,
            scrollWidth: (content?.scrollWidth ?? 0),
            scrollHeight: (content?.scrollHeight ?? 0),
          },
          clipped: clipped.slice(0, 10), // cap noise
        };
      },
      { sel: canvasSelector, contentSel: contentSelector }
    );

    if (!metrics) {
      throw new Error(`Canvas selector "${canvasSelector}" not found in ${url}`);
    }

    const overflowX = Math.max(0, metrics.content.scrollWidth - metrics.canvas.width);
    const overflowY = Math.max(0, metrics.content.scrollHeight - metrics.canvas.height);
    const ok = overflowX <= tolerance && overflowY <= tolerance;

    const message = ok
      ? `✓ Fits. Canvas ${metrics.canvas.width}×${metrics.canvas.height}; content ${metrics.content.scrollWidth}×${metrics.content.scrollHeight}.`
      : `✗ Overflow. X: ${overflowX}px, Y: ${overflowY}px. Clipped: ${metrics.clipped.join(', ') || '(none identified)'}`;

    return {
      ok,
      canvas: metrics.canvas,
      content: metrics.content,
      overflowX,
      overflowY,
      clippedSelectors: metrics.clipped,
      message,
    };
  } finally {
    await browser?.close();
  }
}
