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
import { chromium, type Browser, type Page } from 'playwright';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

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
    await inlineLocalStylesheets(page);

    // Inject paged.js if not already present on the page.
    // Use the local workspace dependency so CI and offline rendering do not
    // depend on a CDN.
    const hasPaged = await page.evaluate(() => typeof (globalThis as any).PagedPolyfill !== 'undefined');
    let pageCount = 0;
    if (!hasPaged) {
      await page.evaluate(() => {
        (globalThis as any).PagedConfig = { auto: false };
      });
      await page.addScriptTag({
        path: resolvePagedPolyfillPath(),
      });
    }

    // Wait for paginator to finish. The polyfill's preview() returns a flow
    // object; counting DOM pages is a fallback for older paged.js shapes.
    pageCount = await page.evaluate(async () => {
      const polyfill = (globalThis as any).PagedPolyfill;
      if (!polyfill || typeof polyfill.preview !== 'function') {
        throw new Error('PagedPolyfill.preview is unavailable after paged.js injection.');
      }

      const flow = await polyfill.preview();
      return flow?.total ?? flow?.pages?.length ?? document.querySelectorAll('.pagedjs_page').length;
    });

    if (opts.waitMs) await page.waitForTimeout(opts.waitMs);
    if (!pageCount) throw new Error('paged.js rendered 0 pages.');

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

function resolvePagedPolyfillPath(): string {
  const pagedMain = require.resolve('pagedjs');
  return resolve(dirname(pagedMain), '../dist/paged.polyfill.js');
}

async function inlineLocalStylesheets(page: Page): Promise<void> {
  const links = await page.$$eval('link[rel="stylesheet"]', (nodes) => {
    return nodes.map((node) => {
      const link = node as HTMLLinkElement;
      return {
        href: link.href,
        media: link.media,
      };
    });
  });

  for (const link of links) {
    if (!link.href.startsWith('file://')) continue;
    const css = await readFile(fileURLToPath(link.href), 'utf-8');
    await page.evaluate(
      ({ href, media, cssText }) => {
        const link = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
          .find((candidate) => candidate.href === href);
        if (!link) return;

        const style = document.createElement('style');
        style.textContent = cssText;
        style.dataset.pagedjsInlined = 'true';
        if (media) style.media = media;
        link.replaceWith(style);
      },
      { href: link.href, media: link.media, cssText: css }
    );
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
