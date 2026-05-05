#!/usr/bin/env bun
/**
 * CLI: dash-measure <html-file> [--canvas=WxH] [--selector=.page] [--tolerance=0]
 *
 * Examples:
 *   dash-measure page.html
 *   dash-measure page.html --canvas=1684x1191
 *   dash-measure page.html --selector=.page-scale --tolerance=2
 *
 * Exit codes:
 *   0 — content fits
 *   1 — overflow detected
 *   2 — bad arguments / file not found
 */

import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { checkBudget } from './index.js';

function parseArgs(argv: string[]) {
  const [, , ...rest] = argv;
  const positional: string[] = [];
  const opts: Record<string, string> = {};
  for (const arg of rest) {
    if (arg.startsWith('--')) {
      const [k, v = 'true'] = arg.slice(2).split('=');
      if (!k) continue;
      opts[k] = v;
    } else {
      positional.push(arg);
    }
  }
  return { positional, opts };
}

async function main() {
  const { positional, opts } = parseArgs(process.argv);

  const [fileArg] = positional;
  if (!fileArg) {
    console.error('Usage: dash-measure <html-file> [--canvas=WxH] [--selector=.page] [--tolerance=0]');
    process.exit(2);
  }

  const file = resolve(fileArg);
  if (!existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(2);
  }

  const canvas = opts.canvas ?? '1684x1191';
  const [wStr, hStr] = canvas.split('x');
  const canvasWidth = Number(wStr);
  const canvasHeight = Number(hStr);

  if (!Number.isFinite(canvasWidth) || !Number.isFinite(canvasHeight)) {
    console.error(`Invalid --canvas=${canvas}; expected WxH (e.g. 1684x1191)`);
    process.exit(2);
  }

  const selector = opts.selector ?? '.page';
  const tolerance = Number(opts.tolerance ?? '0');

  console.log(`Measuring ${file}`);
  console.log(`  canvas:    ${canvasWidth}×${canvasHeight}`);
  console.log(`  selector:  ${selector}`);
  console.log(`  tolerance: ${tolerance}px`);
  console.log('');

  const result = await checkBudget({
    file,
    canvasSelector: selector,
    canvasWidth,
    canvasHeight,
    tolerance,
  });

  console.log(result.message);
  if (!result.ok) {
    console.log('');
    console.log('Content size:', result.content);
    if (result.clippedSelectors.length) {
      console.log('Clipped descendants (up to 10):');
      for (const s of result.clippedSelectors) console.log(`  - ${s}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('dash-measure error:', err);
  process.exit(2);
});
