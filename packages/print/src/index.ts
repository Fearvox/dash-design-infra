/**
 * @dash/print — HTML-to-PDF via paged.js polyfill + Playwright.
 *
 * paged.js polyfills CSS Paged Media (@page, break-before, page-break-inside,
 * running headers/footers, cross-references) inside a browser context. We then
 * let Chromium's print pipeline render to PDF — same code path that makes
 * print-previews match screen preview.
 *
 * Pipeline:
 *   1. Launch headless Chromium
 *   2. Load the source HTML (with any @media print rules)
 *   3. Inject paged.js (paginator runs, splits content into .pagedjs_page)
 *   4. Wait for `window.PagedPolyfill` to finish
 *   5. Export to PDF via page.pdf()
 *
 * vs. raw Chromium print():
 *   - Raw Chromium supports a subset of @page (margins, size) but NOT running
 *     headers, footnotes, named pages, or controlled page-breaks
 *   - paged.js gives us book-grade control (toc, prince-style running headers)
 *     at the cost of one extra client-side pass
 *
 * The cost is ~500ms of paginator time. Fine for CI/offline renders.
 */
import { chromium, type Browser } from 'playwright';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';

export interface RenderOptions {
  /** Absolute path to the source HTML file */
  input: string;
  /** Absolute path where the PDF should be written */
  output: string;
  /** Page format. Examples: "A4", "Letter", or a custom { width, height } in px */
  format?: 'A4' | 'Letter' | { width: number; height: number };
  /** Print background graphics. Default true — we want brand colors in print. */
  printBackground?: boolean;
  /** Extra wait before pdf() — helpful for web fonts. Default 0. */
  waitMs?: number;
  /** Optional margins. paged.js respects @page CSS; these are a Chromium fallback. */
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
}

export interface RenderResult {
  ok: boolean;
  output: string;
  pageCount: number;
  message?: string;
}

/**
 * Render an HTML file to PDF through paged.js + Chromium.
 *
 * The HTML should load paged.js itself or leave it to us — we inject it if
 * `window.PagedPolyfill` is absent after DOMContentLoaded.
 */
export async function renderToPDF(opts: RenderOptions): Promise<RenderResult> {
  const inputPath = resolve(opts.input);
  const outputPath = resolve(opts.output);
  const fileUrl = `file://${inputPath}`;

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    // Load source HTML
    await page.goto(fileUrl, { waitUntil: 'networkidle' });

    // Inject paged.js if not already present on the page
    const hasPaged = await page.evaluate(() => typeof (globalThis as any).PagedPolyfill !== 'undefined');
    if (!hasPaged) {
      await page.addScriptTag({
        // CDN fallback — vendoring a copy into the package is a future improvement
        url: 'https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js',
      });
    }

    // Wait for paginator to finish. paged.js attaches to the window at runtime.
    await page.waitForFunction(() => (window as any).PagedPolyfill?.pages?.length > 0, { timeout: 30_000 });

    if (opts.waitMs) await page.waitForTimeout(opts.waitMs);

    const pageCount = await page.evaluate(() => (globalThis as any).PagedPolyfill?.pages?.length ?? 0);

    // Export to PDF. paged.js has already laid content into fixed-size pages,
    // so we tell Chromium to use the same dimensions to avoid re-paginating.
    const pdfOpts: Parameters<typeof page.pdf>[0] = {
      path: outputPath,
      printBackground: opts.printBackground ?? true,
      preferCSSPageSize: true,
    };
    if (opts.format && typeof opts.format === 'string') pdfOpts.format = opts.format;
    if (opts.format && typeof opts.format === 'object') {
      pdfOpts.width = `${opts.format.width}px`;
      pdfOpts.height = `${opts.format.height}px`;
    }
    if (opts.margin) pdfOpts.margin = opts.margin;

    await page.pdf(pdfOpts);
    await ctx.close();

    return {
      ok: true,
      output: outputPath,
      pageCount,
    };
  } catch (err) {
    return {
      ok: false,
      output: outputPath,
      pageCount: 0,
      message: err instanceof Error ? err.message : String(err),
    };
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Utility: write a minimal "page shell" HTML that loads paged.js and the
 * given content. Useful for quick tests — real DASH docs will own their
 * own HTML.
 */
export async function writeShellHTML(contentHTML: string, outPath: string): Promise<void> {
  const shell = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>DASH Print Shell</title>
  <style>
    @page { size: 1684px 1191px; margin: 0; }
    body { margin: 0; }
  </style>
</head>
<body>
${contentHTML}
</body>
</html>`;
  await writeFile(outPath, shell, 'utf-8');
}
